/*
 * Copyright (c) 2014-2015 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*global google, MashupPlatform*/


window.Widget = (function () {

    "use strict";

    /**
     * Create a new instance of class Widget.
     * @class
     */
    var Widget = function Widget() {
        this.wrapperElement = null;
        this.graph = null;
        this.lastData = Widget.DEFAULTS.DATA;
        this.type = Widget.DEFAULTS.TYPE;
        this.maxdata = 0;

        MashupPlatform.widget.context.registerCallback(handler_onresize.bind(this));
        MashupPlatform.wiring.registerCallback('input', handler_onreceiveGraphInfo.bind(this));
    };

    /* ==================================================================================
     *  STATIC MEMBERS
     * ================================================================================== */

    Widget.DEFAULTS = {

        MIN_LENGTH: 2,

        TYPE: 'LineChart',

        DATA: [
            ['Time', 'dummy'],
            ['', 0],
        ],

        OPTIONS: {
            title: "No Data",
            width: '100%',
            height: '100%',
            hAxis: {
                title: "none"
            },
            legend: {
                position: 'none'
            }
        }

    };

    /* ==================================================================================
     *  PUBLIC METHODS
     * ================================================================================== */

    Widget.prototype.init = function init() {
        var packages;

        //For more info, show all packages supported: https://developers.google.com/chart/
        packages = [
            "corechart",
            "gauge",
            "geochart",
            "imagechart",
            "motionchart",
            "orgchart",
            "table",
            "treemap"
        ];

        //For more info, show the Google Loader Developer's Guide: https://developers.google.com/loader/
        google.load('visualization', '1', {packages: packages});
        google.setOnLoadCallback(handler_onload.bind(this));
    };

    Widget.prototype.loadElement = function loadElement() {
        this.wrapperElement = document.getElementById('graphContainer');
    };

    Widget.prototype.createGraph = function createGraph() {
        this.graph = new google.visualization[this.type](this.wrapperElement);

        return this;
    };

    Widget.prototype.resetGraph = function resetGraph() {
        this.data = Widget.DEFAULTS.DATA;
        this.lastData = Widget.DEFAULTS.DATA;
        this.options = Widget.DEFAULTS.OPTIONS;
        this.maxdata = 0;

        return this.repaintGraph();
    };

    Widget.prototype.repaintGraph = function repaintGraph() {
        drawgraph.call(this, this.graph, this.data, this.options);
        return this;
    };

    Widget.prototype.updateGraph = function updateGraph() {
        var newops = this.options;
        if (!('animation' in newops)) {
            newops.animation = {};
        }
        newops.animation.duration = 1000;
        newops.animation.easing = 'out';

        drawgraph.call(this, this.graph, this.data, newops);
    };

    /* ==================================================================================
     *  PRIVATE METHODS
     * ================================================================================== */

    /*
     {"type":"ComboChart","options":{"title":"Monthly Coffee Production by Country","width":"100%","height":"100%","vAxis":{"title":"Cups"},"hAxis": {"title":"Month"},"seriesType":"bars","series":{"5":{"type":"line"}}},"data":[["Month","Bolivia","Ecuador","Madagascar","Papua New Guinea","Rwanda","Average"],["2004/05",165,938,522,998,450,614.6],["2005/06",135,1120,599,1268,288,682],["2006/07",157,1167,587,807,397,623],["2007/08",139,1110,615,968,215,609.4],["2008/09",136,691,629,1026,366,569.6]]}

     {"action": "update","data": [["Month","Bolivia","Ecuador","Madagascar","Papua New Guinea","Rwanda","Average"],["2004/05",50, 50, 50, 50, 50, 50], ["2005/06",60, 60, 60, 60, 60, 60], ["2006/07",70, 70, 70, 70, 70, 70]]}

     {"action": "slice","data": [["2007/08",80, 80, 80, 80, 80, 80]]}
     */

    var drawgraph = function drawgraph(graph, rawdata, ops) {
        var data = google.visualization.arrayToDataTable(rawdata);
        graph.draw(data, ops);
        google.visualization.events.addListener(graph, 'select', handle_select.call(this, graph, data, ops).bind(this));
    };

    var handle_select = function handle_select(graph, data, ops) {
        return function () {
            var extract_info = function (row, col) {
                return {
                    row_value: data.getValue(row, col),
                    row_label: data.getColumnLabel(col),
                    col_value: data.getValue(row, 0),
                    col_label: data.getColumnLabel(0)
                };
            };
            var selection = graph.getSelection();
            var messagedata = [];
            for (var i = 0; i < selection.length; i++) {
                var item = selection[i];
                var info = {};
                if (item.row != null && item.column != null) {
                    info = extract_info(item.row, item.column);
                    messagedata.push(info);
                } else if (item.row != null) {
                    for (var jr = 0; jr < data.getNumberOfColumns(); jr++) {
                        info = extract_info(item.row, jr);
                        messagedata.push(info);
                    }
                } else if (item.column != null) {
                    for (var jc = 0; jc < data.getNumberOfRows(); jc++) {
                        info = extract_info(jc, item.column);
                        messagedata.push(info);
                    }
                }
            }
            // window.console.log(JSON.stringify(messagedata));
            if (messagedata.length > 0) {
                MashupPlatform.wiring.pushEvent("data_selected", JSON.stringify(messagedata));
            }
        };
    };

    var handler_onreceiveGraphInfo = function handler_onreceiveGraphInfo(graphInfoString) {
        var graphInfo;
        try {
            graphInfo = JSON.parse(graphInfoString);
        } catch (error) {
            throw new MashupPlatform.wiring.EndpointTypeError(Messages.EncodeError);
        }

        if (graphInfo.action && typeof graphInfo.action === "string") {
            var tmp;
            switch (graphInfo.action) {
            case "setting":
                if ('maxdata' in graphInfo && typeof graphInfo.maxdata === "number") {
                    MashupPlatform.widget.log(Messages.SettingUpdated, MashupPlatform.log.INFO);
                    this.maxdata = graphInfo.maxdata;
                }
                return;
            case "update":
                if (!this.graph) {
                    throw new MashupPlatform.wiring.EndpointValueError(Messages.GraphRequired);
                }
                if (!graphInfo.data || graphInfo.data.length < Widget.DEFAULTS.MIN_LENGTH) {
                    throw new MashupPlatform.wiring.EndpointValueError(Messages.DataRequired);
                }
                this.data = graphInfo.data;
                this.lastData = graphInfo.data;
                this.updateGraph();
                MashupPlatform.widget.log(Messages.UpdatedCreated, MashupPlatform.log.INFO);
                return;
            case "slice":
                if (!this.graph) {
                    throw new MashupPlatform.wiring.EndpointValueError(Messages.GraphRequired);
                }
                if (!graphInfo.data) {
                    throw new MashupPlatform.wiring.EndpointValueError(Messages.DataRequired);
                }
                if (!this.lastData || this.lastData.length <= 1) {
                    throw new MashupPlatform.wiring.EndpointValueError(Messages.PreviousDataRequired);
                }
                tmp = this.lastData;
                tmp = tmp.slice(0, 1).concat(tmp.slice(2)).concat(graphInfo.data);
                this.data = tmp;
                this.lastData = tmp;
                MashupPlatform.widget.log(Messages.UpdatedCreated, MashupPlatform.log.INFO);
                this.updateGraph();
                return;
            case "append":
                if (!this.graph) {
                    throw new MashupPlatform.wiring.EndpointValueError(Messages.GraphRequired);
                }
                if (!graphInfo.data) {
                    throw new MashupPlatform.wiring.EndpointValueError(Messages.DataRequired);
                }

                if (graphInfo.data.length === 0 || graphInfo.data.length > 1) {
                    throw new MashupPlatform.wiring.EndpointValueError(Messages.DataOneLength);
                }

                if (!this.lastData || this.lastData.length <= 1) {
                    throw new MashupPlatform.wiring.EndpointValueError(Messages.PreviousDataRequired);
                }

                tmp = this.lastData;
                if (this.maxdata > 0 && tmp.length >= this.maxdata + 1) {
                    tmp = tmp.slice(0, 1).concat(tmp.slice(2));
                }
                tmp = tmp.concat(graphInfo.data);
                this.data = tmp;
                this.lastData = tmp;
                MashupPlatform.widget.log(Messages.UpdatedCreated, MashupPlatform.log.INFO);
                this.updateGraph();
                return;
            }
        }

        // if the graph type is empty or is not supported...
        if (!graphInfo.type) {
            // ...throw a new error message.
            throw new MashupPlatform.wiring.EndpointValueError(Messages.TypeRequired);
        }

        // if the first time or the graph type will be changed (add)...
        if (!this.graph || this.type != graphInfo.type) {
            if (!graphInfo.options) {
                throw new MashupPlatform.wiring.EndpointValueError(Messages.OptionRequired);
            }

            // ...create a new instance of Visualization Google Graph.
            this.type = graphInfo.type;
            this.options = graphInfo.options;
            this.createGraph();
        }

        // if the graph data is empty (empty)...
        if (!graphInfo.data || graphInfo.data.length < Widget.DEFAULTS.MIN_LENGTH) {
            // ...clean the current graph.
            this.resetGraph();
            MashupPlatform.widget.log(Messages.Emptied, MashupPlatform.log.INFO);
        } else {
            // otherwise, the graph will be painted with the current data.
            this.data = graphInfo.data;
            this.lastData = graphInfo.data;
            this.updateGraph();
            // this.repaintGraph();
            MashupPlatform.widget.log(Messages.UpdatedCreated, MashupPlatform.log.INFO);
        }
    };

    var handler_onresize = function handler_onresize(container) {
        if ('heightInPixels' in container) {
            this.wrapperElement.style.height = (document.body.getBoundingClientRect().height - 16) + "px";
        }

        if ('widthInPixels' in container) {
            this.wrapperElement.style.width = (document.body.getBoundingClientRect().width - 10) + "px";
        }

        this.repaintGraph();
    };

    var handler_onload = function handler_onload() {
        this.createGraph().resetGraph();
    };

    var Messages = {
        UpdatedCreated: "The graph was updated or created.",
        Emptied: "The graph was emptied",
        OptionRequired: "The field 'options' is required.",
        TypeRequired: "The field 'type' is required.",
        GraphRequired: "A previous graph is required",
        DataRequired: "The field 'data' is required",
        PreviousDataRequired: "Previous data are required",
        DataOneLength: "The field 'data' must be of length 1",
        EncodeError: "Data should be encoded as JSON",
        SettingUpdated: "Setting updated"
    };

    /* test-code */

    var getWrapperElement = function () {
        return this.wrapperElement;
    };

    var getMaxData = function () {
        return this.maxdata;
    };

    var getGraph = function () {
        return this.graph;
    };

    var prototypeappend = {
        getWrapperElement: getWrapperElement,
        Messages: Messages,
        getMaxData: getMaxData,
        getGraph: getGraph
    };

    for (var attrname in prototypeappend) {
        Widget.prototype[attrname] = prototypeappend[attrname];
    }
    /* end-test-code */


    return Widget;

})();
