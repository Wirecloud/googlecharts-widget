window.google = (function () {

    "use strict";

    var events = {};

    var selection = {};

    var data = [];

    var chart = {
        draw: jasmine.createSpy('draw').and.callFake(function (rawdata, ops) {
            data = data;
        }),
        getSelection: jasmine.createSpy('getSelection').and.callFake(function () {
            return selection;
        }),
        setSelection: jasmine.createSpy('setSelection').and.callFake(function (s) {
            selection = s;
        }),
        getNumberOfColumns: jasmine.createSpy('getNumberOfColumns').and.callFake(function () {
            return data.length;
        })
    };

    var buildsuperdata = function(data) {
        if (data.length === 0 ) {
            throw "No data";
        }
        return {
            header: data[0],
            data: data.slice(1),
            getNumberOfRows: function() {
                return this.data.length;
            },
            getNumberOfColumns: jasmine.createSpy('getNumberOfColumns').and.callFake(function () {
                if (this.data.length === 0) {
                    return 0;
                }
                return this.data[0].length;
            }),
            getValue: function(x, y) {
                // if (x + 1 >= this.data.length) {
                //     throw "Out of range";
                // }
                return this.data[x][y];
            },
            getColumnLabel: function(y) {
                return this.header[y];
            }
        };
    };

    var google = {
        load: jasmine.createSpy('load'),
        setOnLoadCallback: jasmine.createSpy('setOnLoadCallback').and.callFake(function (callback) {
            callback();
        }),
        visualization: {
            arrayToDataTable: jasmine.createSpy('arrayToDataTable').and.callFake(function (d) {
                return buildsuperdata(d);
            }),
            LineChart: jasmine.createSpy('LineChart').and.callFake(function (container) {
                return chart;
            }),
            ComboChart: jasmine.createSpy('ComboChart').and.callFake(function (container) {
                return chart;
            }),
            GeoChart: jasmine.createSpy('GeoChart').and.callFake(function (container) {
                return chart;
            }),
            events: {
                addListener: jasmine.createSpy('addListener').and.callFake(function (graph, name, f) {
                    if (!events[graph]) {
                        events[graph] = {};
                    }
                    events[graph][name] = f;
                }),
                trigger: jasmine.createSpy('trigger').and.callFake(function (graph, name, data) {
                    if (events[graph] && events[graph][name]) {
                        events[graph][name](data);
                    }
                })
            }
        }
    };

    return google;

})();
