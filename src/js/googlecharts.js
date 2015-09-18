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

        return this.repaintGraph();
    };

    Widget.prototype.repaintGraph = function repaintGraph() {
        this.graph.draw(google.visualization.arrayToDataTable(this.data), this.options);

        return this;
    };

    Widget.prototype.updateGraph = function updateGraph() {
        var newops = this.options;
        if (!('animation' in newops)) {
            newops.animation = {};
        }
        newops.animation.duration = 1000;
        newops.animation.easing = 'out';

        this.graph.draw(google.visualization.arrayToDataTable(this.data), newops);
    };

    /* ==================================================================================
     *  PRIVATE METHODS
     * ================================================================================== */

    /*
     {"type":"ComboChart","options":{"title":"Monthly Coffee Production by Country","width":"100%","height":"100%","vAxis":{"title":"Cups"},"hAxis": {"title":"Month"},"seriesType":"bars","series":{"5":{"type":"line"}}},"data":[["Month","Bolivia","Ecuador","Madagascar","Papua New Guinea","Rwanda","Average"],["2004/05",165,938,522,998,450,614.6],["2005/06",135,1120,599,1268,288,682],["2006/07",157,1167,587,807,397,623],["2007/08",139,1110,615,968,215,609.4],["2008/09",136,691,629,1026,366,569.6]]}

     {"action": "update","data": [["Month","Bolivia","Ecuador","Madagascar","Papua New Guinea","Rwanda","Average"],["2004/05",50, 50, 50, 50, 50, 50], ["2005/06",60, 60, 60, 60, 60, 60], ["2006/07",70, 70, 70, 70, 70, 70]]}

     {"action": "slice","data": [["2007/08",80, 80, 80, 80, 80, 80]]}
    */

    var handler_onreceiveGraphInfo = function handler_onreceiveGraphInfo(graphInfoString) {
        var graphInfo;
        try {
            graphInfo = JSON.parse(graphInfoString);
        } catch (error) {
            throw new MashupPlatform.wiring.EndpointTypeError("Data should be encoded as JSON");
        }

        if (graphInfo.action && typeof graphInfo.action === "string") {
            switch (graphInfo.action) {
            case "update":
                if (!this.graph) {
                    throw new MashupPlatform.wiring.EndpointValueError("You need to update a previous graph");
                }
                if (!graphInfo.data || graphInfo.data.length < Widget.DEFAULTS.MIN_LENGTH) {
                    throw new MashupPlatform.wiring.EndpointValueError("When you are updating the field 'data' is mandatory");
                }
                this.data = graphInfo.data;
                this.lastData = graphInfo.data;
                this.updateGraph();
                MashupPlatform.widget.log("The graph was updated or created.", "INFO");
                return;
            case "slice":
                if (!this.graph) {
                    throw new MashupPlatform.wiring.EndpointValueError("You need to slice a previous graph");
                }
                if (!graphInfo.data) {
                    throw new MashupPlatform.wiring.EndpointValueError("When you are slicing the field 'data' is mandatory");
                }
                if (!this.lastData || this.lastData.length <= 1) {
                    throw new MashupPlatform.wiring.EndpointValueError("When you are slicing previous data must exist");
                }
                var tmp = this.lastData;
                tmp = tmp.slice(0, 1).concat(tmp.slice(2)).concat(graphInfo.data);
                this.data = tmp;
                this.lastData = tmp;
                MashupPlatform.widget.log("The graph was updated or created.", "INFO");
                this.updateGraph();
                return;
            }
        }

        // if the graph type is empty or is not supported...
        if (!graphInfo.type) {
            // ...throw a new error message.
            throw new MashupPlatform.wiring.EndpointValueError("Google Chart Error. The field 'type' is required.");
            // MashupPlatform.widget.log("Google Chart Error. The field 'type' is required.");
            // return;
        }

        // if the first time or the graph type will be changed (add)...
        if (!this.graph || this.type != graphInfo.type) {
            if (!graphInfo.options) {
                throw new MashupPlatform.wiring.EndpointValueError("Google Chart Error. The field 'options' is required.");
                // return;
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
            MashupPlatform.widget.log("Google Chart Operation. The graph was emptied.", 'INFO');
        } else {
            // otherwise, the graph will be painted with the current data.
            this.data = graphInfo.data;
            this.lastData = graphInfo.data;
            this.updateGraph();
            // this.repaintGraph();
            MashupPlatform.widget.log("Google Chart Operation. The graph was updated or created.", 'INFO');
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

    /* test-code */

    var getWrapperElement = function () {
        return this.wrapperElement;
    };

    var prototypeappend = {
        getWrapperElement: getWrapperElement
    };

    for (var attrname in prototypeappend) {
        Widget.prototype[attrname] = prototypeappend[attrname];
    }
    /* end-test-code */


    return Widget;

})();
