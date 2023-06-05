import { Address, beginCell, toNano } from "ton-core";

export const whiteCoins = {
  FCK: "0:3a4d2191094e3a33d4601efa51bb52dc5baa354516e162b7706955385f8144a7",
};

const coins = {
  FCK: Math.pow(10, 5),
};

export const payJetton = ({
  selected,
  address,
  forward,
  coin,
  to,
}: {
  selected: { id: number; amount: number }[];
  address: Address;
  forward: string;
  coin: "FCK";
  to: string;
}) => {
  return {
    validUntil: Date.now() + 1000000,
    messages: selected.map(({ id, amount }) => {
      const message = beginCell()
        .storeUint(0xf8a7ea5, 32)
        .storeUint(0, 64)
        .storeCoins(amount * coins[coin])
        .storeAddress(Address.parse(to))
        .storeAddress(Address.parse(forward))
        .storeUint(0, 1)
        .storeCoins(1)
        .storeUint(0, 1)
        .storeUint(0, 32)
        .storeStringTail(id.toString())
        .endCell();

      return {
        address: address.toString(),
        amount: toNano("0.1").toString(),
        payload: message.toBoc().toString("base64"),
      };
    }),
  };
};
