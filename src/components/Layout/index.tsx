import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Navbar,
  Text,
  Dropdown,
  Avatar,
  Spacer,
  User,
  Container,
  Card,
  Button,
  Grid,
  Badge,
  Loading,
  Popover,
} from "@nextui-org/react";
import {
  TonConnectButton,
  useTonAddress,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";

import { colors } from "../../colors";
import { TLoginButton, TLoginButtonSize, TUser } from "../TelegramLogin";
import { ThemeSwitcher } from "../Theme";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "contexts";
import { default as Logo } from "assets/logo.svg";
import { SvgInline } from "../SVG";
import { GEN16, Discord, TG, TW, ABS28 } from "assets/icons";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "components/Language";
import useDarkMode from "use-dark-mode";
import { useTheme } from "next-themes";
import { TonProofApi } from "TonProofApi";

export const Layout = ({ children }: { children?: any }) => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const wallet = useTonWallet();
  const address = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const { nftItems, enabled, theme, setTheme } = useContext(AppContext);
  const [toggle, setToggle] = useState(false);
  const [user, setUser] = useState<TUser>();

  const onAction = (actionKey: React.Key) => {
    switch (actionKey) {
      case "logout":
        tonConnectUI.disconnect();
        localStorage.removeItem("access-token");
        document
          .getElementsByTagName("html")[0]
          .classList.remove(`${theme.color}${enabled ? "" : "-light"}-theme`);
        document
          .getElementsByTagName("html")[0]
          .classList.add(`${enabled ? "dark" : "light"}-theme`);
        setTheme({ color: enabled ? "dark" : "light" });
        setUser(undefined);
        break;
      case "connect":
        document.getElementById("tc-connect-button")?.click();
        break;
      case "whitelist":
        break;
      case "analytics":
        navigate(`/wallet/${address}`);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!TonProofApi.accessToken) {
      onAction("logout");
    }
  }, []);

  const background = useMemo(
    () =>
      theme && (
        <SvgInline
          url={
            nftItems?.find(({ metadata }) => metadata.id === theme.id)?.metadata
              .image
          }
        />
      ),
    [theme, nftItems]
  );

  const onChangeHref = (href) => {
    navigate(href);
    setToggle(false);
  };

  const menu = [
    { title: t("analytics"), href: "/analytics" },
    { title: t("events"), href: "/events" },
    { title: t("roadMap"), href: "/roadmap" },
  ];

  return (
    <div className={"ton-background"}>
      {typeof nftItems === "undefined" ? (
        <Loading
          css={{
            left: "50%",
            top: "50%",
            position: "absolute",
            transform: "translate3d(-50%, -50%, 0)",
          }}
        />
      ) : (
        <>
          <Navbar
            className="navbar"
            isBordered
            isCompact={{ "@smMax": true, "@smMin": false }}
            shouldHideOnScroll
            disableScrollHandler
            variant="sticky"
          >
            <Container
              justify="space-between"
              gap={2}
              css={{ display: "flex", p: 0 }}
            >
              <Grid css={{ w: "auto" }}>
                <Navbar.Brand
                  css={{
                    cursor: "pointer",
                    display: "flex",
                    alignContent: "center",
                  }}
                  onClick={() => navigate("/")}
                >
                  <Navbar.Toggle
                    // isSelected={toggle}
                    aria-label="toggle navigation"
                    showIn="sm"
                    onChange={(value) => setToggle(!!value)}
                  />
                  <Spacer x={0.4} />
                  <Grid.Container alignItems="center">
                    <Grid css={{ display: "flex" }}>
                      <ThemeSwitcher isLogo />
                    </Grid>
                    <Spacer x={0.4} />
                    <Grid>
                      <Text
                        size={16}
                        css={{
                          textGradient: "45deg, $primary 25%, $secondary 125%",
                        }}
                        weight="bold"
                      >
                        FCK
                      </Text>
                    </Grid>
                    <Spacer x={0.2} />
                    <Grid>
                      <Text
                        size={16}
                        css={{
                          textGradient: "45deg, $primary 25%, $secondary 125%",
                        }}
                        weight="bold"
                        hideIn="xs"
                      >
                        Foundation
                      </Text>
                    </Grid>
                  </Grid.Container>
                </Navbar.Brand>
              </Grid>
              <Grid css={{ w: "auto" }}>
                <Navbar.Content hideIn="sm">
                  {menu.map(({ title, href }, index) => (
                    <Navbar.Link
                      key={index}
                      isActive={href === location.pathname}
                      onClick={() => navigate(href)}
                    >
                      {title}
                    </Navbar.Link>
                  ))}
                </Navbar.Content>
              </Grid>
              <Grid
                css={{
                  "@xs": {
                    display: "flex",
                    jc: "flex-end",
                  },
                }}
              >
                <Navbar.Content gap={8}>
                  <LanguageSwitcher />
                  <TonConnectButton className="tconnect-button" />
                  <Dropdown placement="bottom-right" closeOnSelect={false}>
                    <Navbar.Item>
                      <Dropdown.Trigger>
                        <Button
                          flat
                          size="sm"
                          style={{
                            minWidth: "auto",
                          }}
                        >
                          <ABS28
                            style={{
                              fill: "var(--nextui-colors-link)",
                              fontSize: 24,
                            }}
                          />
                          <Spacer x={0.4} />
                          <div
                            style={{
                              maxWidth: 75,
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {!user && !address
                              ? t("signIn")
                              : user
                              ? user.first_name
                              : address}
                          </div>
                        </Button>
                      </Dropdown.Trigger>
                    </Navbar.Item>
                    <Dropdown.Menu
                      aria-label="User menu actions"
                      color="secondary"
                      onAction={onAction}
                    >
                      <Dropdown.Item
                        key="switcher"
                        css={{ height: "unset", p: 0, margin: -8 }}
                      >
                        <ThemeSwitcher />
                      </Dropdown.Item>
                      {!address &&
                        ((
                          <Dropdown.Item
                            key="connect"
                            icon={
                              <ABS28
                                style={{
                                  fill: "var(--nextui-colors-link)",
                                  fontSize: 24,
                                }}
                              />
                            }
                            withDivider
                          >
                            {t("connectWallet")}
                          </Dropdown.Item>
                        ) as any)}
                      {!!address &&
                        ((
                          <Dropdown.Item key="analytics" withDivider>
                            {t("analytics")}
                          </Dropdown.Item>
                        ) as any)}
                      {!!address &&
                        ((
                          <Dropdown.Item key="logout" color="error" withDivider>
                            {t("disconnect")}
                          </Dropdown.Item>
                        ) as any)}
                    </Dropdown.Menu>
                  </Dropdown>
                </Navbar.Content>
              </Grid>
            </Container>
            <Navbar.Collapse isOpen={toggle}>
              {menu.map(({ title, href }, index) => (
                <Navbar.CollapseItem
                  key={index}
                  isActive={href === location.pathname}
                  onClick={() => onChangeHref(href)}
                  style={{ cursor: "pointer" }}
                >
                  {title}
                </Navbar.CollapseItem>
              ))}
            </Navbar.Collapse>
          </Navbar>

          <Container gap={2} css={{ display: "flex", padding: "$0" }}>
            {children ? children : <Outlet />}
          </Container>
          {background}
          <Card variant="flat" css={{ borderRadius: 0 }}>
            <Card.Body>
              <Container alignItems="center" fluid>
                <Grid.Container gap={2} justify="space-between">
                  <Grid
                    sm={6}
                    md={8}
                    css={{ display: "flex", flexDirection: "column" }}
                  >
                    <Grid.Container alignItems="center">
                      <Grid css={{ display: "flex" }}>
                        <img src={Logo.toString()} alt="logo" height={24} />
                      </Grid>
                      <Spacer x={0.4} />
                      <Grid>
                        <Text
                          size={16}
                          css={{
                            textGradient:
                              "45deg, $primary 25%, $secondary 125%",
                          }}
                          weight="bold"
                        >
                          FCK Foundation
                        </Text>
                      </Grid>
                    </Grid.Container>
                    <Spacer x={0.4} />
                    <Text css={{ maxW: 500 }}>{t("footerDescription")}</Text>
                  </Grid>
                  <Grid sm={6} md={4}>
                    <Grid.Container>
                      <Grid>
                        <Text size={18}>{t("learnMore")}</Text>
                        <ul>
                          <li>
                            <Link to="https://ton.app" target="_blank">
                              {t("apps")}
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="https://docs.ton.org/learn/glossary"
                              target="_blank"
                            >
                              {t("glossary")}
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="https://github.com/fck-foundation"
                              target="_blank"
                            >
                              {t("developers")}
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/public/FCK Foundation White Paper.pdf"
                              target="_blank"
                            >
                              {t("whitePaper")}
                            </Link>
                          </li>
                          <li>
                            <Link to="/team">{t("ourTeam")}</Link>
                          </li>
                        </ul>
                      </Grid>
                      <Spacer x={1} />
                      <Grid>
                        <Text size={18}>{t("community")}</Text>
                        <Spacer y={1} />
                        <Grid.Container>
                          <Button flat css={{ minWidth: "auto", p: "$4" }}>
                            <TG
                              style={{
                                fill: "currentColor",
                                fontSize: 32,
                              }}
                            />
                          </Button>
                          <Spacer x={0.4} />
                          <Button flat css={{ minWidth: "auto", p: "$4" }}>
                            <TW
                              style={{
                                fill: "currentColor",
                                fontSize: 32,
                              }}
                            />
                          </Button>
                          <Spacer x={0.4} />
                          <Button flat css={{ minWidth: "auto", p: "$4" }}>
                            <Discord
                              style={{
                                fill: "currentColor",
                                fontSize: 32,
                              }}
                            />
                          </Button>
                        </Grid.Container>
                        <Spacer y={0.4} />
                        <Button flat css={{ minWidth: "100%" }}>
                          <GEN16
                            style={{
                              fill: "currentColor",
                              fontSize: 18,
                            }}
                          />
                          <Spacer x={0.4} />
                          {t("joinCommunity")}
                        </Button>
                      </Grid>
                    </Grid.Container>
                  </Grid>
                </Grid.Container>
              </Container>
            </Card.Body>
            <Card.Divider />
            <Card.Footer>
              <Container gap={2} fluid>
                <Grid.Container
                  gap={2}
                  justify="space-between"
                  alignItems="center"
                >
                  <Grid>
                    <Grid.Container gap={2} alignItems="center">
                      {t("basedOn")}
                      <Spacer x={0.4} />
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M11.5479 10.5742H20.5218C20.8393 10.5742 21.1566 10.6208 21.4881 10.7754C21.8855 10.9606 22.0963 11.2527 22.2439 11.4686C22.2554 11.4854 22.2662 11.5027 22.2761 11.5204C22.4497 11.8295 22.5392 12.1631 22.5392 12.522C22.5392 12.863 22.4581 13.2346 22.2761 13.5584C22.2744 13.5615 22.2726 13.5646 22.2708 13.5677L16.6013 23.3068C16.4762 23.5216 16.2461 23.6534 15.9976 23.6525C15.7491 23.6516 15.5199 23.5182 15.3964 23.3025L9.83089 13.5842C9.8293 13.5815 9.8277 13.5789 9.82609 13.5763C9.69874 13.3664 9.50177 13.0418 9.46733 12.6229C9.43566 12.2377 9.52222 11.8518 9.71576 11.5172C9.9093 11.1825 10.2007 10.9149 10.5511 10.7512C10.9269 10.5756 11.3077 10.5742 11.5479 10.5742ZM15.3044 11.9655H11.5479C11.3011 11.9655 11.2063 11.9807 11.1401 12.0117C11.0485 12.0544 10.9716 12.1247 10.9202 12.2137C10.8687 12.3026 10.8455 12.4057 10.854 12.5089C10.8588 12.5681 10.8829 12.6357 11.0251 12.8703C11.0281 12.8752 11.031 12.8802 11.0339 12.8852L15.3044 20.3423V11.9655ZM16.6957 11.9655V20.3791L21.0651 12.8733C21.1145 12.7837 21.1479 12.6543 21.1479 12.522C21.1479 12.4147 21.1257 12.3216 21.0759 12.2256C21.0238 12.1506 20.992 12.1109 20.9654 12.0837C20.9426 12.0604 20.9251 12.048 20.9003 12.0364C20.797 11.9882 20.6913 11.9655 20.5218 11.9655H16.6957Z"
                          fill="#05ADF5"
                        ></path>
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M32 16C32 24.8365 24.8365 32 16 32C7.16342 32 0 24.8365 0 16C0 7.16342 7.16342 0 16 0C24.8365 0 32 7.16342 32 16ZM30.6087 16C30.6087 24.0681 24.0681 30.6087 16 30.6087C7.93182 30.6087 1.3913 24.0681 1.3913 16C1.3913 7.93182 7.93182 1.3913 16 1.3913C24.0681 1.3913 30.6087 7.93182 30.6087 16Z"
                          fill="#05ADF5"
                        ></path>
                      </svg>
                      <Spacer x={0.4} />
                      TON
                    </Grid.Container>
                  </Grid>
                  <Grid>2023 © FCK Foundation</Grid>
                </Grid.Container>
              </Container>
            </Card.Footer>
          </Card>
        </>
      )}
    </div>
  );
};
