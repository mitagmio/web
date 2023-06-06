/* eslint-disable @next/next/no-img-element */
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import PlitchFile from "../../assets/docs/pitch.pdf";

export const Plitch = () => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t("projectPlitch")}</title>
        <meta property="og:title" content={t("projectPlitch") || ""}></meta>
        <meta property="og:image" content="/img/plitch.png"></meta>
      </Helmet>
      <iframe
        src={`${PlitchFile}#toolbar=0&navpanes=0`}
        width="100%"
        style={{ minHeight: "90vh", border: "none" }}
      />
    </>
  );
};
