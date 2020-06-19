# Virtual Map Forum 2.0

<a href="http://kartenforum.slub-dresden.de"><img src="https://raw.githubusercontent.com/slub/vk2-extension/master/Resources/Public/images/welcome_logo.png" align="left" hspace="10" vspace="6"></a>

The Virtual Map Forum 2.0 allows the searching and viewing of historic and georeferenced maps and offers further capabilities for the georeferencing of historic maps (dependencies to [vk2-georeference](https://github.com/slub/vk2-georeference). The application is developed as an extension for the CMS [TYPO3](https://typo3.org/).

## Install

### TYPO3

The extension uses the TYPO3 core extension `felogin`, for allowing users to register and login into the application. Furthermore it uses the extensions `RSA`, `SA authentication for TYPO3` and `Salted user password hashes`.

The extension was tested with TYPO3 version 6.2 and 7.6.x. It uses the [Fluid](https://wiki.typo3.org/Fluid) template engine and [Extbase](https://docs.typo3.org/typo3cms/ExtbaseFluidBook/)

#### Configuration

The TYPO3 extension could be configured via a FlexForm from within the TYPO3 backend. Therefor go in the page tree to WEB>PAGE and choose the page where you have installed the `Virtual Map Forum 2.0 Extension`. Click then edit and go to the Plugin tab.

In the Plugin tab you got a couple options:

__RealURL active:__

This says the frontend code (javascript) if it should assume speaking urls or not. A lot of power of the application lies in the client code and therefor the client often decides where to go. Therefor it has to know if the backend uses realURL or not.

__URL Elastic Search:__

[ElasitcSearch](https://www.elastic.co/) is the central search index used by the application. It is also used by the georeference backend to publish results. Define here the ElasticSearch endpoint.

__Nominatim Service URL:__

In this field the placename services should be linked. It expects a Nominatim based placename services like `https://kartenforum.slub-dresden.de/nominatim/search.php`.

__3D Terrain Tile Provider:__

In this field the terrain tile provider is configured. For example: `https://maps.tilehosting.com/data/terrain-quantized-mesh/?key=kRAKrA0wcbZZFOT64bX5`.

__Georeferencing active:__

This parameter tells the client code if georeference is active. It is used for a couple of client decisions and has to be in sync with the `Type` settings.

__Type:__

The `Virtual Map Forum 2.0 Extension` can me run in two modes. The `Search and Visualization` allows user to search and display georeference maps. It doesn't support the georeferencing of them, so there has to be now georeference backend. Further because of missing georeferencing is also doesn't need a user authentification. The mode `Search, Visualization and Georeferencing` futher allows the georeferencing of maps. Therefor also a georeference backend has to be set.

__Georeference backend:__

Defines the endpoint of the georeferencing backend. The TYPO3 extension routes requests regarding this georeferencing directly to this endpoint and is tightly bind to it.

__Dynamic WMS URL:__

This is also only necessary when georeferencing is active. It defines the URL of the dynamic wms, which is used in the user history application.

### Javascript

The frontend relies heavily on Javascript. Main depenendies are:

* [OpenLayers 3](http://openlayers.org/) / [Cesium](https://cesiumjs.org/) for Mapping 2D / 3D
* [Closure Library](https://developers.google.com/closure/library/) as Utitlity Library
* [Closure Compiler](https://developers.google.com/closure/compiler/) as Javascript Compiler

#### Developing

To install the external dependencies of the library [npm](https://www.npmjs.com/) and [bower](http://bower.io/) can be used. For this go to the root folder `Build/vk2/` and run the following commands from your commandline:

```
# install dependencies via npm
npm install

# install dependencies via bower
node_modules/bower/bin/bower install

# install closure compiler
cd node_modules/closure-compiler/
npm install
```

For proper working of the closure compiler make sure a `openjdk-8` is installed.

By default the extension will use only the production javascript libraries, means libraries delivered by CDN and minified. For developing it is often easier to use local libraries installed by bower. You can switch the URLs of the libraries in the `Configuration/TypoScript/setup.txt` file.


The google closure library brings an own management system for javascript dependencies with it. This system is also used to management the javascript dependencies of the library in developing mode. The dependencies are therefor descriped in the file `Build/vk2/src/vk2-deps.js`.

If you change dependencies or add new files to library the deps files has to be updated. This can be done with the following command:

	python Resources/Public/lib/closure-library/closure/bin/build/depswriter.py --root_with_prefix="Resources/Public/src ../../../../src" > Resources/Public/src/vk2-deps.js

For building a minified version of the library the google closure compiler is used. Therefor the `extern` are saved in the directory `Build/vk2/externs`. Also the compiler can be used with a [gulpfile](http://gulpjs.com/). The configuration therefor could be find in the `Build/vk2/gulpfile.js` file. It could be run via the following command:

	node_modules/gulp/bin/gulp.js

The compiled version of the library could be found in the `Resources/Public/JavaScript/Dist/` directory.

__Build Openlayers:__

To build an custom OpenLayers version run the following commands from the `Build/vk2/lib/openLayers`

	npm install

	node tasks/build.js ../../../../Build/ol-vk2.json ../../dist/ol-vk2.js

With this commands you can build a debug version of OpenLayers.

	node tasks/build.js config/ol-debug.json ./ol-debug.js
