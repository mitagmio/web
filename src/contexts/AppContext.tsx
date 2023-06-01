import {
  createContext,
  ReactNode,
  ReactElement,
  useEffect,
  useState,
  Dispatch,
  useCallback,
} from "react";
import cookie from "react-cookies";
import {
  THEME,
  TonConnectUIProvider,
  useTonAddress,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { useQuery } from "@tanstack/react-query";
import axios from "libs/axios";
import { coingecko } from "api";
import { fck } from "api/fck";
import useDarkMode from "use-dark-mode";
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
} from "tonapi-sdk-js";
import { TonProofApi } from "TonProofApi";
import { useTranslation } from "react-i18next";
import { CHAIN } from "@tonconnect/sdk";
import { useTheme } from "next-themes";
import { Loading } from "@nextui-org/react";
import { getCookie } from "utils";

export type JType = {
  id: number;
  name: string;
  image: string;
  symbol: string;
  address: string;
  decimals: number;
  verified: number;
};

interface AppProps {
  address: string;
  rawAddress: string;
  nftItems?: NftItemRepr[];
  theme: { color: string; id?: number };
  ton: Record<string, any>;
  isTLoading: boolean;
  jettons: JType[];
  isJLoading: boolean;
  enabled: boolean;
  setEnabled: Dispatch<any>;
  setTheme: Dispatch<any>;
}

const defaultAppContext: AppProps = {
  address: "",
  rawAddress: "",
  theme: { color: "" },
  nftItems: [],
  ton: {},
  isTLoading: false,
  jettons: [],
  isJLoading: false,
  enabled: false,
  setEnabled: () => null,
  setTheme: () => null,
};

const key = "dark-mode";

export const AppContext = createContext<AppProps>(defaultAppContext);

const AppProviderWrapper = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const { i18n } = useTranslation();
  const wallet = useTonWallet();
  const address = useTonAddress();
  const rawAddress = useTonAddress(false);
  const [tonConnectUI, setOptions] = useTonConnectUI();
  const [theme, setTheme] = useState(
    getCookie("theme")
      ? JSON.parse(decodeURIComponent(getCookie("theme") || ""))
      : {
          color: globalThis?.window?.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light",
        }
  );
  console.log("document.cookie", getCookie("theme"));
  const [nftItems, setNFTItems] = useState<NftItemRepr[]>();
  const [enabled, setEnabled] = useState(
    getCookie(key)
      ? JSON.parse(decodeURIComponent(getCookie(key) || ""))
      : globalThis?.window?.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [data, setData] = useState({});
  const [authorized, setAuthorized] = useState(false);

  useEffect(
    () =>
      tonConnectUI.onStatusChange(async (w) => {
        if (!w || w.account.chain === CHAIN.TESTNET) {
          TonProofApi.reset();
          setAuthorized(false);
          return;
        }

        if (w.connectItems?.tonProof && "proof" in w.connectItems.tonProof) {
          await TonProofApi.checkProof(
            w.connectItems.tonProof.proof,
            w.account
          );
        }

        if (!TonProofApi.accessToken) {
          tonConnectUI.disconnect();
          setAuthorized(false);
          return;
        }

        setAuthorized(true);
      }),
    [tonConnectUI]
  );

  useEffect(() => {
    const get = async () => {
      if (wallet) {
        const response = await TonProofApi.getAccountInfo(wallet.account);

        setData(response);
      }
    };

    get();
  }, [wallet]);

  useEffect(() => {
    if (theme) {
      cookie.save("theme", JSON.stringify(theme), { path: "/" });

      if (enabled) {
        document.getElementsByTagName("html")[0].classList.add("dark-theme");
        document
          .getElementsByTagName("html")[0]
          .classList.remove("light-theme");
      } else {
        document.getElementsByTagName("html")[0].classList.add("light-theme");
        document.getElementsByTagName("html")[0].classList.remove("dark-theme");
      }
    }

    setOptions({
      language: i18n.language as any,
      uiPreferences: { theme: (enabled ? "DARK" : "LIGHT") as any },
    });
  }, [theme, enabled, i18n.language]);

  useEffect(() => {
    cookie.save(key, JSON.stringify(enabled), { path: "/" });
  }, [enabled]);

  const { data: ton, isLoading: isTLoading } = useQuery({
    queryKey: ["ton"],
    queryFn: coingecko.getData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const { data: jettons, isLoading: isJLoading } = useQuery({
    queryKey: ["jettons"],
    queryFn: fck.getJettons,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    const getData = async () => {
      if (address) {
        // Get list of transactions
        const blockchainApi = new RawBlockchainApi(
          new Configuration({
            headers: {
              // To get unlimited requests
              Authorization:
                "Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsidGF0YWRldiJdLCJleHAiOjE4MzgwNDc0ODYsImlzcyI6IkB0b25hcGlfYm90IiwianRpIjoiMkFHREdMR09OSUMyVVo3MkNVS0lVUkJXIiwic2NvcGUiOiJjbGllbnQiLCJzdWIiOiJ0b25hcGkifQ.MzApNKLvc9ZHCquoCfXZ-3CXg2-DZLdRrTXjHqk2c1uZt4VPJeQTFvjFtHMtyWi59v1FTCWjYcRUr8viVpXZCA",
            },
          })
        );

        // Receive typed array of transactions
        const { transactions } = await blockchainApi.getTransactions({
          account: address,
          limit: 10,
        });

        // Get list of nfts by owner address
        const nftApi = new NFTApi();
        // Receive typed array of owner nfts
        const { nftItems } = await nftApi.searchNFTItems({
          owner: address,
          includeOnSale: true,
          limit: 27,
          offset: 0,
          collection:
            "0:06d811f426598591b32b2c49f29f66c821368e4acb1de16762b04e0174532465",
        });

        setNFTItems(nftItems);
      } else {
        setNFTItems([]);
      }
    };

    getData();
  }, [address]);

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
  );
};

export const AppProvider = ({ children }) => {
  return (
    <TonConnectUIProvider
      manifestUrl="https://fck.foundation/tonconnect-manifest.json"
      getConnectParameters={() => TonProofApi.connectWalletRequest}
    >
      <AppProviderWrapper>{children}</AppProviderWrapper>
    </TonConnectUIProvider>
  );
};
