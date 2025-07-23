/*
 * Created by tom.schulze@pikobytes.de on 12.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React from "react";
import { useRecoilValue } from "recoil";
import { isExternalVectorMapFormLoadingState } from "./FormExternalVectorMap/FormExternalVectorMap";
import CustomButton from "../../components/CustomButton";
import VkfIcon from "@components/VkfIcon";
import { FORM_ID } from "./util";
import { translate } from "@util/util";

const SubmitButton = () => {
  const isExternalVectorMapFormLoading = useRecoilValue(
    isExternalVectorMapFormLoadingState
  );

  return (
    <CustomButton
      className="save-button"
      type="save"
      buttonType="submit"
      form={FORM_ID}
      loading={isExternalVectorMapFormLoading}
    >
      <VkfIcon name="save" />
      {translate("geojson-apply-btn")}
    </CustomButton>
  );
};

export default SubmitButton;
