window.google = (function () {

    "use strict";

    var google = {
        load: jasmine.createSpy('load'),
        setOnLoadCallback: jasmine.createSpy('setOnLoadCallback').and.callFake(function (callback) {
            callback();
        }),
        visualization: {
            arrayToDataTable: jasmine.createSpy('arrayToDataTable'),
            LineChart: jasmine.createSpy('LineChart').and.callFake(function (container) {
                return {draw: jasmine.createSpy('draw')};
            }),
            ComboChart: jasmine.createSpy('ComboChart').and.callFake(function (container) {
                return {draw: jasmine.createSpy('draw')};
            }),
            GeoChart: jasmine.createSpy('GeoChart').and.callFake(function (container) {
                return {draw: jasmine.createSpy('draw')};
            })
        }

    };

    return google;

})();
