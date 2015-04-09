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

    var Widget = function Widget() {
        this.data = [];
        this.graphContainer = null;
        this.graph = null;
        this.currentType = 'LineChart';
        this.currentOptions = null;

        MashupPlatform.widget.context.registerCallback(this.resizeHandler.bind(this));

        // Input handler
        MashupPlatform.wiring.registerCallback('input', this.process_input.bind(this));
    };

    Widget.prototype.process_input = function process_input(input) {

        var info = JSON.parse(input);
        if (!('type' in info)) {
            // Error. Type is needed
            MashupPlatform.widget.log('Google Chart Error. "type" is needed');
            return;
        } else {
            this.currentType = info.type;
            if (!('options' in  info)) {
                // Error. Type is needed
                MashupPlatform.widget.log('Google Chart Error. "options" is needed');
                return;
            }
            // Set graph options
            this.currentOptions = info.options;
            if (!('data' in  info)) {
                // Empty graph
                MashupPlatform.widget.log('Google Chart warning. "data" is empty');
                this.data = [];
            } else {
                this.data = info.data;
            }
            // Nota: En el caso de la carga de la gráfica inicial, No se necesita
            // redibujar, porque el google.setOnLoadCallback se ejecuta siempre
            // despues de la carga de window. TODO: Hay que probar cuando se cambia una
            // gráfica por otra
            this.draw_graph();
        }

        // Update
        // TODO new Options
        // Normal case
        this.data = info.data;
        MashupPlatform.widget.log('Google Chart Update. Data: ' + this.data);
        this.redraw();
    };

    Widget.prototype.redraw = function redraw() {
        this.graph.draw(google.visualization.arrayToDataTable(this.data), this.currentOptions);
    };

    Widget.prototype.draw_graph = function draw_graph() {
        this.graph = new google.visualization[this.currentType](this.graphContainer);
        // TODO data formats. Se podría añadir a la estructura de datos de entrada un flag
        // que indique el valor del campo que determina si el primer campo es label o dato.
        // 'false' means that the first row contains labels, not data.
        // 'true' Treat first row as data as well.
        //graph.draw(google.visualization.arrayToDataTable(data, false), currentOptions);
        if (this.data.length > 1) {
            this.graph.draw(google.visualization.arrayToDataTable(this.data), this.currentOptions);
        } else {
            this.clean_graph();
        }
    };

    Widget.prototype.clean_graph = function clean_graph() {
        this.data = [
            ['Time', 'dummy'],
            ['', 0],
        ];

        this.currentOptions = {
            title: "No Data",
            width: '100%', height: '100%',
            hAxis: {title: "none"},
            legend: {position: 'none'}
        };
        this.redraw();
    };

    Widget.prototype.resizeHandler = function resizeHandler(new_values) {
        var hasChanged;

        if ('heightInPixels' in new_values) {
            this.graphContainer.style.height = (document.body.getBoundingClientRect().height - 16) + "px";
            hasChanged = true;
        }

        if ('widthInPixels' in new_values) {
            this.graphContainer.style.width = (document.body.getBoundingClientRect().width - 10) + "px";
            hasChanged = true;
        }
        this.redraw();
    };

    Widget.prototype.init = function init() {
        this.graphContainer = document.getElementById('graphContainer');
        // Resize the linearGraphContainer
        this.graphContainer.style.height = "100%";
        this.graphContainer.style.width = "100%";

        //https://developers.google.com/loader/
        //https://developers.google.com/chart/
        // TODO: ponga lo que ponga en packages, excepto paquetes que no existan (LineChart
        // funciona y no debería... debería usar corechart :S), hacen que se vea cualquier gráfica
        // Load the Visualization API and the chart packages
        google.load("visualization", "1", {packages: ["corechart", "gauge", "geochart", "imagechart", "motionchart", "orgchart", "table", "treemap"]});
        // Google always load after DOM (or so it seems)
        // Set a callback to run when the Google Visualization API is loaded
        google.setOnLoadCallback(this.draw_graph.bind(this));
    };

    return Widget;

})();
