/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { motion, AnimatePresence } from "framer-motion";
import { arrayMoveImmutable } from "array-move";
import {
  Badge,
  Button,
  Card,
  Divider,
  Dropdown,
  Grid,
  Input,
  Loading,
  Spacer,
  Text,
  User,
} from "@nextui-org/react";
import { useTranslation } from "react-i18next";

import axios from "libs/axios";
import { _, scaleTime } from "utils/time";
import { useQuery } from "@tanstack/react-query";
import { DroppableItems } from "components/DND/DroppableItems";
import { useLocation, useNavigate } from "react-router-dom";
import { ARR10, ARR12, ARR32, ARR35, GEN02, GRA12 } from "assets/icons";

const JettonChart = ({ data, height = 50, color }) => (
  <ResponsiveContainer width="100%" height={height} className="jetton-chart">
    <LineChart width={300} height={height} data={data}>
      <Line
        name="volume"
        type="natural"
        dot={false}
        dataKey="volume"
        stroke="transparent"
        strokeWidth={1}
      />
      <Line
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

const pagination = {
  "1M": 60,
  "5M": 300,
  "30M": 1800,
  "1H": 3600,
  "4H": 14400,
  "1D": 86400,
};

const whiteList = [
  "0:3a4d2191094e3a33d4601efa51bb52dc5baa354516e162b7706955385f8144a7",
  "0:65aac9b5e380eae928db3c8e238d9bc0d61a9320fdc2bc7a2f6c87d6fedf9208",
  "0:9c2c05b9dfb2a7460fda48fae7409a32623399933a98a7a15599152f37572b49",
  "0:f4bdd480fcd79d47dbaf6e037d1229115feb2e7ac0f119e160ebd5d031abdf2e",
  "0:63130f9239ef325769086c65591abb0fa4b4da6a800e13cec219723671ae1777",
  "0:96e60d5ebe740dd8e6591157bedb7692bc4b203dab96665176ed9233e511219d",
  "0:421705bcb85521f9a99d466358f4dc9e0c469e0d85ddf608091ac89ca6a55c1e",
  "0:63eeea0856c9e0992f9ac8ecf59c710d8d99234ede665c1e2e19af3786672aab",
  "0:6227c7526e9dff6006ff2ae0bae330ab16a413b056d479ee6d6f3af97a5fc710",
  "0:beb5d4638e860ccf7317296e298fde5b35982f4725b0676dc98b1de987b82ebc",
  "0:04f2c01bbf132822b376b40b8e7b8bc8e47e098671c8fb39f6568472f9a807ec",
  "0:65de083a0007638233b6668354e50e44cd4225f1730d66b8b1f19e5d26690751",
  "0:33326656a36ca8e326cf50cbc881f150ddae777f85944e37f6f8b13ba09c4224",
  "0:7e6a33328b9f9628880e1e76ce180a5f7245066e5ead0e4dd0b7c3ca99bfb12c",
  "0:2f0df5851b4a185f5f63c0d0cd0412f5aca353f577da18ff47c936f99dbd849a",
  "0:8f98e9e44def2a3ff66d09fdd1cacd38ba445389073fc554be94643a047dc965",
  "0:6d50a3db84004f62d96d88a580e78eece19849e70647bd55757b27d5eec1321a",
];

export const Analytics = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  // const [present] = useIonActionSheet();
  const [timescale, setTimescale] = useState<
    "1M" | "5M" | "30M" | "1H" | "4H" | "1D" | "30D"
  >((localStorage.getItem("timescale") as any) || "1D");
  const tokens = localStorage.getItem("tokens");
  const [isInformed, setIsInformed] = useState(
    localStorage.getItem("informed") === "true" ? true : false
  );
  const [isMove, setIsMove] = useState(false);
  const [list, setList] = useState<string[]>(
    tokens ? JSON.parse(tokens) : [...whiteList]
  );
  const [search, setSearch] = useState<string | null | undefined>();
  const [jettons, setJettons] = useState<any[]>([]);
  const [loading, setLoading] = useState<any>(0);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem("informed", JSON.stringify(isInformed));
  }, [isInformed]);

  useEffect(() => {
    localStorage.setItem("tokens", JSON.stringify(list));
  }, [list]);

  useEffect(() => {
    localStorage.setItem("timescale", timescale);
    setLoading(0);
  }, [timescale]);

  useEffect(() => {
    axios
      .get(`https://api.fck.foundation/api/v1/jettons`)
      .then(({ data: { data: dataJettons } }) => {
        const today = new Date();
        today.setHours(today.getHours() - 24);

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

  const { isLoading } = useQuery({
    queryKey: ["jettons-analytics", timescale, loading],
    queryFn: () =>
      typeof jettons[loading] !== "undefined" &&
      (jettons[loading]?.id === search ||
        list.includes(jettons[loading]?.address)) &&
      axios
        .get(
          `https://api.fck.foundation/api/v1/analytics?jetton_id=${
            jettons[loading]?.id
          }&time_min=${Math.floor(
            Date.now() / 1000 - pagination[timescale]
          )}&timescale=${pagination[timescale] / 6}`
        )
        .then(({ data: { data } }) => data),
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: !!jettons.length && !!list.length,
    cacheTime: 60 * 1000,
    onSuccess: (results) => {
      if (results)
        setData((prevData) =>
          jettons.map((jetton, i) => ({
            ...prevData[i],
            ...jetton,
            ...(i === loading && {
              data: results?.filter((i) => i?.price_close !== "0.000000000"),
            }),
          }))
        );

      if (loading <= jettons.length) {
        setTimeout(() => setLoading((i) => i + 1), 100);
      }
    },
  });

  const onAdd = (value) => {
    setList((prevList) => [...prevList, value]);
    setSearch(null);
  };

  return (
    <>
      <Grid.Container direction="column" justify="center" alignItems="center">
        {/* {!isInformed && (
          <>
            <Spacer y={0.5} />
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
        <Spacer y={0.5} />
        <Grid css={{ maxWidth: 400, w: "100%" }}>
          <Grid.Container
            direction="column"
            alignItems="center"
            css={{ pl: 0, pb: 0, pr: 0 }}
          >
            <Grid css={{ w: "100%" }}>
              <Grid.Container justify="space-between" alignItems="center">
                <Grid>
                  <Input
                    className="search-input"
                    inputMode="search"
                    value={search as string}
                    placeholder={t("searchToken") as string}
                    onChange={(e) => setSearch(e.target.value as any)}
                  />
                </Grid>
                <Grid>
                  <Grid.Container>
                    <Grid>
                      <Button
                        color="primary"
                        flat={!isMove}
                        onClick={() => setIsMove((i) => !i)}
                        css={{ minWidth: "auto", padding: 8, width: 40 }}
                      >
                        <ARR32 style={{ fill: "currentColor", fontSize: 24 }} />
                        {/* {t("analytics")} */}
                      </Button>
                    </Grid>
                    <Spacer x={0.5} />
                    <Grid>
                      <Dropdown isBordered>
                        <Dropdown.Button
                          flat
                          color="secondary"
                          css={{ padding: 10 }}
                        >
                          <GRA12
                            style={{ fill: "currentColor", fontSize: 24 }}
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
                            "1D" /*, '30D' */,
                          ].map((n) => (
                            <Dropdown.Item key={n}>{t(n)}</Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </Grid>
                  </Grid.Container>
                </Grid>
              </Grid.Container>
            </Grid>
            <Spacer y={1} />
            {!search &&
              !data.filter((i) => list?.includes(i.address))?.length && (
                <>
                  <Grid>
                    <AnimatePresence>
                      <motion.div
                        key={location?.pathname}
                        initial={{ y: -300, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 300, opacity: 0 }}
                        style={{ width: "100%" }}
                      >
                        <img
                          src="/img/ton.svg"
                          alt="FCK"
                          className="logo-btn"
                          height={64}
                          width={64}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </Grid>
                  <Spacer y={1} />
                  <Grid>
                    <AnimatePresence>
                      <motion.div
                        key={location?.pathname}
                        initial={{ y: -300, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 300, opacity: 0 }}
                        style={{ width: "100%" }}
                      >
                        <Text
                          size={16}
                          css={{
                            textGradient: "45deg, $green600 0%, $blue600 100%",
                          }}
                          weight="bold"
                        >
                          {t("findToken")}
                        </Text>
                      </motion.div>
                    </AnimatePresence>
                  </Grid>
                </>
              )}
            {search ? (
              data.filter(
                (i) =>
                  !list.includes(i.address) &&
                  (i.symbol.toLowerCase().includes(search.toLowerCase()) ||
                    i.address.includes(search))
              ).length ? (
                <AnimatePresence>
                  {data
                    .map((i) => {
                      const id = {
                        FCK: 0,
                        SCALE: 1,
                        AMBR: 2,
                        WEX: 3,
                        KINGY: 4,
                        Tnr: 5,
                        BOLT: 6,
                        TNX: 7,
                        LAVE: 8,
                        PERS: 9,
                        INC: 10,
                        STYC: 11,
                      };
                      return { ...i, i: id[i.symbol] };
                    })
                    .sort((x, y) => (x.i || 0) - (y.i || 1))
                    .filter(
                      (i) =>
                        !list.includes(i.address) &&
                        (i.symbol
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                          i.address.includes(search))
                    )
                    .map((jetton, key) => {
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
                        ? (dataJetton[dataJetton.length - 1]?.pv /
                            dataJetton[0]?.pv) *
                            100 -
                          100
                        : 0;

                      return (
                        <motion.div
                          key={location?.pathname}
                          initial={{ y: -300, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 300, opacity: 0 }}
                          style={{ width: "100%" }}
                        >
                          <Grid
                            key={key}
                            className="jetton-card"
                            css={{ maxWidth: 400, w: "100%" }}
                          >
                            <Card
                              variant="bordered"
                              isHoverable
                              isPressable
                              onClick={
                                () =>
                                  whiteList.includes(jetton.address)
                                    ? onAdd(jetton.address)
                                    : null
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
                                      name={jetton.symbol}
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
                                    css={{ padding: 0, overflow: "hidden" }}
                                  >
                                    {loading < key ? (
                                      "skeleton"
                                    ) : dataChart.length ? (
                                      <JettonChart
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
                                      <Spacer y={0.5} />
                                      <Grid
                                        css={{
                                          display: "flex",
                                          flexWrap: "nowrap",
                                          whiteSpace: "nowrap",
                                          alignItems: "center",
                                        }}
                                      >
                                        <GEN02
                                          style={{
                                            fill: "currentColor",
                                            fontSize: 24,
                                          }}
                                        />
                                        <Spacer x={0.5} />
                                        {(volume || 0).toFixed(0)} TON
                                      </Grid>
                                    </Grid.Container>
                                  </Grid>
                                </Grid.Container>
                              </Card.Header>
                            </Card>
                          </Grid>
                          <Spacer y={0.5} />
                        </motion.div>
                      );
                    })}
                </AnimatePresence>
              ) : (
                <>
                  <AnimatePresence>
                    <motion.div
                      key={location?.pathname}
                      initial={{ y: -300, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 300, opacity: 0 }}
                      style={{ width: "100%" }}
                    >
                      <Grid
                        className="jetton-card"
                        css={{ maxWidth: 400, w: "100%", textAlign: "center" }}
                      >
                        <Text
                          size={18}
                          css={{
                            textGradient: "45deg, $blue600 -20%, $green600 50%",
                          }}
                          weight="bold"
                        >
                          No tokens found.
                        </Text>
                      </Grid>
                    </motion.div>
                  </AnimatePresence>
                  <Spacer y={1} />
                </>
              )
            ) : null}
            {search && (
              <>
                <Divider />
                <Spacer y={0.5} />
              </>
            )}
            <AnimatePresence>
              <DragDropContext onDragEnd={onDragEnd}>
                {list.map((column, columnID) => (
                  <DroppableItems
                    key={`${column}-${columnID}`}
                    column={column}
                    id={columnID}
                    data={
                      data
                        .filter((jetton) => jetton?.address === column)
                        .map((jetton, key) => {
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
                          const dataChart = [...dataJetton].map((d, i) => ({
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
                          const percent =
                            _(dataJetton[dataJetton.length - 1]?.pv) > 0 &&
                            _(dataJetton[0]?.pv) > 0
                              ? (dataJetton[dataJetton.length - 1]?.pv /
                                  dataJetton[0]?.pv) *
                                  100 -
                                100
                              : 0;

                          return {
                            key,
                            address: jetton.address,
                            children: (
                              <motion.div
                                key={location?.pathname}
                                style={{ width: "100%" }}
                              >
                                <Grid
                                  key={key}
                                  className="jetton-card"
                                  css={{ maxWidth: 400, w: "100%" }}
                                >
                                  <Card
                                    variant="bordered"
                                    isHoverable
                                    isPressable={!isMove}
                                    onClick={() =>
                                      !isMove &&
                                      navigate(
                                        `/analytics/price/${jetton.symbol}`
                                      )
                                    }
                                  >
                                    <Card.Header style={{ padding: 8 }}>
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
                                            {isMove && (
                                              <Grid>
                                                <motion.div
                                                  key={location?.pathname}
                                                  // initial={{ x: -300, opacity: 0 }}
                                                  // animate={{ x: 0, opacity: 1 }}
                                                  // exit={{ x: 300, opacity: 0 }}
                                                  style={{ width: "100%" }}
                                                >
                                                  <Button
                                                    size="xs"
                                                    flat
                                                    color="warning"
                                                    css={{ minWidth: "auto", pointerEvents: 'none' }}
                                                  >
                                                    <ARR35
                                                      style={{
                                                        fill: "currentColor",
                                                        fontSize: 24,
                                                      }}
                                                    />
                                                  </Button>
                                                </motion.div>
                                              </Grid>
                                            )}
                                            <Grid css={{ textAlign: "center" }}>
                                              <User
                                                bordered
                                                src={jetton.image}
                                                name={jetton.symbol}
                                                description={(!!dataJetton[
                                                  dataJetton.length - 1
                                                ]?.pv
                                                  ? 1 /
                                                    dataJetton[
                                                      dataJetton.length - 1
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
                                          {loading < key ? (
                                            "skeleton"
                                          ) : dataChart.length ? (
                                            <JettonChart
                                              data={
                                                dataChart.length < 2
                                                  ? [
                                                      ...dataChart.map((i) => ({
                                                        ...i,
                                                        pv: i.open,
                                                      })),
                                                      ...dataChart,
                                                    ]
                                                  : dataChart
                                              }
                                              height={
                                                ["FCK"].includes(jetton.symbol)
                                                  ? 36
                                                  : 36
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
                                                color={
                                                  !isNaN(percent) &&
                                                  percent !== 0
                                                    ? percent > 0
                                                      ? "success"
                                                      : "error"
                                                    : "default"
                                                }
                                                css={{
                                                  whiteSpace: "nowrap",
                                                }}
                                              >
                                                {!isNaN(percent) &&
                                                percent !== 0
                                                  ? parseFloat(
                                                      Math.abs(percent).toFixed(
                                                        2
                                                      )
                                                    )
                                                  : 0}{" "}
                                                %
                                              </Badge>
                                            </Grid>
                                            <Spacer y={0.2} />
                                            <Grid
                                              css={{
                                                display: "flex",
                                                flexWrap: "nowrap",
                                                whiteSpace: "nowrap",
                                                alignItems: "center",
                                                fontSize: 14,
                                              }}
                                            >
                                              <GEN02
                                                style={{
                                                  fill: "currentColor",
                                                  fontSize: 24,
                                                }}
                                              />
                                              <Spacer x={0.5} />
                                              {(volume || 0).toFixed(0)} TON
                                            </Grid>
                                          </Grid.Container>
                                        </Grid>

                                        {isMove && (
                                          <Grid>
                                            <motion.div
                                              key={location?.pathname}
                                              // initial={{ x: 300, opacity: 0 }}
                                              // animate={{ x: 0, opacity: 1 }}
                                              // exit={{ x: -300, opacity: 0 }}
                                              style={{ width: "100%" }}
                                            >
                                              <Button
                                                size="xs"
                                                flat
                                                color="error"
                                                css={{ minWidth: "auto" }}
                                              >
                                                <ARR10
                                                  style={{
                                                    fill: "currentColor",
                                                    fontSize: 24,
                                                  }}
                                                />
                                              </Button>
                                              {/* <IonIcon
                                                    icon={trashOutline}
                                                    color="danger"
                                                    onClick={() =>
                                                      setList((prevList) =>
                                                        prevList.filter(
                                                          (i) =>
                                                            i !== jetton.address
                                                        )
                                                      )
                                                    }
                                                  /> */}
                                            </motion.div>
                                          </Grid>
                                        )}
                                      </Grid.Container>
                                    </Card.Header>
                                  </Card>
                                </Grid>
                                <Spacer y={0.5} />
                              </motion.div>
                            ),
                          };
                        })[0]
                    }
                  />
                ))}
              </DragDropContext>
            </AnimatePresence>
          </Grid.Container>
        </Grid>
      </Grid.Container>
      <Spacer y={0.5} />
    </>
  );
};
