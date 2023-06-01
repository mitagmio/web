import { JType } from 'contexts'
import { _ } from './number'

export const getList = (data: Record<number, any>, jettons?: JType[]) =>
  Object.keys({ ...data }).map((id) => {
    const stats = [
      ...(Array.isArray(data[parseInt(id)]) ? data[parseInt(id)] : [data[parseInt(id)] as Record<string, any>]),
    ].map((item) => ({
      value: _(item.price_close) || _(item.price_high) || _(item.price_low) || _(item.price_open),
      volume: item.volume,
    }))
    const jetton = jettons?.find((i) => i.id === parseInt(id))
    const chart = [...stats].map(({ value }: { value: number }, i: number) => ({
      value:
        i > 0 && value && stats[i - 1].value && stats[i - 1].value !== value
          ? stats[i - 1].value < value
            ? value && value - 100
            : value && value + 100
          : stats[stats.length - 1].value < value
          ? value && value + 100 * 10
          : value && value - 100 * 2,
    }))
    const volume = [...stats].reduce((acc, i) => (acc += i?.volume), 0)
    const percent = !!stats[stats.length - 1]?.value
      ? (stats[stats.length - 1]?.value - stats[0]?.value) / stats[0]?.value * 100
      : 0

    return {
      id: jetton?.id,
      name: jetton?.symbol || '',
      image: jetton?.image || '',
      price: stats[stats.length - 1]?.value || 0,
      chart,
      volume,
      percent,
      color: !isNaN(percent) && percent !== 0 ? (percent > 0 ? '#1ac964' : '#f31260') : 'gray',
    }
  })
