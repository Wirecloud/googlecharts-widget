## Introduction

This widget allows you to create any graph/chart/table supported by the [Google Charts library](https://developers.google.com/chart/).

For more information about Google Charts and what kind of graphics you can obtain using this widget, see [Chart Gallery page](https://developers.google.com/chart/interactive/docs/gallery) provided by Google.

## Wiring

Input Endpoints:

- **Data in**: Endpoint providing data to be consumed by the Google Charts
  library. See [the Chart Gallery](https://developers.google.com/chart/interactive/docs/gallery) for a complete set of examples.

Output Endpoints:

* This widget has no output endpoint

### Examples

-   Map showing population data:

        :::json
        {
            "type": "GeoChart",
            "options": {
                "width": "100%",
                "height": "100%"
            },
            "data":[
                ["Country", "Popularity"],
                ["Germany", 200],
                ["United States", 300],
                ["Brazil", 400],
                ["Canada", 500],
                ["France", 600],
                ["RU", 700]
            ]
        }

-   Chart mixing bars and lines:

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
