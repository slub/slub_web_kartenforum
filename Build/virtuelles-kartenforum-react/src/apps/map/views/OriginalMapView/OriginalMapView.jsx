/**
 * Created by jacob.mendt@pikobytes.de on 06.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { queryDocument } from "../../../../util/apiEs";
import { translate } from "../../../../util/util";
import ZoomifyMap from "../../../../components/ZoomifyMap/ZoomifyMap";
import "./OriginalMapView.scss";

export const OriginalMapView = (props) => {
  const { map_id } = props;
  const [mapDocument, setMapDocument] = useState(null);

  //
  // Effects
  //
  useEffect(() => {
    const fetchData = async () => {
      const newMapDocument = await queryDocument(map_id);
      setMapDocument(newMapDocument);
    };
    fetchData();
  }, [map_id, setMapDocument]);

  if (mapDocument === null) {
    return <div className="vkf-view-original-map container"></div>;
  }

  // Filter online ressources
  const res = mapDocument.online_resources;
  const permaLink = res.find((r) => r.type === "Permalink");
  const wmsLink = res.find((r) => r.type === "WMS");
  const wcsLink = res.find((r) => r.type === "WCS");
  const downloadLink = res.find(
    (r) => r.type === "WCS" && r.url.indexOf("GEOTIFF") > -1
  );

  return (
    <div className="vkf-view-original-map">
      <div className="title">
        <h1>
          {mapDocument.title} <small>/ {mapDocument.title_long}</small>
        </h1>
        <div className="btn-group-vertical">
          <a
            href={mapDocument.permalink}
            rel="noreferrer"
            className="btn btn-default"
            target="_blank"
          >
            {translate("originalview-link-slub-label")}
          </a>
        </div>
      </div>
      <div className="content row">
        <div className="col-md-4 col-sm-12 content-metadata">
          <h4>{translate("originalview-label-desc")}</h4>
          <p>{mapDocument.description}</p>
          <h4>{translate("originalview-label-identifier")}</h4>
          <p>{map_id}</p>
          <h4>{translate("originalview-label-scale")}</h4>
          <p>1:{mapDocument.map_scale}</p>
          <h4>{translate("originalview-label-keywords")}</h4>
          <p>{mapDocument.keywords}</p>
          {permaLink !== undefined && (
            <React.Fragment>
              <h4>Permalink</h4>
              <p>
                <a href={permaLink.url} rel="noreferrer" target="_blank">
                  {permaLink.url}
                </a>
              </p>
            </React.Fragment>
          )}
          {(wmsLink !== undefined || wcsLink !== undefined) && (
            <React.Fragment>
              <h4>{translate("originalview-label-services")}</h4>
              <p>
                {wmsLink !== undefined && (
                  <a href={wmsLink.url} rel="noreferrer" target="_blank">
                    WMS
                  </a>
                )}
                {"  |  "}
                {wcsLink !== undefined && (
                  <a href={wcsLink.url} rel="noreferrer" target="_blank">
                    WCS
                  </a>
                )}
              </p>
            </React.Fragment>
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
        <div className="col-md-8 col-sm-12 content-map">
          <ZoomifyMap
            urlImageProperties={mapDocument.zoomify_url}
            withImageManipulation={true}
          />
        </div>
      </div>
    </div>
  );
};

OriginalMapView.propTypes = {
  map_id: PropTypes.string.isRequired,
};

export default OriginalMapView;
