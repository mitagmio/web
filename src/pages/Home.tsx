import { useContext, useMemo, useState, useEffect, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import Earth from "3d-earth";
import { axios } from "libs";
import {
  Button,
  Grid,
  Spacer,
  Text,
  Image,
  Input,
  Dropdown,
  Card,
  Link,
  Container,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import cookie from "react-cookies";
import { Calc, FCard, Promote } from "components";
import { fck } from "api/fck";
import { ARR01, ARR07, FIL21, GEN02, GEN11, GEN20 } from "assets/icons";
import { getList } from "utils/analytics";

import { AppContext, JType } from "../contexts";
import getEarthConfig from "../earth.config";
import { pagination } from "./Analytics";
import {
  useTonAddress,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { getCookie } from "utils";
import { data } from "autoprefixer";

export type TimeScale = "1M" | "5M" | "30M" | "1H" | "4H" | "1D" | "30D";

export function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const address = useTonAddress();
  const wallet = useTonWallet();
  const [tonConnectUi] = useTonConnectUI();
  const { jettons, enabled, refetchJettons } = useContext(AppContext);
  const [timescale, setTimescale] = useState<TimeScale>(
    cookie.load("timescale") || "1D"
  );
  const [voteId, setVoteId] = useState<number>();
  const [processing, setProcessing] = useState(
    cookie.load("processing")
      ? (cookie.load("processing") as any)
      : { before: 0, wait: 0 }
  );

  const listVerified = useMemo(
    () =>
      [...(jettons || [])]
        ?.filter((i) => i.verified)
        ?.map(({ id }) => id)
        .slice(0, 14),
    [jettons]
  );

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["jettons-transactions", timescale],
    queryFn: ({ signal }) =>
      axios
        .get(
          `https://api.fck.foundation/api/v2/analytics/swaps/count?jetton_ids=${jettons
            .map((jetton) => jetton.id)
            .join(",")}&time_min=${Math.floor(
            Date.now() / 1000 - pagination[timescale]
          )}`,
          { signal }
        )
        .then(({ data: { data } }) => data),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled: !!jettons?.length,
    select: (results) => {
      return Object.keys(results.sources.DeDust.jettons)
        .reduce((acc, curr) => {
          acc.push({
            id: curr,
            count: results.sources.DeDust.jettons[curr].count,
          });

          return acc;
        }, [] as any)
        .sort((x, y) => y.count - x.count)
        .slice(0, 9);
    },
  });

  const { data: dataRecently, isLoading: isLoadingRecently } = useQuery({
    queryKey: ["new-jettons"],
    queryFn: async () => await fck.getRecentlyAdded(9),
    refetchOnMount: false,
    refetchOnReconnect: false,
    select: (results) => {
      return results.data.map(({ id }) => id);
    },
  });

  const {
    data: dataPromo,
    isLoading: isLoadingPromo,
    refetch: refetchPromo,
  } = useQuery({
    queryKey: ["promo-jettons"],
    queryFn: async () => await fck.getPromoting(9),
    refetchOnMount: false,
    refetchOnReconnect: false,
    select: (results) => {
      return results.data.map(({ id }) => id);
    },
  });

  const {
    data: dataTrending,
    isLoading: isLoadingTrending,
    refetch: refetchTrending,
  } = useQuery({
    queryKey: ["trending-jettons"],
    queryFn: async () => await fck.getTrending(9),
    refetchOnMount: false,
    refetchOnReconnect: false,
    select: (results) => {
      return results.data.map(({ id }) => id);
    },
  });

  const { data: dataStats, isLoading } = useQuery({
    queryKey: ["analytics-stats", timescale],
    queryFn: async () =>
      await fck.getAnalytics(
        (transactions || [])?.map(({ id }) => parseInt(id))?.join(),
        Math.floor(Date.now() / 1000 - pagination[timescale]),
        pagination[timescale] / 6
      ),
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: !![...(jettons || [])]?.length && !!transactions?.length,
    select: (results) => {
      results = results.data.sources.DeDust.jettons;

      const transform = (list) =>
        list.reduce((acc, curr) => {
          acc[curr] = results[curr].prices;
          return acc;
        }, {});

      return getList(
        transform([...(transactions || [])?.map(({ id }) => parseInt(id))]),
        jettons
      );
    },
  });

  const { data: dataStatsRecent, isLoading: isLoadingStatsRecent } = useQuery({
    queryKey: ["analytics-recent", timescale],
    queryFn: async () =>
      await fck.getAnalytics(
        dataRecently?.join(),
        Math.floor(Date.now() / 1000 - pagination[timescale]),
        pagination[timescale] / 6
      ),
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: !![...(jettons || [])]?.length && !!dataRecently?.length,
    select: (results) => {
      results = results.data.sources.DeDust.jettons;

      const transform = (list) =>
        list.reduce((acc, curr) => {
          acc[curr] = results[curr]?.prices || [];
          return acc;
        }, {});

      return getList(transform([...dataRecently]), jettons);
    },
  });

  const { data: dataStatsPromo, isLoading: isLoadingStatsPromo } = useQuery({
    queryKey: ["analytics-promo", timescale],
    queryFn: async () =>
      await fck.getAnalytics(
        dataPromo?.join(),
        Math.floor(Date.now() / 1000 - pagination[timescale]),
        pagination[timescale] / 6
      ),
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: !![...(jettons || [])]?.length && !!dataPromo?.length,
    select: (results) => {
      results = results.data.sources.DeDust.jettons;

      const transform = (list) =>
        list.reduce((acc, curr) => {
          acc[curr] = results[curr]?.prices || [];
          return acc;
        }, {});

      return getList(transform([...dataPromo]), jettons);
    },
  });

  const { data: dataStatsTrending, isLoading: isLoadingStatsTrending } =
    useQuery({
      queryKey: ["analytics-trending", timescale],
      queryFn: async () =>
        await fck.getAnalytics(
          dataTrending?.join(),
          Math.floor(Date.now() / 1000 - pagination[timescale]),
          pagination[timescale] / 6
        ),
      refetchOnMount: false,
      refetchOnReconnect: false,
      enabled: !![...(jettons || [])]?.length && !!dataTrending?.length,
      select: (results) => {
        results = results.data.sources.DeDust.jettons;

        const transform = (list) =>
          list.reduce((acc, curr) => {
            acc[curr] = results[curr]?.prices || [];
            return acc;
          }, {});

        return getList(transform([...dataTrending]), jettons);
      },
    });

  useEffect(() => {
    if (processing.wait > 0) {
      const verify = setInterval(refetchJettons, 15000);
      const curr = jettons
        ?.map(({ stats }) => stats?.promoting_points || 0)
        ?.reduce((acc, curr) => (acc += curr), 0);

      if (processing.wait <= curr) {
        setProcessing({ wait: 0, curr });
        cookie.remove("processing");

        toast.success(t("voteSuccess"), {
          position: toast.POSITION.TOP_RIGHT,
          theme: enabled ? "dark" : "light",
        });

        clearInterval(verify);
      }
    }
  }, [processing, jettons]);

  const onSuccess = (value: number) => {
    const curr = jettons
      .map(({ stats }) => stats.promoting_points)
      .reduce((acc, curr) => (acc += curr), 0);

    setProcessing({ curr: curr, wait: curr + value });

    cookie.save(
      "processing",
      JSON.stringify({ before: curr, wait: curr + value }),
      { path: "/" }
    );

    toast.success(t("voteSent"), {
      position: toast.POSITION.TOP_RIGHT,
      theme: enabled ? "dark" : "light",
    });
  };

  const loading =
    isLoading ||
    isLoadingPromo ||
    isLoadingStatsRecent ||
    isLoadingStatsPromo ||
    isLoadingRecently ||
    isLoadingTransactions ||
    isLoadingTrending ||
    isLoadingStatsTrending;

  return (
    <>
      <Grid.Container
        gap={2}
        alignItems="center"
        justify="center"
        css={{ minHeight: "70vh" }}
      >
        <Grid xs={12} sm={6} md={7}>
          <Grid.Container gap={2} direction="column">
            <Grid>
              <Text size={16} color="success" weight="bold">
                {t("signUpToday")}
              </Text>
              <Text size={24} color="light" weight="bold">
                {t("header1")}
              </Text>

              <Text size={24} weight="bold">
                {t("header2")}
              </Text>
              <Text size={24} color="light" weight="bold">
                {t("header3")}
              </Text>
              <Text size={14} color="light">
                {t("headerDesc").replace(
                  "$1",
                  (jettons?.length || 0).toString()
                )}
              </Text>
            </Grid>
            <Grid>
              <Grid.Container wrap="nowrap">
                <Grid>
                  <Button
                    color="primary"
                    css={{ minWidth: "auto" }}
                    onClick={() => navigate("/analytics")}
                  >
                    {t("getStarted")}
                    <Spacer x={0.4} />
                    <ARR07
                      style={{
                        fill: "currentColor",
                        fontSize: 24,
                      }}
                    />
                  </Button>
                </Grid>
                {/* <Spacer x={1} />
                <Grid>
                  <Button
                    color="primary"
                    flat
                    size="lg"
                    css={{ minWidth: "auto" }}
                  >
                    <FIL21
                      style={{
                        fill: "var(--nextui-colors-link)",
                        fontSize: 24,
                      }}
                    />
                    <Spacer x={0.4} /> Download App
                  </Button>
                </Grid> */}
              </Grid.Container>
            </Grid>
          </Grid.Container>
        </Grid>
        <Grid xs={12} sm={6} md={5}>
          <Card css={{ height: "fit-content" }}>
            <Card.Body>
              <Grid.Container gap={2} justify="space-between" css={{ pb: 0 }}>
                <Grid xs={12}>
                  <Calc />
                </Grid>
              </Grid.Container>
            </Card.Body>
          </Card>
        </Grid>
        {/* <Grid md={4}>
          <div id="earth" style={{ width: 400, height: 400 }} />
        </Grid> */}
        <Grid xs={12} sm={4}>
          <FCard
            isLoading={loading}
            title={
              <>
                <GEN20
                  style={{ fill: "var(--nextui-colors-link)", fontSize: 24 }}
                />
                <Spacer x={0.4} /> {t("topVoted")}
              </>
            }
            list={
              dataStatsPromo
                ?.sort(
                  (x, y) =>
                    (y.stats?.promoting_points || 0) -
                    (x.stats?.promoting_points || 0)
                )
                ?.slice(0, 9) || []
            }
            setVoteId={setVoteId}
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <FCard
            isLoading={loading}
            title={
              <>
                <GEN02
                  style={{ fill: "var(--nextui-colors-link)", fontSize: 24 }}
                />
                <Spacer x={0.4} /> {t("trending")}
              </>
            }
            list={
              dataStatsTrending
                ?.sort((x, y) => y.volume - x.volume)
                ?.slice(0, 9) || []
            }
            setVoteId={setVoteId}
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <FCard
            isLoading={loading}
            title={
              <>
                <GEN11
                  style={{ fill: "var(--nextui-colors-link)", fontSize: 24 }}
                />
                <Spacer x={0.4} /> {t("recentlyAdded")}
              </>
            }
            list={dataStatsRecent?.slice(0, 9) || []}
            setVoteId={setVoteId}
          />
        </Grid>
        <Grid>
          <Promote
            voteId={voteId}
            processing={processing}
            onSuccess={onSuccess}
            setVoteId={setVoteId}
          />
        </Grid>
      </Grid.Container>
    </>
  );
}
