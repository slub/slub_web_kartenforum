/**
 * Created by nicolas.looschen@pikobytes.de on 04.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useMemo } from "react";
import { translate } from "@util/util";
import {
  cardinalRules,
  signedNumberFormat,
} from "@map/components/GeoJson/util/formatters";

export const ChangeTypography = ({ count, id, formatFunction }) => {
  const formattedNumber = useMemo(
    () =>
      formatFunction ? formatFunction(count) : signedNumberFormat.format(count),
    [count]
  );

  const label = useMemo(() => {
    const cardinality = cardinalRules.select(count);
    return cardinality === "one"
      ? translate(`geojson-control-bar-${id}`)
      : translate(`geojson-control-bar-${id}-plural`);
  }, [count, id]);

  return (
    <span className={id}>
      <span className="bold">{formattedNumber}</span> <span>{label}</span>
    </span>
  );
};

export default ChangeTypography;
