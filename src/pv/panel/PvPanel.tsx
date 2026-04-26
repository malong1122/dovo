import { Suspense, useEffect } from 'react'
import styled from 'styled-components'
import useMoveTo from '@/hooks/useMoveTo'
import AutoFit from '@/components/autoFit'
import { usePvStore } from '../pvStore'
import PvHeader from './PvHeader'
import PvFooter from './PvFooter'
import PvChartGlobal from './PvChartGlobal'
import PvChartCityRank from './PvChartCityRank'
import PvChartType from './PvChartType'
import PvChartConfirm from './PvChartConfirm'
import PvVillageDetail from './PvVillageDetail'

const GridWrapper = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(6, minmax(0, 1fr));
  gap: 12px;
  padding: 12px 16px;
`

const Card = styled.div`
  position: relative;
  background: rgba(255, 250, 235, 0.72);
  border: 1px solid rgba(234, 179, 8, 0.22);
  padding: 12px;
  backdrop-filter: blur(4px);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  z-index: 9999;
  transition: border-color 0.3s;

  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    width: 10px;
    height: 10px;
    border-top: 2px solid #d97706;
    border-left: 2px solid #d97706;
    transition: all 0.3s ease;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    right: -1px;
    width: 10px;
    height: 10px;
    border-bottom: 2px solid #d97706;
    border-right: 2px solid #d97706;
    transition: all 0.3s ease;
    pointer-events: none;
  }

  &:hover {
    border-color: rgba(234, 179, 8, 0.4);
  }

  &:hover::before,
  &:hover::after {
    width: 100%;
    height: 100%;
    opacity: 0.3;
  }
`

const CardTitle = styled.div`
  font-size: 13px;
  margin-bottom: 8px;
  padding-left: 8px;
  border-left: 3px solid #f59e0b;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #78350f;

  span {
    font-size: 9px;
    color: rgba(120, 53, 15, 0.42);
    font-weight: normal;
    letter-spacing: 1px;
  }
`

export default function PvPanel() {
  const topBox   = useMoveTo('toBottom', 0.6)
  const leftBox  = useMoveTo('toRight', 0.8, 0.5)
  const leftBox1 = useMoveTo('toRight', 0.8, 0.6)
  const rightBox  = useMoveTo('toLeft', 0.8, 0.5)
  const rightBox1 = useMoveTo('toLeft', 0.8, 0.6)
  const bottomBox = useMoveTo('toTop', 0.8, 0.5)

  useEffect(() => {
    const unsub = usePvStore.subscribe(
      (s) => s.mapPlayComplete,
      (v) => {
        if (v) {
          topBox.restart(); bottomBox.restart()
          leftBox.restart(); leftBox1.restart()
          rightBox.restart(); rightBox1.restart()
        }
      }
    )
    return unsub
  }, [])

  return (
    <AutoFit>
      <PvHeader ref={topBox.ref} />
      <GridWrapper>
        {/* 左列：全局统计 + 盟市排行 */}
        <Card ref={leftBox.ref} style={{ gridArea: '1 / 1 / 3 / 2' }}>
          <CardTitle>全区总览<span>OVERVIEW</span></CardTitle>
          <Suspense fallback={null}><PvChartGlobal /></Suspense>
        </Card>
        <Card ref={leftBox1.ref} style={{ gridArea: '3 / 1 / 7 / 2' }}>
          <CardTitle>盟市建设规模排行<span>CITY RANKING (MW)</span></CardTitle>
          <Suspense fallback={null}><PvChartCityRank /></Suspense>
        </Card>

        {/* 右列：电站类型 + 确权率 */}
        <Card ref={rightBox.ref} style={{ gridArea: '1 / 4 / 4 / 5' }}>
          <CardTitle>电站类型分布<span>TYPE DISTRIBUTION</span></CardTitle>
          <Suspense fallback={null}><PvChartType /></Suspense>
        </Card>
        <Card ref={rightBox1.ref} style={{ gridArea: '4 / 4 / 7 / 5' }}>
          <CardTitle>各市确权率<span>CONFIRMATION RATE</span></CardTitle>
          <Suspense fallback={null}><PvChartConfirm /></Suspense>
        </Card>
      </GridWrapper>
      <PvFooter ref={bottomBox.ref} />
      <PvVillageDetail />
    </AutoFit>
  )
}
