import { use, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { getPvData } from '../data/pvLoader'
import { aggregateByCity } from '../data/pvStats'

const pvPromise = getPvData()

export default function PvChartConfirm() {
  const pvData = use(pvPromise)
  const cityStats = useMemo(() => {
    return aggregateByCity(pvData.features)
      .map((c) => ({
        ...c,
        confirm_rate: c.total_build_kw > 0
          ? +((c.total_confirm_kw / c.total_build_kw) * 100).toFixed(1)
          : 0,
      }))
      .sort((a, b) => b.confirm_rate - a.confirm_rate)
      .slice(0, 8)
  }, [pvData])

  const option = {
    grid: { top: 8, bottom: 20, left: 80, right: 40 },
    xAxis: {
      type: 'value', max: 100,
      axisLabel: { color: 'rgba(120,53,15,0.6)', fontSize: 9,
        formatter: (v: number) => `${v}%` },
      splitLine: { lineStyle: { color: 'rgba(234,179,8,0.15)' } },
    },
    yAxis: {
      type: 'category',
      data: cityStats.map((c) => c.city).reverse(),
      axisLabel: { color: '#78350f', fontSize: 10 },
    },
    series: [{
      type: 'bar',
      data: cityStats.map((c) => c.confirm_rate).reverse(),
      itemStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [{ offset: 0, color: '#16a34a' }, { offset: 1, color: '#4ade80' }] },
        borderRadius: [0, 3, 3, 0],
      },
      label: { show: true, position: 'right', color: 'rgba(22,163,74,0.85)', fontSize: 9,
        formatter: (p: { value: number }) => `${p.value}%` },
    }],
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,250,235,0.95)',
      borderColor: '#16a34a', textStyle: { color: '#166534', fontSize: 10 } },
  }

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
}
