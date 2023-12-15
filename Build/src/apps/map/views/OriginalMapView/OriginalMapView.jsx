/**
 * Created by jacob.mendt@pikobytes.de on 06.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

import Modal from "../../../../components/Modal/Modal";
import { queryDocument } from "../../../../util/apiEs";
import { translate } from "../../../../util/util";
import ZoomifyMap from "../../../../components/ZoomifyMap/ZoomifyMap";
import "./OriginalMapView.scss";

export const OriginalMapView = (props) => {
  const { isOpen, onClose, map_id } = props;
  const [mapDocument, setMapDocument] = useState(null);

  const handleClose = () => {
    setMapDocument(null);
    onClose();
  };

  //
  // Effects
  //
  useEffect(() => {
    const fetchData = async () => {
      const newMapDocument = await queryDocument(map_id);
      setMapDocument(newMapDocument);
    };
    if (map_id !== undefined) {
      fetchData();
    }
  }, [map_id, setMapDocument]);

  if (mapDocument === null) {
    return <div className="vkf-view-original-map container" />;
  }

  // Filter online ressources
  const res = mapDocument.online_resources;
  const permaLink = res.find((r) => r.type === "Permalink");
  const wmsLink = res.find((r) => r.type === "WMS");
  const wcsLink = res.find((r) => r.type === "WCS");
  const downloadLink = res.find((r) => r.type === "download");

  const isMosaicMap = mapDocument.type === "mosaic";
  return (
    <Modal
      key={map_id}
      modalClassName={clsx("vkf-modal-original-map", mapDocument.type)}
      onClose={handleClose}
      renderContent={() => (
        <div className="vkf-view-original-map">
          <div className="title">
            <h1>
              {mapDocument.title} <small>/ {mapDocument.title_long}</small>
            </h1>
            <div className="header-functions">
              {!isMosaicMap && (
                <a
                  href={mapDocument.permalink}
                  rel="noreferrer"
                  className="btn btn-default"
                  target="_blank"
                >
                  {translate("originalview-link-slub-label")}
                </a>
              )}
              {downloadLink !== undefined && (
                <a
                  href={downloadLink.url}
                  rel="noreferrer"
                  className="btn btn-default btn-download"
                  target="_blank"
                  title={translate("originalview-link-download-label")}
                >
                  {translate("originalview-link-download-label")}
                </a>
              )}
            </div>
          </div>
          {mapDocument.thumb_url !== undefined && isMosaicMap && (
            <div>
              <img
                className="thumbnail"
                height={200}
                width={200}
                src={mapDocument.thumb_url}
              />
            </div>
          )}
          <div className="content-metadata">
            <dl>
              <dt>{translate("originalview-label-desc")}</dt>
              <dd>{mapDocument.description}</dd>
              <dt>{translate("originalview-label-identifier")}</dt>
              <dd>{map_id}</dd>
              <dt>{translate("originalview-label-scale")}</dt>
              <dd>1:{mapDocument.map_scale}</dd>
              {permaLink !== undefined && (
                <React.Fragment>
                  <dt>Permalink</dt>
                  <dd>
                    <a href={permaLink.url} rel="noreferrer" target="_blank">
                      {permaLink.url}
                    </a>
                  </dd>
                </React.Fragment>
              )}
              {(wmsLink !== undefined || wcsLink !== undefined) && (
                <React.Fragment>
                  <dt>{translate("originalview-label-services")}</dt>
                  {wmsLink !== undefined && (
                    <dd>
                      <a href={wmsLink.url} rel="noreferrer" target="_blank">
                        WMS
                      </a>
                    </dd>
                  )}
                  {wcsLink !== undefined && (
                    <dd>
                      <a href={wcsLink.url} rel="noreferrer" target="_blank">
                        WCS
                      </a>
                    </dd>
                  )}
                </React.Fragment>
              )}
            </dl>
          </div>
          {!isMosaicMap && (
            <div className="content-map">
              <ZoomifyMap
                urlImageProperties={mapDocument.zoomify_url}
                withImageManipulation={true}
              />
            </div>
          )}
        </div>
      )}
      isOpen={isOpen}
      title={translate(
        isMosaicMap ? "originalview-title-mosaic" : "originalview-title"
      )}
    />
  );
};

OriginalMapView.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  map_id: PropTypes.string,
};

export default OriginalMapView;
