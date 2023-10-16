# Overview of an Appropriate GeoJSON Layer Format

### Introduction

The internally used geojson format is very similar to the format used by [geojson.io]().

This will be explained in the next paragraphs using some example geometries, where individual features are mapped according to the geojson standard. Instead of explaining the standard, we refer to the page [geojson.org](https://geojson.org/) or to the [RFC 7946](https://tools.ietf.org/html/rfc7946). Instead, it is mainly explained how the application makes use of special styling properties stored under the properties keyword.<br>

### **Geometry Types:**

1. Marker (point)
2. Line String
3. Multi-Line String
4. Circle
5. Polygon
6. Multi-Polygon
7. Geometry Collection

### **Supported Properties:**

1.  Style Properties:

    | Property Name  |                                  Feature Geometry                                   |  Type  | Default Value |  Example  |                       Explanation                       |
        | :------------: | :---------------------------------------------------------------------------------: | :----: | :-----------: | :-------: | :-----------------------------------------------------: |
    |     Marker     |                                 Point, Multi Point                                  | String |     Blue      |  Yellow   | **Supported Colors:** Blue, Green, Orange, Pink, Yellow |
    |      Fill      |                 Polygon, Multi Polygon, Geometry Collection, Circle                 | String |   #0000FFFF   | #FFFF0044 |                            -                            |
    |  Fill Opacity  |                 Polygon, Multi Polygon, Geometry Collection, Circle                 | Number |     0.13      |    0.7    |                      0 < Value < 1                      |
    |     Stroke     | Line String, Multi-Line String, Polygon, Multi Polygon, Geometry Collection, Circle | String |   #0000FFFF   | #00FF00FF |                            -                            |
    | Stroke Opacity | Line String, Multi-Line String, Polygon, Multi Polygon, Geometry Collection, Circle | Number |       1       |    0.7    |                      0 < Value < 1                      |
    |  Stroke Width  | Line String, Multi-Line String, Polygon, Multi Polygon, Geometry Collection, Circle | Number |       3       |   13.5    |              0 < Value < 20 (unit: pixel)               |

    <br>
    <br>

-   A color description shall mean a rgb color representation of the form `"rgb(r,g,b)"` or `"#rrggbb"`.
-   For polygons, on the one hand the fill color and the alpha channel of the fill color, on the other hand the stroke color, the corresponding alpha channel and the width of the border can be influenced. The keywords "fill", " fill-opacity", "stroke", "stroke-opacity" and "stroke-width" are reserved for this purpose.
-   LineStrings mostly behave like polygons, but do not have a surface, therefore only the stroke properties apply.
-   Points are represented as markers in the application. Because an image file must be provided for each marker, there is so far a fixed selection of available markers.

    <br>
    <br>
    <br>

2. Predefined Properties:

   | Property Name | Feature Geometry |  Type  |          Default Value          |                                           Example                                            | Explanation |
       | :-----------: | :--------------: | :----: | :-----------------------------: | :------------------------------------------------------------------------------------------: | :---------: |
   |     Title     |       all        | String |       No Title (no title)       |                                   "That is a sample title"                                   |      -      |
   |  Description  |       all        | String | No Description (no description) |                                "That is a sample description"                                |      -      |
   | Attributions  |       all        | String |              null               |                                     "©pikobytesXdikusa"                                      |      -      |
   |   img_link    |       all        | String |              null               | "https://fotothek.slub-dresden.de/fotos/df/hauptkatalog/0312000/df_hauptkatalog_0312816.jpg" |      -      |

## **Examples :**

### point:

```geojson
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          13.8020494,
          51.0398113
        ]
      },
      "properties": {
        "title": "test title for point feature",
        "operational": "yes"
        "marker" : "green"
      }
    }
  ]
}
```

### polygon:

```geojson
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            1951895.9542902608,
                            9779047.650692312
                        ],
                        [
                            3081940.980458306,
                            9779047.650692312
                        ],
                        [
                            3081940.980458306,
                            10336732.20906096
                        ],
                        [
                            1951895.9542902608,
                            10336732.20906096
                        ],
                        [
                            1951895.9542902608,
                            9779047.650692312
                        ]
                    ]
                ]
            },
            "properties": {
                "title": "Erich Kästner",
                "description": "Erich Kästner (Autor) wuchs als Einzelkind in kleinbürgerlichen Verhältnissen in der Königsbrücker Straße 66 in der Äußeren Neustadt von Dresden auf",
                "fill": "#9a0909",
                "fill-opacity": 0.5,
                "stroke": "#ff0000",
                "stroke-opacity": 1,
                "stroke-width": 2
            }
        }
    ]
}
```

### Complete Example GeoJson File

```JSON
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    13.8020494,
                    51.0398113
                ]
            },
            "properties": {
                "title": "test title",
                "marker": "blue"
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
                "title": "test title",
                "description": "test description",
                "attribution": "©pikobytesXdikusa",
                "img_link": "",
                "fill": "#0000FF",
                "fill-opacity": 0.13,
                "stroke": "#0000FF",
                "stroke-opacity": 1,
                "stroke-width": 3
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [
                        29.22687059905769,
                        54.12468690660333
                    ],
                    [
                        3.695980196117091,
                        47.6545200526283
                    ]
                ]
            },
            "properties": {
                "img_link": "https://fotothek.slub-dresden.de/fotos/df/hauptkatalog/0312000/df_hauptkatalog_0312816.jpg",
                "stroke": "#555555",
                "stroke-opacity": 1,
                "stroke-width": 5
            }
        }
    ]
}

```
