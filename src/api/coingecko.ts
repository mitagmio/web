import axios from 'libs/axios'

export const coingecko = {
  getData: async () => {
    const { data } = await axios.get(`https://api.coingecko.com/api/v3/coins/the-open-network`)
    return data
  },
}
