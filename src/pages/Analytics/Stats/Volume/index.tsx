/* eslint-disable @next/next/no-img-element */
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import cookie from "react-cookies";
import { useTranslation } from "react-i18next";
import { Grid, Loading, Spacer, Table, Text, Divider } from "@nextui-org/react";
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
import { _, scaleTime } from "utils/time";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toFixed } from "utils/price";
import { useLocation, useNavigate } from "react-router-dom";
import { GEN12, GEN13, GRA06, GRA09 } from "assets/icons";
import { pagination } from "pages/Analytics";

export const Volume = ({ timescale }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi>();
  const areaSeriesRef = useRef<ISeriesApi<"Area">>();
  const jettonsSeriesRef = useRef<ISeriesApi<"Area">>();
  const { jettons, enabled } = useContext(AppContext);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [isFull, setIsFull] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [loadingPage, setLoadingPage] = useState(1);
  const [info, setInfo] = useState<Record<string, any>>();
  const [jetton, setJetton] = useState<Record<string, any>>({});
  const [results, setResult] = useState<Record<string, any>>([]);
  const [hasNextPage, setHasNextPage] = useState(true);

  useEffect(() => {
    if (jettons?.length) {
      const jettonName = location.pathname.split("/").pop();

      const dataJetton = jettons.find(
        ({ symbol }) => symbol?.toUpperCase() === jettonName?.toUpperCase()
      );

      if (dataJetton) {
        setJetton(dataJetton);
      }
    }
  }, [jettons, location.pathname, jetton]);

  const chartOptions: DeepPartial<ChartOptions> = useMemo(
    () => ({
      autoSize: true,
      layout: {
        textColor: !enabled ? "#3e3e3e" : "#eae5e7",
        background: { color: "transparent" },
      },
      grid: {
        vertLines: { color: enabled ? "#3e3e3e" : "#eae5e7" },
        horzLines: { color: enabled ? "#3e3e3e" : "#eae5e7" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: enabled ? "#3e3e3e" : "#eae5e7",
      },
    }),
    [enabled]
  );

  const { data: dataVolume, isLoading } = useQuery({
    queryKey: [
      "jetton-analytics",
      page,
      location.pathname,
      timescale,
      jetton.id,
    ],
    queryFn: ({ signal }) => {
      return axios
        .get(
          `https://api.fck.foundation/api/v2/analytics/liquidity?jetton_ids=${
            jetton.id
          }&time_min=${Math.floor(
            Date.now() / 1000 - page * pagination[timescale] * 84
          )}&time_max=${Math.floor(
            Date.now() / 1000 - (page - 1) * pagination[timescale] * 84
          )}&timescale=${pagination[timescale]}`,
          { signal }
        )
        .then(
          ({ data: { data } }) =>
            data.sources.DeDust.jettons[jetton.id].liquidity
        );
    },
    enabled: !!jetton?.id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: (results) => {
      setData((prevData) => {
        if (!results.length) {
          setHasNextPage(false);
        }

        results = [...results, ...prevData].sort((x, y) => x.time - y.time);

        cookie.save("timescale", timescale, { path: "/" });

        const list = results;

        areaSeriesRef.current!.setData(
          [...list].map((item) => ({
            time: Math.floor(item.time) as any,
            value: _(item.ton_pool),
          }))
        );

        jettonsSeriesRef.current!.setData(
          [...list].map((item) => ({
            time: Math.floor(item.time) as any,
            value: _(item.jetton_pool),
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
            ? param.seriesData.get(areaSeriesRef.current)
            : getLastBar(areaSeriesRef.current);
          const jettons = validCrosshairPoint
            ? param.seriesData.get(jettonsSeriesRef.current)
            : getLastBar(jettonsSeriesRef.current);

          // time is in the same format that you supplied to the setData method,
          // which in this case is YYYY-MM-DD

          const time = candle?.time ? new Date(candle.time * 1000) : new Date();

          setInfo({
            time: moment(time).format("HH:mm"),
            value: candle?.value || 0,
            jettons: jettons?.value || 0,
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
          chartRef.current!.timeScale().fitContent();
        }

        return results;
      });

      if (page && page <= 1) {
        // chartRef.current!.timeScale().
        chartRef.current!.timeScale().fitContent();
        // .applyOptions({ rightOffset: globalThis.innerWidth / 20 });
      }

      chartRef.current
        ?.timeScale()
        .unsubscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChanged);
      chartRef.current
        ?.timeScale()
        .subscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChanged);
    },
  });

  const dataDays = useMemo(
    () => Math.round((Date.now() / 1000 - dataVolume?.pop()?.time) / 86400),
    [dataVolume]
  );

  const onVisibleLogicalRangeChanged = useCallback(
    (newVisibleLogicalRange) => {
      if (areaSeriesRef.current) {
        const barsInfo = areaSeriesRef.current.barsInLogicalRange(
          newVisibleLogicalRange
        );
        if (hasNextPage && barsInfo !== null && barsInfo.barsBefore < 0) {
          setLoadingPage(page + 1);
        }
      }
    },
    [page, loadingPage, isLoading, hasNextPage]
  );

  useEffect(() => {
    if (page && page <= 2 && page !== loadingPage && !isLoading) {
      setLoadingPage(page + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    chartRef.current = createChart(ref.current!, chartOptions);
    const date = new Date();

    if (chartRef.current) {
      areaSeriesRef.current = chartRef.current.addAreaSeries({
        lineColor: "#2962FF",
        topColor: "transparent",
        bottomColor: "transparent",
      });
      jettonsSeriesRef.current = chartRef.current.addAreaSeries({
        lineColor: "#1ac964",
        topColor: "transparent",
        bottomColor: "transparent",
      });

      areaSeriesRef.current.setMarkers([
        {
          time: {
            year: date.getFullYear(),
            month: date.getMonth(),
            day: date.getDate(),
          },
          position: "belowBar",
          color: "#2962FF",
          shape: "circle",
          text: "TON",
        },
      ]);
      jettonsSeriesRef.current.setMarkers([
        {
          time: {
            year: date.getFullYear(),
            month: date.getMonth(),
            day: date.getDate(),
          },
          position: "aboveBar",
          color: "#1ac964",
          shape: "circle",
          text: jetton?.symbol,
        },
      ]);
    }

    setPage(1);
    setLoadingPage(1);
    queryClient.setQueryData(["jetton-analytics"], { pages: [] });

    return () => {
      chartRef.current!.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jetton.id, timescale, chartOptions, location?.pathname]);

  return (
    <Grid.Container>
      {!isLoading && (!data.length || dataDays > 3) && (
        <Grid.Container
          justify="center"
          alignItems="center"
          wrap="nowrap"
          css={{
            position: "absolute",
            left: "0",
            top: "0",
            height: "100%",
            background: "var(--nextui--navbarBlurBackgroundColor)",
            pointerEvents: 'none'
          }}
        >
          <Grid>
            <GEN13 style={{ fill: "currentColor", fontSize: 24 }} />
          </Grid>
          <Spacer x={0.4} />
          <Grid>
            <Text size={16}>{t("notAvailable")}</Text>
          </Grid>
        </Grid.Container>
      )}
      {isLoading && location.pathname.includes("volume") && (
        <Loading
          css={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate3d(-50%, -50%, 0)",
          }}
        />
      )}

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
              <div className="chart-label">
                <GRA06 style={{ fill: "currentColor", fontSize: 24 }} />{" "}
                {t("volumeJ")}
              </div>
            </Table.Column>
            <Table.Column>
              <div className="chart-label">
                <GRA09 style={{ fill: "currentColor", fontSize: 24 }} />{" "}
                {t("volumeL")}
              </div>
            </Table.Column>
          </Table.Header>
          <Table.Body>
            <Table.Row key="1">
              <Table.Cell>
                <Grid.Container alignItems="center">
                  <Grid>
                    <Text
                      css={{
                        textGradient: "45deg, $primary -20%, $secondary 100%",
                      }}
                      className="chart-label"
                    >
                      <GRA06 style={{ fill: "currentColor", fontSize: 24 }} />{" "}
                      {t("volumeJ")}
                    </Text>
                  </Grid>
                  <Spacer x={0.4} />
                  <Grid>
                    {toFixed(
                      (parseFloat(info?.jettons || 0) as number).toFixed(
                        jetton?.decimals
                      )
                    )}{" "}
                    {jetton.symbol}
                  </Grid>
                </Grid.Container>
              </Table.Cell>
              <Table.Cell>
                <Grid.Container alignItems="center">
                  <Grid>
                    <Text
                      css={{
                        textGradient: "45deg, $primary -20%, $secondary 100%",
                      }}
                      className="chart-label"
                    >
                      <GRA09 style={{ fill: "currentColor", fontSize: 24 }} />{" "}
                      {t("volumeL")}
                    </Text>
                  </Grid>
                  <Spacer x={0.4} />
                  <Grid>{parseFloat(info?.value?.toFixed(2) || 0)} TON</Grid>
                </Grid.Container>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Grid>
      <Divider />
      <Grid css={{ width: "100%" }}>
        <div
          ref={ref}
          key={timescale}
          style={{
            width: "100%",
            height: isFull ? "calc(100vh - 350px)" : "70vh",
            filter: !data.length || dataDays > 3 ? "blur(3px)" : undefined,
          }}
        />
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
