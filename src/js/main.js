/*
 *     Copyright (c) 2014-2015 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of the googlecharts widget.
 *
 */

/*global google, MashupPlatform*/

(function () {

    "use strict";

    var data = [];
    var graphContainer;
    var graph;
    var currentType = 'LineChart';
    var currentOptions;

    var process_input = function process_input(input) {

        var info = JSON.parse(input);
        if (!('type' in info)) {
            // Error. Type is needed
            MashupPlatform.widget.log('Google Chart Error. "type" is needed');
            return;
        }
        //if (currentType == null || currentType != info.type) {
            // TODO compare options
        if (true) {
            //New graph
            currentType = info.type;
            if (!('options' in  info)) {
                // Error. Type is needed
                MashupPlatform.widget.log('Google Chart Error. "options" is needed');
                return;
            }
            // Set graph options
            currentOptions = info.options;
            if (!('data' in  info)) {
                // Empty graph
                MashupPlatform.widget.log('Google Chart warning. "data" is empty');
                data = [];
            } else {
                data = info.data;
            }
            // Nota: En el caso de la carga de la gráfica inicial, No se necesita
            // redibujar, porque el google.setOnLoadCallback se ejecuta siempre
            // despues de la carga de window. TODO: Hay que probar cuando se cambia una
            // gráfica por otra
            draw_graph();
        } else {
            // Update
            // TODO new Options
            // Normal case
            data = info.data;
            MashupPlatform.widget.log('Google Chart Update. Data: ' + data);
            redraw();
        }
    };

    var redraw = function redraw() {
        graph.draw(google.visualization.arrayToDataTable(data), currentOptions);
    };

    var draw_graph = function draw_graph() {
        graph =  new google.visualization[currentType](graphContainer);
        // TODO data formats. Se podría añadir a la estructura de datos de entrada un flag
        // que indique el valor del campo que determina si el primer campo es label o dato.
        // 'false' means that the first row contains labels, not data.
        // 'true' Treat first row as data as well.
        //graph.draw(google.visualization.arrayToDataTable(data, false), currentOptions);
        if (data.length > 1) {
            graph.draw(google.visualization.arrayToDataTable(data), currentOptions);
        } else {
            clean_graph();
        }
    };

    var clean_graph = function clean_graph() {
        data = [
            ['Time', 'dummy'],
            ['', 0],
        ];

        currentOptions = {
            title:"No Data",
            width:'100%', height:'100%',
            hAxis: {title: "none"},
            legend: {position: 'none'}
        };
        redraw();
    };

    var resizeHandler = function resizeHandler(new_values) {
        var hasChanged;

        if ('heightInPixels' in new_values) {
            graphContainer.style.height = (document.body.getBoundingClientRect().height - 16) + "px";
            hasChanged = true;
        }

        if ('widthInPixels' in new_values) {
            graphContainer.style.width = (document.body.getBoundingClientRect().width - 10) + "px";
            hasChanged = true;
        }
        redraw();
    };
    MashupPlatform.widget.context.registerCallback(resizeHandler);

    window.addEventListener('load', function () {
        graphContainer = document.getElementById('graphContainer');
        // Resize the linearGraphContainer
        graphContainer.style.height = "100%";
        graphContainer.style.width = "100%";
    }, true);

    // Input handler
    MashupPlatform.wiring.registerCallback('input', process_input);

    //https://developers.google.com/loader/
    //https://developers.google.com/chart/
    // TODO: ponga lo que ponga en packages, excepto paquetes que no existan (LineChart
    // funciona y no debería... debería usar corechart :S), hacen que se vea cualquier gráfica
    google.load("visualization", "1", {packages:["corechart", "gauge", "geochart", "imagechart", "motionchart", "orgchart", "table", "treemap"]});
    // Google always load after DOM (or so it seems)
    google.setOnLoadCallback(draw_graph);

})();
