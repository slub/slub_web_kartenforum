# Overview of an Appropriate GeoJSON Layer Format

### Introduction

The internally used geojson format is very similar to the format used by [geojson.io](https://geojson.io/). For more information about the basic structure and content of a GeoJSON file please check the page [geojson.org](https://geojson.org/) or to the [RFC 7946](https://tools.ietf.org/html/rfc7946). Below you find more information about the support of GeoJSON features through the VKF.

### **Geometry Types:**

The following geometries are supported through the VKF:

1. Marker (point)
2. Line String
3. Polygon

More geometry types can be basically displayed, but are not fully supported through all GeoJSON functions of the VKF.

### **Coordinate reference system:**
The coordinate reference system (CRS) of a [GeoJSON](http://wiki.geojson.org/GeoJSON_draft_version_6) object is determined by its "crs" member.If no CRS can be so acquired, the default CRS shall apply to the GeoJSON object.

1. **Default coordinate reference system**: The default is a geographic coordinate reference system, using the World Geodetic
   System 1984 (WGS84) datum, and with longitude and latitude units of decimal degrees. **It's recommended to use WGS84 as a CRS in your GeoJSON.**

   <span style="color:red">**If the coordinates are in WGS84 (EPSG 4326) the difintion of the crs in geojson is not necessary otherwise CRS must be defined exactly as follows.**</span>
2. **The "crs" member**: The value of a member named "crs" must be an object (referred to as the CRS object below)
    * The "type" member: The value of this required member must be a string, indicating the type of CRS object.
    * The "properties" member: The value of this required member must be an object.

```
"crs":{
    "type": "name",
    "properties": {
        "name": "EPSG:3857"}
    }
```


## Supported Properties

### Style Properties

| Property Name  | Feature Geometry                                   | Type   | Default Value | Example | Explanation                                          |
|:---------------| :------------------------------------------------- | :----- | :------------ | :------ | :--------------------------------------------------- |
| marker         | Point                                              | String | Blue          | Yellow  | Supported Colors: Blue, Green, Orange, Pink, Yellow  |
| fill           | Polygon                                            | String | #0000FFFF     | #FFFF0044 | Fill color for polygons                            |
| fill-opacity   | Polygon                                            | Number | 0.13          | 0.7     | Transparency of fill color (0 to 1)                  |
| stroke         | LineString, Polygon                                | String | #0000FFFF     | #00FF00FF | Stroke color for lines and polygons                |
| stroke-opacity | LineString, Polygon                                | Number | 1             | 0.7     | Stroke opacity (0 to 1)                              |
| stroke-width   | LineString, Polygon                                | Number | 3             | 13.5    | Width of the stroke (0 to 20 pixels)                 |

<br>
<br>

-   A color description shall mean a rgb color representation of the form `"rgb(r,g,b)"` or `"#rrggbb"`.
-   For polygons, on the one hand the fill color and the alpha channel of the fill color, on the other hand the stroke color, the corresponding alpha channel and the width of the border can be influenced. The keywords "fill", " fill-opacity", "stroke", "stroke-opacity" and "stroke-width" are reserved for this purpose.
-   LineStrings mostly behave like polygons, but do not have a surface, therefore only the stroke properties apply.
-   Points are represented as markers in the application. Because an image file must be provided for each marker, there is so far a fixed selection of available markers.

<br>
<br>
<br>

### Predefined Properties

| Property Name | Feature Geometry | Type   | Default Value           | Example                                                                                   | Explanation           |
|:--------------| :--------------- | :----- | :----------------------- | :---------------------------------------------------------------------------------------- | :-------------------- |
| title         | All              | String | No Title (no title)      | "That is a sample title"                                                                  | -                      |
| description   | All              | String | No Description           | "That is a sample description"                                                            | -                      |
| attributions  | All              | String | null                     | "©pikobytesXdikusa"                                                                       | -                      |
| img_link      | All              | String | null                     | "https://fotothek.slub-dresden.de/fotos/df/hauptkatalog/0312000/df_hauptkatalog_0312816.jpg" | -                      |

## **Examples :**

### point (CRS : EPSG:4326):

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
        "title": "test title for point feature",
        "operational": "yes",
        "marker" : "green"
      }
    }
  ]
}
```

### polygon (CRS : EPSG:3857):

```JSON
{
  "type": "FeatureCollection",
  "crs": {
    "type": "name",
    "properties": {
      "name": "EPSG:3857"
    }
  },
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          1227604.9494884037,
          6754267.2354485085
        ]
      },
      "properties": {
        "marker": "blue"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              1227105.7201474162,
              6751742.424857966
            ],
            [
              1227521.3464887168,
              6751742.424857966
            ],
            [
              1227521.3464887168,
              6752074.448199582
            ],
            [
              1227105.7201474162,
              6752074.448199582
            ],
            [
              1227105.7201474162,
              6751742.424857966
            ]
          ]
        ]
      },
      "properties": {
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
            1227604.9494884037,
            6754264.249627092
          ],
          [
            1227681.3865166889,
            6754068.976906391
          ]
        ]
      },
      "properties": {
        "stroke": "#555555",
        "stroke-opacity": 1,
        "stroke-width": 5
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
