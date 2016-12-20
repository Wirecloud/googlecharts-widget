Google Charts Widget
====================

This widget allows you to create any graph/charts supported by the [Google Charts library](https://developers.google.com/chart/).

For more information about Google Charts and what kind of graphics you can obtain using this widget, see [Chart Gallery page](https://developers.google.com/chart/interactive/docs/gallery) provided by Google.

## Configurations

### Preferences

This widget has not preferences.

### Wiring

#### Input Endpoints:

* **Data in**: Input endpoint for sending the data and the options for building the chart using the Google Charts library. Data coming from this endpoint should be structured using json with the following attributes:

    * `type (String)`: Name of the visualization's class to use.
    * `options (Object)`: A map of name/value pairs of custom options. Examples include height and width, background colors, and captions. The visualization documentation should list which options are available, and should support default options if you do not specify this parameter.
    * `data`: A two-dimensional array, where each row represents a row in the data table. The first row will be interpreted as header labels. The data types of each column are interpreted automatically from the data given. If a cell has no value, specify a `null` or empty value as appropriate.

#### Output Endpoints:

* **Selected data**: Output endpoint for sending selected data. The data is an array with the elemens selected. Every element have this data:

    * `row_value (String)`: Value of the row selected.
    * `row_label (String)`: Label of the row selected.
    * `col_value (String)`: Value of the column selected.
    * `col_label (String)`: Label of the column selected.

## Examples

* Map showing population data:

        :::json
        {
            "type": "GeoChart",
            "options": {
                "width": "100%",
                "height": "100%"
            },
            "data": [
                ["Country", "Popularity"],
                ["Germany", 200],
                ["United States", 300],
                ["Brazil", 400],
                ["Canada", 500],
                ["France", 600],
                ["RU", 700]
            ]
        }

* Chart mixing bars and lines:

        :::json
        {
            "type": "ComboChart",
            "options": {
                "title": "Monthly Coffee Production by Country",
                "width": "100%",
                "height": "100%",
                "vAxis": {"title": "Cups"},
                "hAxis": {"title": "Month"},
                "seriesType": "bars",
                "series": {"5": {"type": "line"}}
            },
            "data": [
                ["Month", "Bolivia", "Ecuador", "Madagascar", "Papua New Guinea", "Rwanda", "Average"],
                ["2004/05",  165,      938,         522,             998,           450,      614.6],
                ["2005/06",  135,      1120,        599,             1268,          288,      682],
                ["2006/07",  157,      1167,        587,             807,           397,      623],
                ["2007/08",  139,      1110,        615,             968,           215,      609.4],
                ["2008/09",  136,      691,         629,             1026,          366,      569.6]
            ]
        }
