goog.provide('vk2.app.AdminEvaluationApp');

goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.net.XhrIo');
goog.require('goog.net.EventType');
goog.require('vk2.settings');
goog.require('vk2.utils');
goog.require('vk2.utils.routing');
goog.require('vk2.georeference.utils');
goog.require('vk2.georeference.view.TargetView');
goog.require('vk2.georeference.GeoreferencerService');

/**
 * @constructor
 * @export
 * @param {Object} settings
 * 		{string} btn_getallprocess
 * 		{string} process_list
 * 		{string} map_container
 */
vk2.app.AdminEvaluationApp = function(settings){
	if (goog.DEBUG)
		console.log('Create new vk2.app.AdminEvaluationApp');
	
	if (!settings.hasOwnProperty('process_list') || !settings.hasOwnProperty('map_container'))
		throw "Missing parameter in the vk2.app.AdminEvaluationApp settings. Please check the documentation.";
	
	this.initializeEvaluationMap_(settings['map_container']);
	
	if (settings.hasOwnProperty('btn_getallprocess'))
		this.addFetchProcessEvent_(settings['btn_getallprocess'], settings['process_list']);
	
	if (settings.hasOwnProperty('btn_getallinvalideprocess'))
		this.addFetchProcessEvent_(settings['btn_getallinvalideprocess'], settings['process_list'], 'validation=invalide');
	
	if (settings.hasOwnProperty('btn_getsingleprocess_mapid'))
		this.addFetchSingleProcessForMapId_(settings['btn_getsingleprocess_mapid'], settings['process_list']);
	
	if (settings.hasOwnProperty('btn_getsingleprocess_userid'))
		this.addFetchSingleProcessForUserId_(settings['btn_getsingleprocess_userid'], settings['process_list']);
};

/**
 * @param {string} idEventTrigger
 * @param {string} resultContainer
 * @param {string=} opt_param
 * @private
 */
vk2.app.AdminEvaluationApp.prototype.addFetchProcessEvent_ = function(idEventTrigger, resultContainer, opt_param){
	var eventTrigger = goog.dom.getElement(idEventTrigger);
	
	// add event to the trigger
	goog.events.listen(eventTrigger, 'click', function(event){
		if (goog.DEBUG)
			console.log('fetch data from server ...');
		
		var xhr = new goog.net.XhrIo();
		
		// add listener to request object
		goog.events.listenOnce(xhr, goog.net.EventType.SUCCESS, function(e){
			var xhr = /** @type {goog.net.XhrIo} */ (e.target);
			this.displayProcesses_(resultContainer, xhr.getResponseJson());
			xhr.dispose();
		}, false, this);
		
		goog.events.listenOnce(xhr, goog.net.EventType.ERROR, function(e){
			alert('Something went wrong, while trying to fetch data from the server.')
		}, false, this);
		
		// send request
		var params = goog.isDef(opt_param) ? opt_param : undefined,
			url = vk2.utils.routing.getGeoreferenceAdminProcessRoute(params);
		xhr.send(url, 'GET');	
	}, undefined, this);
};

/**
 * @param {string} idEventTrigger
 * @param {string} resultContainer
 * @private
 */
vk2.app.AdminEvaluationApp.prototype.addFetchSingleProcessForMapId_ = function(idEventTrigger, resultContainer){
	var eventTrigger = goog.dom.getElement(idEventTrigger);
	
	// add event to the trigger
	goog.events.listen(eventTrigger, 'click', function(event){
		if (goog.DEBUG)
			console.log('fetch data from server ...');
		
		var inputFieldId = event.currentTarget.getAttribute('data-src');
		var inputFieldEl = goog.dom.getElement(inputFieldId);
		var mapid = inputFieldEl.value;
		
		var xhr = new goog.net.XhrIo();
		
		// add listener to request object
		goog.events.listenOnce(xhr, goog.net.EventType.SUCCESS, function(e){
			var xhr = /** @type {goog.net.XhrIo} */ (e.target);
			this.displayProcesses_(resultContainer, xhr.getResponseJson());
			xhr.dispose();
		}, false, this);
		
//		goog.events.listenOnce(xhr, goog.net.EventType.ERROR, function(e){
//			alert('Something went wrong, while trying to fetch data from the server.');
//			debugger;
//		}, false, this);
		
		// send request
		var params = 'mapid=' + mapid,
			url = vk2.utils.routing.getGeoreferenceAdminProcessRoute(params);
		xhr.send(url, 'GET');	
	}, undefined, this);
};

/**
 * @param {string} idEventTrigger
 * @param {string} resultContainer
 * @private
 */
vk2.app.AdminEvaluationApp.prototype.addFetchSingleProcessForUserId_ = function(idEventTrigger, resultContainer){
	var eventTrigger = goog.dom.getElement(idEventTrigger);
	
	// add event to the trigger
	goog.events.listen(eventTrigger, 'click', function(event){
		
		if (goog.DEBUG)
			console.log('fetch data from server ...');
		
		var inputFieldId = event.currentTarget.getAttribute('data-src');
		var inputFieldEl = goog.dom.getElement(inputFieldId);
		var userid = inputFieldEl.value;
		
		var xhr = new goog.net.XhrIo();
		
		// add listener to request object
		goog.events.listenOnce(xhr, goog.net.EventType.SUCCESS, function(e){
			var xhr = /** @type {goog.net.XhrIo} */ (e.target);
			this.displayProcesses_(resultContainer, xhr.getResponseJson());
			xhr.dispose();
		}, false, this);
		
		goog.events.listenOnce(xhr, goog.net.EventType.ERROR, function(e){
			alert('Something went wrong, while trying to fetch data from the server.')
		}, false, this);
		
		// send request
		var params = 'userid=' + userid,
			url = vk2.utils.routing.getGeoreferenceAdminProcessRoute(params);
		xhr.send(url, 'GET');	
		
	}, undefined, this);
};

/**
 * Creates a html element for a given georeference record.
 * @param {Object} record
 * @return {Element}
 * @private
 */
vk2.app.AdminEvaluationApp.prototype.createProcessListElement_ = function(record) {

	if (goog.DEBUG)
		console.log(record);

	var articleType_ = record['adminvalidation'] === 'invalide'
			? 'panel-danger'
			: record['adminvalidation'] === 'isvalide'
				? 'panel-success'
				: 'panel-warning',
		parentEl_ = goog.dom.createDom('article', {
			'id': record['georef_id'],
			'class': 'panel ' + articleType_ + ' record'
		});

	//
	// create header
	//
	var headerEl_ = goog.dom.createDom('div', {
		'class': 'panel-heading',
		'innerHTML': '<h3>' + record['title'] + ' <span class="label label-default">' + record['type'] + '</span> ' +
		'<span class="right">' + record['georef_id'] + '</span></h3>'
	});
	goog.dom.appendChild(parentEl_, headerEl_);

	// add show map button
	var showMapBtn_ = goog.dom.createDom('button', {
		'data-params-georef': JSON.stringify(record['georef_params']),
		'data-params-id': parseInt(record['oai'].split('-')[2]),
		'class':'btn btn-default btn-show-georef',
		'innerHTML': 'Vorschau anzeigen ...'
	});

	// if clippolygon exists add it
	if (record['clippolygon'] !== undefined)
		showMapBtn_.setAttribute('data-params-clip',JSON.stringify(record['clippolygon']));

	this.registerShowMapEventListener_(showMapBtn_);
	goog.dom.appendChild(headerEl_, showMapBtn_);

	// go to process
	goog.dom.appendChild(headerEl_, goog.dom.createDom('a', {
		'href': vk2.utils.routing.getGeorefPageRoute(undefined, 'georeferenceid=' + record['georef_id']),
		'class':'btn btn-default action-btn',
		'target':'_blank',
		'innerHTML': 'Georeferenzierung anzeigen ...'
	}));

	//
	// create body
	//
	var bodyEl_ = goog.dom.createDom('div', {'class': 'panel-body'}),
	helperFactory_ = function (label, value, opt_spanClassName) {
		var spanClassName = opt_spanClassName !== undefined ? opt_spanClassName : '';

		return goog.dom.createDom('p', {
			'innerHTML': '<strong>' + label + '</strong> <span class="' + spanClassName + '">' + value + '</span>'
		});
	};

	// create georef-params phrases
	var georefHeaderPhraseEl_ = helperFactory_('Georeferenzierungsparameter vom ' + record['georef_time'] + ':', '', 'glyphicon glyphicon-triangle-left right'),
		georefBodyPhraseEl_ = goog.dom.createDom('p', {
			'class': 'georef-params',
			'innerHTML': 'Passpunkte: <br>' + JSON.stringify(record['georef_params']) + '<br><br>Clip-Polygon: <br>'
				+ JSON.stringify(record['clippolygon'])
		});
	goog.events.listen(georefHeaderPhraseEl_, 'click', function (event) {
		var glyphiconSpanEl_ = goog.dom.getElementByClass('glyphicon', georefHeaderPhraseEl_);
		if (goog.dom.classlist.contains(georefBodyPhraseEl_, 'show')) {
			goog.dom.classlist.remove(georefBodyPhraseEl_, 'show');
			goog.dom.classlist.addRemove(glyphiconSpanEl_, 'glyphicon-triangle-left', 'glyphicon-triangle-bottom');
			return;
		}
		goog.dom.classlist.add(georefBodyPhraseEl_, 'show');
		goog.dom.classlist.addRemove(glyphiconSpanEl_, 'glyphicon-triangle-bottom', 'glyphicon-triangle-left');
	});

	// append phrases
	goog.dom.appendChild(bodyEl_, helperFactory_('Karten-OAI:', record['oai']));
	goog.dom.appendChild(bodyEl_, helperFactory_('Validierung:', record['adminvalidation'], 'label label-danger'));
	goog.dom.appendChild(bodyEl_, helperFactory_('Vearbeitet:', (record['processed'] == true ? 'Ja' : 'Nein'), 'label label-info'));
	goog.dom.appendChild(bodyEl_, helperFactory_('Nutzer:', record['userid']));
	goog.dom.appendChild(bodyEl_, georefHeaderPhraseEl_);
	goog.dom.appendChild(bodyEl_, georefBodyPhraseEl_);
	goog.dom.appendChild(bodyEl_, helperFactory_('Aktiv:', (record['georef_isactive'] == true ? 'Ja' : 'Nein'), 'label label-info'));
	goog.dom.appendChild(parentEl_, bodyEl_);

	//
	// Create record controls
	//
	var footerEl_ = goog.dom.createDom('div', {'class': 'panel-footer'});
	goog.dom.appendChild(parentEl_, footerEl_);

	// add set isvalide button
	if (record['adminvalidation'] != 'isvalide'){
		// set is valid
		var setIsValideBtn = goog.dom.createDom('button', {
				'class':'btn btn-primary action-btn',
				'innerHTML': 'Setze als \"isvalide\" ...'
			}),
			setIsValidUrl = vk2.utils.routing.getGeoreferenceAdminSetIsValideRoute('georeferenceid=' + record['georef_id']);

		goog.events.listen(setIsValideBtn, 'click', function() {
			goog.net.XhrIo.send(setIsValidUrl, function(event){
				alert(event.target.getResponseJson()['message']);
				goog.dom.removeNode(parentEl_);
			}, 'GET');
		});

		goog.dom.appendChild(footerEl_, setIsValideBtn);
	};

	// add set invalide button
	if (record['adminvalidation'] != 'invalide') {
		var deactiveBtn = goog.dom.createDom('button', {
			'data-href': vk2.utils.routing.getGeoreferenceAdminSetIsInValideRoute('georeferenceid=' + record['georef_id']),
			'class': 'btn btn-warning action-btn',
			'innerHTML': 'Setze als \"invalide\" ...'
		});

		var callback = goog.partial(vk2.utils.getConfirmationDialog, 'Ist der Georeferenzierungsprozess valide?',
			'Soll der Georeferenzierungsprozess auf \"invalide\" gesetzt werden? Bitte geben Sie einen Grund an: ' +
			'<br><div id="admin-validation-comment" class="input-group">' +
				'<input type="radio" value="imprecision"> Ungenauigkeit <br>' +
				'<input type="radio" value="wrong-parameter"> Falsche Parameter <br>' +
				'<input type="radio" value="wrong-map-sheet-number">  False Kartennummer <br>' +
				'<input type="radio" value="bad-original"> Schlechte Qualität des Orginals<br><br>' +
				'<input type="text" class="form-control" placeholder="Weitere Gründe ..." id="confirm-comment"></div>',

			function (event) {
				var inputs = goog.dom.getElementsByTagNameAndClass('input', undefined, goog.dom.getElement('admin-validation-comment'));
				var msg = undefined;
				for (var i = 0; i < inputs.length; i++) {
					if (inputs[i].type == 'radio' && inputs[i].checked)
						msg = inputs[i].value;
				}
				var comment = goog.isDef(msg) ? msg : goog.dom.getElement('confirm-comment').value
				var url = deactiveBtn.getAttribute('data-href') + '&comment=' + comment;

				goog.net.XhrIo.send(url, function (event) {
					alert(event.target.getResponseJson()['message']);
					goog.dom.removeNode(parentEl_);
				}, 'GET');
			});
		goog.events.listen(deactiveBtn, 'click', callback);

		goog.dom.appendChild(footerEl_, deactiveBtn);
	};






	return parentEl_;
};

/**
 * @param {string} resultContainer
 * @param {Array.<Object>} data
 * @private
 */
vk2.app.AdminEvaluationApp.prototype.displayProcesses_ = function(resultContainer, data){
		
	// get resultContainer and clear it
	var containerEl = goog.dom.getElement(resultContainer);
	containerEl.innerHTML = '';
	
	// now add processes
	for (var i = 0, ii = data.length; i < ii; i++){
		goog.dom.appendChild(containerEl, this.createProcessListElement_(data[i]));
	};
};

/**
 * @param {string} idMapContainer
 * @private
 */
vk2.app.AdminEvaluationApp.prototype.initializeEvaluationMap_ = function(idMapContainer){
	vk2.georeference.utils.initializeGeorefenceCRS();
	
	/**
	 * @type {vk2.georeference.view.TargetView}
	 * @private
	 */
	this.targetView_ = new vk2.georeference.view.TargetView(idMapContainer);
};

/**
 * @param {Element} element
 * @private
 */
vk2.app.AdminEvaluationApp.prototype.registerShowMapEventListener_ = function(element){
	goog.events.listen(element, 'click', function(event){
		
		if (goog.DEBUG)
			console.log('Fire show map event ...');
		
		// parse request parameter
		var georefParamsNewOrUpdate = JSON.parse(event.currentTarget.getAttribute('data-params-georef')),
			georefParams = georefParamsNewOrUpdate.hasOwnProperty('new') ? georefParamsNewOrUpdate['new'] 
				: georefParamsNewOrUpdate,
			clipParams = event.currentTarget.getAttribute('data-params-clip') == null || event.currentTarget.getAttribute('data-params-clip') == undefined ?
				undefined : JSON.parse(event.currentTarget.getAttribute('data-params-clip')),
			objectId = parseInt(event.currentTarget.getAttribute('data-params-id'), 0);
		
		var requestParams = {
			'georeference': georefParams,
			'id': objectId
		};

		if (clipParams !== undefined)
			requestParams['clip'] = clipParams;
		
		if (goog.DEBUG) {
			console.log(requestParams);
		}
		// request a validation result
		this.targetView_.activateLoadingBar();
		vk2.georeference.GeoreferencerService.requestValidationResult(requestParams, goog.bind(function(response){
			var data = response.target.getResponseJson(),
				extent = ol.proj.transformExtent(data['extent'], georefParams['target'],
					vk2.settings.MAPVIEW_PARAMS['projection']),
				clipPolygon = clipParams !== undefined ? vk2.georeference.utils.extractClipPolygon(clipParams) : undefined;

			// display validation result and zoom to extent
			this.targetView_.displayValidationMap(data['wmsUrl'], data['layerId'], clipPolygon);
			this.targetView_.setZoom(extent);

			// deavtivate the loading bar
			this.targetView_.deactivateLoadingBar();
		}, this), function(response){
			this.targetView_.deactivateLoadingBar();
			alert('Something went wrong while trying to fetch a georeference validation result from server ....');
		});
	}, false, this);
};