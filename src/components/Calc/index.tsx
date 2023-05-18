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
import { getList } from "utils";

export const Calc: React.FC<{ onChange: any }> = ({ onChange }) => {
  const { ton, jettons, theme } = useContext(AppContext);
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
  const [from, setFrom] = useState<Key>("TON");
  const [to, setTo] = useState<Key>("SCALE");

  const [valueX, setValueX] = useState("1");
  const [valueY, setValueY] = useState("1");

  useEffect(() => {
    onChange({ from, valueX, valueY });
  }, [from, valueX, valueY]);

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
    <Grid.Container wrap="nowrap" alignItems="center" justify="space-between">
      <Grid.Container gap={1} css={{ width: "auto" }}>
        <Grid>
          <Input
            value={!isNaN(parseFloat(valueX)) ? valueX : ''}
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
                    (jettonsList.find(({ name }) => name === from)?.price || 1)
                  : parseInt(e.target.value) /
                    (jettonsList.find(({ name }) => name === to)?.price || 1)
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
              <Dropdown.Menu aria-label="Static Actions" onAction={setFrom}>
                {[
                  ...(to !== "TON" && from !== "TON" ? [{ name: "TON" }] : []),
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
      <Button flat css={{ minWidth: "auto" }}>
        <ARR58
          style={{
            fill: "currentColor",
            fontSize: 32,
          }}
          onClick={onSwap}
        />
      </Button>
      <Grid.Container
        gap={1}
        css={{ width: "auto", display: "flex", justifyContent: "flex-end" }}
      >
        <Grid>
          <Input
            value={!isNaN(parseFloat(valueY)) ? valueY : ''}
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
                    (jettonsList.find(({ name }) => name === to)?.price || 1)
                  : parseInt(e.target.value) /
                    (jettonsList.find(({ name }) => name === from)?.price || 1)
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
                  ...(to !== "TON" && from !== "TON" ? [{ name: "TON" }] : []),
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
    </Grid.Container>
  );
};
