import styled from 'styled-components'
import { usePvStore } from '../pvStore'

const Overlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 80px;
  right: 20px;
  width: 320px;
  background: rgba(255, 250, 235, 0.96);
  border: 1px solid rgba(217, 119, 6, 0.45);
  border-radius: 6px;
  padding: 14px;
  z-index: 9999;
  pointer-events: auto;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transform: ${(p) => (p.$visible ? 'translateX(0)' : 'translateX(120%)')};
  transition: all 0.3s ease;
  color: #78350f;
  font-size: 12px;

  &::before {
    content: '';
    position: absolute;
    top: -1px; left: -1px;
    width: 10px; height: 10px;
    border-top: 2px solid #d97706;
    border-left: 2px solid #d97706;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -1px; right: -1px;
    width: 10px; height: 10px;
    border-bottom: 2px solid #d97706;
    border-right: 2px solid #d97706;
    pointer-events: none;
  }
`

const Title = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(217, 119, 6, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid rgba(234, 179, 8, 0.15);
  color: rgba(120, 53, 15, 0.8);
`

const Tag = styled.span<{ color: string }>`
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 2px;
  background: ${(p) => p.color}22;
  border: 1px solid ${(p) => p.color}88;
  color: ${(p) => p.color};
`

const StationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(234, 179, 8, 0.1);
  font-size: 11px;
  color: rgba(120, 53, 15, 0.75);
`

function stationColor(type: string) {
  if (type === '村级电站') return '#f59e0b'
  if (type === '联村电站') return '#f97316'
  return '#2299ff'
}

export default function PvVillageDetail() {
  const village = usePvStore((s) => s.selectedVillage)
  const setVillage = usePvStore((s) => s.setSelectedVillage)

  return (
    <Overlay $visible={!!village}>
      {village && (
        <>
          <Title>
            <span>{village.village}（{village.county}）</span>
            <span
              style={{ cursor: 'pointer', color: 'rgba(120,53,15,0.4)', fontSize: 18, lineHeight: 1 }}
              onClick={() => setVillage(null)}>
              ×
            </span>
          </Title>
          <Row><span>所在市</span><span>{village.city}</span></Row>
          <Row><span>乡镇</span><span>{village.town}</span></Row>
          <Row>
            <span>贫困村</span>
            <Tag color={village.is_poor === '是' ? '#dc2626' : '#6b7280'}>
              {village.is_poor}
            </Tag>
          </Row>
          <Row><span>电站数</span><span>{village.station_count} 座</span></Row>
          <Row>
            <span>建设规模</span>
            <span style={{ color: '#d97706', fontWeight: 600 }}>{village.total_build_kw.toLocaleString()} 千瓦</span>
          </Row>
          <Row>
            <span>确权规模</span>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>{village.total_confirm_kw.toLocaleString()} 千瓦</span>
          </Row>

          <div style={{ marginTop: 10, marginBottom: 6, fontSize: 11, color: 'rgba(120,53,15,0.5)' }}>
            电站列表
          </div>
          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
            {village.stations.map((s, i) => (
              <StationRow key={i}>
                <Tag color={stationColor(s.station_type)}>{s.station_type}</Tag>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.station_name}
                </span>
                <span style={{ whiteSpace: 'nowrap', color: s.is_confirmed === '是' ? '#16a34a' : '#f97316' }}>
                  {s.confirm_scale}千瓦
                </span>
              </StationRow>
            ))}
          </div>
        </>
      )}
    </Overlay>
  )
}
