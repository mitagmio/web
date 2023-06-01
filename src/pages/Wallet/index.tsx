import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Grid } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { useTonAddress } from "@tonconnect/ui-react";
import axios from "axios";
import { _ } from "utils";
import { TonProofApi } from "TonProofApi";
import { AppContext } from "contexts";

import Header from "./Header";
import Jettons from "./Jettons";
import Swaps from "./Swaps";

export const Wallet = () => {
  const location = useLocation();
  const tonAddress = useTonAddress();
  const { jettons } = useContext(AppContext);
  const [swaps, setSwaps] = useState<Record<string, any>[]>([]);
  const [selected, setSelected] = useState<number>();

  const wallet = location.pathname.split("/").pop();

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
    if (!selected && data?.length && jettons?.length) {
      const list = data?.filter((balance) =>
        dataChart?.find(({ jetton }) => jetton.symbol === balance.jetton.symbol)
      );

      if (list.length) {
        setSelected(
          jettons?.find(({ address }) => address === list[0].jetton.address)?.id
        );
      }
    }
  }, [data, selected, jettons, dataChart]);

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
  }, [tonAddress, selected, wallet]);

  return (
    <Container css={{ minHeight: "50vh", p: "$8" }}>
      <Grid.Container gap={1}>
        <Grid xs={12}>
          <Header selected={selected} setSwaps={setSwaps} />
        </Grid>
        <Grid xs={12} sm={4} css={{ h: "fit-content" }}>
          <Jettons
            selected={selected}
            setSelected={setSelected}
            setSwaps={setSwaps}
          />
        </Grid>
        <Grid xs={12} sm={8} css={{ h: "fit-content" }}>
          <Swaps selected={selected} swaps={swaps} setSwaps={setSwaps} />
        </Grid>
      </Grid.Container>
    </Container>
  );
};
