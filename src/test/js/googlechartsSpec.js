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

/*global $, google*/


(function () {

    "use strict";

    jasmine.getFixtures().fixturesPath = 'src/test/fixtures/';

    var dependencyList = [
        'script',
        'div#jasmine-fixtures',
        'div.jasmine_html-reporter'
    ];

    var clearDocument = function clearDocument() {
        $('body > *:not(' + dependencyList.join(', ') + ')').remove();
    };

    var getWiringCallback = function getWiringCallback(endpoint) {
        var calls = MashupPlatform.wiring.registerCallback.calls;
        var count = calls.count();
        for (var i = count - 1; i >= 0; i--) {
            var args = calls.argsFor(i);
            if (args[0] === endpoint) {
                return args[1];
            }
        }
        return null;
    };

    describe("Google Charts widget", function () {

        var widget = null;

        beforeEach(function () {
            loadFixtures('index.html');
            MashupPlatform.widget.context.registerCallback.calls.reset();
            MashupPlatform.wiring.registerCallback.calls.reset();

            google.load.calls.reset();
            google.setOnLoadCallback.calls.reset();

            widget = new Widget();
            spyOn(widget, 'clean_graph').and.callThrough();
            spyOn(widget, 'draw_graph').and.callThrough();
            spyOn(widget, 'redraw').and.callThrough();
            spyOn(widget, 'resizeHandler').and.callThrough();
            widget.init();
        });

        afterEach(function () {
            clearDocument();
        });

        it("loads the Google Charts API", function () {
            expect(google.load).toHaveBeenCalledWith("visualization", "1", jasmine.any(Object));
            expect(google.setOnLoadCallback.calls.count()).toBe(1);
            expect(widget.draw_graph.calls.count()).toBe(1);
            expect(widget.clean_graph.calls.count()).toBe(1);
            expect(widget.graph.draw.calls.count()).toBe(1);
        });

        it("registers a callback for the input endpoint", function () {
            expect(MashupPlatform.wiring.registerCallback)
            .toHaveBeenCalledWith("input", jasmine.any(Function));
        });

        it("registers a widget context callback", function () {
            expect(MashupPlatform.widget.context.registerCallback)
            .toHaveBeenCalledWith(jasmine.any(Function));
        });

        it("handles correctly events comming from the input endpoint (passing type, options and data)", function () {
            var callback = getWiringCallback('input');
            callback('{"type":"ComboChart","options":{"title":"Monthly Coffee Production by Country","width":"100%","height":"100%","vAxis":{"title":"Cups"},"hAxis":{"title":"Month"},"seriesType":"bars","series":{"5":{"type":"line"}}},"data":[["Month","Bolivia","Ecuador","Madagascar","Papua New Guinea","Rwanda","Average"],["2004/05",165,938,522,998,450,614.6],["2005/06",135,1120,599,1268,288,682],["2006/07",157,1167,587,807,397,623],["2007/08",139,1110,615,968,215,609.4],["2008/09",136,691,629,1026,366,569.6]]}');
            expect(widget.draw_graph).toHaveBeenCalled();
        });

        it("handles correctly events comming from the input endpoint (without type)", function () {
            var callback = getWiringCallback('input');
            callback('{"options":{"width":"100%","height":"100%"},"data":[["Country","Popularity"],["Germany",200],["United States",300],["Brazil",400],["Canada",500],["France",600],["RU",700]]}');
            expect(MashupPlatform.widget.log).toHaveBeenCalled();
        });

        it("handles correctly events comming from the input endpoint (without options)", function () {
            var callback = getWiringCallback('input');
            callback('{"type":"GeoChart","data":[["Country","Popularity"],["Germany",200],["United States",300],["Brazil",400],["Canada",500],["France",600],["RU",700]]}');
            expect(MashupPlatform.widget.log).toHaveBeenCalled();
        });

        it("handles correctly events comming from the input endpoint (without data)", function () {
            var callback = getWiringCallback('input');
            callback('{"type":"GeoChart","options":{"width":"100%","height":"100%"}}');
            expect(MashupPlatform.widget.log).toHaveBeenCalled();
        });

        it("redraw on vertical resizes", function () {
            var pref_callback = MashupPlatform.widget.context.registerCallback.calls.argsFor(0)[0];
            pref_callback({"heightInPixels": 100});
            expect(widget.redraw).toHaveBeenCalled();
        });

        it("redraw on horizontal resizes", function () {
            var pref_callback = MashupPlatform.widget.context.registerCallback.calls.argsFor(0)[0];
            pref_callback({"widthInPixels": 100});
            expect(widget.redraw).toHaveBeenCalled();
        });

    });

})();
