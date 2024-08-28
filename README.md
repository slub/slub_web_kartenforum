# Virtual Map Forum

![Logo of the Virtual Map Forum](Documentation/images/header-logo.svg)

The Virtual Map Forum allows the searching and viewing of historic and georeferenced maps and offers further
capabilities for the georeferencing of historic maps (dependencies
to [vk2-georeference](https://github.com/slub/vk2-georeference). The application is developed as an extension for the
CMS [TYPO3](https://typo3.org/). and the extension was tested with TYPO3 version 10.4.

## Configuration

### TYPO3 Extension configuration

For a valid default configuration have a look at [ddev-kartenforum](https://github.com/slub/ddev-kartenforum).
Furthermore the extension can be configured via the `Extension Configuration` in the TYPO3 back office. The following
settings are supported:

| Property                        | Type    | Example                                                                                                                                                                                                                                                                                                                                                                                                           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|---------------------------------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| global.basemaps                 | string  | [{"id":"slub-osm","label":"SLUB OSM","urls":["https://tile-1.kartenforum.slub-dresden.de/styles/maptiler-basic-v2/{z}/{x}/{y}.png","https://tile-2.kartenforum.slub-dresden.de/styles/maptiler-basic-v2/{z}/{x}/{y}.png"],"type":"xyz","tileSize":256}, {"id":"bkg-topoplus","label":"BKG TopPlusOpen","urls":["https://sgx.geodatenzentrum.de/wms_topplus_open"],"type":"wms", "layers": "web", "tileSize":512}] | A JSON string containing an array of objects, where each object has the fields `id` (string), `label` (string), `urls` (string[]), `type` ("xyz" or "wms"), `attribution` (string) and `tileSize` (number).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| global.enableTilePreloading     | boolean | false                                                                                                                                                                                                                                                                                                                                                                                                             | Enable or disable the preloading of terrain tiles in order to make the first switch between 2d and 3d mode faster                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| global.mapView                  | string  | { "extent": [-20026376.39,-20048966.10,20026375.39,20048966.10], "center": [1528150, 6630500], "zoom": 2 }                                                                                                                                                                                                                                                                                                        | A JSON string containing an object which describes the mapView. `extent` (number[]) sets the extents supported by the search view. `zoom` (number) and `center` (number[]) sets the initial map view.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| global.urlNominatim             | string  | https://kartenforum.slub-dresden.de/nominatim/                                                                                                                                                                                                                                                                                                                                                                    | Base link to the placename searvie. Currently only [nominatim](https://nominatim.org/) is supported.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| global.urlSearch                | string  | https://search.kartenforum.slub-dresden.de/vk20                                                                                                                                                                                                                                                                                                                                                                   | Link to the search endpoint of the virtual map forum.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Link to the search endpoint of the virtual map forum.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| global.terrain                  | string  | { "type": "maptiler", "attribution": "<a href='https://www.maptiler.com/maps/3d/#10.4800/46.8400/4300/281/-24' target='_blank'>© MapTiler</a>" "url": "https://api.maptiler.com/tiles/terrain-quantized-mesh/?key=kRAKrA0wcbZZFOT64bX5" } or { "type": "cesium", "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXV", "attribution": "<a href='https://cesium.com/' target='_blank'>© Cesium</a>", "asset": "1" }        | A JSON string containing an object which describes the terrain service. Currently two types of terrain tile provider are supported [MapTiler](https://www.maptiler.com) and [Cesium](https://cesium.com/). They both vary a bit in regards to the configuration. In case of [Cesium](https://cesium.com/) a `token` (string) is needed and a `asset` (number), which referenced to the Asset number, which can be seen in the Cesium Administration panel. In case [MapTiler](https://www.maptiler.com) the token is set implicitly via the `url` (string) property. Both terrain tiles provider support the setting of an `attribution` (string) the attribution used for the terrain service. The `type` declares if the terrain tile source is _cesium_ or _maptiler_. |
| georeference.georefApi          | string  | https://geo.kartenforum.slub-dresden.de                                                                                                                                                                                                                                                                                                                                                                           | Link to the georeference service. Used by the Extension, which works as a Proxy- / Auth-Layer for the client code of the application.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

### TYPO3 Content configuration

In order for the welcome flyout to be more than a green rectangle some contents have to be added from the TYPO3
backoffice. Any text elements are feasible for this purpose.

![Documentation/images/welcome_content_configuration.png](Documentation/images/welcome_content_configuration.png)

In addition, a button must be included to hide the flyout and disable it for subsequent visits. The following figure
explains how to add such a button. Mainly important is the `Appearance -> Layout` Setting, which has to
be `Map: Welcome Button`.

![Documentation/images/welcome_button_configuration.png](Documentation/images/welcome_button_configuration.png)


### TYPO3 Template configuration

In order for the user dropdown to work correctly, the page ids of the specific setup have to be supplied to the extension via the template configuration.
All available configuration parameters can be found here: `Configuration/TypoScript/constants.typoscript`
The following figure shows how to modify the settings:

![Image of the template modification tools, with the constants section highlighted.](Documentation/images/template_configuration.jpg)


## Available query parameters

The permalink implementation provides several query parameters that allow the application to be initialized with a
predetermined state. These query parameters are explained in the following table.

ℹ Arrays are represented as comma seprated values in the same query parameter.

| Name                         | QueryParameter       | Value Type                                | Description                                                                                                |
|------------------------------|----------------------|-------------------------------------------|------------------------------------------------------------------------------------------------------------|
| Basemap Id                   | b                    | String                                    | Allows setting a basemap from the preselection of basemaps available in the vkf (no custom basemaps).      |
| View mode                    | v                    | {0,1}                                     | Allows setting the initial view mode (0 => 2D, 1 => 3D)                                                    |
| Selected maps                | map_id (legacy: oid) | String or Array\<string\>                 | Allows setting the initially selected map(s)                                                               |
| Map View                     | map_view_id          | String                                    | Allows restoring a previously saved map_view from the backend. (with geojson layer or custom basemap etc.) |
| <--- Map view Parameters --> |                      |                                           |                                                                                                            |
| 2d                           |                      |                                           |                                                                                                            |
| Center                       | c                    | Array\<number\> ([number, number]         | Sets the initial center of the map view.                                                                   |
| Resolution                   | re                   | number                                    | Sets the initial map view resolution                                                                       |
| Rotation                     | r                    | number                                    | Sets the initial map view rotation.                                                                        |
| Zoom                         | z                    | number                                    | Sets the initial map view zoom.                                                                            |
| 3d                           |                      |                                           |                                                                                                            |
| Direction                    | d                    | Array\<number\> ([number, number, number] | Sets the initial direction of the camera in 3d view.                                                       |
| Position                     | p                    | Array\<number\> ([number, number, number] | Sets the initial position of the camera in 3d view.                                                        |
| Right                        | r                    | Array\<number\> ([number, number, number] | Sets the initial right parameter of the camera in 3d view.                                                 |
| Up                           | z                    | Array\<number\> ([number, number, number] | Sets the initial up parameter of the camera in 3d view.                                                    |

## Development

Besides some templating and configuration logic, the largest part of the application code is build with JavaScript. The
source code is placed in the directory [Build](./Build).

Main dependencies are:

* [ReactJS](https://reactjs.org/)
* [React-Bootstrap](https://react-bootstrap-v3.netlify.app/)
* [OpenLayers](http://openlayers.org/)
* [Cesium](https://cesium.com/)

For each plugin of the extension, a JavaScript / CSS bundle is build, which is placed in the
directory [Resources/Public/Build/](./Resources/Public/Build)

For building bundles or developing have a look at the `script` commands within [package.json](./Build/package.json).

Basically all production code can be build via the following commands:

```
cd Build/
npm install
npm run build
```
