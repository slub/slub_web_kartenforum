/*
 * Created by tom.schulze@pikobytes.de on 23.06.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { forwardRef, useCallback, useState } from "react";
import ImageWithFallback from "../../components/ImageWithFallback";
import { translate } from "@util/util";
import PropTypes from "prop-types";

const ImageField = forwardRef(function ImageField(props, ref) {
  const [imgLink, setImgLink] = useState(props.defaultValue);
  const handleBlur = useCallback(
    (event) => {
      setImgLink(event.target.value);
      props.onBlur(event);
    },
    [props.onBlur]
  );

  return (
    <>
      <div className="vkf-form-control non-style-property-item">
        <label className="vkf-form-label with-border">
          {translate("geojson-featureview-image-title")}
        </label>
        <ImageWithFallback imageUrl={imgLink} showPlaceholder imageAsPreview />
      </div>
      <div className="vkf-form-control non-style-property-item">
        <label className="vkf-form-label with-border">img_link</label>
        <input
          className="vkf-form-input"
          {...props}
          onBlur={handleBlur}
          placeholder={translate("geojson-editfeature-input-placeholder")}
          ref={ref}
        />
      </div>
    </>
  );
});

ImageField.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  onBlur: PropTypes.func.isRequired,
};

export default ImageField;
