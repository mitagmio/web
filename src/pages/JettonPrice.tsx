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
} from "@nextui-org/react";
import {
  ChartOptions,
  createChart,
  DeepPartial,
  IChartApi,
  ISeriesApi,
  Time,
} from "lightweight-charts";
import moment from "moment";
import { AppContext } from "contexts/AppContext";
import axios from "libs/axios";
import { _ } from "utils/time";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { toFixed } from "utils/price";
import { useLocation, useNavigate } from "react-router-dom";

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
  const { jettons } = useContext(AppContext);
  const [timescale, setTimescale] = useState<
    "1M" | "5M" | "30M" | "1H" | "4H" | "1D" | "30D"
  >((localStorage.getItem("timescale") as any) || "1H");

  const [isFull, setIsFull] = useState(false);
  const [page, setPage] = useState<number>();
  const [loadingPage, setLoadingPage] = useState(1);
  const [info, setInfo] = useState<Record<string, any>>();
  const [decimals, setDecimals] = useState(9);
  const [jetton, setJetton] = useState<Record<string, any>>({});
  const [results, setResult] = useState<Record<string, any>>([]);

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
          precision: jetton.symbol === "STYC" ? 9 : decimals,
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
  }, [jetton.id, timescale, decimals, chartOptions, location?.pathname]);

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
            setResult(result);
          });

        axios
          .get(
            `https://tonapi.io/v1/jetton/getInfo?account=${dataJetton.address}`
          )
          .then(({ data: { metadata } }) => {
            setDecimals(metadata?.decimals);
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

  return (
    <>
      <Grid.Container justify="center">
        {!isFull && (
          <Grid xs={12} sm={8}>
            <Grid.Container justify="space-between" alignItems="center">
              <Grid>
                {t("analytics")} - {jetton.name}
              </Grid>
            </Grid.Container>
          </Grid>
        )}
        <Grid xs={12} sm={isFull ? 12 : 8}>
          <Grid.Container>
            <Spacer y={0.5} />
            <Grid xs={12}>
              <Grid.Container wrap="nowrap" justify="space-between">
                <Grid>
                  <Grid.Container
                    gap={1}
                    style={{ margin: "calc(-2 * var(--nextui--gridGapUnit))" }}
                  >
                    <Grid>
                      {prevJetton && (
                        <Button
                          onClick={() =>
                            navigate(`/analytics/price/${prevJetton.symbol}`)
                          }
                          css={{ minWidth: "auto" }}
                          flat
                          color="secondary"
                        >
                          arrowBackOutline
                        </Button>
                      )}
                    </Grid>
                    <Grid>
                      <Grid.Container alignItems="center">
                        <Grid>
                          {isLoading ? (
                            <Loading size="lg" />
                          ) : (
                            <Avatar bordered src={jetton?.image} />
                          )}
                        </Grid>
                        <Spacer x={0.5} />
                        <Grid>{jetton?.symbol}</Grid>
                      </Grid.Container>
                    </Grid>
                    <Grid>
                      <Grid.Container>
                        <Grid
                          css={{ display: "flex", justifyContent: "center" }}
                        >
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
                            statsChartOutline
                            <Text hideIn="xs" color="white">
                              <div style={{ display: "flex" }}>
                                <Spacer x={0.5} />
                                {t("price")}
                              </div>
                            </Text>
                          </Button>
                        </Grid>
                        <Grid
                          css={{ display: "flex", justifyContent: "center" }}
                        >
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
                            pieChartOutline
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
                    <Grid css={{ display: "flex", justifyContent: "center" }}>
                      <Button
                        color={isFull ? "warning" : "secondary"}
                        flat
                        css={{
                          minWidth: "auto",
                        }}
                        onClick={() => setIsFull((i) => !i)}
                      >
                        Icon
                        {/* {isFull ? navigateOutline : expandOutline} */}
                      </Button>
                    </Grid>

                    <Grid>
                      <Grid.Container
                        justify="space-between"
                        alignItems="center"
                      >
                        timerOutline
                        {/* <IonSelect
                          interface="popover"
                          value={timescale}
                          onIonChange={e => setTimescale(e.detail.value)}
                        >
                          {['1M', '5M', '30M', '1H', '4H', '1D'].map(n => (
                            <IonSelectOption value={n} key={n}>
                              {t(n)}
                            </IonSelectOption>
                          ))}
                        </IonSelect> */}
                      </Grid.Container>
                    </Grid>
                  </Grid.Container>
                </Grid>

                <Grid>
                  {nextJetton && (
                    <Button
                      onClick={() =>
                        navigate(`/analytics/price/${nextJetton.symbol}`)
                      }
                      css={{ minWidth: "auto" }}
                      flat
                      color="secondary"
                    >
                      arrowForwardOutline
                    </Button>
                  )}
                </Grid>
              </Grid.Container>
            </Grid>
            <Spacer y={1} />
            <Grid className="chart-table">
              <Table
                aria-label="Stats"
                compact
                bordered={false}
                shadow={false}
                css={{ border: "none", padding: 0 }}
              >
                <Table.Header>
                  <Table.Column>
                    <div className="chart-label">scaleOutline 1 TON</div>
                  </Table.Column>
                  <Table.Column>
                    <div className="chart-label">
                      diamondOutline {t("closePrice")}
                    </div>
                  </Table.Column>
                </Table.Header>
                <Table.Body>
                  <Table.Row key="1">
                    <Table.Cell>
                      {(info?.price ? 1 / parseFloat(info?.price) : 0).toFixed(
                        2
                      )}{" "}
                      {jetton.symbol}
                    </Table.Cell>
                    <Table.Cell>
                      {toFixed(
                        (parseFloat(info?.price || 0) as number).toFixed(9)
                      )}{" "}
                      {jetton.symbol}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Grid>
            <Spacer y={0.5} />
            <Grid xs={12}>
              <Card variant="bordered">
                <Card.Header>
                  <Grid.Container justify="space-between">
                    {/* <Grid>
                      <Grid.Container alignItems="center">
                        <Grid>
                          <Popover isBordered>
                            <Popover.Trigger>
                              <Button
                                css={{ background: 'transparent', minWidth: 'auto' }}
                                icon={<IonIcon icon={cogOutline} size="large" />}
                              />
                            </Popover.Trigger>
                            <Popover.Content css={{ p: 0 }}>
                              <Text size={12} color="gray" css={{ px: '$8' }}>
                                {t('chartType')}</div>
                              </Text>
                              <Button
                                size="lg"
                                disabled={type === 'price'}
                                css={{
                                  ...(type !== 'price' && {
                                    background: 'transparent',
                                    ...(!darkMode.value && { color: '$accents10' }),
                                  }),
                                  minWidth: '100%',
                                }}
                                icon={<div className="bar-price" />}
                                onClick={() => setType('price')}
                              >
                                <Spacer x={1.5} />
                                {t('price')} Свечной график
                              </Button>
                              <Button
                                size="lg"
                                disabled={type === 'volume'}
                                css={{
                                  ...(type !== 'volume' && {
                                    background: 'transparent',
                                    ...(!darkMode.value && { color: '$accents10' }),
                                  }),
                                  minWidth: '100%',
                                }}
                                icon={<div className="bar-volume" />}
                                onClick={() => setType('volume')}
                              >
                                <Spacer x={1.5} />
                                {t('volume')}
                              </Button>
                            </Popover.Content>
                          </Popover>
                        </Grid>
                      </Grid.Container>
                    </Grid> */}
                  </Grid.Container>
                </Card.Header>
                <Card.Body>
                  <div
                    ref={ref}
                    key={timescale}
                    style={{
                      width: "100%",
                      height: isFull ? "calc(100vh - 350px)" : "30vh",
                    }}
                  />
                </Card.Body>
              </Card>
            </Grid>
            <Spacer y={1} />
            {!isFull && (
              <>
                <Grid xs={12}>
                  <Table
                    aria-label="Example table with static content"
                    css={{
                      height: "auto",
                      minWidth: "100%",
                      w: "100%",
                    }}
                    bordered
                  >
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
                                    <div className="holder-address">
                                      {result.address}
                                    </div>
                                  </Badge>
                                ) : (
                                  <div className="holder-address">
                                    {result.address}
                                  </div>
                                )}
                              </Link>
                            </Table.Cell>
                            <Table.Cell>
                              {parseInt(
                                result.info.jettonWallet.balance.slice(
                                  0,
                                  -decimals
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
                <Spacer y={1} />
              </>
            )}
          </Grid.Container>
        </Grid>
      </Grid.Container>
    </>
  );
};

const infoAddress = {
  "EQB-7nZY_Onatn-_s5J2Y9jDOxCjWFzwMOa4_MeuSbgPgnVO": {
    color: "primary",
    text: "Development",
  },
  "EQDzIMlFI2-f-hWlVqoxFmFCo7nIA5YN0q3V6zg2DN2aEpmR": {
    color: "secondary",
    text: "Marketing",
  },
};
