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

        var defaultdata = {"type":"ComboChart","options":{"title":"Monthly Coffee Production by Country","width":"100%","height":"100%","vAxis":{"title":"Cups"},"hAxis": {"title":"Month"},"seriesType":"bars","series":{"5":{"type":"line"}}},"data":[["Month","Bolivia","Ecuador","Madagascar","Papua New Guinea","Rwanda","Average"],["2004/05",165,938,522,998,450,614.6],["2005/06",135,1120,599,1268,288,682],["2006/07",157,1167,587,807,397,623],["2007/08",139,1110,615,968,215,609.4],["2008/09",136,691,629,1026,366,569.6]]};

        beforeEach(function () {
            loadFixtures('index.html');
            MashupPlatform.reset();

            google.load.calls.reset();
            google.setOnLoadCallback.calls.reset();

            widget = new Widget();
            spyOn(widget, 'createGraph').and.callThrough();
            spyOn(widget, 'repaintGraph').and.callThrough();
            spyOn(widget, 'resetGraph').and.callThrough();
            widget.init();
            widget.loadElement();
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

        var simulateEventWithObjectException = function simulateEventWithObjectException(wname, arg, name, message) {
            try {
                MashupPlatform.simulateReceiveEvent(wname, arg);
            } catch (error) {
                expect(error.name).toEqual(name);
                expect(error.message).toEqual(message);
            }
        };

        it("throws type error when the data are not JSON encoded", function() {
            simulateEventWithObjectException('input', "NOJSON!", "EndpointTypeError", widget.Messages.EncodeError);
            expect(MashupPlatform.wiring.EndpointTypeError).toHaveBeenCalledWith(widget.Messages.EncodeError);
        });

        it("throws error message when it's trying to perform any operation with no 'type'", function () {
            simulateEventWithObjectException('input', {
                options: {
                    width: "100%",
                    height: "100%"
                },
                data: [["Country","Popularity"],["Germany",200],["United States",300],["Brazil",400],["Canada",500],["France",600],["RU",700]]
            }, 'EndpointValueError', widget.Messages.TypeRequired);
            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith(widget.Messages.TypeRequired);
        });

        it("throws error message when it's trying to perform any operation with a 'type' not supported", function () {
            simulateEventWithObjectException('input',{
                type:"",
                options:{
                    width:"100%",
                    height:"100%"
                },
                data:[["Country","Popularity"],["Germany",200],["United States",300],["Brazil",400],["Canada",500],["France",600],["RU",700]]
            } , 'EndpointValueError', widget.Messages.TypeRequired);
            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith(widget.Messages.TypeRequired);
        });

        it("throws error message when it's trying to switch the graph with no 'options'", function () {
            simulateEventWithObjectException('input', {
                type:"GeoChart",
                data:[["Country","Popularity"],["Germany",200],["United States",300],["Brazil",400],["Canada",500],["France",600],["RU",700]]
            }, 'EndpointValueError', widget.Messages.OptionRequired);

            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith(widget.Messages.OptionRequired);
        });

        it("handles the data received from the 'input' endpoint to switch the graph", function () {
            MashupPlatform.simulateReceiveEvent('input', {
                "type":"ComboChart",
                "options":{
                    "title":"Monthly Coffee Production by Country",
                    "width":"100%",
                    "height":"100%",
                    "vAxis":{
                        "title":"Cups"
                    },
                    "hAxis": {
                        "title":"Month"
                    },
                    "seriesType":"bars",
                    "series":{
                        "5":{
                            "type":"line"
                        }
                    }
                },
                "data":[["Month","Bolivia","Ecuador","Madagascar","Papua New Guinea","Rwanda","Average"],["2004/05",165,938,522,998,450,614.6],["2005/06",135,1120,599,1268,288,682],["2006/07",157,1167,587,807,397,623],["2007/08",139,1110,615,968,215,609.4],["2008/09",136,691,629,1026,366,569.6]]});

            expect(MashupPlatform.widget.log).toHaveBeenCalledWith(widget.Messages.UpdatedCreated, MashupPlatform.log.INFO);
        });

        it("handles the data received (with no data) from the 'input' endpoint to switch and empty the graph", function () {
            MashupPlatform.simulateReceiveEvent('input', {
                type:"GeoChart",
                options:{
                    width:"100%",
                    height:"100%"
                }
            });

            expect(MashupPlatform.widget.log).toHaveBeenCalledWith(widget.Messages.Emptied, MashupPlatform.log.INFO);
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

            expect(MashupPlatform.widget.log).toHaveBeenCalledWith(widget.Messages.Emptied, MashupPlatform.log.INFO);
        });

        it("handles the data received (with unique data) from the 'input' ", function () {
            MashupPlatform.simulateReceiveEvent('input', {
                type:"LineChart",
                data:[["Country","Popularity"]]
            });

            expect(MashupPlatform.widget.log).toHaveBeenCalledWith(widget.Messages.Emptied, MashupPlatform.log.INFO);
        });


        it("handles the data received from the 'input' endpoint to update the graph", function () {
            MashupPlatform.simulateReceiveEvent('input', {
                type:"LineChart",
                data:[["Month","Bolivia","Ecuador","Madagascar","Papua New Guinea","Rwanda","Average"],["2004/05",165,938,522,998,450,614.6],["2005/06",135,1120,599,1268,288,682],["2006/07",157,1167,587,807,397,623],["2007/08",139,1110,615,968,215,609.4],["2008/09",136,691,629,1026,366,569.6]]});

            expect(MashupPlatform.widget.log).toHaveBeenCalledWith(widget.Messages.UpdatedCreated, MashupPlatform.log.INFO);
        });

        it("handles the data received (with no data) from the 'input' endpoint to keep and empty the graph", function () {
            MashupPlatform.simulateReceiveEvent('input', {
                type: "LineChart"
            });

            expect(MashupPlatform.widget.log).toHaveBeenCalledWith(widget.Messages.Emptied, MashupPlatform.log.INFO);
        });

        /*
         UPDATE
         */

        it("handles error in update action when there are no previous graph", function () {

            var errorm = widget.Messages.GraphRequired;
            widget.graph = null;
            simulateEventWithObjectException('input', {action: "update"}, 'EndpointValueError', errorm);
            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith(errorm);
        });

        it("handlers error in update action when there are no data", function () {
            var errorm = widget.Messages.DataRequired;
            simulateEventWithObjectException('input', {action: "update"}, 'EndpointValueError', errorm);
            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith(errorm);
        });

        it("handles error in update with less data", function() {
            var errorm = widget.Messages.DataRequired;
            simulateEventWithObjectException('input', {
                action: "update",
                data: [["Month","Bolivia","Ecuador","Madagascar","Papua New Guinea","Rwanda","Average"]]}, 'EndpointValueError', errorm);
            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith(errorm);
        });

        it("handles a good update", function() {
            MashupPlatform.simulateReceiveEvent('input', {
                action: "update",
                data: [["Month","Bolivia","Ecuador","Madagascar","Papua New Guinea","Rwanda","Average"],["2004/05",165,938,522,998,450,614.6]]
            });
            expect(MashupPlatform.widget.log).toHaveBeenCalledWith(widget.Messages.UpdatedCreated, MashupPlatform.log.INFO);
        });

        /*
         SLICE
         */
        it("handles error in slice action when there are no previous graph", function () {

            var errorm = widget.Messages.GraphRequired ;
            widget.graph = null;
            simulateEventWithObjectException('input', {action: "slice"}, 'EndpointValueError', errorm);
            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith(errorm);
        });

        it("handlers error in slice action when there are no data", function () {
            var errorm = widget.Messages.DataRequired;
            simulateEventWithObjectException('input', {action: "slice"}, 'EndpointValueError', errorm);
            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith(errorm);
        });

        it("handlers error in slice action when there are no previous data", function () {
            var errorm = widget.Messages.PreviousDataRequired;
            widget.lastData = null;
            simulateEventWithObjectException('input', {action: "slice", data: []}, 'EndpointValueError', errorm);
            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith(errorm);
        });

        it("handlers error in slice action when the previous data are low", function () {
            var errorm = widget.Messages.PreviousDataRequired;
            widget.lastData = [[]];
            simulateEventWithObjectException('input', {action: "slice", data: []}, 'EndpointValueError', errorm);
            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith(errorm);
        });

        it("handles a good slice", function () {
            MashupPlatform.simulateReceiveEvent('input', {
                action: "slice",
                data: [["0", "1"]]
            });
            expect(MashupPlatform.widget.log).toHaveBeenCalledWith(widget.Messages.UpdatedCreated, MashupPlatform.log.INFO);
        });


        /*
         APPEND && MAXDATA setting
         */

        it("handles error in append when there are no previous graph", function() {
            var errorm = widget.Messages.GraphRequired ;
            widget.graph = null;
            simulateEventWithObjectException('input', {action: "append"}, 'EndpointValueError', errorm);
            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith(errorm);
        });

        it("handlers error in append action when there are no data", function () {
            var errorm = widget.Messages.DataRequired;
            simulateEventWithObjectException('input', {action: "append"}, 'EndpointValueError', errorm);
            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith(errorm);
        });

        it("handlers error in append action when the data length are different of 1", function () {
            var errorm = widget.Messages.DataOneLength;
            widget.lastData = null;
            simulateEventWithObjectException('input', {action: "append", data: []}, 'EndpointValueError', errorm);
            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith(errorm);

            simulateEventWithObjectException('input', {action: "append", data: [["1"], ["2"]]}, 'EndpointValueError', errorm);
            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith(errorm);
        });


        it("handlers error in append action when there are no previous data", function () {
            var errorm = widget.Messages.PreviousDataRequired;
            widget.lastData = null;
            simulateEventWithObjectException('input', {action: "append", data: [[]]}, 'EndpointValueError', errorm);
            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith(errorm);
        });

        it("handlers error in append action when the previous data are low", function () {
            var errorm = widget.Messages.PreviousDataRequired;
            widget.lastData = [[]];
            simulateEventWithObjectException('input', {action: "append", data: [[]]}, 'EndpointValueError', errorm);
            expect(MashupPlatform.wiring.EndpointValueError).toHaveBeenCalledWith(errorm);
        });

        it("handles a good append", function () {
            MashupPlatform.simulateReceiveEvent('input', {
                action: "append",
                data: [["0", "1"]]
            });
            expect(MashupPlatform.widget.log).toHaveBeenCalledWith(widget.Messages.UpdatedCreated, MashupPlatform.log.INFO);
        });

        it("let not update maxdata if not present in settings", function () {
            expect(widget.getMaxData()).toEqual(0);
            MashupPlatform.simulateReceiveEvent('input', {
                action: "setting"
            });
            expect(MashupPlatform.widget.log).not.toHaveBeenCalledWith(widget.Messages.SettingUpdated, MashupPlatform.log.INFO);
            expect(widget.getMaxData()).toEqual(0);
        });


        it("let add maxdata setting", function () {
            expect(widget.getMaxData()).toEqual(0);
            MashupPlatform.simulateReceiveEvent('input', {
                action: "setting",
                maxdata: 5
            });
            expect(MashupPlatform.widget.log).toHaveBeenCalledWith(widget.Messages.SettingUpdated, MashupPlatform.log.INFO);
            expect(widget.getMaxData()).toEqual(5);
        });

        it("let remove first data in append when maxdata", function () {
            expect(widget.getMaxData()).toEqual(0);
            MashupPlatform.simulateReceiveEvent('input', {
                action: "setting",
                maxdata: 2
            });
            expect(MashupPlatform.widget.log).toHaveBeenCalledWith(widget.Messages.SettingUpdated, MashupPlatform.log.INFO);
            expect(widget.getMaxData()).toEqual(2);

            MashupPlatform.simulateReceiveEvent('input', {
                action: "append",
                data: [["0", "1"]]
            });
            MashupPlatform.simulateReceiveEvent('input', {
                action: "append",
                data: [["0", "1"]]
            });
        });

        it("handles the data received (with unique data) from the 'input' endpoint to keep and empty the graph", function () {
            MashupPlatform.simulateReceiveEvent('input', {
                type:"LineChart",
                data:[["Month","Bolivia","Ecuador","Madagascar","Papua New Guinea","Rwanda","Average"]]
            });

            expect(MashupPlatform.widget.log).toHaveBeenCalledWith(widget.Messages.Emptied , MashupPlatform.log.INFO);
        });

        it("repaints the graph container when the vertical is resized", function () {
            MashupPlatform.simulateReceiveContext('heightInPixels', 80);
            expect(widget.repaintGraph).toHaveBeenCalled();
            expect(widget.getWrapperElement().style.height).toEqual("78px");
        });

        it("repaints the graph container when the horizontal is resized", function () {
            MashupPlatform.simulateReceiveContext('widthInPixels', 384);
            expect(widget.repaintGraph).toHaveBeenCalled();
            expect(widget.getWrapperElement().style.width).toEqual("374px");
        });


        /* SEND DATA WHEN SELECT */

        it("should send when one data when selected", function (done) {
            MashupPlatform.setStrategy({
                'wiring.pushEvent': function(name, data) {
                    expect(name).toEqual("data_selected");
                    expect(data).toEqual(JSON.stringify([{"row_value":165,"row_label":"Bolivia","col_value":"2004/05","col_label":"Month"}]));
                    done();
                }
            });
            widget = new Widget();
            MashupPlatform.simulateReceiveEvent('input', defaultdata);

            widget.getGraph().setSelection([{row: 0, column: 1}]);
            google.visualization.events.trigger(widget.getGraph(), 'select', {});
        });

        it("should send when all the row", function (done) {
            MashupPlatform.setStrategy({
                'wiring.pushEvent': function(name, data) {
                    expect(name).toEqual("data_selected");
                    expect(data).toEqual(JSON.stringify([{"row_value":165,"row_label":"Bolivia","col_value":"2004/05","col_label":"Month"},{"row_value":135,"row_label":"Bolivia","col_value":"2005/06","col_label":"Month"},{"row_value":157,"row_label":"Bolivia","col_value":"2006/07","col_label":"Month"},{"row_value":139,"row_label":"Bolivia","col_value":"2007/08","col_label":"Month"},{"row_value":136,"row_label":"Bolivia","col_value":"2008/09","col_label":"Month"}]));
                    done();
                }
            });

            widget = new Widget();
            MashupPlatform.simulateReceiveEvent('input', defaultdata);

            widget.getGraph().setSelection([{row: null, column: 1}]);
            google.visualization.events.trigger(widget.getGraph(), 'select', {});
        });

        it("should send when all the column", function (done) {
            MashupPlatform.setStrategy({
                'wiring.pushEvent': function(name, data) {
                    expect(name).toEqual("data_selected");
                    expect(data).toEqual(JSON.stringify([{"row_value":"2005/06","row_label":"Month","col_value":"2005/06","col_label":"Month"},{"row_value":135,"row_label":"Bolivia","col_value":"2005/06","col_label":"Month"},{"row_value":1120,"row_label":"Ecuador","col_value":"2005/06","col_label":"Month"},{"row_value":599,"row_label":"Madagascar","col_value":"2005/06","col_label":"Month"},{"row_value":1268,"row_label":"Papua New Guinea","col_value":"2005/06","col_label":"Month"},{"row_value":288,"row_label":"Rwanda","col_value":"2005/06","col_label":"Month"},{"row_value":682,"row_label":"Average","col_value":"2005/06","col_label":"Month"}]));
                    done();
                }
            });

            widget = new Widget();
            MashupPlatform.simulateReceiveEvent('input', defaultdata);

            widget.getGraph().setSelection([{row: 1, column: null}]);
            google.visualization.events.trigger(widget.getGraph(), 'select', {});
        });

        it("should not send when no column and no row", function (done) {
            var listener = jasmine.createSpy('listener');
            MashupPlatform.setStrategy({
                'wiring.pushEvent': listener
            });

            widget = new Widget();
            MashupPlatform.simulateReceiveEvent('input', defaultdata);

            widget.getGraph().setSelection([{row: null, column: null}]);
            google.visualization.events.trigger(widget.getGraph(), 'select', {});
            setTimeout(function () {
                expect(listener).not.toHaveBeenCalled();
                done();
            }, 500);
        });
    });

})();
