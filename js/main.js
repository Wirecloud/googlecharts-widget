/*
 *     Copyright (c) 2014 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of the googleChart widget.
 *
 */

/*global google, MashupPlatform*/

(function () {

    "use strict";

    var data = [];
    var graphContainer;
    var graph;
    var currentType;
    var currentOptions;

    var process_input = function process_input(input) {
        var info;

        /*
        inputExample = {
            'type': "GeoChart",
            'options': {
                width: 556,
                height: 347
            },
            'data':[
                ['Country', 'Popularity'],
                ['Germany', 200],
                ['United States', 300],
                ['Brazil', 400],
                ['Canada', 500],
                ['France', 600],
                ['RU', 700]
            ]
        };
        */

        info = JSON.parse(input);
        if (!('type' in info)) {
            // Error. Type is needed
            console.log('Google Chart Error. "type" is needed');
            return;
        }
        if (currentType == null || currentType != info.type) {
            //New graph
            currentType = info.type;
            if (!('options' in  info)) {
                // Error. Type is needed
                console.log('Google Chart Error. "options" is needed');
                return;
            }
            // Set graph options
            currentOptions = info.options;
            if (!('data' in  info)) {
                // Empty graph
                console.log('Google Chart warning. "data" is empty');
                data = [];
            } else {
                data = info.data;
            }
            // Nota: En el caso de la carga de la gráfica inicial, No se necesita
            // redibujar, porque el google.setOnLoadCallback se ejecuta siempre
            // despues de la carga de window. TODO: Hay que probar cuando se cambia una
            // gráfica por otra
            redraw();
        } else {
            // Update
            // TODO new Options
            // Normal case
            data = info.data
            console.log('Google Chart Update. Data: ' + data);
            redraw();
        }
    };

    var redraw = function redraw() {
        // Clean the graph is not necesary
        //clean_graph();
        graph.draw(google.visualization.arrayToDataTable(data), currentOptions);
    };

    var draw_graph = function draw_graph() {
        graph =  new google.visualization[currentType](graphContainer);
        // TODO data formats. Se podría añadir a la estructura de datos de entrada un flag
        // que indique el valor del campo que determina si el primer campo es label o dato.
        // 'false' means that the first row contains labels, not data.
        // 'true' Treat first row as data as well.
        //graph.draw(google.visualization.arrayToDataTable(data, false), currentOptions);
        graph.draw(google.visualization.arrayToDataTable(data), currentOptions);
    };

    var delete_graph = function delete_graph() {
        // Clears the chart, and releases all of its allocated resources.
        currentType = null;
        currentOptions = null
        graph.clearChart();
        //TODO ¿Habrá que hacer algo más para quitarlo del DOM?
    };

    var clean_graph = function clean_graph() {
        graph.clearChart();
    };

    MashupPlatform.widget.context.registerCallback(function (new_values) {
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
    });

    window.addEventListener('load', function () {
        graphContainer = document.getElementById('graphContainer');
        // Resize the linearGraphContainer
        graphContainer.style.height = "100%";
        graphContainer.style.width = "100%";
        init();
    }, true);

    var init = function init() {

        //test
        var testData = {
            'type': "ComboChart",
            'options': {
                title : 'Monthly Coffee Production by Country',
                width: '100%',
                height: '100%',
                vAxis: {title: "Cups"},
                hAxis: {title: "Month"},
                seriesType: "bars",
                series: {5: {type: "line"}}
            },
            'data':[
                ['Month', 'Bolivia', 'Ecuador', 'Madagascar', 'Papua New Guinea', 'Rwanda', 'Average'],
                ['2004/05',  165,      938,         522,             998,           450,      614.6],
                ['2005/06',  135,      1120,        599,             1268,          288,      682],
                ['2006/07',  157,      1167,        587,             807,           397,      623],
                ['2007/08',  139,      1110,        615,             968,           215,      609.4],
                ['2008/09',  136,      691,         629,             1026,          366,      569.6]
            ]
        };
        // Initial Data
        process_input(JSON.stringify(testData));
        // Random Data
        //setInterval(testFunc, 5000);
    };

    // Only 4 Tests with ComboChart
    var testFunc = function(){
        var newData = [
            ['Month', 'Bolivia', 'Ecuador', 'Madagascar', 'Papua New Guinea', 'Rwanda', 'Average'],
            ['2004/05',  Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 900) + 100],
            ['2005/06',  Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 900) + 100],
            ['2006/07',  Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 900) + 100],
            ['2007/08',  Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 900) + 100],
            ['2008/09',  Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 1000) + 1, Math.floor(Math.random() * 900) + 100]
        ]
        process_input(JSON.stringify({'type': "ComboChart",'data': newData}));
    };

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
