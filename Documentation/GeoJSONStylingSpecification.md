# VKF GeoJSON Styling Specification

## Introduction

This document provides an overview of the GeoJSON layer format that can be used in the Virtual Map Forum to display vector maps. For more information about the basic structure and content of a GeoJSON file please visit the page [geojson.org](https://geojson.org/) or consult the [RFC 7946](https://tools.ietf.org/html/rfc7946).

The app [geojson.io](https://geojson.io/) is a useful tool to visualize both the GeoJSON data itself and its representation on a map.

## Geometry Types

The following geometries are supported in the VKF:

1. Point
2. LineString
3. Polygon

Note: All coordinates must be in the coordinate reference system [WGS84](https://epsg.io/4326). See [Section 4](https://datatracker.ietf.org/doc/html/rfc7946#section-4) in the RFC 7946.

## Supported Feature Properties

### Style Properties

In order to change the way your features are displayed on the map, the following styling properties can be used.

| Property Name  | Supported Feature Geometry | Type   | Default Value | Example | Explanation                          |
| :------------- | :------------------------- | :----- | :------------ | :------ | :----------------------------------- |
| marker         | Point                      | String | #0000FF       | #0000FF | The marker color for point features  |
| fill           | Polygon                    | String | #0000FF       | #FFFF00 | Fill color for polygons              |
| fill-opacity   | Polygon                    | Number | 0.13          | 0.7     | Transparency of fill color (0 to 1)  |
| stroke         | LineString, Polygon        | String | #0000FF       | #00FF00 | Stroke color for lines and polygons  |
| stroke-opacity | LineString, Polygon        | Number | 1             | 0.7     | Stroke opacity (0 to 1)              |
| stroke-width   | LineString, Polygon        | Number | 3             | 13.5    | Width of the stroke (0 to 20 pixels) |

The `stroke` properties define the styling of the outline of a polygon feature.

All color properties (`stroke`, `fill`, `marker`) support hex alpha values such as `#00000055`.

### Predefined Properties

The following properties are displayed in the feature popup[^1] with dedicated styling. The `title` and `time` properties are also displayed in the feature list [^2]. The `time` property can be used to filter features in the feature list.

| Property Name | Type                              | Default Value  | Example                                                                                      |
| :------------ | :-------------------------------- | :------------- | :------------------------------------------------------------------------------------------- |
| title         | String                            | No Title       | "That is a sample title"                                                                     |
| description   | String                            | No Description | "That is a sample description"                                                               |
| time          | String or `Array[string, string]` | `null`         | "2025-06-30" or `["2026-06-30", "2027-06-30"]`                                               |
| img_link      | String                            | `null`         | "https://fotothek.slub-dresden.de/fotos/df/hauptkatalog/0312000/df_hauptkatalog_0312816.jpg" |

The property `time` can be

-   a string in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601), representing a single point in time or
-   an array of 2 ISO 8601 strings, representing a time interval.

Valid `time` values are:

-   `"2025-06-30"`
-   `["2025-06-30", "2025-06-30"]` (identical to the one above)
-   `["2025-06-30", "2026-12-01"]`

### Custom Properties

Custom properties will also be shown in the feature popup[^1]. However, they appear below the predefined properties and are generically styled.
Custom properties **must** be primitive types. Objects or arrays are not supported as values and will not be displayed (and removed when the feature is edited and saved).

## Example

The following example shows a FeatureCollection with a point, a polygon and a line.

```json
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [13.8020494, 51.0398113]
            },
            "properties": {
                "title": "A VKF Point feature",
                "description": "A simple VKF point with a single date.",
                "marker": "#00927e",
                "time": "2026-07-01"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [17.5341796875, 65.6401548998356],
                        [27.685546874999996, 65.6401548998356],
                        [27.685546874999996, 67.62595438857817],
                        [17.5341796875, 67.62595438857817],
                        [17.5341796875, 65.6401548998356]
                    ]
                ]
            },
            "properties": {
                "title": "A VKF Polygon feature",
                "description": "This polygon has various styling properties and a time interval.",
                "img_link": "",
                "fill": "#00b19e",
                "fill-opacity": 0.75,
                "stroke": "#00927e",
                "stroke-opacity": 1,
                "stroke-width": 2,
                "time": ["2025-07-01", "2025-08-01"]
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [29.22687059905769, 54.12468690660333],
                    [3.695980196117091, 47.6545200526283]
                ]
            },
            "properties": {
                "title": "A VKF LineString",
                "description": "A LineString with a picture and styling properties set. The time property is not set.",
                "img_link": "https://fotothek.slub-dresden.de/fotos/df/hauptkatalog/0312000/df_hauptkatalog_0312816.jpg",
                "stroke": "#00927e",
                "stroke-opacity": 1,
                "stroke-width": 7
            }
        }
    ]
}
```

[^1]: The feature popup is a UI component in the VKF that displays detailed information about a feature when the feature is clicked.
[^2]: The feature list is a UI component in the VKF that shows the list of features a vector map contains.
