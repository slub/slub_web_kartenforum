goog.provide('vk2.app.RankingPageApp');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.net.EventType');
goog.require('goog.net.XhrIo');
goog.require('goog.style');
goog.require('vk2.settings');
goog.require('vk2.utils');
goog.require('vk2.utils.routing');

/**
 * @export
 * @param @param {vk2x.app.RankingPageAppOptions} options
 * @constructor
 */
vk2.app.RankingPageApp = function(options) {

	var tableEl_ = goog.isDef(options.tableEl) && goog.dom.isElement(options.tableEl) ? options.tableEl :
		goog.isDef(options.tableEl) && goog.isString(options.tableEl) ? goog.dom.getElement(options.tableEl) :
		undefined;

	if (tableEl_ === undefined)
		throw 'Could not find targetElement for table data!';

	// get table body element and clear it
	var tbodyEl_ = goog.dom.getElement(goog.dom.getElementsByTagNameAndClass('tbody', undefined, tableEl_)[0]);
	tbodyEl_.innerHTML = '';

	//
	// Fetch data from remote
	//
	goog.net.XhrIo.send(vk2.utils.routing.getGeoreferenceInformation(), function(event) {
		var xhr = /** @type {goog.net.XhrIo} */ (event.target);
		if (event.type === 'complete' && xhr.getStatus() === 200) {
			var data = xhr.getResponseJson(),
				ranking = data['pointoverview'];

			for (var i = 0; i < ranking.length; i++) {
				var r = ranking[i],
					place = i + 1;
				goog.dom.appendChild(tbodyEl_, goog.dom.createDom('tr', {
					'innerHTML': '<th class="rank">' + i + '</th><th class="name">' + r['userid'] + '</th><th class="new">' + r['new'] + '</th>' +
					'<th class="update">' + r['update'] + '</th><th class="points">' + r['points'] + '</th>'
				}));
			}
		}
	}, 'GET');


	//// add listener to request object
	//goog.events.listenOnce(xhr, goog.net.EventType.SUCCESS, function(e){
	//	var xhr = /** @type {goog.net.XhrIo} */ (e.target),
	//		data = xhr.getResponseJson();
  //
	//	if (goog.DEBUG) {
	//		console.log(data);
	//	};
  //
	//	this.displayData_(data, georeferenceEls, overallGeoreferenceEls,
	//		relGeoreferenceEls, georeferenceUserRankingEl);
	//	xhr.dispose();
	//}, false, this);
  //
	//goog.events.listenOnce(xhr, goog.net.EventType.ERROR, function(e){
	//	alert('Something went wrong, while trying to fetch data from the server.')
	//}, false, this);
  //
	//// send request
	//var url = vk2.utils.routing.getGeoreferenceInformation();
	//xhr.send(url, 'GET');
};