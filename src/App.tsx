import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import useDarkMode from 'use-dark-mode'
import { ThemeProvider } from 'next-themes'
import { createTheme, NextUIProvider } from '@nextui-org/react'
import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react'

import { TonProofDemoApi } from './TonProofDemoApi'
import Layout from './components/Layout'
import Home from './Home'
import NotFound from './NotFound'
import Ton from './Ton'

import './assets/index.scss';
import 'keen-slider/keen-slider.min.css';
import 'tailwindcss/tailwind.css';

const lightTheme = createTheme({
  type: 'light',
  theme: {
    colors: {
      primaryLight: '$green200',
      primaryLightHover: '$green300',
      primaryLightActive: '$green400',
      primaryLightContrast: '$green600',
      primary: '#2eab8f',
      primaryBorder: '$green500',
      primaryBorderHover: '$green600',
      primarySolidHover: '$green700',
      primarySolidContrast: '$white',
      primaryShadow: '$green500',
      secondary: `#45B6F7`,
      secondaryLight: '$blue200',
      secondaryLightHover: '$blue300',
      secondaryLightActive: '$blue400',
      secondaryLightContrast: '$blue600',
      secondaryBorder: '$blue500',
      secondaryBorderHover: '$blue600',
      secondarySolidHover: '$blue700',
      secondarySolidContrast: '$white',
      gradient: 'linear-gradient(45deg, $green600 0%, $blue600 100%)',
      link: '#45B6F7',
    }, // optional
  },
})

const darkTheme = createTheme({
  type: 'dark',
  theme: {
    colors: {
      background: 'transparent',
      primaryLight: '$green200',
      primaryLightHover: '$green300',
      primaryLightActive: '$green400',
      primaryLightContrast: '$green600',
      primary: '#2eab8f',
      primaryBorder: '$green500',
      primaryBorderHover: '$green600',
      primarySolidHover: '$green700',
      primarySolidContrast: '$white',
      primaryShadow: '$green500',
      secondaryLight: '$blue200',
      secondaryLightHover: '$blue300',
      secondaryLightActive: '$blue400',
      secondaryLightContrast: '$blue600',
      secondary: `#45B6F7`,
      secondaryBorder: '$blue500',
      secondaryBorderHover: '$blue600',
      secondarySolidHover: '$blue700',
      secondarySolidContrast: '$white',
      secondaryShadow: '$blue500',
      gradient: 'linear-gradient(45deg, $green600 0%, $blue600 100%)',
      link: '#45B6F7',
    }, // optional
  },
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'ton',
        element: <Ton />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

function App() {
  const darkMode = useDarkMode(true)

  return (
    <ThemeProvider
      defaultTheme={darkMode.value ? 'dark' : 'light'}
      attribute="class"
      value={{
        light: lightTheme.className,
        dark: darkTheme.className,
      }}
    >
      <NextUIProvider theme={darkMode.value ? darkTheme : lightTheme}>
    <TonConnectUIProvider
      manifestUrl="https://fck.foundation/tonconnect-manifest.json"
      getConnectParameters={() => TonProofDemoApi.connectWalletRequest}
      uiPreferences={{ theme: THEME.DARK }}
    >
        <RouterProvider router={router} />
        </TonConnectUIProvider>
      </NextUIProvider>
    </ThemeProvider>
  )
}

export default App
