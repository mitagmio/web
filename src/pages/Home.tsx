import { useContext, useMemo, useState, useEffect, lazy } from "react";
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
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const { ton, jettons, theme } = useContext(AppContext);
  const [calcValue, setCalcValue] = useState<Record<string, any>>({});
  const [timescale, setTimescale] = useState<TimeScale>(
    (localStorage.getItem("timescale") as any) || "1D"
  );

  const displayCalcValue = useMemo(() => {
    const val = (
      (ton?.market_data?.current_price?.usd || 1) *
      (calcValue?.from === "TON"
        ? parseInt(calcValue?.valueX)
        : parseInt(calcValue?.valueY))
    ).toFixed(2);

    return !isNaN(parseFloat(val)) ? val : 0;
  }, [ton, calcValue]);

  const listVerified = useMemo(
    () => [...(jettons || [])]?.filter((i) => i.verified)?.map(({ id }) => id),
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
    cacheTime: 60 * 1000,
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
              <Text size={16} color="success" weight="bold">
                SIGN UP TODAY
              </Text>
              <Text size={36} color="light" weight="bold">
                The World's
              </Text>

              <Text
                size={36}
                css={{
                  textGradient: "45deg, $blue600 -20%, $green600 50%",
                  marginTop: -16,
                }}
                weight="bold"
              >
                Fastest Growing
              </Text>
              <Text
                size={36}
                color="light"
                weight="bold"
                css={{
                  marginTop: -16,
                }}
              >
                TON Analytics app
              </Text>
              <Text size={14} color="light">
                Buy and sell {jettons?.length || 0}+ cryptocurrencies with TON
                using DeDust.io.
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
                    Get Started
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
                  <Grid.Container direction="column">
                    <Grid>
                      <Grid.Container justify="space-between">
                        <Grid>
                          <Text
                            size={32}
                            css={{
                              textGradient:
                                "45deg, $blue600 -20%, $green600 50%",
                              marginTop: -16,
                            }}
                            weight="bold"
                          >
                            Buy & trade on the
                          </Text>
                          <Text
                            size={32}
                            color="light"
                            weight="bold"
                            css={{
                              marginTop: -16,
                            }}
                          >
                            TON network
                          </Text>
                        </Grid>
                        <Grid>
                          <Grid.Container alignItems="center">
                            <Text size={24} color="primary">
                              ~
                            </Text>
                            <Spacer x={0.4} />
                            <Button
                              flat
                              color="secondary"
                              css={{ minWidth: "auto", overflow: "visible" }}
                              onClick={() =>
                                globalThis.open(
                                  "https://dedust.io/swap",
                                  "_blank"
                                )
                              }
                            >
                              {displayCalcValue}
                              $
                              <Spacer x={0.4} />
                              <img
                                src="/img/dedust.webp"
                                alt="DeDust.io"
                                style={{ height: 32 }}
                              />
                            </Button>
                          </Grid.Container>
                        </Grid>
                      </Grid.Container>
                    </Grid>
                    <Spacer y={2} />
                    <Grid>
                      <Calc onChange={setCalcValue} />
                    </Grid>
                  </Grid.Container>
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
                <Spacer x={0.4} /> Trending
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
                <Spacer x={0.4} /> Top Gainers
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
                <Spacer x={0.4} /> Recently Added
              </>
            }
            list={data?.recent || []}
          />
        </Grid>
      </Grid.Container>
    </>
  );
}
