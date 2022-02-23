# Virtual Map Forum

[Logo of the Virtual Map Forum](./Resources/Public/images/welcome_logo.png)

The Virtual Map Forum allows the searching and viewing of historic and georeferenced maps and offers further
capabilities for the georeferencing of historic maps (dependencies
to [vk2-georeference](https://github.com/slub/vk2-georeference). The application is developed as an extension for the
CMS [TYPO3](https://typo3.org/). and the extension was tested with TYPO3 version 10.4.

## Configuration

### TYPO3 Extension configuration

For a valid default configuration have a look at [ddev-kartenforum](https://github.com/slub/ddev-kartenforum).
Furthermore the extension can be configured via the `Extension Configuration` in the TYPO3 back office. The following
settings are supported:

| Property                        | Type   | Example                                                                                                                                                                                                                                                                                                                                                                                                           | Description                                                                                                                                                                                                 |
|---------------------------------|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| global.basemaps                 | string | [{"id":"slub-osm","label":"SLUB OSM","urls":["https://tile-1.kartenforum.slub-dresden.de/styles/maptiler-basic-v2/{z}/{x}/{y}.png","https://tile-2.kartenforum.slub-dresden.de/styles/maptiler-basic-v2/{z}/{x}/{y}.png"],"type":"xyz","tileSize":256}, {"id":"bkg-topoplus","label":"BKG TopPlusOpen","urls":["https://sgx.geodatenzentrum.de/wms_topplus_open"],"type":"wms", "layers": "web", "tileSize":512}] | A JSON string containing an array of objects, where each object has the fields `id` (string), `label` (string), `urls` (string[]), `type` ("xyz" or "wms"), `attribution` (string) and `tileSize` (number). |
| global.mapView                  | string | { "extent": [-20026376.39,-20048966.10,20026375.39,20048966.10], "center": [1528150, 6630500], "zoom": 2 }                                                                                                                                                                                                                                                                                                        | A JSON string containing an object which describes the mapView. `extent` (number[]) sets the extents supported by the search view. `zoom` (number) and `center` (number[]) sets the initial map view.       |
| global.urlNominatim             | string | https://kartenforum.slub-dresden.de/nominatim/                                                                                                                                                                                                                                                                                                                                                                    | Base link to the placename searvie. Currently only [nominatim](https://nominatim.org/) is supported.                                                                                                        |
| global.urlSearch                | string | https://search.kartenforum.slub-dresden.de/vk20                                                                                                                                                                                                                                                                                                                                                                   | Link to the search endpoint of the virtual map forum.                                                                                                                                                       |
| global.terrain                  | string | {"url": "https://api.maptiler.com/tiles/terrain-quantized-mesh/?key=kRAKrA0wcbZZFOT64bX5", "attribution": "<a href='https://www.maptiler.com/maps/3d/#10.4800/46.8400/4300/281/-24' target='_blank'>© MapTiler</a>"}                                                                                                                                                                                              | A JSON string containing an object which describes the terrain service. `url` (string) is the url of the terrain services and `attribution` (string) the attribution used for the terrain service.          |
| georeference.georefApi          | string | https://geo.kartenforum.slub-dresden.de                                                                                                                                                                                                                                                                                                                                                                           | Link to the georeference service. Used by the Extension, which works as a Proxy- / Auth-Layer for the client code of the application.                                                                       |
| georeference.georefAuthUser     | string | some_user_name                                                                                                                                                                                                                                                                                                                                                                                                    | Basic auth user name of the georeference service.                                                                                                                                                           |
| georeference.georefAuthPassword | string | some_password                                                                                                                                                                                                                                                                                                                                                                                                     | Basic auth password of the georeference service.                                                                                                                                                            |

### TYPO3 Content configuration

In order for the welcome flyout to be more than a green rectangle some contents have to be added from the TYPO3
backoffice. Any text elements are feasible for this purpose.

![Documentation/images/welcome_content_configuration.png](Documentation/images/welcome_content_configuration.png)

In addition, a button must be included to hide the flyout and disable it for subsequent visits. The following figure
explains how to add such a button. Mainly important is the `Appearance -> Layout` Setting, which has to
be `Map: Welcome Button`.

![Documentation/images/welcome_button_configuration.png](Documentation/images/welcome_button_configuration.png)

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
