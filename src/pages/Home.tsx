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
} from "@nextui-org/react";
import { Calc, FCard } from "components";
import { fck } from "api/fck";
import { ARR01, ARR07, FIL21, GEN02, GEN11, GEN20 } from "assets/icons";
import { getList } from "utils/analytics";

import { AppContext, JType } from "../contexts";
import getEarthConfig from "../earth.config";

export type TimeScale = "1M" | "5M" | "30M" | "1H" | "4H" | "1D" | "30D";

export const pagination: Record<string, number> = {
  "1M": 60,
  "5M": 300,
  "30M": 1800,
  "1H": 3600,
  "4H": 14400,
  "1D": 86400,
};

export function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { jettons, theme } = useContext(AppContext);
  const [timescale, setTimescale] = useState<TimeScale>(
    (localStorage.getItem("timescale") as any) || "1D"
  );

  const listVerified = useMemo(
    () =>
      [...(jettons || [])]
        ?.filter((i) => i.verified)
        ?.map(({ id }) => id)
        .slice(0, 14),
    [jettons]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", timescale],
    queryFn: async () =>
      await fck.getAnalytics(
        [...listVerified]?.join(),
        Math.floor(Date.now() / 1000 - pagination[timescale]),
        pagination[timescale] / 6
      ),
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: !![...(jettons || [])]?.length,
    select: (results) => {
      results = results.data.sources.DeDust.jettons;

      const transform = (list) =>
        list.reduce((acc, curr) => {
          acc[curr] = results[curr].prices;
          return acc;
        }, {});

      return {
        trend: getList(transform([...listVerified]), jettons)
          .sort((a, b) =>
            a.volume > b.volume ? -1 : a.volume < b.volume ? 1 : 0
          )
          .slice(0, 9)
          .sort((x, y) => y.percent - x.percent),
        gainer: getList(transform([...listVerified]), jettons)
          .sort((a, b) =>
            a.percent > b.percent ? -1 : a.percent < b.percent ? 1 : 0
          )
          .slice(0, 9)
          .sort((x, y) => y.percent - x.percent),
        recent: getList(
          transform([...listVerified].reverse().slice(0, 9)),
          jettons
        ).sort((x, y) => y.percent - x.percent),
      };
    },
  });

  const { data: dataRecently, isLoading: isLoadingRecently } = useQuery({
    queryKey: ["recently-added"],
    queryFn: async () => await fck.getRecentlyAdded(),
    refetchOnMount: false,
    refetchOnReconnect: false,
    select: (results) => {
      return getList(results.data, jettons)
        .sort((a, b) =>
          a.volume > b.volume ? -1 : a.volume < b.volume ? 1 : 0
        )
        .slice(0, 9)
        .sort((x, y) => y.percent - x.percent);
    },
  });

  console.log("dataRecently", dataRecently);

  // useEffect(() => {
  //   if (document.getElementById("earth")) {
  //     const earthConfig = getEarthConfig(theme.color);

  //     document.getElementById("earth")!.innerHTML = "";

  //     const load = async () => {
  //       let e = new Earth("earth", earthConfig.cityList, earthConfig.bizLines, {
  //         earthRadius: 12,
  //         autoRotate: true,
  //         zoomChina: false,
  //         starBackground: false,
  //         orbitControlConfig: {
  //           enableRotate: true,
  //           enableZoom: false,
  //         },
  //       });
  //       e.load();
  //     }

  //     load();
  //   }
  // }, [theme]);

  return (
    <>
      <Grid.Container gap={2} alignItems="center" css={{ minHeight: "70vh" }}>
        <Grid xs={12} sm={6} md={7}>
          <Grid.Container gap={2} direction="column">
            <Grid>
              <Text
                size={16}
                color="success"
                weight="bold"
                css={{ lineHeight: 1.2 }}
              >
                {t("signUpToday")}
              </Text>
              <Text
                size={36}
                color="light"
                weight="bold"
                css={{ lineHeight: 1.2 }}
              >
                {t("header1")}
              </Text>

              <Text
                size={36}
                css={{
                  textGradient: "45deg, $primary -20%, $secondary 50%",
                  lineHeight: 1.2,
                }}
                weight="bold"
              >
                {t("header2")}
              </Text>
              <Text
                size={36}
                color="light"
                weight="bold"
                css={{
                  lineHeight: 1.2,
                }}
              >
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
                <Grid>
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
            isLoading={isLoading}
            title={
              <>
                <GEN20
                  style={{ fill: "var(--nextui-colors-link)", fontSize: 24 }}
                />
                <Spacer x={0.4} /> {t("trending")}
              </>
            }
            list={data?.trend || []}
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <FCard
            isLoading={isLoading}
            title={
              <>
                <GEN02
                  style={{ fill: "var(--nextui-colors-link)", fontSize: 24 }}
                />
                <Spacer x={0.4} /> {t("topGainers")}
              </>
            }
            list={data?.gainer || []}
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <FCard
            isLoading={isLoading}
            title={
              <>
                <GEN11
                  style={{ fill: "var(--nextui-colors-link)", fontSize: 24 }}
                />
                <Spacer x={0.4} /> {t("recentlyAdded")}
              </>
            }
            list={data?.recent || []}
          />
        </Grid>
      </Grid.Container>
    </>
  );
}
