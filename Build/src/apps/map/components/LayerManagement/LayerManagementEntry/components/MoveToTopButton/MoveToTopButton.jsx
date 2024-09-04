/**
 * Created by nicolas.looschen@pikobytes.de on 04.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { translate } from "../../../../../../../util/util.js";
import SvgIcons from "../../../../../../../components/SvgIcons/SvgIcons.jsx";
import React from "react";
import { useRecoilValue } from "recoil";
import { mapState } from "../../../../../atoms/atoms.js";
import PropTypes from "prop-types";

export const MoveToTopButton = (props) => {
  const { layer } = props;

  const map = useRecoilValue(mapState);

  // Move layer to the top of the stack
  const handleMoveTop = (event) => {
    map.moveLayer(layer.id, null);
    event.stopPropagation();
  };

  return (
    <button
      className="move-layer-top minimize-tool"
      onClick={handleMoveTop}
      type="button"
      title={translate("layermanagement-move-top")}
    >
      <SvgIcons name="layeraction-totop" />
    </button>
  );
};

MoveToTopButton.propTypes = {
  layer: PropTypes.object.isRequired,
};

export default MoveToTopButton;
