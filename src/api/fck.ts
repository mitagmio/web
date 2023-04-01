import axios from 'libs/axios'

export const fck = {
  getJettons: async () => {
    const { data } = await axios.get(`https://api.fck.foundation/api/v1/jettons`)
    return data.data
  },
  getAnalytics: async (jetton_ids: string, time: number, timescale: number) => {
    const { data } = await axios.get(
      `https://api.fck.foundation/api/v2/analytics?jetton_ids=${jetton_ids}&time_min=${time}&timescale=${timescale}`
    )
    return data
  },
}
