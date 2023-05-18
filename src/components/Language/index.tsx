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
    <Popover>
      <Popover.Trigger>
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
        />
      </Popover.Trigger>
      <Popover.Content
        css={{
          padding: "$0",
          border: "1px solid var(--nextui--navbarBorderColor)",
          borderRadius: 4,
          maxHeight: 334,
          background: "var(--nextui-colors-backgroundAlpha)",
        }}
      >
        <Grid.Container css={{ maxWidth: 300 }}>
          {["ru", "en"]
            .filter((i) => i !== value)
            .map((i) => (
              <Button onClick={() => setValue(i)}>
                Switch to {i.toUpperCase()}
              </Button>
            ))}
        </Grid.Container>
      </Popover.Content>
    </Popover>
  );
};
