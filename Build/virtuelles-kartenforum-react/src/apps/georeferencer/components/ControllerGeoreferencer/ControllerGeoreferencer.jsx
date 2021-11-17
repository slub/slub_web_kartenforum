/**
 * Created by jacob.mendt@pikobytes.de on 10.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import queryString from "query-string";
import { queryDocument } from "../../../../util/apiEs";
import { queryTransformationForMapId } from "../../../../util/apiGeo";
import { mapMetadataState, transformationState } from "../../atoms/atoms";

export const ControllerGeoreferencer = () => {
  const setTransformation = useSetRecoilState(transformationState);
  const setMapMetadata = useSetRecoilState(mapMetadataState);

  // Effects which should be triggered on mount
  useEffect(async () => {
    // Extract the query string and create the initial georeference object for it
    // For testing use map_id=oai:de:slub-dresden:vk:id-10009482
    const qs = queryString.parse(location.search);

    if (qs.map_id !== undefined) {
      const transformation = await queryTransformationForMapId(qs.map_id);
      const metadata = await queryDocument(qs.map_id);

      // @TODO - Remove log statements
      console.log(transformation);
      console.log(metadata);

      // Extract active transformation
      if (
        transformation.items.length > 0 &&
        transformation.active_transformation_id !== null
      ) {
        const activeTransformation = transformation.items.find(
          (t) =>
            t.transformation.transformation_id ===
            transformation.active_transformation_id
        );
        setTransformation({
          clip: activeTransformation.transformation.clip,
          overwrites: activeTransformation.transformation.overwrites,
          params: activeTransformation.transformation.params,
        });
      } else if (transformation.active_transformation_id === null) {
        setTransformation({
          clip: null,
          overwrites: 0,
          params: {
            source: "pixel",
            target: transformation.default_srs,
            algorithm: "affine",
            gcps: [],
          },
        });
      } else {
        throw new Error("This transformation type is not supported yet.");
      }

      setMapMetadata(metadata);
    }
  }, []);

  return <div style={{ display: "none" }} />;
};

export default ControllerGeoreferencer;
