import type { ComponentProps } from "react";
import styled from "styled-components";
import { useAppStore } from "@/stores";

const Wrapper = styled.div`
  position: absolute;
  bottom: 0;
  height: 112px;
  width: 100%;
`;

const Buttons = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 30px;
  z-index: 10;
  padding-bottom: 20px;
`;

const Button = styled.button<{ $active?: boolean }>`
  pointer-events: auto;
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(234, 88, 12, 0.2);
  color: #d35400;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(234, 88, 12, 0.1) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    transform: translateY(-5px) scale(1.1);
    border-color: #ff6715;
    box-shadow: 0 0 15px rgba(255, 103, 21, 0.4);
    color: #ff6715;
  }

  &:hover::before {
    opacity: 1;
  }

  ${(props) =>
    props.$active &&
    `
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #ff6715 0%, #ff8c00 100%);
      color: white !important;
      border: none;
      box-shadow: 0 4px 15px rgba(255, 103, 21, 0.5);
      margin-bottom: 5px;
    `}
`;

const Bg = () => (
  <svg viewBox="0 0 1920 100" preserveAspectRatio="none" width="100%" height="100%">
    <defs>
      <linearGradient id="grad-bottom" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fff5e8" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#fff5e8" stopOpacity="1" />
      </linearGradient>
    </defs>
    <path d="M0,100 H1920 V100 Q1600,100 1450,100 Q1300,80 1200,60 Q960,10 720,60 Q620,80 470,100 Q320,100 0,100 Z" fill="url(#grad-bottom)" stroke="none" />
    <path d="M0,100 Q320,100 470,100 Q620,80 720,60 Q960,10 1200,60 Q1300,80 1450,100 Q1600,100 1920,100" fill="none" stroke="#ff6715" strokeWidth="1" strokeOpacity="0.4" />
    <path d="M720,60 Q960,10 1200,60" fill="none" stroke="#ff6715" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function Footer(props: ComponentProps<typeof Wrapper>) {
  const { cloud, rotation, mode, heat, bar, toggle } = useAppStore();

  return (
    <Wrapper {...props}>
      <Bg />
      <Buttons>
        <Button $active={cloud} onClick={() => toggle("cloud")} title="云层光晕">
          <svg fill="currentColor" viewBox="0 0 1024 1024" width="24" height="24"><path d="M746.666667 725.333333c59.733333-12.8 106.666667-64 106.666666-128 0-72.533333-55.466667-128-128-128-17.066667 0-29.866667 4.266667-42.666666 8.533334V469.333333c0-93.866667-76.8-170.666667-170.666667-170.666666s-170.666667 76.8-170.666667 170.666666c0 17.066667 4.266667 29.866667 4.266667 46.933334-8.533333-4.266667-17.066667-4.266667-25.6-4.266667C260.266667 512 213.333333 558.933333 213.333333 618.666667S260.266667 725.333333 320 725.333333h426.666667z"></path></svg>
        </Button>
        <Button $active={rotation} onClick={() => toggle("rotation")} title="旋转底盘">
          <svg fill="currentColor" viewBox="0 0 1024 1024" width="24" height="24"><path d="M492.416 658.176L230.826667 504.32V196.565333L492.373333 42.666667l261.589334 153.898666v307.754667l-261.589334 153.856z"></path></svg>
        </Button>
        <Button $active={!mode} onClick={() => toggle("mode")} title="纯净模式">
          <svg fill="currentColor" viewBox="0 0 1024 1024" width="24" height="24"><path d="M512 21.333333l156.138667 334.528L1002.666667 512l-334.528 156.138667L512 1002.666667l-156.138667-334.528L21.333333 512l334.528-156.138667L512 21.333333z"></path></svg>
        </Button>
        <Button $active={heat} onClick={() => toggle("heat")} title="热力分布">
          <svg fill="currentColor" viewBox="0 0 1024 1024" width="24" height="24"><path d="M781.981888 1014.033538C649.277769 945.497049 431.312619 990.61918 298.608501 972.93895 165.904382 955.25872 80.23377 832.725854 35.111639 706.301971 113.136746 295.287826 270.483965 302.387223 427.899447 309.691411 582.720919 27.558632 862.874059 217.126192 838.367485 287.574057 796.863316 425.32967 963.357836 601.858915 914.686006 1082.706555 781.981888 1014.033538Z"></path></svg>
        </Button>
        <Button $active={bar} onClick={() => toggle("bar")} title="城市光柱">
          <svg fill="currentColor" viewBox="0 0 1024 1024" width="24" height="24"><path d="M211.176727 809.425455a34.909091 34.909091 0 0 1-34.909091-34.909091V367.522909a34.909091 34.909091 0 0 1 69.818182 0v406.993455a34.909091 34.909091 0 0 1-34.909091 34.909091z m329.821091-34.909091V90.298182a34.909091 34.909091 0 0 0-69.818182 0v684.218182a34.909091 34.909091 0 0 0 69.818182 0z m289.000727 0V367.522909a34.909091 34.909091 0 0 0-69.818181 0v406.993455a34.909091 34.909091 0 0 0 69.818181 0zM977.454545 933.701818a34.909091 34.909091 0 0 0-34.90909-34.909091H81.454545a34.909091 34.909091 0 0 0 0 69.818182h861.09091a34.909091 34.909091 0 0 0 34.90909-34.909091z"></path></svg>
        </Button>
      </Buttons>
    </Wrapper>
  );
}
