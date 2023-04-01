import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import useDarkMode from 'use-dark-mode'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { NextUIProvider } from '@nextui-org/react'

import { AppContext, AppProvider } from './contexts'
import { darkTheme, lightTheme, T509FFA,
  T5089FA,
  T7380FA,
  T9B78FA,
  TFA5AAF,
  TFA5A60,
  T53DAF5,
  T8978FA,
  T5AFACA,
  TF450FA,
  T567FF0,
  TF0AF65 } from './themes'
import { TonProofDemoApi } from './TonProofDemoApi'
import Layout from './components/Layout'
import Home from './Home'
import NotFound from './NotFound'
import Ton from './Ton'

import 'react-loading-skeleton/dist/skeleton.css'
import 'keen-slider/keen-slider.min.css'
import './assets/index.scss'
import { useContext } from 'react'

const queryClient = new QueryClient()

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
  const { theme } = useContext(AppContext)
  const darkMode = useDarkMode(true)

  const themeName = theme ? `T${theme.color.split('#').pop()}` : 'dark'

  return (
    <ThemeProvider
      defaultTheme={themeName} //darkMode.value ? 'dark' : 'light'}
      attribute="class"
      forcedTheme={themeName} //theme ? `T${theme.split('#').pop()}` : 'dark'}
      themes={['light', 'dark', 'T9B78FA']}
      value={{
        light: lightTheme.className,
        dark: darkTheme.className,
        T509FFA: T509FFA.className, // sky
        T5089FA: T5089FA.className, // arctic
        T7380FA: T7380FA.className, // azure
        T9B78FA: T9B78FA.className, // iris
        TFA5AAF: TFA5AAF.className, // flamingo
        TFA5A60: TFA5A60.className, // corral
        T53DAF5: T53DAF5.className, // marine
        T8978FA: T8978FA.className, // ocean
        T5AFACA: T5AFACA.className, // fluid
        TF450FA: TF450FA.className, // galaxy
        T567FF0: T567FF0.className, // cosmos
        TF0AF65: TF0AF65.className, // andromeda
      }}
    >
      <NextUIProvider theme={darkMode.value ? darkTheme : lightTheme}>
        <RouterProvider router={router} />
      </NextUIProvider>
    </ThemeProvider>
  )
}

export default () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <App />
    </AppProvider>
  </QueryClientProvider>
)
