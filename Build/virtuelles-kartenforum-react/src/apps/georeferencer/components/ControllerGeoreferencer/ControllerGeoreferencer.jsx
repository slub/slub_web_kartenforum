/**
 * Created by jacob.mendt@pikobytes.de on 10.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect } from "react";
import { queryDocument } from "../../../../util/apiEs";

export const ControllerGeoreferencer = () => {
  // Effects which should be triggered on mount
  useEffect(async () => {
    const mapDocument = await queryDocument(
      "oai:de:slub-dresden:vk:id-10009482"
    );

    if (mapDocument !== undefined) {
      console.log(mapDocument);
    }
  }, []);

  return <div style={{ display: "none" }} />;
};

export default ControllerGeoreferencer;
