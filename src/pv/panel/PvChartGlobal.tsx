import { use, useMemo } from 'react'
import { getPvData } from '../data/pvLoader'
import { globalStats } from '../data/pvStats'
import NumberAnimation from '@/components/numberAnimation'

const pvPromise = getPvData()

const StatItem = ({ label, value, unit }: { label: string; value: number; unit: string }) => (
  <div style={{ textAlign: 'center', flex: 1 }}>
    <div style={{ fontSize: 22, fontWeight: 700, color: '#d97706', lineHeight: 1.2 }}>
      <NumberAnimation
        value={value}
        options={unit === 'MW' ? { minimumFractionDigits: 1, maximumFractionDigits: 1 } : undefined}
        style={{ display: 'inline' }}
      />
      <span style={{ fontSize: 11, color: 'rgba(217,119,6,0.6)', marginLeft: 2 }}>{unit}</span>
    </div>
    <div style={{ fontSize: 10, color: 'rgba(120,53,15,0.55)', marginTop: 2 }}>{label}</div>
  </div>
)

export default function PvChartGlobal() {
  const pvData = use(pvPromise)
  const stats = useMemo(() => globalStats(pvData.features), [pvData])

  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
      <StatItem label="覆盖村庄" value={stats.village_count} unit="个" />
      <StatItem label="电站总数" value={stats.station_count} unit="座" />
      <StatItem label="建设规模" value={stats.total_build_mw} unit="MW" />
      <StatItem label="确权规模" value={stats.total_confirm_mw} unit="MW" />
      <StatItem label="贫困村数" value={stats.poor_village_count} unit="个" />
    </div>
  )
}
