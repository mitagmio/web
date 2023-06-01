import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Button,
  Grid,
  Link,
  Spacer,
  Text,
} from "@nextui-org/react";
import {
  Tonscan,
  Tonviewer,
} from "assets/icons";
import axios from "axios";
import { useTonAddress } from "@tonconnect/ui-react";
import { AppContext } from "contexts";
import qrcode from "qrcode-generator";
import { useQuery } from "@tanstack/react-query";
import { _, normalize } from "utils";
import { useTranslation } from "react-i18next";
import { Address } from "ton-core";
import Skeleton from "react-loading-skeleton";
import { TonProofApi } from "TonProofApi";

interface Props {
  selected?: number;
  setSwaps: (value?: any) => void;
}

const WalletHeader: React.FC<Props> = ({ selected, setSwaps }) => {
  const location = useLocation();
  const tonAddress = useTonAddress();
  const { t } = useTranslation();
  const { jettons, ton } = useContext(AppContext);

  const wallet = location.pathname.split("/").pop();

  const qrSVG = useMemo(() => {
    const qr = qrcode(0, "L");
    qr.addData(wallet as string);
    qr.make();
    return qr.createTableTag(4.5, 0);
  }, [wallet]);

  const address = useMemo(() => Address.parse(wallet as string), [wallet]);

  const { data: dataTON, isLoading: isLoadingTON } = useQuery({
    queryKey: ["wallet-ton", address],
    queryFn: async () =>
      await axios.get(
        `https://tonapi.io/v1/blockchain/getAccount?account=${address.toRawString()}`
      ),
    enabled: !!wallet,
    refetchOnMount: false,
    refetchOnReconnect: false,
    select: (response) => ({
      ton: normalize(response.data.balance, 9).toFixed(2),
      usd: (
        normalize(response.data.balance, 9) * ton.market_data.current_price.usd
      ).toFixed(2),
    }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["wallet-jettons", wallet],
    queryFn: async () =>
      await axios.get(`https://tonapi.io/v2/accounts/${wallet}/jettons`),
    enabled: !!wallet,
    refetchOnMount: false,
    refetchOnReconnect: false,
    select: (response) =>
      response.data.balances.filter(({ balance }) => parseFloat(balance)),
  });

  const dataSelected = useMemo(
    () =>
      jettons?.filter(({ address }) =>
        data?.some(({ jetton }) => jetton.address === address)
      ),
    [jettons, data]
  );

  const { data: dataChart, isLoading: isLoadingChart } = useQuery({
    queryKey: ["jettons-analytics-profile", data],
    queryFn: () =>
      axios
        .get(
          `https://api.fck.foundation/api/v2/analytics?jetton_ids=${dataSelected
            .map(({ id }) => id)
            .join(",")}&time_min=${Math.floor(
            Date.now() / 1000 - 86400
          )}&timescale=${86400 / 6}`
        )
        .then(({ data: { data } }) => data),
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: !!data?.length,
    cacheTime: 60 * 1000,
    select: (response) =>
      dataSelected.map((jetton: any, key) => {
        jetton.data =
          response?.sources?.DeDust?.jettons[jetton.id.toString()]?.prices ||
          [];
        const dataJetton = [
          ...(jetton.data && jetton.data.length < 2
            ? [
                {
                  name: jetton.data[0]?.symbol,
                  pv:
                    _(jetton.data[0]?.price_close) ||
                    _(jetton.data[0]?.price_high) ||
                    _(jetton.data[0]?.price_low) ||
                    _(jetton.data[0]?.price_open),
                  volume: 0,
                },
              ]
            : []),
          ...(jetton.data || [])?.map((item, i) => {
            return {
              name: jettons.find(({ id }) => id === item.jetton_id)?.symbol,
              pv:
                _(item.price_close) ||
                _(item.price_high) ||
                _(item.price_low) ||
                _(item.price_open),
              volume: _(item.volume),
            };
          }),
        ];
        const dataChart = [...dataJetton]
          .filter((i) => i.pv)
          .map((d, i) => ({
            ...d,
            pv:
              i > 0 &&
              d.pv &&
              dataJetton[i - 1].pv &&
              dataJetton[i - 1].pv !== d.pv
                ? dataJetton[i - 1].pv < d.pv
                  ? d.pv && d.pv - 100
                  : d.pv && d.pv + 100
                : dataJetton[dataJetton.length - 1].pv < d.pv
                ? d.pv && d.pv + 100 * 10
                : d.pv && d.pv - 100 * 2,
          }));

        const volume = [...dataJetton].reduce(
          (acc, i) => (acc += i?.volume),
          0
        );
        const percent = !!dataJetton[dataJetton.length - 1]?.pv
          ? ((dataJetton[dataJetton.length - 1]?.pv - dataJetton[0]?.pv) /
              dataJetton[0]?.pv) *
            100
          : 0;

        return { jetton, dataJetton, dataChart, percent, volume };
      }),
  });

  useEffect(() => {
    if (TonProofApi.accessToken) {
      if (selected && tonAddress) {
        axios
          .get(
            `https://api.fck.foundation/api/v2/user/swaps?address=${wallet}&jetton_id=${selected}&count=100`,
            {
              headers: {
                Authorization: `Bearer ${TonProofApi.accessToken}`,
              },
            }
          )
          .then((response) => {
            console.log("response", response);
            setSwaps(response.data.data.sources.DeDust.jettons[selected].swaps);
          });
      }
    }
    console.log(tonAddress, selected, wallet);
  }, [tonAddress, selected, wallet]);

  const dataJettons = useMemo(
    () =>
      jettons?.reduce((acc, curr) => {
        acc[curr.id] = curr;

        return acc;
      }, {}),
    [jettons]
  );

  return (
    <Grid.Container wrap="nowrap">
            <Grid
              dangerouslySetInnerHTML={{
                __html: qrSVG.replace('style="', 'style="width:130.5px;'),
              }}
            />
            <Spacer x={1} />
            <Grid>
              <Grid.Container direction="column">
                <Grid>
                  <Grid.Container>
                    <Grid>
                      {wallet?.slice(0, 4)}...{wallet?.slice(-4)}
                    </Grid>
                    <Spacer x={0.4} />
                    <Grid>
                      <Link
                        href={`https://tonviewer.com/${wallet}`}
                        target="_blank"
                      >
                        <Tonviewer
                          style={{ fill: "currentColor", zoom: 0.5 }}
                        />
                      </Link>
                    </Grid>
                    <Spacer x={0.4} />
                    <Grid>
                      <Link
                        href={`https://tonscan.org/address/${wallet}`}
                        target="_blank"
                      >
                        <Tonscan
                          style={{ fill: "currentColor", fontSize: 20 }}
                        />
                        <Text size={12} css={{ fontWeight: "bold" }}>
                          Tonscan
                        </Text>
                      </Link>
                    </Grid>
                  </Grid.Container>
                </Grid>
                <Spacer y={0.4} />
                <Grid>
                  {isLoadingTON ? (
                    <Skeleton width={100} height={18} />
                  ) : (
                    `${dataTON?.ton} TON ≈ $${dataTON?.usd}`
                  )}
                </Grid>
                <Grid>
                  <Button flat size="sm" css={{ minWidth: "auto" }}>
                    {t("sendTransaction")}
                  </Button>
                </Grid>
              </Grid.Container>
            </Grid>
          </Grid.Container>
  );
}

export default WalletHeader;
