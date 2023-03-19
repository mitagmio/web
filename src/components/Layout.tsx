import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { save } from 'react-cookies'
import { Navbar, Text, Dropdown, Avatar, Spacer, User } from '@nextui-org/react'
import { TonConnectButton } from '@tonconnect/ui-react'
import { Box } from './Box'
import { TLoginButton, TLoginButtonSize, TUser } from './TLogin'
import { useState } from 'react'

const Layout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<TUser>()

  const onAction = (actionKey: React.Key) => {
    switch (actionKey) {
      case 'logout':
        fetch('https://oauth.telegram.org/auth/logOut?bot_id=6160672395&origin=https://fck.foundation', {
          method: 'POST',
          credentials: 'omit',
        })
        setUser(undefined)
        break
      default:
        break
    }
  }
  return (
    <div>
      <Navbar isBordered isCompact shouldHideOnScroll variant="sticky">
        <Navbar.Brand>
          <Navbar.Toggle aria-label="toggle navigation" />
          <Spacer x={1} />
          <img src="/img/logo.svg" alt="logo" height={24} />
          <Spacer x={0.4} />
          <Text b color="inherit" hideIn="xs">
            FCK
          </Text>
          <Spacer x={0.2} />
          <Text color="inherit" hideIn="sm">
            Foundation
          </Text>
        </Navbar.Brand>
        <Navbar.Content hideIn="xs">
          {menu.map(({ title, href }, index) => (
            <Navbar.Link isActive={href === location.pathname} onClick={() => navigate(href)}>
              {title}
            </Navbar.Link>
          ))}
        </Navbar.Content>
        <Navbar.Content
          css={{
            '@xs': {
              jc: 'flex-end',
            },
          }}
        >
          {!user ? (
            <TLoginButton
              botName="dyorton_bot"
              buttonSize={TLoginButtonSize.Medium}
              lang="en"
              usePic={false}
              redirectUrl="https://fck.foundation"
              cornerRadius={0}
              onAuthCallback={setUser}
              requestAccess={'write'}
            />
          ) : (
            <Dropdown placement="bottom-right">
              <Navbar.Item>
                <Dropdown.Trigger>
                  <User bordered as="button" name={user.first_name} color="secondary" size="sm" src={user.photo_url} />
                </Dropdown.Trigger>
              </Navbar.Item>
              <Dropdown.Menu
                aria-label="User menu actions"
                color="secondary"
                onAction={onAction}
                disabledKeys={['profile']}
              >
                <Dropdown.Item key="profile" withDivider>
                  <Text color="inherit" css={{ d: 'flex' }}>
                    Signed in as <Spacer x={0.2} /> <b>{user.username}</b>
                  </Text>
                </Dropdown.Item>
                {/* <Dropdown.Item key="logout" withDivider color="error">
                  Log Out
                </Dropdown.Item> */}
              </Dropdown.Menu>
            </Dropdown>
          )}
          <TonConnectButton />
        </Navbar.Content>
        <Navbar.Collapse>
          {menu.map(({ title, href }, index) => (
            <Navbar.CollapseItem
              key={index}
              isActive={href === location.pathname}
              onClick={() => navigate(href)}
              style={{ cursor: 'pointer' }}
            >
              {title}
            </Navbar.CollapseItem>
          ))}
        </Navbar.Collapse>
      </Navbar>

      <Box css={{ px: '$12', mt: '$8', '@xsMax': { px: '$10' } }}>
        <Outlet />
      </Box>
    </div>
  )
}

export default Layout

const menu = [
  { title: 'Analytics', href: '/' },
  { title: 'Events', href: '/events' },
  { title: 'Roadmap', href: '/roadmap' },
  { title: 'Team', href: '/team' },
]
