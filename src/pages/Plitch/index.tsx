/* eslint-disable @next/next/no-img-element */
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import File from "assets/docs/pitch.pdf";

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
        src={`https://docs.google.com/viewer?url=https://raw.githubusercontent.com/fck-foundation/web/master/intro/pitch.pdf&embedded=true`}
        cross-origin="anonymous"
        width="100%"
        style={{ minHeight: "90vh", border: "none" }}
      />
    </>
  );
};
