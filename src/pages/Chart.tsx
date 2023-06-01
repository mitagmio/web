import React, { useEffect, useState } from "react";
import { exportComponentAsPNG } from "react-component-export-image";
import { AnalyticsPrice } from "./JettonPrice";
import { useLocation } from "react-router-dom";

export const Chart = () => {
  const location = useLocation();
  const [state, setState] = useState<any>();

  const onRef = (val) => {
    exportComponentAsPNG(val, { fileName: `${location.pathname.split('/').pop()}.png` }).then(setState)
    setState(val)
  }
  return <AnalyticsPrice onRef={onRef} timescale={"1D"} />;
};
