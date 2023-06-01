/* eslint-disable @next/next/no-img-element */
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import cookie from "react-cookies";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  Legend,
  RadialBar,
  Treemap,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  ComposedChart,
  CartesianGrid,
  Area,
  Sector,
  AreaChart,
  Tooltip as ReTooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { motion, AnimatePresence } from "framer-motion";
import { arrayMoveImmutable } from "array-move";
import {
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Dropdown,
  Grid,
  Image,
  Input,
  Loading,
  Spacer,
  Text,
  Tooltip,
  User,
} from "@nextui-org/react";
import { useTranslation } from "react-i18next";

import axios from "libs/axios";
import { _, scaleTime } from "utils/time";
import { useQuery } from "@tanstack/react-query";
import { DroppableItems } from "components/DND/DroppableItems";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ARR10,
  ARR12,
  ARR20,
  ARR24,
  ARR32,
  ARR35,
  GEN02,
  GRA12,
} from "assets/icons";
import { colors } from "colors";
import { AppContext } from "contexts";
import Skeleton from "react-loading-skeleton";
import { AnalyticsPrice } from "./JettonPrice";
import { AnalyticsVolume } from "./JettonVolume";
import { TonProofApi } from "TonProofApi";
import { useTonAddress, useTonWallet } from "@tonconnect/ui-react";
import { random } from "utils";

const CustomTooltip = ({
  active,
  payload,
  label,
  color,
  symbol,
  decimals = 2,
}: any) => {
  console.log("payload", payload[0]?.payload?.name);
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <Badge
          size="xs"
          content={`${payload[0].value.toFixed(decimals)} ${
            symbol ? symbol : ""
          }`}
          color={
            color
              ? color
              : payload[0].value > 0
              ? "success"
              : payload[0].value === 0
              ? "default"
              : "error"
          }
          css={{ mr: -20 }}
        >
          <Button size="xs" css={{ minWidth: "auto" }}>
            {payload[0]?.payload?.name || label}
          </Button>
        </Badge>
      </div>
    );
  }

  return null;
};

const RADIAN = Math.PI / 180;
const cx = 85;
const cy = 85;
const iR = 70;
const oR = 80;

const needle = (value, list, cx, cy, iR, oR, color) => {
  let total = 0;
  list.forEach((v) => {
    total += v.value;
  });
  const ang = 180.0 * (1 - value / total);
  const length = (iR + 2 * oR) / 3;
  const sin = Math.sin(-RADIAN * ang);
  const cos = Math.cos(-RADIAN * ang);
  const r = 5;
  const x0 = cx + 5;
  const y0 = cy + 5;
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return [
    <circle cx={x0} cy={y0} r={r} fill={color} stroke="none" />,
    <path
      d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
      stroke="#none"
      fill={color}
    />,
  ];
};

const JettonChart = ({ index, data, height = 50, color }) => (
  <ResponsiveContainer width="100%" height={height} className="jetton-chart">
    <LineChart width={300} height={height} data={data}>
      <Line
        animationBegin={150 * index}
        name="volume"
        type="natural"
        dot={false}
        dataKey="volume"
        stroke="transparent"
        strokeWidth={1}
      />
      <Line
        animationBegin={150 * index}
        name="pv"
        type="natural"
        dot={false}
        dataKey="pv"
        stroke={color}
        strokeWidth={2}
      />
    </LineChart>
  </ResponsiveContainer>
);

export const pagination = {
  "1M": 60,
  "5M": 300,
  "30M": 1800,
  "1H": 3600,
  "4H": 14400,
  "1D": 86400,
  "7D": 604800,
  "30D": 2592000,
};

export const Analytics = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const address = useTonAddress();
  // const [present] = useIonActionSheet();
  const { theme } = useContext(AppContext);
  const [timescale, setTimescale] = useState<
    "1M" | "5M" | "30M" | "1H" | "4H" | "1D" | "7D" | "30D"
  >((cookie.load("timescale") as any) || "1D");
  const tokens = cookie.load("tokens");
  const [isInformed, setIsInformed] = useState(
    cookie.load("informed") === "true" ? true : false
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [list, setList] = useState<string[]>(tokens || []);
  const [search, setSearch] = useState<string | null | undefined>();
  const [jettons, setJettons] = useState<any[]>([]);
  const [swaps, setSwaps] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (
      TonProofApi.accessToken &&
      (location.pathname.includes("price") ||
        location.pathname.includes("chart"))
    ) {
      const jettonId = jettons.find(
        ({ symbol }) =>
          symbol.toLowerCase() ===
          location.pathname.split("/").pop()?.toLocaleLowerCase()
      )?.id;

      if (jettonId)
        axios
          .get(
            `https://api.fck.foundation/api/v2/user/swaps?jetton_id=${jettonId}&count=100`,
            {
              headers: {
                Authorization: `Bearer ${TonProofApi.accessToken}`,
              },
            }
          )
          .then((response) =>
            setSwaps(response.data.data.sources.DeDust.jettons)
          );
    }
  }, [address, location.pathname, jettons]);

  useEffect(() => {
    cookie.save("informed", JSON.stringify(isInformed), { path: "/" });
  }, [isInformed]);

  useEffect(() => {
    cookie.save("tokens", list, { path: "/" });
  }, [list]);

  useEffect(() => {
    cookie.save("timescale", timescale, { path: "/" });
  }, [timescale]);

  useEffect(() => {
    if (
      !location.pathname.includes("price") &&
      !location.pathname.includes("volume")
    ) {
      navigate("/analytics/price/FCK");
    }
  }, [location.pathname]);

  console.log(location);

  useEffect(() => {
    axios
      .get(`https://api.fck.foundation/api/v1/jettons`)
      .then(({ data: { data: dataJettons } }) => {
        const today = new Date();
        today.setHours(today.getHours() - 24);

        const listVerified = dataJettons
          .filter(
            ({ verified, address }) => verified && !list.includes(address)
          )
          .map(({ address }) => address);
        if (listVerified.length) {
          setList((prevState) => [...prevState, ...listVerified]);
        }

        setJettons(dataJettons);
      });
  }, []);

  const onDragEnd = ({ destination, source }: DropResult) => {
    if (
      destination?.index !== null &&
      typeof destination?.index !== undefined &&
      typeof source?.index !== undefined &&
      source?.index !== null
    ) {
      setList((prevList) =>
        arrayMoveImmutable(prevList, source.index, destination.index)
      );
    }
  };

  const { data: dataStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["jettons-analytics", timescale],
    queryFn: () =>
      axios
        .get(
          `https://api.fck.foundation/api/v2/analytics?jetton_ids=${jettons
            .map((jetton) => jetton.id)
            .slice(0, 14)
            .join(",")}&time_min=${Math.floor(
            Date.now() / 1000 - pagination[timescale]
          )}&timescale=${pagination[timescale] / 6}`
        )
        .then(({ data: { data } }) => data),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled: !!jettons.length,
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["jettons-transactions", timescale],
    queryFn: () =>
      axios
        .get(
          `https://api.fck.foundation/api/v2/analytics/swaps/count?jetton_ids=${jettons
            .map((jetton) => jetton.id)
            .splice(0, 14)
            .join(",")}&time_min=${Math.floor(
            Date.now() / 1000 - pagination[timescale]
          )}`
        )
        .then(({ data: { data } }) => data),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled: !!jettons.length && !!list.length,
  });

  const renderList = jettons.map((jetton, key) => {
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
          i > 0 && d.pv && dataJetton[i - 1].pv && dataJetton[i - 1].pv !== d.pv
            ? dataJetton[i - 1].pv < d.pv
              ? d.pv && d.pv - 100
              : d.pv && d.pv + 100
            : dataJetton[dataJetton.length - 1].pv < d.pv
            ? d.pv && d.pv + 100 * 10
            : d.pv && d.pv - 100 * 2,
      }));

    const volume = [...dataJetton].reduce((acc, i) => (acc += i?.volume), 0);
    const percent = !!dataJetton[dataJetton.length - 1]?.pv
      ? ((dataJetton[dataJetton.length - 1]?.pv - dataJetton[0]?.pv) /
          dataJetton[0]?.pv) *
        100
      : 0;

    return { jetton, dataJetton, dataChart, percent, volume };
  });

  const searchList = useMemo(
    () =>
      jettons.filter(
        (i) =>
          !list.includes(i.address) &&
          (i.symbol.toLowerCase().includes(search && search.toLowerCase()) ||
            i.address.includes(search))
      ),
    [renderList, jettons, search, list]
  );

  console.log("searchList", searchList);

  const { data: dataStatsSearch, isLoading: isLoadingStatsSearch } = useQuery({
    queryKey: ["jettons-analytics-search", timescale, searchList],
    queryFn: () =>
      axios
        .get(
          `https://api.fck.foundation/api/v2/analytics?jetton_ids=${searchList
            .map(({ id }) => id)
            .join(",")}&time_min=${Math.floor(
            Date.now() / 1000 - pagination[timescale]
          )}&timescale=${pagination[timescale] / 6}`
        )
        .then(({ data: { data } }) => data),
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: !!searchList.length,
    cacheTime: 60 * 1000,
    select: (response) =>
      searchList.map((jetton, key) => {
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

  const onAdd = (value) => {
    setList((prevList) => [...prevList, value]);
    setSearch(null);
    navigate(
      `/analytics/price/${
        jettons.find(({ address }) => address === value)?.symbol
      }`
    );
  };

  const totals = useMemo(() => {
    let countJetton = 0,
      countTon = 0;

    Object.keys(dataStats?.sources?.DeDust?.jettons || {}).forEach((i) => {
      dataStats?.sources?.DeDust?.jettons[i].prices.forEach((price) => {
        countJetton += _(price.jetton_volume) * _(price.price_close);
        countTon += _(price.volume);
      });
    });

    return { ton: countTon, jettons: countJetton };
  }, [dataStats]);

  const dataVolume = useMemo(() => {
    const sell = totals.jettons;
    const buy = totals.ton;

    return [
      {
        name: "Sell",
        value: 25,
        color: "#f31260",
      },
      {
        name: "Sell",
        value: 20,
        color: "#f46a1b",
      },
      {
        name: "Sell",
        value: 10,
        color: "#d29902",
      },
      {
        name: "Sell",
        value: 20,
        color: "#9ebd04",
      },
      {
        name: "Buy",
        value: 25,
        color: "#1ac964",
      },
    ];
  }, [totals]);

  const dataTransactions = Object.keys(
    transactions?.sources?.DeDust?.jettons || {}
  )
    ?.filter((jetton) => transactions?.sources?.DeDust?.jettons[jetton]?.count)
    .map((id) => ({
      name: jettons.find((jetton) => jetton.id === parseInt(id))?.symbol,
      count: transactions?.sources?.DeDust?.jettons[id].count,
    }))
    .sort((x, y) => x.count - y.count)
    .slice(-15);

  const dataPie = useMemo(() => {
    const dailyVolume = Object.keys(dataStats?.sources?.DeDust?.jettons || {})
      .map((jettonId, i) => ({
        name: jettons.find(({ id }) => parseInt(jettonId) === id)?.symbol,
        pv: dataStats.sources.DeDust.jettons[jettonId].prices.reduce(
          (acc, curr) => (acc += curr.volume),
          0
        ),
        fill: `${colors[theme.color].primary.slice(0, 2)}${random(
          10,
          99
        )}${colors[theme.color].primary.slice(5, colors[theme.color].primary.length - 1)}`,
      }))
      .sort((x, y) => y.pv - x.pv);
    return {
      top: dailyVolume.slice(0, 9),
      others: dailyVolume.slice(9, dailyVolume.length - 1),
    };
  }, [dataStats, theme]);

  console.log(dataPie)

  const dataPercent = useMemo(
    () =>
      renderList
        .filter(({ percent }) => percent)
        .sort((x, y) => x.percent - y.percent)
        .map(({ jetton, percent }) => ({
          name: jetton.symbol,
          uv: percent,
        })),
    [renderList]
  );

  return (
    <>
      <Grid.Container
        gap={0.4}
        css={{ minHeight: "70vh", display: "flex", pt: 16 }}
      >
        {/* {!isInformed && (
          <>
            <Spacer y={0.4} />
            <Grid css={{ maxWidth: 400, w: '100%', display: 'flex' }}>
              <Spacer x={1} />
              <IonText color="warning">
                <IonIcon icon={warning} />
              </IonText>
              <Spacer x={0.5} y={0.5} />
              <p>{t('infoMessage')}</p>
              <Button css={{ minWidth: 40 }} onClick={() => setIsInformed(true)}>
                Ok
              </Button>
            </Grid>
          </>
        )} */}

        <Grid xs={12}>
          <Grid.Container gap={1} wrap="nowrap" alignContent="center">
            <Grid>
              {location.pathname.includes("price") ||
              location.pathname.includes("volume") ? (
                <Button
                  flat
                  css={{
                    minWidth: "auto",
                    "@sm": { display: "none" },
                  }}
                  onClick={() => setOpen(true)}
                >
                  {location.pathname.split("/").pop()}

                  <Spacer x={0.4} />
                  <ARR24 style={{ fill: "currentColor", fontSize: 18 }} />
                </Button>
              ) : null}
            </Grid>
            <Grid css={{ w: "100%" }}>
              <Input
                className="search-input"
                inputMode="search"
                value={search as string}
                placeholder={t("searchToken") as string}
                css={{ width: "100%" }}
                onChange={(e) => setSearch(e.target.value as any)}
              />
            </Grid>
          </Grid.Container>
        </Grid>

        <Grid xs={12} css={{ display: "flex", flexDirection: "column" }}>
          {!!searchList.length && (
            <div className="jettons-list">
              <AnimatePresence>
                {dataStatsSearch?.map(
                  ({ jetton, dataJetton, dataChart, percent, volume }, key) => {
                    return (
                      <motion.div
                        key={location?.pathname}
                        initial={{ y: -300, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 300, opacity: 0 }}
                      >
                        <Grid key={key} className="jetton-card" xs={12}>
                          <Card
                            variant="bordered"
                            isHoverable
                            isPressable
                            onClick={
                              () =>
                                // jetton.verified
                                onAdd(jetton.address)
                              // : null
                              // : present({
                              //     header: t("importRisks"),
                              //     subHeader: t("riskInfo"),
                              //     cssClass: "my-custom-class",
                              //     buttons: [
                              //       {
                              //         text: t("import"),
                              //         role: "destructive",
                              //         data: {
                              //           action: "import",
                              //         },
                              //       },
                              //       {
                              //         text: t("cancel"),
                              //         data: {
                              //           action: "cancel",
                              //         },
                              //       },
                              //     ],
                              //     onDidDismiss: ({ detail }) =>
                              //       detail?.data?.action === "import" &&
                              //       onAdd(jetton.address), //onAdd(jetton.address),
                              //   })
                            }
                          >
                            <Card.Header>
                              <Grid.Container
                                wrap="nowrap"
                                gap={1}
                                alignItems="center"
                                justify="space-between"
                              >
                                <Grid css={{ textAlign: "center" }}>
                                  <User
                                    bordered
                                    src={jetton.image}
                                    name={
                                      <div>
                                        {jetton.symbol}{" "}
                                        {!!jetton?.verified && (
                                          <Badge
                                            size="xs"
                                            css={{
                                              p: 0,
                                              background: "transparent",
                                              right: "unset",
                                              left: "$8",
                                            }}
                                          >
                                            <ARR20
                                              style={{
                                                fill: "var(--nextui-colors-primary)",
                                                fontSize: 16,
                                                borderRadius: 100,
                                                overflow: "hidden",
                                              }}
                                            />
                                          </Badge>
                                        )}
                                      </div>
                                    }
                                    description={(!!dataJetton[
                                      dataJetton.length - 1
                                    ]?.pv
                                      ? 1 /
                                        dataJetton[dataJetton.length - 1]?.pv
                                      : 0
                                    ).toFixed(2)}
                                    css={{ padding: 0 }}
                                  />
                                </Grid>
                                <Grid
                                  xs={4}
                                  className="jetton-chart"
                                  css={{
                                    padding: 0,
                                    overflow: "hidden",
                                  }}
                                >
                                  {isLoadingStatsSearch ? (
                                    <Skeleton
                                      count={1}
                                      height={35}
                                      width={250}
                                    />
                                  ) : dataChart.length ? (
                                    <JettonChart
                                      index={key}
                                      data={
                                        dataChart.length < 2
                                          ? [
                                              ...dataChart.map((i) => ({
                                                ...i,
                                                pv:
                                                  _(i?.price_close) ||
                                                  _(i?.price_high) ||
                                                  _(i?.price_low) ||
                                                  _(i?.price_open),
                                              })),
                                              ...dataChart,
                                            ]
                                          : dataChart
                                      }
                                      height={
                                        ["FCK"].includes(jetton.symbol)
                                          ? 36
                                          : 50
                                      }
                                      color={
                                        !isNaN(percent) && percent !== 0
                                          ? percent > 0
                                            ? "#1ac964"
                                            : "#f31260"
                                          : "gray"
                                      }
                                    />
                                  ) : null}
                                </Grid>
                                <Grid>
                                  <Grid.Container
                                    direction="column"
                                    alignItems="flex-end"
                                  >
                                    <Grid>
                                      <Badge
                                        size="xs"
                                        color={
                                          !isNaN(percent) && percent !== 0
                                            ? percent > 0
                                              ? "success"
                                              : "error"
                                            : "default"
                                        }
                                        css={{ whiteSpace: "nowrap" }}
                                      >
                                        {!isNaN(percent) && percent !== 0
                                          ? parseFloat(
                                              Math.abs(percent).toFixed(2)
                                            )
                                          : 0}{" "}
                                        %
                                      </Badge>
                                    </Grid>
                                    <Spacer y={0.4} />
                                    <Grid
                                      css={{
                                        display: "flex",
                                        flexWrap: "nowrap",
                                        whiteSpace: "nowrap",
                                        alignItems: "center",
                                      }}
                                    >
                                      {(volume || 0).toFixed(0)} TON
                                    </Grid>
                                  </Grid.Container>
                                </Grid>
                              </Grid.Container>
                            </Card.Header>
                          </Card>
                        </Grid>
                        <Spacer y={0.4} />
                      </motion.div>
                    );
                  }
                )}
              </AnimatePresence>
            </div>
          )}
        </Grid>

        <Grid xs={12}>
          <Grid.Container
            className="hide-scrollbar"
            gap={1}
            alignContent="flex-start"
            wrap="nowrap"
            css={{
              overflow: "auto",
              padding: 35,
              margin: -35,
              width: "100vw",
            }}
          >
            <Grid>
              <Card css={{ height: "fit-content" }}>
                <Card.Header css={{ whiteSpace: "nowrap" }}>
                  {t("fearGreedIndex")}
                </Card.Header>
                <Card.Body
                  css={{
                    pt: 0,
                    pb: 0,
                    dflex: true,
                    alignItems: "center",
                    overflow: "hidden",
                  }}
                >
                  <ResponsiveContainer width={180} height={105}>
                    <PieChart>
                      <Pie
                        label={false}
                        dataKey="value"
                        startAngle={180}
                        endAngle={0}
                        data={dataVolume}
                        cx={cx}
                        cy={cy}
                        innerRadius={iR}
                        outerRadius={oR}
                        fill={colors[theme.color].primary}
                        stroke="none"
                      >
                        {dataVolume.map((entry, index) => (
                          <Cell key={`cell-${entry.name}`} fill={entry.color} />
                        ))}
                      </Pie>
                      {needle(
                        parseFloat(
                          (
                            (totals.jettons / (totals.jettons + totals.ton)) *
                            100
                          ).toFixed(2)
                        ),
                        dataVolume,
                        cx,
                        cy,
                        iR,
                        oR,
                        colors[theme.color].primary
                      )}
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
                <Card.Footer
                  css={{ display: "flex", justifyContent: "center", pt: 0 }}
                >
                  <Badge size="xs">
                    {Math.ceil(
                      (totals.jettons / (totals.jettons + totals.ton || 1)) *
                        100
                    )}
                  </Badge>
                </Card.Footer>
              </Card>
            </Grid>
            <Grid>
              <Card
                css={{ height: "fit-content", overflow: "visible", zIndex: 2 }}
              >
                <Card.Header>{t("volume")}</Card.Header>
                <Card.Body css={{ pt: 0, pb: 0, overflow: "visible" }}>
                  <ResponsiveContainer width={250} height={140}>
                    <RadialBarChart
                      cx="20%"
                      cy="50%"
                      innerRadius="50%"
                      outerRadius="300%"
                      barSize={10}
                      data={[
                        ...dataPie.top,
                        dataPie.others.reduce((acc, curr) => {
                          acc.name = t("others");
                          acc.pv = (acc.pv || 0) + curr.pv;
                          acc.fill = curr.fill;

                          return acc;
                        }, {} as any),
                      ]}
                      style={{ marginTop: -10 }}
                    >
                      <RadialBar
                        startAngle={15}
                        dataKey="pv"
                        label={{
                          fontSize: 12,
                          dataKey: "name",
                          position: "end",
                        }}
                      />
                      <ReTooltip content={<CustomTooltip symbol="TON" />} />
                    </RadialBarChart>
                    {/* <PieChart width={120} height={120}>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={(args) =>
                          renderActiveShape({
                            ...args,
                            color: colors[theme.color],
                          })
                        }
                        data={dataPie}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={60}
                        stroke="none"
                        dataKey="value"
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                      />
                    </PieChart> */}
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Grid>
            <Grid>
              <Card css={{ height: "fit-content" }}>
                <Card.Header>{t('change')}</Card.Header>
                <Card.Body css={{ pt: 0, pb: 0, overflow: "hidden" }}>
                  <ResponsiveContainer width={300} height={140}>
                    <AreaChart
                      width={500}
                      height={400}
                      data={dataPercent}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" scale="auto" />
                      <YAxis scale="auto" />
                      <ReTooltip content={<CustomTooltip symbol="%" />} />
                      <Area
                        type="monotone"
                        dataKey="uv"
                        stroke={colors[theme.color].primary}
                        fill={colors[theme.color].primary}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Grid>
            <Grid>
              <Card css={{ height: "fit-content" }}>
                <Card.Header>{t("transactionsCount")}</Card.Header>
                <Card.Body css={{ pt: 0, pb: 0, overflow: "hidden" }}>
                  <ResponsiveContainer width={300} height={140}>
                    <ComposedChart layout="vertical" data={dataTransactions}>
                      <XAxis type="category" fontSize={12} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        scale="auto"
                        fontSize={12}
                      />
                      <Bar
                        dataKey="count"
                        barSize={5}
                        fill={colors[theme.color].primary}
                      />
                      <ReTooltip
                        content={<CustomTooltip decimals={0} color="warning" />}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Grid>
          </Grid.Container>
        </Grid>
        <Grid xs={12}>
          <Grid.Container>
            <Grid xs={12} sm={4}>
              <Grid.Container gap={0.4} css={{ height: "fit-content" }}>
                <Grid xs={12}>
                  <Container
                    gap={0}
                    justify="space-between"
                    alignItems="center"
                    css={{ display: "flex", width: "100%", zIndex: 2 }}
                  >
                    <Grid>
                      <Grid.Container
                        gap={1}
                        wrap="nowrap"
                        css={{ margin: -10, width: "calc(100% + 10px)" }}
                      >
                        {location.pathname.includes("price") ||
                        location.pathname.includes("volume") ? (
                          <Grid>
                            <Grid.Container wrap="nowrap">
                              <Grid
                                css={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <Button
                                  size="sm"
                                  flat={!location.pathname.includes("price")}
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
                                  {t("price")}
                                </Button>
                              </Grid>
                              <Grid
                                css={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <Button
                                  size="sm"
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
                                  {t("volumeL")}
                                </Button>
                              </Grid>
                            </Grid.Container>
                          </Grid>
                        ) : null}
                        <Grid>
                          <Dropdown isBordered>
                            <Dropdown.Button
                              flat
                              size="sm"
                              color="secondary"
                              css={{ padding: 10 }}
                            >
                              <GRA12
                                style={{ fill: "currentColor", fontSize: 18 }}
                              />
                              <Spacer x={0.4} />
                              {timescale}
                            </Dropdown.Button>
                            <Dropdown.Menu
                              selectionMode="single"
                              onSelectionChange={(key) =>
                                setTimescale(Object.values(key)[0])
                              }
                              css={{ minWidth: 50 }}
                            >
                              {[
                                "1M",
                                "5M",
                                "30M",
                                "1H",
                                "4H",
                                "1D",
                                "7D",
                                "30D",
                              ].map((n) => (
                                <Dropdown.Item key={n}>{t(n)}</Dropdown.Item>
                              ))}
                            </Dropdown.Menu>
                          </Dropdown>
                        </Grid>
                      </Grid.Container>
                    </Grid>
                  </Container>
                </Grid>
                <Grid
                  xs={12}
                  css={{ display: "flex", flexDirection: "column" }}
                >
                  <div
                    className={`jettons-list ${
                      location.pathname.includes("price") ||
                      location.pathname.includes("volume")
                        ? "side"
                        : undefined
                    } ${open ? "open" : ""}`}
                    onClick={() => setOpen(false)}
                  >
                    <div>
                      <AnimatePresence>
                        <DragDropContext onDragEnd={onDragEnd}>
                          {list.map((column, columnID) => (
                            <DroppableItems
                              key={columnID}
                              column={column}
                              id={columnID}
                              data={
                                jettons
                                  .filter(
                                    (jetton) => jetton?.address === column
                                  )
                                  .map((jetton, key) => {
                                    jetton.data =
                                      dataStats?.sources?.DeDust?.jettons[
                                        jetton.id.toString()
                                      ]?.prices;
                                    const dataJetton = [
                                      ...(jetton.data && jetton.data.length < 2
                                        ? [
                                            {
                                              name: jetton.data[0]?.symbol,
                                              pv:
                                                _(
                                                  jetton.data[0]?.price_close
                                                ) ||
                                                _(jetton.data[0]?.price_high) ||
                                                _(jetton.data[0]?.price_low) ||
                                                _(jetton.data[0]?.price_open),
                                              volume: 0,
                                            },
                                          ]
                                        : []),
                                      ...(jetton.data || [])?.map((item, i) => {
                                        return {
                                          name: jettons.find(
                                            ({ id }) => id === item.jetton_id
                                          )?.symbol,
                                          pv:
                                            _(item.price_close) ||
                                            _(item.price_high) ||
                                            _(item.price_low) ||
                                            _(item.price_open),
                                          volume: _(item.volume),
                                        };
                                      }),
                                    ];
                                    const dataChart = [...dataJetton].map(
                                      (d, i) => ({
                                        ...d,
                                        pv:
                                          i > 0 &&
                                          d.pv &&
                                          dataJetton[i - 1].pv &&
                                          dataJetton[i - 1].pv !== d.pv
                                            ? dataJetton[i - 1].pv < d.pv
                                              ? d.pv && d.pv - 100
                                              : d.pv && d.pv + 100
                                            : dataJetton[dataJetton.length - 1]
                                                .pv < d.pv
                                            ? d.pv && d.pv + 100 * 10
                                            : d.pv && d.pv - 100 * 2,
                                      })
                                    );

                                    const volume = [...dataJetton].reduce(
                                      (acc, i) => (acc += i?.volume),
                                      0
                                    );
                                    const percent =
                                      _(dataJetton[dataJetton.length - 1]?.pv) >
                                        0 && _(dataJetton[0]?.pv) > 0
                                        ? (dataJetton[dataJetton.length - 1]
                                            ?.pv /
                                            dataJetton[0]?.pv) *
                                            100 -
                                          100
                                        : 0;

                                    return {
                                      key,
                                      address: jetton.address,
                                      children: (
                                        <motion.div
                                          key={jetton.symbol}
                                          style={{ width: "100%" }}
                                        >
                                          <Grid
                                            key={key}
                                            className="jetton-card"
                                            xs={12}
                                          >
                                            <Card
                                              variant={
                                                location.pathname.includes(
                                                  jetton.symbol
                                                )
                                                  ? undefined
                                                  : "bordered"
                                              }
                                              isHoverable
                                              isPressable
                                              css={{
                                                bg: location.pathname.includes(
                                                  jetton.symbol
                                                )
                                                  ? "$border"
                                                  : undefined,
                                              }}
                                              onClick={() =>
                                                navigate(
                                                  `/analytics/price/${jetton.symbol}`
                                                )
                                              }
                                            >
                                              <Card.Header
                                                style={{ padding: 8 }}
                                              >
                                                <Grid.Container
                                                  wrap="nowrap"
                                                  gap={1}
                                                  alignItems="center"
                                                  justify="space-between"
                                                >
                                                  <Grid>
                                                    <Grid.Container
                                                      wrap="nowrap"
                                                      gap={1}
                                                      alignItems="center"
                                                    >
                                                      <Grid
                                                        css={{
                                                          textAlign: "center",
                                                        }}
                                                      >
                                                        <User
                                                          bordered
                                                          src={jetton.image}
                                                          name={
                                                            <div>
                                                              {jetton.symbol}{" "}
                                                              {!!jetton?.verified && (
                                                                <Badge
                                                                  size="xs"
                                                                  css={{
                                                                    p: 0,
                                                                    background:
                                                                      "transparent",
                                                                    right:
                                                                      "unset",
                                                                    left: "$8",
                                                                  }}
                                                                >
                                                                  <ARR20
                                                                    style={{
                                                                      fill: "var(--nextui-colors-primary)",
                                                                      fontSize: 16,
                                                                      borderRadius: 100,
                                                                      overflow:
                                                                        "hidden",
                                                                    }}
                                                                  />
                                                                </Badge>
                                                              )}
                                                            </div>
                                                          }
                                                          description={(!!dataJetton[
                                                            dataJetton.length -
                                                              1
                                                          ]?.pv
                                                            ? 1 /
                                                              dataJetton[
                                                                dataJetton.length -
                                                                  1
                                                              ]?.pv
                                                            : 0
                                                          ).toFixed(2)}
                                                          css={{ padding: 0 }}
                                                        />
                                                      </Grid>
                                                    </Grid.Container>
                                                  </Grid>
                                                  <Grid
                                                    className="jetton-chart"
                                                    css={{
                                                      padding: 0,
                                                      overflow: "hidden",
                                                      w: "100%",
                                                    }}
                                                  >
                                                    {isLoadingStats ? (
                                                      <Skeleton
                                                        count={1}
                                                        height={35}
                                                        width={250}
                                                      />
                                                    ) : dataChart.length ? (
                                                      <JettonChart
                                                        index={columnID}
                                                        data={
                                                          dataChart.length < 2
                                                            ? [
                                                                ...dataChart.map(
                                                                  (i) => ({
                                                                    ...i,
                                                                    pv: i.open,
                                                                  })
                                                                ),
                                                                ...dataChart,
                                                              ]
                                                            : dataChart
                                                        }
                                                        height={
                                                          ["FCK"].includes(
                                                            jetton.symbol
                                                          )
                                                            ? 36
                                                            : 36
                                                        }
                                                        color={
                                                          !isNaN(percent) &&
                                                          percent !== 0
                                                            ? percent > 0
                                                              ? "#1ac964"
                                                              : "#f31260"
                                                            : "gray"
                                                        }
                                                      />
                                                    ) : null}
                                                  </Grid>
                                                  <Grid>
                                                    <Grid.Container
                                                      direction="column"
                                                      alignItems="flex-end"
                                                    >
                                                      <Grid>
                                                        <Badge
                                                          color={
                                                            !isNaN(percent) &&
                                                            percent !== 0
                                                              ? percent > 0
                                                                ? "success"
                                                                : "error"
                                                              : "default"
                                                          }
                                                          size="xs"
                                                          css={{
                                                            whiteSpace:
                                                              "nowrap",
                                                          }}
                                                        >
                                                          {!isNaN(percent) &&
                                                          percent !== 0
                                                            ? parseFloat(
                                                                Math.abs(
                                                                  percent
                                                                ).toFixed(2)
                                                              )
                                                            : 0}{" "}
                                                          %
                                                        </Badge>
                                                      </Grid>
                                                      <Spacer y={0.4} />
                                                      <Grid
                                                        css={{
                                                          display: "flex",
                                                          flexWrap: "nowrap",
                                                          whiteSpace: "nowrap",
                                                          alignItems: "center",
                                                          fontSize: 14,
                                                        }}
                                                      >
                                                        {(volume || 0).toFixed(
                                                          0
                                                        )}{" "}
                                                        TON
                                                      </Grid>
                                                    </Grid.Container>
                                                  </Grid>
                                                </Grid.Container>
                                              </Card.Header>
                                            </Card>
                                          </Grid>
                                          <Spacer y={0.4} />
                                        </motion.div>
                                      ),
                                    };
                                  })[0]
                              }
                            />
                          ))}
                        </DragDropContext>
                      </AnimatePresence>
                    </div>
                  </div>
                </Grid>
              </Grid.Container>
            </Grid>
            <Grid xs={12} sm={8}>
              {location.pathname.includes("volume") ||
              location.pathname.includes("price") ? (
                <AnalyticsPrice timescale={timescale} swaps={swaps} />
              ) : (
                <Grid.Container justify="center">
                  <Grid
                    css={{
                      display: "flex",
                      alignItems: "center",
                      color: "$primary",
                    }}
                  >
                    <GEN02
                      style={{
                        fill: "currentColor",
                        fontSize: 32,
                      }}
                    />
                  </Grid>
                </Grid.Container>
              )}
            </Grid>
          </Grid.Container>
        </Grid>
      </Grid.Container>
    </>
  );
};

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    payload,
    percent,
    fill,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill={props.color.primary}
      >{`${payload.value.toFixed(2)} TON`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill={props.color.link}
      >
        {`${(percent * 100).toFixed(2)}%`}
      </text>
    </g>
  );
};
