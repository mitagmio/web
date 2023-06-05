import {
  Badge,
  Button,
  Card,
  Grid,
  Input,
  Loading,
  Modal,
  Spacer,
  Text,
  User,
} from "@nextui-org/react";
import {
  useTonAddress,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { GEN03, Payment } from "assets/icons";
import { AppContext } from "contexts";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { JettonMaster } from "ton";
import { Address } from "ton-core";
import { payJetton, whiteCoins } from "utils";
import moment from "moment";

export const Promote: React.FC<{
  voteId?: number;
  hideTrigger?: boolean;
  processing?: Record<string, any>;
  onSuccess: (value: number) => void;
  setVoteId: (value?: number) => void;
}> = ({ hideTrigger, voteId, processing, onSuccess, setVoteId }) => {
  const { t } = useTranslation();
  const address = useTonAddress();
  const wallet = useTonWallet();
  const { jettons, client } = useContext(AppContext);
  const [tonConnectUi] = useTonConnectUI();
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<{ id: number; amount: number }[]>(
    []
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!visible) {
      setSelected([]);
      setVoteId(undefined);
    }
  }, [visible]);

  useEffect(() => {
    if (voteId) {
      setVisible(true);
      setSelected([{ id: voteId, amount: 1 }]);
    }
  }, [voteId]);
  const onPromote = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };
  const onVote = () => {
    if (!address) {
      document.getElementById("tc-connect-button")?.click();
    } else {
      if (wallet) {
        const jetton = Address.parseRaw(whiteCoins["FCK"]);
        const masterContract = JettonMaster.create(jetton);
        const master = client.open(masterContract);

        master
          .getWalletAddress(Address.parseRaw(wallet.account.address))
          .then((addr) => {
            tonConnectUi
              .sendTransaction(
                payJetton({
                  selected,
                  address: addr,
                  forward: address,
                  coin: "FCK",
                  to: "EQBjTg5KAKakMQ_BT_DVkUWMGhhiqW0ADppVOLnF3m7sNv5P",
                })
              )
              .finally(() => {
                onSuccess(
                  selected.reduce((acc, curr) => (acc += curr.amount), 0)
                );
                setSelected([]);
                setVisible(false);
              });
          });
      }
    }
  };
  return (
    <>
      {!hideTrigger && (
        <Button color="gradient" onClick={onPromote}>
          <Grid.Container alignItems="center">
            {!!processing?.wait ? (
              <>
                <Grid css={{ display: "flex" }}>
                  <Loading size="xs" />
                </Grid>
                <Spacer x={0.4} />
              </>
            ) : (
              <>
                <Grid css={{ display: "flex" }}>
                  <GEN03
                    style={{
                      fill: "currentColor",
                      fontSize: 18,
                    }}
                  />
                </Grid>
                <Spacer x={0.4} />
              </>
            )}
            <Grid>
              {t(processing?.wait ? "voteProcessing" : "promoteToken")}
            </Grid>
          </Grid.Container>
        </Button>
      )}
      <Modal
        width="500px"
        closeButton
        aria-labelledby="modal-title"
        open={visible}
        css={{ overflow: "visible" }}
        onClose={onClose}
      >
        <Modal.Header
          css={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            background: "var(--nextui-colors-accents0)",
          }}
        >
          <Grid.Container direction="column">
            <Grid>
              <Text size={18}>{t("promoteToken")}</Text>
            </Grid>
            <Spacer y={0.4} />
            <Grid>
              <Text size={16}>
                {t("promoteInfo").replace(
                  "$1",
                  moment(Date.now() + 86400 * 7).format("DD.MM.YY HH:mm")
                )}
              </Text>
            </Grid>
          </Grid.Container>
        </Modal.Header>
        <Modal.Body
          css={{
            background: "var(--nextui--navbarBlurBackgroundColor)",
            backdropFilter: "saturate(180%) blur(var(--nextui--navbarBlur))",
          }}
        >
          <Grid.Container justify="space-between" gap={1}>
            <Grid xs={12}>
              <Input
                value={search}
                placeholder={t("searchToken") || ""}
                css={{ w: "100%" }}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
            {jettons
              ?.filter(({ id, address, name, symbol }) =>
                voteId && !search
                  ? id === voteId
                  : search
                  ? address.toLowerCase().includes(search.toLowerCase()) ||
                    symbol.toLowerCase().includes(search.toLowerCase()) ||
                    name.toLowerCase().includes(search.toLowerCase())
                  : true
              )
              ?.map((jetton) => {
                const item = selected.find(
                  ({ id, amount }) => id === jetton.id
                );

                return (
                  <Grid xs={12} sm={voteId ? 12 : 6}>
                    <Grid.Container wrap="nowrap" alignItems="center">
                      <Grid xs={12}>
                        <Card
                          color="primary"
                          variant={
                            selected.some(({ id }) => id === jetton.id)
                              ? "bordered"
                              : undefined
                          }
                          isPressable
                          isHoverable
                          onClick={() =>
                            setSelected((prevState) =>
                              prevState.some(({ id }) => id === jetton.id)
                                ? prevState.filter((i) => i.id !== jetton.id)
                                : [...prevState, { id: jetton.id, amount: 1 }]
                            )
                          }
                        >
                          <Card.Body css={{ pl: 0, pt: "$4", pb: "$4" }}>
                            <Grid.Container
                              alignItems="center"
                              justify="space-between"
                              wrap="nowrap"
                            >
                              <Grid css={{ display: "flex" }}>
                                <User
                                  src={jetton.image}
                                  name={
                                    <div
                                      style={{
                                        maxWidth: 50,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {jetton.symbol}
                                    </div>
                                  }
                                />
                              </Grid>
                              <Grid>
                                {!item && (
                                  <Badge
                                    variant="flat"
                                    color="primary"
                                    css={{ flexWrap: "nowrap", p: "$2 $4" }}
                                  >
                                    <GEN03
                                      style={{
                                        fill: "currentColor",
                                        fontSize: 18,
                                      }}
                                    />
                                    <Spacer x={0.4} />
                                    {jetton.stats.promoting_points}
                                  </Badge>
                                )}
                              </Grid>
                            </Grid.Container>
                          </Card.Body>
                        </Card>
                      </Grid>
                      {item && (
                        <>
                          <Spacer x={0.4} />
                          <Grid>
                            <Grid.Container alignItems="center" wrap="nowrap">
                              <Grid>
                                <GEN03
                                  style={{
                                    fill: "var(--nextui-colors-primary)",
                                    fontSize: 18,
                                  }}
                                />
                              </Grid>
                              <Spacer x={0.4} />
                              <Grid>
                                <Input
                                  size="sm"
                                  type="number"
                                  min={1}
                                  width="55px"
                                  value={item?.amount}
                                  onChange={(e) =>
                                    setSelected((prevState) =>
                                      prevState.map((sel, x) => ({
                                        ...sel,
                                        ...(sel.id === item.id && {
                                          amount: parseInt(
                                            e.currentTarget.value
                                          ),
                                        }),
                                      }))
                                    )
                                  }
                                />
                              </Grid>
                            </Grid.Container>
                          </Grid>
                        </>
                      )}
                    </Grid.Container>
                  </Grid>
                );
              })}
          </Grid.Container>
        </Modal.Body>
        <Modal.Footer
          css={{
            position: "sticky",
            zIndex: 2,
            bottom: 0,
            background: "var(--nextui-colors-accents0)",
          }}
        >
          <Grid.Container justify="center" alignItems="center">
            <Grid>
              <Badge>
                {selected.reduce((acc, curr) => (acc += curr.amount), 0)} FCK
              </Badge>
            </Grid>
            <Spacer x={0.4} />
            <Grid>
              <Button
                size="sm"
                flat
                css={{ minWidth: "auto" }}
                onClick={!processing?.wait ? onVote : undefined}
              >
                <Grid.Container alignItems="center">
                  {!!processing?.wait ? (
                    <>
                      <Grid css={{ display: "flex" }}>
                        <Loading size="xs" />
                      </Grid>
                      <Spacer x={0.4} />
                    </>
                  ) : (
                    <>
                      <Grid>
                        <Payment
                          style={{
                            fill: "currentColor",
                            fontSize: 18,
                          }}
                        />
                      </Grid>
                      <Spacer x={0.4} />
                    </>
                  )}
                  <Grid>{t(processing?.wait ? "voteProcessing" : "pay")}</Grid>
                </Grid.Container>
              </Button>
            </Grid>
          </Grid.Container>
        </Modal.Footer>
      </Modal>
    </>
  );
};
