import type { ComponentProps } from 'react'
import styled from 'styled-components'

const TitleWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
`

const Title = styled.div`
  font-size: 34px;
  letter-spacing: 8px;
  font-weight: 700;
  background: linear-gradient(to bottom, #d97706, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;

  &::after {
    content: 'INNER MONGOLIA PHOTOVOLTAIC AID LAYOUT MAP';
    display: block;
    font-size: 10px;
    letter-spacing: 4px;
    text-align: center;
    -webkit-text-fill-color: rgba(217, 119, 6, 0.55);
    margin-top: -4px;
  }
`

const Bg = styled.svg.attrs({
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 1920 82',
  width: '100%',
  height: '100%',
  preserveAspectRatio: 'none',
  children: (
    <>
      <defs>
        <radialGradient id="pvGradient" cx="50%" cy="50%" fx="100%" fy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <mask id="pvLine1">
          <circle r="100" cx="0" cy="0" fill="url(#pvGradient)">
            <animateMotion begin="0s" dur="3s" path="M0,60 L620,60 L670,80 L960,80" rotate="auto" keyPoints="0;1" keyTimes="0;1" repeatCount="indefinite" />
          </circle>
        </mask>
        <mask id="pvLine2">
          <circle r="100" cx="0" cy="0" fill="url(#pvGradient)">
            <animateMotion begin="0s" dur="3s" path="M1920,60 L1300,60 L1250,80 L960,80" rotate="auto" keyPoints="0;1" keyTimes="0;1" repeatCount="indefinite" />
          </circle>
        </mask>
      </defs>
      <path d="M0,0 L1920,0 L1920,60 L1300,60 L1250,80 L670,80 L620,60 L0,60 Z" fill="rgba(255,248,225,0.96)" />
      <path d="M0,60 L620,60 L670,80 L1250,80 L1300,60 L1920,60" fill="none" stroke="rgba(217,119,6,0.55)" strokeWidth="1" />
      <path d="M0,60 L620,60 L670,80 L960,80" fill="none" stroke="#f59e0b" strokeWidth="3" mask="url(#pvLine1)" />
      <path d="M1920,60 L1300,60 L1250,80 L960,80" fill="none" stroke="#f59e0b" strokeWidth="3" mask="url(#pvLine2)" />
    </>
  ),
})`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`

const DateTime = styled.div`
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(120, 53, 15, 0.72);
  font-size: 12px;
  letter-spacing: 1px;
  text-align: right;
  pointer-events: none;
`

function getDateStr() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export default function PvHeader(props: ComponentProps<typeof TitleWrapper>) {
  return (
    <TitleWrapper {...props}>
      <Bg />
      <Title>内蒙古自治区光伏帮扶重点工作布局图</Title>
      <DateTime>
        <div>{getDateStr()}</div>
        <div style={{ color: 'rgba(217,119,6,0.5)', fontSize: 10 }}>数据来源：确权明细表</div>
      </DateTime>
    </TitleWrapper>
  )
}
