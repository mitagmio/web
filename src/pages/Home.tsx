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
import cookie from "react-cookies";
import { Calc, FCard } from "components";
import { fck } from "api/fck";
import { ARR01, ARR07, FIL21, GEN02, GEN11, GEN20 } from "assets/icons";
import { getList } from "utils/analytics";

import { AppContext, JType } from "../contexts";
import getEarthConfig from "../earth.config";
import { pagination } from "./Analytics";

export type TimeScale = "1M" | "5M" | "30M" | "1H" | "4H" | "1D" | "30D";

export function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { jettons, theme } = useContext(AppContext);
  const [timescale, setTimescale] = useState<TimeScale>(
    cookie.load("timescale") || "1D"
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
    queryFn: () =>
      axios
        .get(
          `https://api.fck.foundation/api/v2/analytics/swaps/count?jetton_ids=${jettons
            .map((jetton) => jetton.id)
            .join(",")}&time_min=${Math.floor(
            Date.now() / 1000 - pagination[timescale]
          )}`
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

  return (
    <>
      <Grid.Container gap={2} alignItems="center" css={{ minHeight: "70vh" }}>
        <Grid xs={12} sm={6} md={7}>
          <Grid.Container gap={2} direction="column">
            <Grid>
              <Text size={16} color="success" weight="bold">
                {t("signUpToday")}
              </Text>
              <Text size={24} color="light" weight="bold">
                {t("header1")}
              </Text>

              <Text
                size={24}
                css={{
                  textGradient: "45deg, $primary -20%, $secondary 50%",
                }}
                weight="bold"
              >
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
              <Grid.Container gap={2} justify="space-between">
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
            isLoading={
              isLoading ||
              isLoadingStatsRecent ||
              isLoadingRecently ||
              isLoadingTransactions
            }
            title={
              <>
                <GEN20
                  style={{ fill: "var(--nextui-colors-link)", fontSize: 24 }}
                />
                <Spacer x={0.4} /> {t("trending")}
              </>
            }
            list={dataStats || []}
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <FCard
            isLoading={
              isLoading ||
              isLoadingStatsRecent ||
              isLoadingRecently ||
              isLoadingTransactions
            }
            title={
              <>
                <GEN02
                  style={{ fill: "var(--nextui-colors-link)", fontSize: 24 }}
                />
                <Spacer x={0.4} /> {t("topGainers")}
              </>
            }
            list={
              dataStats
                ?.sort((a, b) =>
                  a.percent > b.percent ? -1 : a.percent < b.percent ? 1 : 0
                )
                .sort((x, y) => y.percent - x.percent) || []
            }
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <FCard
            isLoading={
              isLoadingStatsRecent ||
              isLoading ||
              isLoadingRecently ||
              isLoadingTransactions
            }
            title={
              <>
                <GEN11
                  style={{ fill: "var(--nextui-colors-link)", fontSize: 24 }}
                />
                <Spacer x={0.4} /> {t("recentlyAdded")}
              </>
            }
            list={dataStatsRecent?.slice(0, 9) || []}
          />
        </Grid>
      </Grid.Container>
    </>
  );
}
