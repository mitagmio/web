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
        src={`https://raw.githubusercontent.com/fck-foundation/web/2c87d28298cfd75326d471c2e4d95d0e4135d8ca/intro/pitch.pdf`}
        width="100%"
        style={{ minHeight: "90vh", border: "none" }}
      />
    </>
  );
};
