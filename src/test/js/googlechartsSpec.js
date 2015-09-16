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

/*global $, google, MockMP, MashupPlatform*/

(function () {

    "use strict";

    jasmine.getFixtures().fixturesPath = 'src/test/fixtures/';

    window.MashupPlatform = new MockMP.MockMP();

    var dependencyList = [
        'script',
        'div#jasmine-fixtures',
        'div.jasmine_html-reporter'
    ];

    var clearDocument = function clearDocument() {
        $('body > *:not(' + dependencyList.join(', ') + ')').remove();
    };

    describe("Google Charts widget", function () {

        var widget = null;

        beforeEach(function () {
            loadFixtures('index.html');
            MashupPlatform.reset();
            // MashupPlatform.widget.context.registerCallback.calls.reset();
            // MashupPlatform.wiring.registerCallback.calls.reset();

            google.load.calls.reset();
            google.setOnLoadCallback.calls.reset();

            widget = new Widget();
            spyOn(widget, 'createGraph').and.callThrough();
            spyOn(widget, 'repaintGraph').and.callThrough();
            spyOn(widget, 'resetGraph').and.callThrough();
            widget.init();
        });

        afterEach(function () {
            clearDocument();
        });

        it("loads the Google Charts API", function () {
            expect(google.load).toHaveBeenCalledWith("visualization", "1", jasmine.any(Object));
            expect(google.setOnLoadCallback.calls.count()).toBe(1);
            expect(widget.createGraph.calls.count()).toBe(1);
            expect(widget.repaintGraph.calls.count()).toBe(1);
            expect(widget.resetGraph.calls.count()).toBe(1);
        });

        it("registers a callback for the input endpoint", function () {
            expect(MashupPlatform.wiring.registerCallback)
            .toHaveBeenCalledWith("input", jasmine.any(Function));
        });

        it("registers a widget context callback", function () {
            expect(MashupPlatform.widget.context.registerCallback)
            .toHaveBeenCalledWith(jasmine.any(Function));
        });

        it("throws error message when it's trying to perform any operation with no 'type'", function () {
            MashupPlatform.simulateReceiveEvent('input', {
                options: {
                    width: "100%",
                    height: "100%"
                },
                data: [["Country","Popularity"],["Germany",200],["United States",300],["Brazil",400],["Canada",500],["France",600],["RU",700]]
            });

            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith("Google Chart Error. The field 'type' is required.");
        });

        it("throws error message when it's trying to perform any operation with a 'type' not supported", function () {
            MashupPlatform.simulateReceiveEvent('input', {
                type:"",
                options:{
                    width:"100%",
                    height:"100%"
                },
                data:[["Country","Popularity"],["Germany",200],["United States",300],["Brazil",400],["Canada",500],["France",600],["RU",700]]
            });

            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith("Google Chart Error. The field 'type' is required.");
        });

        it("throws error message when it's trying to switch the graph with no 'options'", function () {
            MashupPlatform.simulateReceiveEvent('input', {
                type:"GeoChart",
                data:[["Country","Popularity"],["Germany",200],["United States",300],["Brazil",400],["Canada",500],["France",600],["RU",700]]
            });

            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith("Google Chart Error. The field 'options' is required.");
        });

        it("handles the data received from the 'input' endpoint to switch the graph", function () {
            MashupPlatform.simulateReceiveEvent('input', {
                type:"ComboChart",
                options:{
                    title:"Monthly Coffee Production by Country",
                    width:"100%",
                    height:"100%",
                    vAxis:{
                        title:"Cups"
                    },
                    hAxis: {
                        title:"Month"
                    },
                    seriesType:"bars",
                    series:{
                        5:{
                            type:"line"
                        }
                    }
                },
                data:[["Month","Bolivia","Ecuador","Madagascar","Papua New Guinea","Rwanda","Average"],["2004/05",165,938,522,998,450,614.6],["2005/06",135,1120,599,1268,288,682],["2006/07",157,1167,587,807,397,623],["2007/08",139,1110,615,968,215,609.4],["2008/09",136,691,629,1026,366,569.6]]});

            expect(MashupPlatform.widget.log).toHaveBeenCalledWith("Google Chart Operation. The graph was updated or created.");
        });

        it("handles the data received (with no data) from the 'input' endpoint to switch and empty the graph", function () {
            MashupPlatform.simulateReceiveEvent('input', {
                type:"GeoChart",
                options:{
                    width:"100%",
                    height:"100%"
                }
            });

            expect(MashupPlatform.widget.log).toHaveBeenCalledWith("Google Chart Operation. The graph was emptied.");
        });

        it("handles the data received (with unique data) from the 'input' endpoint to switch and empty the graph", function () {
            MashupPlatform.simulateReceiveEvent('input', {
                type:"GeoChart",
                options: {
                    width: "100%",
                    height: "100%"
                },
                data:[["Country","Popularity"]]
            });

            expect(MashupPlatform.widget.log).toHaveBeenCalledWith("Google Chart Operation. The graph was emptied.");
        });

        it("handles the data received (with unique data) from the 'input' ", function () {
            MashupPlatform.simulateReceiveEvent('input', {
                type:"LineChart",
                data:[["Country","Popularity"]]
            });

            expect(MashupPlatform.widget.log).toHaveBeenCalledWith("Google Chart Operation. The graph was emptied.");
        });


        it("handles the data received from the 'input' endpoint to update the graph", function () {
            MashupPlatform.simulateReceiveEvent('input', {
                type:"LineChart",
                data:[["Month","Bolivia","Ecuador","Madagascar","Papua New Guinea","Rwanda","Average"],["2004/05",165,938,522,998,450,614.6],["2005/06",135,1120,599,1268,288,682],["2006/07",157,1167,587,807,397,623],["2007/08",139,1110,615,968,215,609.4],["2008/09",136,691,629,1026,366,569.6]]});

            expect(MashupPlatform.widget.log).toHaveBeenCalledWith("Google Chart Operation. The graph was updated or created.");
        });

        it("handles the data received (with no data) from the 'input' endpoint to keep and empty the graph", function () {
            MashupPlatform.simulateReceiveEvent('input', {
                type: "LineChart"
            });

            expect(MashupPlatform.widget.log).toHaveBeenCalledWith("Google Chart Operation. The graph was emptied.");
        });

        it("handles the data received (with unique data) from the 'input' endpoint to keep and empty the graph", function () {
            MashupPlatform.simulateReceiveEvent('input', {
                type:"LineChart",
                data:[["Month","Bolivia","Ecuador","Madagascar","Papua New Guinea","Rwanda","Average"]]
            });

            expect(MashupPlatform.widget.log).toHaveBeenCalledWith("Google Chart Operation. The graph was emptied.");
        });

        it("repaints the graph container when the vertical is resized", function () {
            MashupPlatform.simulateReceiveContext('heightInPixels', 80);
            expect(widget.repaintGraph).toHaveBeenCalled();
            expect(widget.getWrapperElement().style.height).toEqual("64px");
        });

        it("repaints the graph container when the horizontal is resized", function () {
            MashupPlatform.simulateReceiveContext('widthInPixels', 384);
            expect(widget.repaintGraph).toHaveBeenCalled();
            expect(widget.getWrapperElement().style.width).toEqual("374px");
        });

    });

})();
