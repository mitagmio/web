import { createContext, ReactNode, ReactElement, useEffect, useState, Dispatch } from 'react'
import { THEME, TonConnectUIProvider, useTonAddress } from '@tonconnect/ui-react'
import { useQuery } from '@tanstack/react-query'
import axios from 'libs/axios'
import { coingecko } from 'api'
import { fck } from 'api/fck'
import useDarkMode from 'use-dark-mode'
import {
  JettonApi,
  DNSApi,
  NFTApi,
  RawBlockchainApi,
  SubscriptionApi,
  TraceApi,
  WalletApi,
  Configuration,
  NftItemRepr,
} from 'tonapi-sdk-js'
import { TonProofDemoApi } from 'TonProofDemoApi'

export type JType = {
  id: number
  name: string
  image: string
  symbol: string
  address: string
  decimals: number
  verified: number
}

interface AppProps {
  address: string
  rawAddress: string
  nftItems: NftItemRepr[]
  theme: { color: string; id?: number }
  ton: Record<string, any>
  isTLoading: boolean
  jettons: JType[]
  isJLoading: boolean
  enabled: boolean
  setEnabled: Dispatch<any>
  setTheme: Dispatch<any>
}

const defaultAppContext: AppProps = {
  address: '',
  rawAddress: '',
  theme: { color: '' },
  nftItems: [],
  ton: {},
  isTLoading: false,
  jettons: [],
  isJLoading: false,
  enabled: false,
  setEnabled: () => null,
  setTheme: () => null,
}

const key = 'is-dark'

export const AppContext = createContext<AppProps>(defaultAppContext)

const AppProviderWrapper = ({ children }: { children: ReactNode }): ReactElement => {
  const address = useTonAddress()
  const rawAddress = useTonAddress(false)

  const [theme, setTheme] = useState(localStorage.getItem('theme') ? JSON.parse(localStorage.getItem('theme') as string) : { color: 'dark' })
  const [nftItems, setNFTItems] = useState<NftItemRepr[]>([])

  const darkMode = useDarkMode(false, {
    classNameDark: 'dark',
    classNameLight: 'light',
  })
  const [enabled, setEnabled] = useState(
    globalThis.localStorage?.getItem(key)
      ? JSON.parse(globalThis.localStorage?.getItem(key) as string)
      : globalThis?.window?.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    if (theme) {
      localStorage.setItem('theme', JSON.stringify(theme))
    }
  }, [theme])

  useEffect(() => {
    globalThis.localStorage.setItem(key, JSON.stringify(enabled))
    if (enabled) {
      document.body.classList.add('dark')
      document.body.classList.remove('light')
    } else {
      document.body.classList.add('light')
      document.body.classList.remove('dark')
    }

    if (enabled) {
      darkMode.enable()
    } else {
      darkMode.disable()
    }
  }, [enabled])

  const { data: ton, isLoading: isTLoading } = useQuery({
    queryKey: ['ton'],
    queryFn: coingecko.getData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const { data: jettons, isLoading: isJLoading } = useQuery({
    queryKey: ['jettons'],
    queryFn: fck.getJettons,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  useEffect(() => {
    const getData = async () => {
      // if (address) {
        // Get list of transactions
        const blockchainApi = new RawBlockchainApi(
          new Configuration({
            headers: {
              // To get unlimited requests
              Authorization:
                'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsidGF0YWRldiJdLCJleHAiOjE4MzgwNDc0ODYsImlzcyI6IkB0b25hcGlfYm90IiwianRpIjoiMkFHREdMR09OSUMyVVo3MkNVS0lVUkJXIiwic2NvcGUiOiJjbGllbnQiLCJzdWIiOiJ0b25hcGkifQ.MzApNKLvc9ZHCquoCfXZ-3CXg2-DZLdRrTXjHqk2c1uZt4VPJeQTFvjFtHMtyWi59v1FTCWjYcRUr8viVpXZCA',
            },
          })
        )

        // Receive typed array of transactions
        const { transactions } = await blockchainApi.getTransactions({
          account: address,
          limit: 10,
        })

        // Get list of nfts by owner address
        const nftApi = new NFTApi()
        // Receive typed array of owner nfts
        const { nftItems } = await nftApi.searchNFTItems({
          owner: true ? 'EQDsP4js-X1VVS7mBZAuoeXvKcvOYlkpsdELBHwJOez07ZTW' : address,
          includeOnSale: true,
          limit: 27,
          offset: 0,
          collection: '0:06d811f426598591b32b2c49f29f66c821368e4acb1de16762b04e0174532465',
        })

        setNFTItems(nftItems)
        console.log(nftItems)
      // }
    }

    getData()
  }, [address])

  console.log('App', { ton, jettons })

  return (
    <AppContext.Provider
      value={{
        address,
        rawAddress,
        nftItems,
        theme,
        setTheme,
        ton,
        isTLoading,
        jettons,
        isJLoading,
        enabled,
        setEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const AppProvider = ({ children }) => {
  return (
    <TonConnectUIProvider
      manifestUrl="https://fck.foundation/tonconnect-manifest.json"
      getConnectParameters={() => TonProofDemoApi.connectWalletRequest}
      uiPreferences={{ theme: THEME.DARK }}
    >
      <AppProviderWrapper>{children}</AppProviderWrapper>
    </TonConnectUIProvider>
  )
}
