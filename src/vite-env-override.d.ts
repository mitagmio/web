declare module "*.svg" {
  import * as React from "react";

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  const src: string;
  export default src;
}

declare module "react-screen-capture" {
  export const ScreenCapture: any;
}

declare global {
  interface Window {
    global: any;
  }
}

window.global = globalThis;
