import { use, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { getPvData } from '../data/pvLoader'
import { globalStats } from '../data/pvStats'

const pvPromise = getPvData()

export default function PvChartType() {
  const pvData = use(pvPromise)
  const stats = useMemo(() => globalStats(pvData.features), [pvData])

  const option = {
    tooltip: { trigger: 'item', backgroundColor: 'rgba(255,250,235,0.95)',
      borderColor: '#d97706', textStyle: { color: '#78350f', fontSize: 10 } },
    legend: { bottom: 0, textStyle: { color: 'rgba(120,53,15,0.75)', fontSize: 10 } },
    series: [{
      type: 'pie',
      radius: ['40%', '68%'],
      center: ['50%', '42%'],
      data: [
        { value: stats.village_type_count.village, name: '村级电站',
          itemStyle: { color: '#f59e0b' } },
        { value: stats.village_type_count.joint, name: '联村电站',
          itemStyle: { color: '#f97316' } },
        { value: stats.village_type_count.central, name: '集中式',
          itemStyle: { color: '#2299ff' } },
      ],
      label: { color: '#78350f', fontSize: 10 },
      labelLine: { lineStyle: { color: 'rgba(217,119,6,0.5)' } },
    }],
  }

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
}
