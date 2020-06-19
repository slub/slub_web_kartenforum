goog.provide('vk2.tool.MetadataBinding');

goog.require('goog.object');
goog.require('goog.dom');
goog.require('goog.Uri');
goog.require('goog.style');
goog.require('goog.net.XhrIo');
goog.require('vk2.settings');
goog.require('vk2.utils');

/**
 * @param {Element|string} parentEl 
 * @param {string} metadataId
 * @param {Object} metadata
 * @constructor
 */
vk2.tool.MetadataBinding = function(parentEl, metadataId, metadata){

	/**
	 * @type {Node}
	 * @private
	 */
	this._parentEl = goog.isString(parentEl) ? goog.dom.getElement(parentEl) : parentEl;;
	
	this._displayMetadata(metadataId, metadata);

};

/**
 * @param {string} id
 * @param {Object} metadata 
 * @private
 */
vk2.tool.MetadataBinding.prototype._displayMetadata = function(id, metadata){
	
	var row_container = goog.dom.createDom('div', {'class':'container'});
	goog.dom.appendChild(this._parentEl, row_container);
	
	var row = goog.dom.createDom('div',{'class':'row-metadata'});
	goog.dom.appendChild(row_container, row);
	
	// this is the bootstrap grid container for further metadata
	var metadata_container = goog.dom.createDom('div',{
		'class':'col-md-8 col-lg-8 metdata-col'
	});
	goog.dom.appendChild(row, metadata_container);
	
	// this is the bootstrap grid container for thumbnail
	var thumbnail_container = goog.dom.createDom('div',{
		'class':'col-md-4 col-lg-4 thumbnail-col'
	});
	goog.dom.appendChild(row, thumbnail_container);
	
	// set title and thumbnail of metadata
	this._setTitle(metadata_container, metadata['description']);
	this._setThumbnail(thumbnail_container, metadata['thumb']);
	
	// set further metadata information
	this._setCatchwords(metadata_container, vk2.utils.getMsg('metadata-keyword'), metadata['keywords']);
	
	for (var i = 0; i < metadata['online-resources'].length; i++){
		this._setOnlineRessource(metadata_container, vk2.utils.getMsg('metadata-online-res'),metadata['online-resources'][i]['url']);
	};

	var scale = metadata['denominator'] === '0' || metadata['denominator'] === 0 ? ' unknown' : ' 1:' + metadata['denominator'];
	this._setResolution(metadata_container, vk2.utils.getMsg('metadata-spatial-res'), scale);
	this._setUniqueId(metadata_container, id);
};

/**
 * @param {Element} container
 * @param {string} description
 * @param {string} catalog_link
 * @private
 */
vk2.tool.MetadataBinding.prototype._setTitle = function(container, description, catalog_link){
	
	// now add description
	var descr_div = goog.dom.createDom('div',{
		'class': 'description'
	});
	goog.dom.appendChild(container, descr_div);
	
	var descr_h3 = goog.dom.createDom('h3',{
		'innerHTML': description
	});
	goog.dom.appendChild(descr_div, descr_h3);
};

/**
 * @param {Element} container
 * @param {string} thumbnail_link
 * @private
 */
vk2.tool.MetadataBinding.prototype._setThumbnail = function(container, thumbnail_link){
	var thumbnail_img = goog.dom.createDom('img', {
		'class': 'thumbnail',
		'src': thumbnail_link
	});
	goog.dom.appendChild(container, thumbnail_img);
};

/**
 * @param {Element} container
 * @param {string} label_name
 * @param {string} catchwords
 * @private
 */
vk2.tool.MetadataBinding.prototype._setCatchwords = function(container, label_name, catchwords){
	var row = this._createMetadataRow(container);
	
	var label = goog.dom.createDom('div', {'class':'label', 'innerHTML':label_name});
	goog.dom.appendChild(row, label);
	
	var content = goog.dom.createDom('div', {'innerHTML':catchwords});
	goog.dom.appendChild(row, content);	
};

/**
 * @param {Element} container
 * @param {string} label_name
 * @param {string} language
 * @private
 */
vk2.tool.MetadataBinding.prototype._setLanguage = function(container, label_name, language){
	var row = this._createMetadataRow(container);
	
	var label = goog.dom.createDom('div', {'class':'label', 'innerHTML':label_name});
	goog.dom.appendChild(row, label);
	
	var content = goog.dom.createDom('div', {'innerHTML':language});
	goog.dom.appendChild(row, content);	
};

/**
 * @param {Element} container
 * @param {string} label_name
 * @param {string} identifier
 * @private
 */
vk2.tool.MetadataBinding.prototype._setCrsIdentifier = function(container, label_name, identifier){
	var row = this._createMetadataRow(container);
	
	var label = goog.dom.createDom('div', {'class':'label', 'innerHTML':label_name});
	goog.dom.appendChild(row, label);
	
	var content = goog.dom.createDom('div', {'innerHTML':identifier});
	goog.dom.appendChild(row, content);	
};

/**
 * @param {Element} container
 * @param {string} label_name
 * @param {string} ahref
 * @private
 */
vk2.tool.MetadataBinding.prototype._setOnlineRessource = function(container, label_name, ahref){
	var row = this._createMetadataRow(container);
	
	var label = goog.dom.createDom('div', {'class':'label', 'innerHTML':label_name});
	goog.dom.appendChild(row, label);
	
	var content_container = goog.dom.createDom('div');
	goog.dom.appendChild(row, content_container);	
	
		
	var url = new goog.Uri(ahref);
	
	// check if it is a download link
	var isDownloadLink = false;
	if (goog.isDef(url.getParameterValue('SERVICE')) && url.getParameterValue('SERVICE').toLowerCase() == 'wcs' && 
			url.getParameterValue('REQUEST') && url.getParameterValue('REQUEST').toLowerCase() == 'getcoverage')
		isDownloadLink = true;

	// for preventing to long urls cut query
	url.setQuery('');

	var urlAsString = url.toString().indexOf('//') === 0
			? url.toString().replace('//', '')
			: url.toString();
	if (!isDownloadLink){
		var content = goog.dom.createDom('a', {'target':'_blank','href':ahref,'innerHTML':urlAsString});
	} else {
		var content = goog.dom.createDom('a', {'target':'_blank','href':ahref,'innerHTML':urlAsString, 'class':'download'});
	};
	
	goog.dom.appendChild(content_container, content);
};

/**
 * @param {Element} container
 * @param {string} label_name
 * @param {string} resolution
 * @private
 */
vk2.tool.MetadataBinding.prototype._setResolution = function(container, label_name, resolution){
	var row = this._createMetadataRow(container);
	
	var label = goog.dom.createDom('div', {'class':'label', 'innerHTML':label_name});
	goog.dom.appendChild(row, label);
	
	var content_container = goog.dom.createDom('div');
	goog.dom.appendChild(row, content_container);	
	
	var content_label = goog.dom.createDom('label', {'innerHTML':''});
	goog.dom.appendChild(content_container, content_label);
	
	var content = goog.dom.createDom('span',{'innerHTML':resolution});
	goog.dom.appendChild(content_container, content);
};

/**
 * @param {Element} container
 * @param {string} dataset_id
 * @private
 */
vk2.tool.MetadataBinding.prototype._setUniqueId = function(container, dataset_id){
	var span = goog.dom.createDom('span', {'class':'unique-id metadata-content-row','innerHTML':
		'<div class="label">' + vk2.utils.getMsg('metadata-unqiue-id') + '</div><div>' + dataset_id + '</div>'});
	goog.dom.appendChild(container, span);
};

/**
 * @param {Element} container
 * @return {Element}
 * @private
 */
vk2.tool.MetadataBinding.prototype._createMetadataRow = function(container){
	var new_row = goog.dom.createDom('div', {'class':'metadata-content-row'});
	goog.dom.appendChild(container, new_row);
	return new_row;
};


