import { use, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { getPvData } from '../data/pvLoader'
import { aggregateByCity } from '../data/pvStats'

const pvPromise = getPvData()

export default function PvChartCityRank() {
  const pvData = use(pvPromise)
  const cityStats = useMemo(() => aggregateByCity(pvData.features).slice(0, 8), [pvData])

  const option = {
    grid: { top: 8, bottom: 20, left: 80, right: 40 },
    xAxis: {
      type: 'value',
      axisLabel: { color: 'rgba(120,53,15,0.6)', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(234,179,8,0.15)' } },
    },
    yAxis: {
      type: 'category',
      data: cityStats.map((c) => c.city).reverse(),
      axisLabel: { color: '#78350f', fontSize: 10 },
    },
    series: [
      {
        type: 'bar',
        data: cityStats.map((c) => (c.total_build_kw / 1000).toFixed(1)).reverse(),
        itemStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [{ offset: 0, color: '#d97706' }, { offset: 1, color: '#fbbf24' }] },
          borderRadius: [0, 3, 3, 0],
        },
        label: { show: true, position: 'right', color: 'rgba(120,53,15,0.7)', fontSize: 9,
          formatter: (p: { value: number }) => `${p.value}MW` },
      },
    ],
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,250,235,0.95)',
      borderColor: '#d97706', textStyle: { color: '#78350f', fontSize: 10 } },
  }

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
}
