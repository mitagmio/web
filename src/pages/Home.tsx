import { useContext, useMemo, useState, useEffect } from "react";
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
} from "@nextui-org/react";
import { FCard } from "components";
import { fck } from "api/fck";
import { ARR01, FIL21, GEN02, GEN11, GEN20 } from "assets/icons";
import { getList } from "utils/analytics";

import { AppContext, JType } from "../contexts";
import getEarthConfig from "../earth.config";

type TimeScale = "1M" | "5M" | "30M" | "1H" | "4H" | "1D" | "30D";

const pagination: Record<string, number> = {
  "1M": 60,
  "5M": 300,
  "30M": 1800,
  "1H": 3600,
  "4H": 14400,
  "1D": 86400,
};

export function Home() {
  const { jettons, theme } = useContext(AppContext);
  const [timescale, setTimescale] = useState<TimeScale>(
    (localStorage.getItem("timescale") as any) || "1D"
  );

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
      results = results.data.sources.DeDust.jettons.price[0];

      const transform = (list) =>
        list.reduce((acc, curr) => {
          acc[curr] = results[curr];
          return acc;
        }, {});

      return {
        trend: getList(transform([...listVerified]), jettons)
          .sort((a, b) =>
            a.volume > b.volume ? -1 : a.volume < b.volume ? 1 : 0
          )
          .slice(0, 5),
        gainer: getList(transform([...listVerified]), jettons)
          .sort((a, b) =>
            a.percent > b.percent ? -1 : a.percent < b.percent ? 1 : 0
          )
          .slice(0, 5),
        recent: getList(
          transform([...listVerified].reverse().slice(0, 5)),
          jettons
        ),
      };
    },
  });

  useEffect(() => {
    if (document.getElementById("earth")) {
      const earthConfig = getEarthConfig(theme.color);

      document.getElementById("earth")!.innerHTML = "";

      let e = new Earth("earth", earthConfig.cityList, earthConfig.bizLines, {
        earthRadius: 12,
        autoRotate: true,
        zoomChina: false,
        starBackground: false,
        orbitControlConfig: {
          enableRotate: true,
          enableZoom: false,
        },
      });
      e.load();
    }
  }, [theme]);

  return (
    <>
      <Grid.Container gap={2}>
        <Grid xs={12} md={8}>
          <Grid.Container direction="column">
            <Grid>
              <Text size={16} color="success" weight="bold">
                SIGN UP TODAY
              </Text>
            </Grid>
            <Grid>
              <Text size={48} color="light" weight="bold">
                The World's
              </Text>

              <Text
                size={48}
                css={{
                  textGradient: "45deg, $blue600 -20%, $green600 50%",
                  marginTop: -16,
                }}
                weight="bold"
              >
                Fastest Growing
              </Text>
              <Text
                size={48}
                color="light"
                weight="bold"
                css={{
                  marginTop: -16,
                }}
              >
                TON Analytics app
              </Text>
            </Grid>
            <Grid>
              <Text size={14} color="light">
                Buy and sell {jettons?.length || 0}+ cryptocurrencies with TON /
                Scale using DeDust.io card.
              </Text>
            </Grid>
            <Spacer y={1} />
            <Grid>
              <Grid.Container>
                <Grid>
                  <Button color="primary" size="lg" css={{ minWidth: "auto" }}>
                    Get Started
                  </Button>
                </Grid>
                <Spacer x={1} />
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
                    />{" "}
                    <Spacer x={0.4} /> Download App
                  </Button>
                </Grid>
              </Grid.Container>
            </Grid>
          </Grid.Container>
        </Grid>
        <Grid md={4}>
          <div id="earth" style={{ width: 400, height: 400 }} />
        </Grid>
        <Grid xs={12} md={4}>
          <FCard
            isLoading={isLoading}
            title={
              <>
                <GEN20
                  style={{ fill: "var(--nextui-colors-link)", fontSize: 24 }}
                />{" "}
                <Spacer x={0.4} /> Trending
              </>
            }
            list={data?.trend || []}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <FCard
            isLoading={isLoading}
            title={
              <>
                <GEN02
                  style={{ fill: "var(--nextui-colors-link)", fontSize: 24 }}
                />{" "}
                <Spacer x={0.4} /> Top Gainers
              </>
            }
            list={data?.gainer || []}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <FCard
            isLoading={isLoading}
            title={
              <>
                <GEN11
                  style={{ fill: "var(--nextui-colors-link)", fontSize: 24 }}
                />{" "}
                <Spacer x={0.4} /> Recently Added
              </>
            }
            list={data?.recent || []}
          />
        </Grid>
      </Grid.Container>
      <Grid.Container gap={2} justify="space-between">
        <Grid>
          <Card>
            <Card.Body>
              <Grid.Container gap={2} justify="space-between">
                <Grid>
                  <Grid.Container direction="column">
                    <Grid>
                      <Text
                        size={32}
                        css={{
                          textGradient: "45deg, $blue600 -20%, $green600 50%",
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
                        original crypto exchange.
                      </Text>
                    </Grid>
                    <Grid>
                      <Text size={14} color="light">
                        Buy now and get 40% extra bonus Minimum pre-sale amount
                        25 Crypto Coin. We accept BTC crypto-currency
                      </Text>
                    </Grid>
                    <Spacer y={2} />
                    <Grid>
                      <Grid.Container wrap="nowrap" alignItems="center" justify="space-between">
                        <Grid>
                          <Grid.Container gap={1}>
                            <Grid>
                              <Input
                                clearable
                                underlined
                                color="primary"
                                labelPlaceholder="Amount"
                                width="75px"
                                size="sm"
                              />
                            </Grid>

                            <Grid>
                              <Dropdown>
                                <Dropdown.Button color="gradient" size="sm">TON</Dropdown.Button>
                                <Dropdown.Menu aria-label="Static Actions">
                                  {jettons
                                    ?.filter(({ verified }) => verified)
                                    ?.map(({ symbol }) => (
                                      <Dropdown.Item key={symbol}>
                                        {symbol}
                                      </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                              </Dropdown>
                            </Grid>
                          </Grid.Container>
                        </Grid>
                        <Spacer x={1} />
                        <Grid>
                          <ARR01
                            style={{
                              fill: "var(--nextui-colors-link)",
                              fontSize: 32,
                            }}
                          />
                        </Grid>
                        <Spacer x={1} />
                        <Grid>
                          <Grid.Container gap={1}>
                            <Grid>
                              <Input
                                clearable
                                underlined
                                color="primary"
                                labelPlaceholder="Get"
                                width="75px"
                                size="sm"
                              />
                            </Grid>

                            <Grid>
                              <Dropdown>
                                <Dropdown.Button color="gradient" size="sm">TON</Dropdown.Button>
                                <Dropdown.Menu aria-label="Static Actions">
                                  {jettons
                                    ?.filter(({ verified }) => verified)
                                    ?.map(({ symbol }) => (
                                      <Dropdown.Item key={symbol}>
                                        {symbol}
                                      </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                              </Dropdown>
                            </Grid>
                          </Grid.Container>
                        </Grid>
                      </Grid.Container>
                    </Grid>
                  </Grid.Container>
                </Grid>
              </Grid.Container>
            </Card.Body>
          </Card>
        </Grid>
      </Grid.Container>
    </>
  );
}
