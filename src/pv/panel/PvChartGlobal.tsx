import { use, useMemo } from 'react'
import { getPvData } from '../data/pvLoader'
import { globalStats } from '../data/pvStats'
import NumberAnimation from '@/components/numberAnimation'

const pvPromise = getPvData()

const StatItem = ({ label, value, unit, fractions }: { label: string; value: number; unit: string; fractions?: boolean }) => (
  <div style={{ textAlign: 'center', flex: 1 }}>
    <div style={{ fontSize: 20, fontWeight: 700, color: '#d97706', lineHeight: 1.2 }}>
      <NumberAnimation
        value={value}
        options={fractions ? { minimumFractionDigits: 1, maximumFractionDigits: 1 } : undefined}
        style={{ display: 'inline' }}
      />
      <span style={{ fontSize: 10, color: 'rgba(217,119,6,0.6)', marginLeft: 2 }}>{unit}</span>
    </div>
    <div style={{ fontSize: 10, color: 'rgba(120,53,15,0.55)', marginTop: 2 }}>{label}</div>
  </div>
)

function ProgressBar({ buildMw, confirmMw }: { buildMw: number; confirmMw: number }) {
  const rate = buildMw > 0 ? Math.min(confirmMw / buildMw, 1) : 0
  const pct = (rate * 100).toFixed(1)

  return (
    <div style={{ padding: '6px 4px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(120,53,15,0.5)', marginBottom: 4 }}>
        <span>建设规模 {buildMw.toFixed(1)} MW</span>
        <span style={{ color: '#16a34a' }}>确权率 {pct}%</span>
      </div>
      <div style={{ height: 6, background: 'rgba(234,179,8,0.18)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${rate * 100}%`,
          background: 'linear-gradient(to right, #d97706, #4ade80)',
          borderRadius: 3,
          transition: 'width 1.2s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(120,53,15,0.4)', marginTop: 3 }}>
        <span>0</span>
        <span style={{ color: '#16a34a' }}>已确权 {confirmMw.toFixed(1)} MW</span>
      </div>
    </div>
  )
}

export default function PvChartGlobal() {
  const pvData = use(pvPromise)
  const stats = useMemo(() => globalStats(pvData.features), [pvData])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <StatItem label="覆盖村庄" value={stats.village_count} unit="个" />
        <StatItem label="电站总数" value={stats.station_count} unit="座" />
        <StatItem label="建设规模" value={stats.total_build_mw} unit="MW" fractions />
        <StatItem label="确权规模" value={stats.total_confirm_mw} unit="MW" fractions />
        <StatItem label="贫困村数" value={stats.poor_village_count} unit="个" />
      </div>
      <ProgressBar buildMw={stats.total_build_mw} confirmMw={stats.total_confirm_mw} />
    </div>
  )
}
