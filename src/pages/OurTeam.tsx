/* eslint-disable @next/next/no-img-element */
import { useTranslation } from "react-i18next";
import {
  Grid,
  Text,
  Row,
  Col,
  Collapse,
  Avatar,
  Spacer,
  Button,
  Card,
} from "@nextui-org/react";
import { GEN16 } from "assets/icons";

export const OurTeam = () => {
  const { t } = useTranslation();

  const columns = [
    { name: t("name"), uid: "name" },
    { name: t("role"), uid: "role" },
    { name: t("status"), uid: "status" },
  ];

  const users = [
    {
      name: "Beybut",
      role: `${t("CEO")} & ${t("seniorDeveloper")}`,
      color: "primary",
      statusText: t("available"),
      avatar:
        "https://s.getgems.io/nft/c/626e630d4c1921ba7a0e3b4e/561/image.png",
      telegram: "https://beycoder.t.me",
      content: <Text>{t("beybutContent")}</Text>,
    },
    {
      name: "Evgeniy",
      role: t("productManager"),
      color: "secondary",
      statusText: t("available"),
      avatar:
        "https://s.getgems.io/nft/c/626e630d4c1921ba7a0e3b4e/864/image.png",
      telegram: "https://IzosimovEA.t.me",
      content: <Text>{t("evgeniyContent")}</Text>,
    },
    {
      name: "Nick",
      role: `${t("CTO")} & ${t("seniorDeveloper")}`,
      color: "gradient",
      statusText: t("available"),
      avatar:
        "https://s.getgems.io/nft/c/626e630d4c1921ba7a0e3b4e/687/image.png",
      telegram: "https://tatadev.t.me",
      content: <Text>{t("nickContent")}</Text>,
    },
  ];
  return (
    <Grid.Container justify="center" css={{ minHeight: "70vh", p: 16 }}>
      <Grid>
        <Card>
          <Card.Header css={{ pl: 24 }}>
            <Text size="$3xl">{t("ourTeam")}</Text>
          </Card.Header>
          <Card.Body css={{ pt: 0 }}>
            <Grid.Container gap={2}>
              <Grid css={{ maxWidth: 400 }}>
                <Grid.Container css={{ gap: 16, position: "relative" }}>
                  {users.map((user, i) => (
                    <Col span={12} key={i}>
                      <Grid.Container wrap="nowrap" justify="space-between">
                        <Col>
                          <Grid.Container wrap="nowrap" justify="flex-start">
                            <Col
                              css={{
                                w: "auto",
                              }}
                            >
                              {i < 1 && (
                                <div className="vertical-timeline-line" />
                              )}
                              <Avatar
                                size="xl"
                                src={user.avatar}
                                color={user.color as any}
                                bordered
                                rounded
                              />
                            </Col>
                            <Spacer x={1} />
                            <Col>
                              <Grid.Container>
                                <Col>
                                  <Text>{user.name}</Text>
                                </Col>
                                <Col>
                                  <Text css={{ whiteSpace: "nowrap" }}>
                                    {user.role}
                                  </Text>
                                </Col>
                              </Grid.Container>
                            </Col>
                          </Grid.Container>
                        </Col>
                        <Col
                          css={{
                            w: "auto",
                            display: "inline-flex",
                            paddingRight: 16,
                          }}
                        >
                          {user.telegram && (
                            <Button
                              flat
                              size="xs"
                              icon={
                                <GEN16
                                  style={{
                                    fill: "var(--nextui-colors-link)",
                                    fontSize: 16,
                                  }}
                                />
                              }
                              css={{ minWidth: 24 }}
                              onClick={() =>
                                window.open(user.telegram, "_blank")
                              }
                            />
                          )}
                        </Col>
                      </Grid.Container>
                    </Col>
                  ))}
                </Grid.Container>
              </Grid>
            </Grid.Container>
          </Card.Body>
        </Card>
      </Grid>
    </Grid.Container>
  );
};
