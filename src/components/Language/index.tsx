import { useContext, useEffect, useState } from "react";
import {
  Button,
  Popover,
  Image,
  Grid,
  Badge,
  Text,
  Spacer,
} from "@nextui-org/react";
import { AppContext } from "contexts/AppContext";
import { ABS13, ABS14 } from "assets/icons";
import { useTranslation } from "react-i18next";

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [value, setValue] = useState(i18n.language.split("-")[0].toLowerCase());

  useEffect(() => {
    i18n.changeLanguage(value);
  }, [value]);

  return (
    <Button
      icon={value.toUpperCase()}
      size="sm"
      flat
      css={{
        minWidth: "auto",
        padding: "$4",
        background: "transparent",
        border: "1px solid $blue100",
      }}
      auto
      onClick={() => setValue(value === "en" ? "ru" : "en")}
    />
  );
};
