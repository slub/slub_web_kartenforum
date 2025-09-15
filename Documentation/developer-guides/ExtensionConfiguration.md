# Extension Configuration

## Example JSON for basemaps

```JSON
[
  {
    "id": "slub-osm",
    "label": "SLUB OSM",
    "urls": [
      "https://tile-1.kartenforum.slub-dresden.de/styles/maptiler-basic-v2/{z}/{x}/{y}.png",
      "https://tile-2.kartenforum.slub-dresden.de/styles/maptiler-basic-v2/{z}/{x}/{y}.png",
      "https://tile-3.kartenforum.slub-dresden.de/styles/maptiler-basic-v2/{z}/{x}/{y}.png",
      "https://tile-4.kartenforum.slub-dresden.de/styles/maptiler-basic-v2/{z}/{x}/{y}.png"
    ],
    "type": "xyz",
    "tileSize": 256,
    "attribution": "<a href=\"https://kartenforum.slub-dresden.de/\" target=\"_blank\">Hosted by SLUB Dresden</a> <a href=\"https://www.pikobytes.de/\" target=\"_blank\">built by PIKOBYTES GmbH</a> <a href=\"https://www.openmaptiles.org/\" target=\"_blank\">&copy; OpenMapTiles</a> <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">&copy; OpenStreetMap contributors</a>"
  },
  {
    "id": "maptiler-satellite",
    "label": "MapTiler Satellite",
    "urls": [
      "https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=9wghD5zlvdu13A81zHqB"
    ],
    "type": "xyz",
    "tileSize": 512,
    "attribution": "<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">© MapTiler</a> <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">© OpenStreetMap contributors</a>"
  },
  {
    "id": "bkg-topoplus",
    "label": "TopPlusOpen",
    "urls": [
      "https://sgx.geodatenzentrum.de/wms_topplus_open"
    ],
    "type": "wms",
    "layers": "web",
    "tileSize": 512,
    "attribution": "<a href=\"https://sg.geodatenzentrum.de/web_public/Datenquellen_TopPlus_Open.pdf\" target=\"blank\">© Bundesamt für Kartographie und Geodäsie 2022</a>"
  }
]
```

This code may be copied as is into Extension Configuration -> slub_web_kartenforum.
