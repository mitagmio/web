import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useTonAddress } from "@tonconnect/ui-react";
import { TonProofApi } from "TonProofApi";
import moment from "moment";
import {
  Badge,
  Button,
  Card,
  Grid,
  Link,
  Loading,
  Spacer,
  Table,
  Text,
} from "@nextui-org/react";
import {
  ARR09,
  ARR10,
  ARR25,
  ARR28,
  ARR33,
  ARR36,
  ARR37,
  ARR42,
  GEN02,
  GEN17,
  Tonscan,
  Tonviewer,
} from "assets/icons";
import axios from "axios";
import { AppContext } from "contexts";
import { _ } from "utils";

const actions = {
  buy: <ARR09 style={{ fill: "#1ac964", fontSize: 24 }} />,
  sell: <ARR10 style={{ fill: "#f31260", fontSize: 24 }} />,
  liquidity_deposit: <ARR28 style={{ fill: "#1ac964", fontSize: 24 }} />,
  liquidity_withdraw: <ARR25 style={{ fill: "#f31260", fontSize: 24 }} />,
};

const colorType = {
  buy: "#1ac964",
  sell: "#f31260",
  liquidity_deposit: "#1ac964",
  liquidity_withdraw: "#f31260",
};

interface Props {
  selected?: number;
  isLoading?: boolean;
  swaps: Record<string, any>[];
  setSwaps: React.Dispatch<Record<string, any>[]>;
}

const WalletSwaps: React.FC<Props> = ({
  isLoading,
  selected,
  swaps,
  setSwaps,
}) => {
  const location = useLocation();
  const tonAddress = useTonAddress();
  const { t } = useTranslation();
  const { jettons, ton } = useContext(AppContext);

  const wallet = location.pathname.split("/").pop();

  const { data, isLoading: isLoadingJettons } = useQuery({
    queryKey: ["wallet-jettons", wallet],
    queryFn: async () =>
      await axios.get(`https://tonapi.io/v2/accounts/${wallet}/jettons`),
    enabled: !!wallet,
    refetchOnMount: false,
    refetchOnReconnect: false,
    select: (response) =>
      response.data.balances.filter(({ balance }) => parseFloat(balance)),
  });

  useEffect(() => {
    if (TonProofApi.accessToken) {
      if (selected && tonAddress) {
        axios
          .get(
            `https://api.fck.foundation/api/v2/user/swaps?address=${wallet}&jetton_id=${selected}&count=100`,
            {
              headers: {
                Authorization: `Bearer ${TonProofApi.accessToken}`,
              },
            }
          )
          .then((response) => {
            setSwaps(response.data.data.sources.DeDust.jettons[selected].swaps);
          });
      }
    }
    console.log(tonAddress, selected, wallet);
  }, [tonAddress, selected, wallet]);

  const dataJettons = useMemo(
    () =>
      jettons?.reduce((acc, curr) => {
        acc[curr.id] = curr;

        return acc;
      }, {}),
    [jettons]
  );

  return tonAddress ? (
    selected ? (
      <Card variant="bordered">
        <Card.Header>{t("swaps")}</Card.Header>
        <Card.Body css={{ p: "$0" }}>
          <Table
            className="chart-table"
            compact
            css={{
              height: "auto",
              minWidth: "100%",
              p: 0,
            }}
          >
            <Table.Header>
              <Table.Column>hash</Table.Column>
              <Table.Column>type</Table.Column>
              <Table.Column>ton</Table.Column>
              <Table.Column>x</Table.Column>
              <Table.Column>jetton</Table.Column>
              <Table.Column>time</Table.Column>
            </Table.Header>
            <Table.Body>
              {isLoadingJettons || (!!data?.length && isLoadingJettons) ? (
                new Array(3).fill(null).map((_, i) => (
                  <Table.Row key={i}>
                    <Table.Cell>
                      <Grid.Container justify="center">
                        <Grid>
                          <Loading />
                        </Grid>
                      </Grid.Container>
                    </Table.Cell>
                    <Table.Cell css={{ display: "none" }}>empty</Table.Cell>
                    <Table.Cell css={{ display: "none" }}>empty</Table.Cell>
                    <Table.Cell css={{ display: "none" }}>empty</Table.Cell>
                    <Table.Cell css={{ display: "none" }}>empty</Table.Cell>
                    <Table.Cell css={{ display: "none" }}>empty</Table.Cell>
                  </Table.Row>
                ))
              ) : !data?.length ? (
                <Table.Row key="empty">
                  <Table.Cell>
                    <Grid.Container justify="center">
                      <Grid>
                        <GEN17 style={{ fill: "currentColor", fontSize: 24 }} />
                      </Grid>
                      <Spacer x={0.4} />
                      <Grid>
                        <Text>{t("notFoundTokens")}</Text>
                      </Grid>
                    </Grid.Container>
                  </Table.Cell>
                  <Table.Cell css={{ display: "none" }}>empty</Table.Cell>
                  <Table.Cell css={{ display: "none" }}>empty</Table.Cell>
                  <Table.Cell css={{ display: "none" }}>empty</Table.Cell>
                  <Table.Cell css={{ display: "none" }}>empty</Table.Cell>
                  <Table.Cell css={{ display: "none" }}>empty</Table.Cell>
                </Table.Row>
              ) : (
                swaps.map((swap, i) => {
                  return (
                    <Table.Row key={i}>
                      <Table.Cell css={{ w: 50 }}>
                        <Grid.Container wrap="nowrap">
                          <Grid>{actions[swap.type]}</Grid>
                          <Spacer x={0.4} />
                          <Grid>
                            <Badge css={{ background: colorType[swap.type] }}>
                              {t(swap.type)}
                            </Badge>
                          </Grid>
                        </Grid.Container>
                      </Table.Cell>
                      <Table.Cell css={{ w: 10 }}>
                        {[
                          "buy",
                          "liquidity_deposit",
                          "liquidity_withdraw",
                        ].includes(swap.type)
                          ? `${parseFloat(parseFloat(swap.ton).toFixed(2))} TON`
                          : swap.type === "sell"
                          ? `${parseFloat(
                              parseFloat(swap.jettons).toFixed(
                                dataJettons[selected].decimals
                              )
                            )} 
                        ${dataJettons[selected].symbol}`
                          : null}
                      </Table.Cell>
                      <Table.Cell css={{ w: 10 }}>
                        {["sell", "buy"].includes(swap.type) ? (
                          <ARR33
                            style={{ fill: "currentColor", fontSize: 20 }}
                          />
                        ) : swap.type === "liquidity_withdraw" ? (
                          <ARR36
                            style={{ fill: "currentColor", fontSize: 20 }}
                          />
                        ) : (
                          <ARR37
                            style={{ fill: "currentColor", fontSize: 20 }}
                          />
                        )}
                      </Table.Cell>
                      <Table.Cell css={{ w: 10 }}>
                        {parseFloat(
                          parseFloat(swap.jettons).toFixed(
                            dataJettons[selected].decimals
                          )
                        )}{" "}
                        {dataJettons[selected].symbol}
                      </Table.Cell>
                      <Table.Cell css={{ w: 130 }}>
                        {moment(new Date(swap.time * 1000)).format(
                          "DD.MM.YY HH:mm"
                        )}
                      </Table.Cell>
                      <Table.Cell css={{ w: 50 }}>
                        <Link>
                          <Link
                            href={`https://tonscan.org/tx/${swap.hash}`}
                            target="_blank"
                          >
                            <Tonscan
                              style={{ fill: "currentColor", fontSize: 20 }}
                            />
                            <Text size={12} css={{ fontWeight: "bold" }}>
                              Tonscan
                            </Text>
                          </Link>
                        </Link>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              )}
            </Table.Body>
          </Table>
        </Card.Body>
      </Card>
    ) : (
      <>Empty swaps</>
    )
  ) : (
    <Grid.Container justify="center">
      <Grid xs={12} css={{ height: "fit-content" }}>
        <Card>
          <Card.Header>
            <GEN02 style={{ fill: "currentColor", fontSize: 24 }} />{" "}
            <Spacer x={0.4} /> {t("walletInfo")}
          </Card.Header>
          <Card.Body css={{ p: "$0" }}>
            <Button
              css={{ borderRadius: 0 }}
              onClick={() =>
                document.getElementById("tc-connect-button")?.click()
              }
            >
              {t("connectWallet")}
            </Button>
          </Card.Body>
        </Card>
      </Grid>
    </Grid.Container>
  );
};

export default WalletSwaps;
