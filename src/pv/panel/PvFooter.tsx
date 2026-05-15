import type { ComponentProps } from 'react'
import styled from 'styled-components'
import { usePvStore } from '../pvStore'

const Wrapper = styled.div`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  background: rgba(255, 248, 225, 0.92);
  border-top: 1px solid rgba(217, 119, 6, 0.35);
  pointer-events: auto;
  flex-shrink: 0;
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: rgba(120, 53, 15, 0.8);
`

const Dot = styled.div<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: ${(p) => p.color};
  box-shadow: 0 0 6px ${(p) => p.color};
`

export default function PvFooter(props: ComponentProps<typeof Wrapper>) {
  const selectedCity = usePvStore((s) => s.selectedCity)

  return (
    <Wrapper {...props}>
      {selectedCity ? (
        <>
          <LegendItem><Dot color="#f59e0b" />村级电站</LegendItem>
          <LegendItem><Dot color="#f97316" />联村电站</LegendItem>
          <LegendItem><Dot color="#2299ff" />集中式电站</LegendItem>
          <LegendItem style={{ marginLeft: 16, color: 'rgba(120,53,15,0.55)', fontSize: 10 }}>
            当前：{selectedCity}
          </LegendItem>
          <LegendItem
            style={{ marginLeft: 8, color: '#d97706', fontSize: 10, cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => usePvStore.getState().setSelectedCity(null)}>
            返回总览
          </LegendItem>
        </>
      ) : (
        <>
          <LegendItem><Dot color="#ff8f00" />盟市汇总</LegendItem>
          <LegendItem style={{ color: 'rgba(120,53,15,0.45)', fontSize: 10 }}>
            点击盟市柱进入村级视图
          </LegendItem>
        </>
      )}
    </Wrapper>
  )
}
