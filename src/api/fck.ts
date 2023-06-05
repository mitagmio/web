import axios from "libs/axios";

export const fck = {
  getJettons: async () => {
    const { data } = await axios.get(
      `https://api.fck.foundation/api/v1/jettons`
    );
    return data.data;
  },
  getAnalytics: async (jetton_ids: string, time: number, timescale: number) => {
    const { data } = await axios.get(
      `https://api.fck.foundation/api/v2/analytics?jetton_ids=${jetton_ids}&time_min=${time}&timescale=${timescale}`
    );
    return data;
  },
  getRecentlyAdded: async (count) => {
    const { data } = await axios.get(
      `https://api.fck.foundation/api/v2/analytics/preview/recentlyAdded?onlyJettons=true&count=${count}`
    );
    return data;
  },
  getPromoting: async (count) => {
    const { data } = await axios.get(
      `https://api.fck.foundation/api/v2/analytics/preview/promoting?onlyJettons=true&count=${count}`
    );
    return data;
  },
  getTrending: async (count) => {
    const { data } = await axios.get(
      `https://api.fck.foundation/api/v2/analytics/preview/trending?onlyJettons=true&count=${count}`
    );
    return data;
  },
  getSwapsCount: async (jetton_ids: string, time: number) => {
    const { data } = await axios.get(
      `https://api.fck.foundation/api/v2/analytics/swaps/count?jetton_ids=${jetton_ids}&time_min=${time}`
    );
    return data;
  },
};
