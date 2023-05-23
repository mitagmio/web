import {
  Grid,
  Spacer,
  Input,
  Dropdown,
  Button,
  Text,
  Badge,
} from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { fck } from "api/fck";
import { ARR01, ARR58 } from "assets/icons";
import { AppContext } from "contexts";
import { TimeScale, pagination } from "pages";
import { Key, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getList } from "utils";

export const Calc: React.FC = () => {
  const { t } = useTranslation();
  const { ton, jettons, theme } = useContext(AppContext);
  const [timescale, setTimescale] = useState<TimeScale>(
    (localStorage.getItem("timescale") as any) || "1D"
  );

  const listVerified = useMemo(
    () => [...(jettons || [])]?.filter((i) => i.verified)?.map(({ id }) => id).slice(0, 14),
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
  });
  const [from, setFrom] = useState<Key>("TON");
  const [to, setTo] = useState<Key>("SCALE");

  const [valueX, setValueX] = useState("1");
  const [valueY, setValueY] = useState("1");

  const displayCalcValue = useMemo(() => {
    const val = (
      (ton?.market_data?.current_price?.usd || 1) *
      (from === "TON" ? parseInt(valueX) : parseInt(valueY))
    ).toFixed(2);

    return !isNaN(parseFloat(val)) ? val : 0;
  }, [ton, valueX, valueY]);

  const onSwap = () => {
    setTo(from);
    setFrom(to);
  };

  const jettonsList = [
    ...(data?.trend || []),
    ...(data?.gainer || []),
    ...(data?.recent || []),
  ];

  useEffect(() => {
    setValueY(
      (to === "TON"
        ? parseInt(valueX) *
          (jettonsList.find(({ name }) => name === from)?.price || 1)
        : parseInt(valueX) /
          (jettonsList.find(({ name }) => name === to)?.price || 1)
      ).toString()
    );
  }, [jettonsList]);

  return (
    <Grid.Container direction="column">
      <Grid>
        <Grid.Container justify="space-between">
          <Grid>
            <Text
              size={32}
              css={{
                textGradient: "45deg, $primary -20%, $secondary 50%",
                marginTop: -16,
              }}
              weight="bold"
            >
              {t("buyTrade")}
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
          <Spacer x={1} />
          <Grid>
            <Button
              flat
              color="secondary"
              css={{ minWidth: "auto", overflow: "visible" }}
              onClick={() =>
                globalThis.open(
                  `https://dedust.io/dex/swap?from=${from}&to=${to}`,
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
          </Grid>
        </Grid.Container>
      </Grid>
      <Spacer y={2} />
      <Grid>
        <Grid.Container
          wrap="nowrap"
          alignItems="center"
          justify="space-between"
        >
          <Grid>
            <Grid.Container gap={1} wrap="wrap" css={{ width: "auto" }}>
              <Grid>
                <Input
                  value={!isNaN(parseFloat(valueX)) ? valueX : ""}
                  clearable
                  underlined
                  color="primary"
                  labelPlaceholder="Amount"
                  width="75px"
                  size="sm"
                  onChange={(e) => {
                    setValueX(e.target.value);
                    setValueY(
                      (to === "TON"
                        ? parseInt(e.target.value) *
                          (jettonsList.find(({ name }) => name === from)
                            ?.price || 1)
                        : parseInt(e.target.value) /
                          (jettonsList.find(({ name }) => name === to)?.price ||
                            1)
                      ).toString()
                    );
                  }}
                />
              </Grid>

              <Grid>
                {from === "TON" ? (
                  <Badge isSquared color="primary" variant="bordered">
                    {from}
                  </Badge>
                ) : (
                  <Dropdown>
                    <Dropdown.Button color="gradient" size="sm">
                      {from}
                    </Dropdown.Button>
                    <Dropdown.Menu
                      aria-label="Static Actions"
                      onAction={setFrom}
                    >
                      {[
                        ...(to !== "TON" && from !== "TON"
                          ? [{ name: "TON" }]
                          : []),
                        ...(jettonsList || []),
                      ]
                        ?.filter(({ name }) => name !== from)
                        ?.map(({ name }) => (
                          <Dropdown.Item key={name}>{name}</Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </Grid>
            </Grid.Container>
          </Grid>
          <Grid>
            <Button flat size="sm" css={{ minWidth: "auto", p: 4 }}>
              <ARR58
                style={{
                  fill: "currentColor",
                  fontSize: 32,
                }}
                onClick={onSwap}
              />
            </Button>
          </Grid>
          <Grid>
            <Grid.Container
              gap={1}
              wrap="wrap"
              css={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Grid>
                <Input
                  value={!isNaN(parseFloat(valueY)) ? valueY : ""}
                  clearable
                  underlined
                  color="primary"
                  labelPlaceholder="Get"
                  width="75px"
                  size="sm"
                  onChange={(e) => {
                    setValueY(e.target.value);
                    setValueX(
                      (to !== "TON"
                        ? parseInt(e.target.value) *
                          (jettonsList.find(({ name }) => name === to)?.price ||
                            1)
                        : parseInt(e.target.value) /
                          (jettonsList.find(({ name }) => name === from)
                            ?.price || 1)
                      ).toString()
                    );
                  }}
                />
              </Grid>

              <Grid>
                {to === "TON" ? (
                  <Badge isSquared color="primary" variant="bordered">
                    {to}
                  </Badge>
                ) : (
                  <Dropdown>
                    <Dropdown.Button color="gradient" size="sm">
                      {to}
                    </Dropdown.Button>
                    <Dropdown.Menu aria-label="Static Actions" onAction={setTo}>
                      {[
                        ...(to !== "TON" && from !== "TON"
                          ? [{ name: "TON" }]
                          : []),
                        ...(jettonsList || []),
                      ]
                        ?.filter(({ name }) => name !== to)
                        ?.map(({ name }) => (
                          <Dropdown.Item key={name}>{name}</Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </Grid>
            </Grid.Container>
          </Grid>
        </Grid.Container>
      </Grid>
    </Grid.Container>
  );
};
