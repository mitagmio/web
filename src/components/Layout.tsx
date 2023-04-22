import { Outlet, useLocation, useNavigate } from "react-router-dom";
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
} from "@nextui-org/react";
import { TonConnectButton } from "@tonconnect/ui-react";

import { TLoginButton, TLoginButtonSize, TUser } from "./TLogin";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useContext, useMemo, useState } from "react";
import { AppContext } from "contexts";
import { default as Logo } from "assets/logo.svg";
import { SvgInline } from "./SvgInline";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { nftItems, theme } = useContext(AppContext);
  const [toggle, setToggle] = useState(false);
  const [user, setUser] = useState<TUser>();

  const onAction = (actionKey: React.Key) => {
    switch (actionKey) {
      case "logout":
        fetch(
          "https://oauth.telegram.org/auth/logOut?bot_id=6160672395&origin=https://fck.foundation",
          {
            method: "POST",
            mode: "no-cors",
          }
        );
        setUser(undefined);
        break;
      default:
        break;
    }
  };

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

  return (
    <div className={"ton-background"}>
      <Navbar
        className="navbar"
        isBordered
        isCompact={{ "@smMax": true, "@smMin": false }}
        shouldHideOnScroll
        disableScrollHandler
        variant="sticky"
      >
        <Navbar.Brand css={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          <Navbar.Toggle
            isSelected={toggle}
            aria-label="toggle navigation"
            showIn="sm"
            onChange={(value) => setToggle(!!value)}
          />
          <Spacer x={1} />
          <Text>
            <img src={Logo.toString()} alt="logo" height={24} />
          </Text>
          <Spacer x={0.4} />
          <Text
            b
            color={location.pathname === "/" ? "$primary" : "inherit"}
            hideIn="xs"
          >
            FCK
          </Text>
          <Spacer x={0.2} />
          <Text
            color={location.pathname === "/" ? "$primary" : "inherit"}
            hideIn="sm"
          >
            Foundation
          </Text>
        </Navbar.Brand>
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
        <Navbar.Content
          css={{
            "@xs": {
              jc: "flex-end",
            },
          }}
        >
          <ThemeSwitcher />
          {/* {!user ? (
            <TLoginButton
              botName="dyorton_bot"
              buttonSize={TLoginButtonSize.Medium}
              lang="en"
              usePic={false}
              redirectUrl="https://fck.foundation"
              cornerRadius={0}
              onAuthCallback={setUser}
              requestAccess={"write"}
            />
          ) : (
            <User
              bordered
              as="button"
              name={user.first_name}
              color="secondary"
              size="sm"
              src={user.photo_url}
            />
            // <Dropdown placement="bottom-right">
            //   <Navbar.Item>
            //     <Dropdown.Trigger>
            //       <User bordered as="button" name={user.first_name} color="secondary" size="sm" src={user.photo_url} />
            //     </Dropdown.Trigger>
            //   </Navbar.Item>
            //   <Dropdown.Menu
            //     aria-label="User menu actions"
            //     color="secondary"
            //     onAction={onAction}
            //     disabledKeys={['profile']}
            //   >
            //     <Dropdown.Item key="profile" withDivider>
            //       <Text color="inherit" css={{ d: 'flex' }}>
            //         Signed in as <Spacer x={0.2} /> <b>{user.username}</b>
            //       </Text>
            //     </Dropdown.Item>
            //     <Dropdown.Item key="logout" withDivider color="error">
            //       Log Out
            //     </Dropdown.Item>
            //   </Dropdown.Menu>
            // </Dropdown>
          )} */}
          <TonConnectButton className="tconnect-button" />
        </Navbar.Content>
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

      <Container fluid css={{ p: 0, "@xs": { p: "$8" } }}>
        <Outlet />
      </Container>
      {background}
      <Card variant="flat" css={{ borderRadius: 0 }}>
        <Card.Body css={{ py: "$10" }}>
          <Container fluid css={{ p: 0, "@xs": { p: "$8" } }}>
            <Grid.Container alignItems="center">
              <Text>
                <img src={Logo.toString()} alt="logo" height={24} />
              </Text>
              <Spacer x={0.4} />
              <Text b color={"inherit"} hideIn="xs">
                FCK
              </Text>
              <Spacer x={0.2} />
              <Text color={"inherit"} hideIn="sm">
                Foundation
              </Text>
            </Grid.Container>
            <Text css={{ maxW: 300 }}>
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </Text>
          </Container>
        </Card.Body>
        <Card.Divider />
        <Card.Footer>
          <Container fluid css={{ p: 0, "@xs": { p: "$8" } }}>
            <Grid.Container alignItems="center">
              Based on
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
          </Container>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Layout;

const menu = [
  { title: "Analytics", href: "/analytics" },
  { title: "Events", href: "/events" },
  { title: "Roadmap", href: "/roadmap" },
  { title: "Team", href: "/team" },
];
