/* eslint-disable @next/next/no-img-element */
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import WhitePaperFile from "../../assets/docs/whitepaper.pdf";

export const WhitePaper = () => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t("whitePaper")}</title>
        <meta property="og:title" content={t("whitePaper") || ""}></meta>
        <meta property="og:image" content="/img/whitepaper.png"></meta>
      </Helmet>
      <iframe
        src={`${WhitePaperFile}#toolbar=0&navpanes=0`}
        width="100%"
        style={{ minHeight: "90vh", border: "none" }}
      />
    </>
  );
};
