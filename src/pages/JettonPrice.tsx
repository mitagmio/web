/* eslint-disable @next/next/no-img-element */
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import useDarkMode from "use-dark-mode";
import {
  Badge,
  Button,
  Card,
  Grid,
  Loading,
  Spacer,
  Table,
  Link,
  Avatar,
  Text,
  Dropdown,
  Container,
} from "@nextui-org/react";
import {
  ChartOptions,
  createChart,
  CrosshairMode,
  DeepPartial,
  IChartApi,
  ISeriesApi,
  LineStyle,
  Time,
} from "lightweight-charts";
import moment from "moment";
import { AppContext } from "contexts/AppContext";
import axios from "libs/axios";
import { _ } from "utils/time";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { toFixed } from "utils/price";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ARR01,
  ARR02,
  ARR12,
  ARR20,
  ARR36,
  ARR40,
  ARR42,
  ARR43,
  ARR58,
  ARR59,
  FIL02,
  GEN02,
  GEN13,
  GEN15,
  GEN20,
  GRA01,
  GRA03,
  GRA04,
  GRA05,
  GRA06,
  GRA07,
  GRA11,
  GRA12,
} from "assets/icons";
import { colors } from "colors";

const pagination = {
  "1M": 60,
  "5M": 300,
  "30M": 1800,
  "1H": 3600,
  "4H": 14400,
  "1D": 86400,
};

export const AnalyticsPrice = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const darkMode = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi>();
  const volumeSeries = useRef<ISeriesApi<"Histogram">>();
  const candlestickSeries = useRef<ISeriesApi<"Candlestick">>();
  const { jettons, theme } = useContext(AppContext);
  const [timescale, setTimescale] = useState<
    "1M" | "5M" | "30M" | "1H" | "4H" | "1D" | "30D"
  >((localStorage.getItem("timescale") as any) || "1D");

  const [isFull, setIsFull] = useState(false);
  const [page, setPage] = useState<number>();
  const [loadingPage, setLoadingPage] = useState(1);
  const [info, setInfo] = useState<Record<string, any>>();
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [jetton, setJetton] = useState<Record<string, any>>({});
  const [results, setResults] = useState<Record<string, any>>([]);
  const [seeMore, setSeeMore] = useState(false);

  // const [] = useDebounce(
  //   () => {
  //     setPage(loadingPage);
  //   },
  //   300,
  //   [loadingPage]
  // );

  const chartOptions: DeepPartial<ChartOptions> = useMemo(
    () => ({
      autoSize: true,
      layout: { textColor: "white", background: { color: "transparent" } },
      grid: {
        vertLines: { color: darkMode.value ? "#131d29" : "#f1f1f1" },
        horzLines: { color: darkMode.value ? "#131d29" : "#f1f1f1" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    }),
    [darkMode.value]
  );

  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["jetton-analytics"],
      queryFn: ({ pageParam = 1 }) => {
        return (
          jetton.id &&
          !!(
            !data?.pages[pageParam - 1] || (data?.pages[pageParam - 1] as any)
          ) &&
          axios
            .get(
              `https://api.fck.foundation/api/v1/analytics?jetton_id=${
                jetton.id
              }&time_min=${Math.floor(
                Date.now() / 1000 - pageParam * pagination[timescale] * 60
              )}&time_max=${Math.floor(
                Date.now() / 1000 - (pageParam - 1) * pagination[timescale] * 60
              )}&timescale=${pagination[timescale]}`
            )
            .then(({ data: { data } }) => data)
        );
      },
      cacheTime: 60 * 1000,
      enabled: !!jetton?.id,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      getNextPageParam: (_, pages) => {
        return pages && page && !pages[page - 1]
          ? page
          : pages
          ? false
          : undefined; // If there is not a next page, getNextPageParam will return undefined and the hasNextPage boolean will be set to 'false'
      },
      onSuccess: (results) => {
        localStorage.setItem("timescale", timescale);

        const list = results.pages
          ?.reverse()
          ?.flat()
          ?.sort((x: any, y: any) => x.time - y.time)
          ?.filter((i: any) => i && i?.price_close !== "0.000000000") as any;
        volumeSeries.current!.setData(
          [...list].map((item) => ({
            time: Math.floor(item.time) as any,
            value: _(item.volume),
            color:
              _(item.price_close) > _(item.price_open)
                ? "#26a69a80"
                : _(item.price_close) === _(item.price_open)
                ? "gray"
                : "#ef535080",
          }))
        );

        candlestickSeries.current!.setData(
          [...list].map((item) => ({
            time: Math.floor(item.time) as any,
            open: _(item.price_open),
            high: _(item.price_high),
            low: _(item.price_low),
            close: _(item.price_close),
            buy: _(item.volume),
            sell: _(item.jetton_volume),
          }))
        );

        const getLastBar = (series) => {
          return list && series.dataByIndex(list.length - 1);
        };

        const updateLegend = (param) => {
          const validCrosshairPoint = !(
            param === undefined ||
            param.time === undefined ||
            param.point.x < 0 ||
            param.point.y < 0
          );

          const candle = validCrosshairPoint
            ? param.seriesData.get(candlestickSeries.current)
            : getLastBar(candlestickSeries.current);
          const volume = validCrosshairPoint
            ? param.seriesData.get(volumeSeries.current)
            : getLastBar(volumeSeries.current);

          // time is in the same format that you supplied to the setData method,
          // which in this case is YYYY-MM-DD

          const time = candle?.time ? new Date(candle.time * 1000) : new Date();

          setInfo({
            time: moment(time).format("HH:mm"),
            price: candle?.close || 0,
            volume: volume?.value,
            color:
              candle?.close > candle?.open
                ? "#26a69a"
                : candle?.close === candle?.open
                ? "#fff"
                : "#ef5350",
          });
        };

        chartRef.current!.subscribeCrosshairMove(updateLegend);
        updateLegend(undefined);

        if (!page || (page && page <= 2)) {
          // chartRef.current!.timeScale().
          chartRef
            .current!.timeScale()
            .applyOptions({ rightOffset: globalThis.innerWidth / 20 });
        }
      },
    });

  const onVisibleLogicalRangeChanged = useCallback(
    (newVisibleLogicalRange) => {
      if (candlestickSeries.current) {
        const barsInfo = candlestickSeries.current.barsInLogicalRange(
          newVisibleLogicalRange
        );
        if (
          hasNextPage &&
          page &&
          page >= 3 &&
          page <= loadingPage &&
          barsInfo !== null &&
          barsInfo.barsBefore < 0
        ) {
          setLoadingPage(page + 1);
        }
      }
    },
    [page, loadingPage, hasNextPage]
  );

  useEffect(() => {
    if (page && page <= 2 && !isFetchingNextPage) {
      setLoadingPage(page + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    chartRef.current = createChart(ref.current!, chartOptions);

    chartRef.current.applyOptions({
      crosshair: {
        // Change mode from default 'magnet' to 'normal'.
        // Allows the crosshair to move freely without snapping to datapoints
        mode: CrosshairMode.Normal,

        // Vertical crosshair line (showing Date in Label)
        vertLine: {
          width: 8 as any,
          color: "#C3BCDB44",
          style: LineStyle.Solid,
          labelBackgroundColor: colors[theme.color].primary,
        },

        // Horizontal crosshair line (showing Price in Label)
        horzLine: {
          color: colors[theme.color].primary,
          labelBackgroundColor: colors[theme.color].primary,
        },
      },
    });

    volumeSeries.current = chartRef.current.addHistogramSeries({
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "", // set as an overlay by setting a blank priceScaleId
      // set the positioning of the volume series
    });

    volumeSeries.current.priceScale().applyOptions({
      scaleMargins: {
        top: 0.9, // highest point of the series will be 70% away from the top
        bottom: 0,
      },
    });

    if (chartRef.current) {
      candlestickSeries.current = chartRef.current.addCandlestickSeries({
        priceFormat: {
          precision: jetton.symbol === "STYC" ? 9 : jetton.decimals,
          minMove: 0.000000001,
        },
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });
    }

    setPage(undefined);
    setLoadingPage(1);
    queryClient.setQueryData(["jetton-analytics"], { pages: [] });

    return () => {
      chartRef.current!.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jetton.id, timescale, chartOptions, location?.pathname]);

  useEffect(() => {
    if (hasNextPage) {
      setTimeout(() => {
        chartRef.current
          ?.timeScale()
          .unsubscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChanged);
        chartRef.current
          ?.timeScale()
          .subscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChanged);

        fetchNextPage();
      }, 150);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, hasNextPage]);

  useEffect(() => {
    if (jettons?.length) {
      const jettonName = location.pathname.split("/analytics/price/").pop();

      const dataJetton = jettons.find(
        ({ symbol }) => symbol?.toUpperCase() === jettonName?.toUpperCase()
      );

      if (dataJetton) {
        setJetton(dataJetton);

        axios
          .get(
            `https://tonobserver.com/api/v2/jetton_top_holders/${dataJetton.address}?limit=100`
          )
          .then(({ data: { result } }) => {
            setResults(result);
          });

        axios
          .get(
            `https://tonapi.io/v1/jetton/getInfo?account=${dataJetton.address}`
          )
          .then(({ data: { metadata, total_supply, mintable } }) => {
            setMetadata({ ...metadata, total_supply, mintable });
          });
      }
    }
  }, [jettons]);

  const prevJetton = useMemo(() => {
    const list = jettons?.filter((i) => i.verified);

    if (list) {
      const index = list.findIndex((item) => item.symbol === jetton.symbol) - 1;

      return index > -1 ? list[index] : list && list[list.length - 1];
    } else {
      return null;
    }
  }, [jettons, jetton]);

  const nextJetton = useMemo(
    () =>
      jettons &&
      jettons?.filter((i) => i.verified)[
        jettons
          ?.filter((i) => i.verified)
          .findIndex((item) => item.symbol === jetton.symbol) + 1
      ],
    [jettons, jetton]
  );

  const stats = useMemo(() => {
    const results = data?.pages
      ?.reverse()
      ?.flat()
      ?.sort((x: any, y: any) => x.time - y.time)
      ?.filter((i: any) => i && i?.price_close !== "0.000000000")
      .map((item: any) => ({
        price_open: _(item?.price_open),
        price_close: _(item?.price_close),
        price_low: _(item?.price_low),
        price_high: _(item?.price_high),
        buy: _(item?.volume),
        sell: _(item?.jetton_volume),
      }));

    let low = (results?.length && results[0].price_low) || 0,
      high = (results?.length && results[results.length - 1].price_low) || 0,
      open = 0,
      close = 0,
      sell = 0,
      buy = 0;

    if (results?.length && results[0].price_high > high) {
      high = results[0].price_high;
    }
    if (results?.length && results[0].price_low < low) {
      low = results[0].price_low;
    }

    results?.forEach((result) => {
      buy += result.buy;
      sell += result.sell;
    });

    open = (results?.length && results[0].price_open) || 0;
    close = (results?.length && results[results.length - 1].price_close) || 0;

    return {
      low,
      high,
      open,
      close,
      sell,
      buy,
    };
  }, [data]);

  console.log(metadata);

  return (
    <Grid.Container gap={2} direction="row-reverse" css={{ minHeight: "70vh" }}>
      <Grid xs={12} sm={4}>
        <Grid.Container justify="center">
          <Grid xs={12} css={{ height: "fit-content" }}>
            <Grid.Container gap={1}>
              <Grid xs={12}>
                <Grid.Container justify="space-between">
                  <Grid>
                    <Grid.Container wrap="nowrap">
                      <Grid>
                        <Grid.Container alignItems="center" wrap="nowrap">
                          <Grid>
                            {isLoading ? (
                              <Loading size="lg" />
                            ) : jetton?.verified ? (
                              <Badge
                                size="xs"
                                css={{ p: 0, background: "transparent" }}
                                content={
                                  <ARR20
                                    style={{
                                      fill: "var(--nextui-colors-primary)",
                                      fontSize: 16,
                                      borderRadius: 100,
                                      overflow: "hidden",
                                    }}
                                  />
                                }
                              >
                                <Avatar bordered src={jetton?.image} />
                              </Badge>
                            ) : (
                              <Avatar bordered src={jetton?.image} />
                            )}
                          </Grid>
                          <Spacer x={0.5} />
                          <Grid>{jetton?.symbol}</Grid>
                        </Grid.Container>
                      </Grid>
                    </Grid.Container>
                  </Grid>
                </Grid.Container>
              </Grid>
              <Grid>
                <Grid.Container>
                  <Grid css={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      onClick={() =>
                        location.pathname.includes("volume") &&
                        navigate(
                          `/analytics/price/${location.pathname
                            .split("/analytics/volume/")
                            .pop()}`
                        )
                      }
                      css={{
                        minWidth: "auto",
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                      }}
                    >
                      <GRA01 style={{ fill: "currentColor", fontSize: 24 }} />
                      <Text hideIn="xs" color="white">
                        <div style={{ display: "flex" }}>
                          <Spacer x={0.5} />
                          {t("price")}
                        </div>
                      </Text>
                    </Button>
                  </Grid>
                  <Grid css={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      color="secondary"
                      flat={!location.pathname.includes("volume")}
                      css={{
                        minWidth: "auto",
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                      }}
                      onClick={() =>
                        location.pathname.includes("price") &&
                        navigate(
                          `/analytics/volume/${location.pathname
                            .split("/analytics/price/")
                            .pop()}`
                        )
                      }
                    >
                      <GRA03 style={{ fill: "currentColor", fontSize: 24 }} />
                      <Text
                        hideIn="xs"
                        color={
                          !location.pathname.includes("volume")
                            ? "secondaryLight"
                            : "white"
                        }
                      >
                        <div style={{ display: "flex" }}>
                          <Spacer x={0.5} />
                          {t("volumeL")}
                        </div>
                      </Text>
                    </Button>
                  </Grid>
                </Grid.Container>
              </Grid>

              <Grid>
                <Card variant="flat">
                  <Card.Body css={{ p: 0 }}>
                    <Grid.Container>
                      <Grid className="chart-table">
                        <Table
                          aria-label="Stats"
                          bordered={false}
                          shadow={false}
                          css={{ border: "none", padding: 0 }}
                        >
                          <Table.Header>
                            <Table.Column>1</Table.Column>
                            <Table.Column>2</Table.Column>
                          </Table.Header>
                          <Table.Body>
                            <Table.Row key="1">
                              <Table.Cell>
                                <Grid.Container gap={1}>
                                  <Grid>
                                    <Text
                                      css={{
                                        textGradient:
                                          "45deg, $primary -20%, $secondary 100%",
                                      }}
                                      className="chart-label"
                                    >
                                      <GEN20
                                        style={{
                                          fill: "currentColor",
                                          fontSize: 24,
                                        }}
                                      />{" "}
                                      1 TON
                                    </Text>
                                  </Grid>
                                  <Grid
                                    css={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {(info?.price
                                      ? 1 / parseFloat(info?.price)
                                      : 0
                                    ).toFixed(2)}{" "}
                                    {jetton.symbol}
                                  </Grid>
                                </Grid.Container>
                              </Table.Cell>
                              <Table.Cell>
                                <Grid.Container gap={1}>
                                  <Grid>
                                    <Text
                                      css={{
                                        textGradient:
                                          "45deg, $primary -20%, $secondary 100%",
                                      }}
                                      className="chart-label"
                                    >
                                      <GEN02
                                        style={{
                                          fill: "currentColor",
                                          fontSize: 24,
                                        }}
                                      />{" "}
                                      Source
                                    </Text>
                                  </Grid>
                                  <Grid>
                                    <Link
                                      href="https://dedust.io/"
                                      target="_blank"
                                    >
                                      DeDust.io
                                    </Link>
                                  </Grid>
                                </Grid.Container>
                              </Table.Cell>
                            </Table.Row>
                          </Table.Body>
                        </Table>
                      </Grid>
                      <Grid className="chart-table">
                        <Table
                          aria-label="Stats"
                          bordered={false}
                          shadow={false}
                          css={{ border: "none", padding: 0 }}
                        >
                          <Table.Header>
                            <Table.Column>1</Table.Column>
                            <Table.Column>2</Table.Column>
                          </Table.Header>
                          <Table.Body>
                            <Table.Row key="1">
                              <Table.Cell>
                                <Grid.Container gap={1}>
                                  <Grid>
                                    <Text
                                      css={{
                                        textGradient:
                                          "45deg, $primary -20%, $secondary 100%",
                                      }}
                                      className="chart-label"
                                    >
                                      <ARR36
                                        style={{
                                          fill: "currentColor",
                                          fontSize: 24,
                                        }}
                                      />{" "}
                                      Open
                                    </Text>
                                  </Grid>
                                  <Grid
                                    css={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {toFixed(
                                      stats.open.toFixed(jetton.decimals)
                                    )}
                                  </Grid>
                                </Grid.Container>
                              </Table.Cell>
                              <Table.Cell>
                                <Grid.Container gap={1}>
                                  <Grid>
                                    <Text
                                      css={{
                                        textGradient:
                                          "45deg, $primary -20%, $secondary 100%",
                                      }}
                                      className="chart-label"
                                    >
                                      <ARR42
                                        style={{
                                          fill: "currentColor",
                                          fontSize: 24,
                                        }}
                                      />{" "}
                                      Close
                                    </Text>
                                  </Grid>
                                  <Grid
                                    css={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {toFixed(
                                      stats.close.toFixed(jetton.decimals)
                                    )}
                                  </Grid>
                                </Grid.Container>
                              </Table.Cell>
                            </Table.Row>
                          </Table.Body>
                        </Table>
                      </Grid>
                      <Grid className="chart-table">
                        <Table
                          aria-label="Stats"
                          bordered={false}
                          shadow={false}
                          css={{ border: "none", padding: 0 }}
                        >
                          <Table.Header>
                            <Table.Column>1</Table.Column>
                            <Table.Column>2</Table.Column>
                          </Table.Header>
                          <Table.Body>
                            <Table.Row key="1">
                              <Table.Cell>
                                <Grid.Container gap={1}>
                                  <Grid>
                                    <Text
                                      css={{
                                        textGradient:
                                          "45deg, $primary -20%, $secondary 100%",
                                      }}
                                      className="chart-label"
                                    >
                                      <GRA12
                                        style={{
                                          fill: "currentColor",
                                          fontSize: 24,
                                        }}
                                      />{" "}
                                      High
                                    </Text>
                                  </Grid>
                                  <Grid
                                    css={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {toFixed(
                                      stats.high.toFixed(jetton.decimals)
                                    )}
                                  </Grid>
                                </Grid.Container>
                              </Table.Cell>
                              <Table.Cell>
                                <Grid.Container gap={1}>
                                  <Grid>
                                    <Text
                                      css={{
                                        textGradient:
                                          "45deg, $primary -20%, $secondary 100%",
                                      }}
                                      className="chart-label"
                                    >
                                      <GRA11
                                        style={{
                                          fill: "currentColor",
                                          fontSize: 24,
                                        }}
                                      />{" "}
                                      Low
                                    </Text>
                                  </Grid>
                                  <Grid
                                    css={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {toFixed(
                                      stats.low.toFixed(jetton.decimals)
                                    )}
                                  </Grid>
                                </Grid.Container>
                              </Table.Cell>
                            </Table.Row>
                          </Table.Body>
                        </Table>
                      </Grid>
                      <Grid className="chart-table">
                        <Table
                          aria-label="Stats"
                          bordered={false}
                          shadow={false}
                          css={{ border: "none", padding: 0 }}
                        >
                          <Table.Header>
                            <Table.Column>1</Table.Column>
                            <Table.Column>2</Table.Column>
                          </Table.Header>
                          <Table.Body>
                            <Table.Row key="1">
                              <Table.Cell>
                                <Grid.Container gap={1}>
                                  <Grid>
                                    <Text
                                      css={{
                                        textGradient:
                                          "45deg, $primary -20%, $secondary 100%",
                                      }}
                                      className="chart-label"
                                    >
                                      <ARR59
                                        style={{
                                          fill: "currentColor",
                                          fontSize: 24,
                                        }}
                                      />{" "}
                                      Sell
                                    </Text>
                                  </Grid>
                                  <Grid
                                    css={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {toFixed(stats.sell.toFixed(0))}{" "}
                                    {jetton.symbol}
                                  </Grid>
                                </Grid.Container>
                              </Table.Cell>
                              <Table.Cell>
                                <Grid.Container gap={1}>
                                  <Grid>
                                    <Text
                                      css={{
                                        textGradient:
                                          "45deg, $primary -20%, $secondary 100%",
                                      }}
                                      className="chart-label"
                                    >
                                      <GRA04
                                        style={{
                                          fill: "currentColor",
                                          fontSize: 24,
                                        }}
                                      />
                                      Buy
                                    </Text>
                                  </Grid>
                                  <Grid
                                    css={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {toFixed(stats.buy.toFixed(0))} TON
                                  </Grid>
                                </Grid.Container>
                              </Table.Cell>
                            </Table.Row>
                          </Table.Body>
                        </Table>
                      </Grid>
                    </Grid.Container>
                  </Card.Body>
                </Card>
              </Grid>

              {!seeMore && (
                <Grid>
                  <Button flat css={{ minWidth: 'auto' }} onClick={() => setSeeMore(true)}>See more</Button>
                </Grid>
              )}

              {seeMore && (
                <Grid>
                  <Spacer y={0.4} />
                  <Card variant="flat">
                    <Card.Body>
                      <Grid.Container alignItems="center">
                        <Grid>
                          <ARR58
                            style={{
                              fill: "currentColor",
                              fontSize: 32,
                            }}
                          />
                        </Grid>
                        <Spacer x={0.4} />
                        <Grid>
                          <Text
                            size={24}
                            css={{
                              textGradient:
                                "45deg, $primary -20%, $secondary 100%",
                            }}
                            weight="bold"
                          >
                            {metadata?.total_supply
                              .slice(
                                0,
                                metadata?.total_supply.length -
                                  metadata?.decimals
                              )
                              .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}
                          </Text>
                        </Grid>
                        <Spacer x={0.4} />
                        <Grid>
                          <Text size={18}>{metadata?.symbol}</Text>
                        </Grid>
                      </Grid.Container>
                      <Text css={{ overflowWrap: "anywhere" }}>
                        {metadata?.description}
                      </Text>
                      {metadata.websites?.map((site) => (
                        <Link href={site} target="_blank">
                          {site}
                        </Link>
                      ))}
                      {metadata.social?.map((social) => (
                        <Link href={social} target="_blank">
                          {social}
                        </Link>
                      ))}
                    </Card.Body>
                  </Card>
                </Grid>
              )}
            </Grid.Container>
          </Grid>
        </Grid.Container>
      </Grid>
      <Grid xs={12} sm={8}>
        <Card variant="flat">
          <Card.Body>
            <div
              ref={ref}
              key={timescale}
              style={{
                width: "100%",
                height: isFull ? "calc(100vh - 350px)" : "100%",
              }}
            />
          </Card.Body>
        </Card>
      </Grid>
      <Grid xs={12}>
        <Table aria-label="Example table with static content" bordered>
          <Table.Header>
            <Table.Column>Address</Table.Column>
            <Table.Column>{jetton.symbol}</Table.Column>
          </Table.Header>
          <Table.Body>
            {results
              ?.filter((result) => !result.info.jettonWallet.isFake)
              ?.map((result, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Link
                      href={`https://tonapi.io/account/${result.address}`}
                      target="_blank"
                    >
                      {infoAddress[result.address] ? (
                        <Badge
                          content={infoAddress[result.address].text}
                          color={infoAddress[result.address].color}
                        >
                          <div className="holder-address">{result.address}</div>
                        </Badge>
                      ) : (
                        <div className="holder-address">{result.address}</div>
                      )}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    {parseInt(
                      result.info.jettonWallet.balance.slice(
                        0,
                        -jetton.decimals
                      )
                    ).toLocaleString()}
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
          <Table.Pagination
            shadow
            noMargin
            align="center"
            rowsPerPage={5}
            // onPageChange={page => console.log({ page })}
          />
        </Table>
      </Grid>
    </Grid.Container>
  );
};

const infoAddress = {
  "EQB-7nZY_Onatn-_s5J2Y9jDOxCjWFzwMOa4_MeuSbgPgnVO": {
    color: "secondary",
    text: "Development",
  },
  "EQDzIMlFI2-f-hWlVqoxFmFCo7nIA5YN0q3V6zg2DN2aEpmR": {
    color: "secondary",
    text: "Marketing",
  },
};
