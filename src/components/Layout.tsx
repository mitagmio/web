import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Navbar,
  Text,
  Dropdown,
  Avatar,
  Spacer,
  User,
  Container,
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
        <Navbar.Brand>
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
          <Text b color="inherit" hideIn="xs">
            FCK
          </Text>
          <Spacer x={0.2} />
          <Text color="inherit" hideIn="sm">
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
    </div>
  );
};

export default Layout;

const menu = [
  { title: "Analytics", href: "/" },
  { title: "Events", href: "/events" },
  { title: "Roadmap", href: "/roadmap" },
  { title: "Team", href: "/team" },
];
