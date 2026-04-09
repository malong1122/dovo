import { useEffect } from "react";
import styled from "styled-components";
import useMoveTo from "@/hooks/useMoveTo";
import AutoFit from "@/components/autoFit";
import { useAppStore } from "@/stores";
import Header from "./header";
import Footer from "./footer";
import Chart1 from "./chart1";
import Chart2 from "./chart2";
import Chart3 from "./chart3";
import Chart4 from "./chart4";
import Chart5 from "./chart5";
import Chart6 from "./chart6";

const GridWrapper = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(6, minmax(0, 1fr));
  gap: 12px;
  padding: 12px 16px;
`;

const Card = styled.div`
  position: relative;
  background: rgba(255, 248, 239, 0.68);
  border: 1px solid rgba(234, 88, 12, 0.22);
  padding: 12px;
  backdrop-filter: blur(4px);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  z-index: 9999;
  transition: border-color 0.3s;

  &::before {
    content: "";
    position: absolute;
    top: -1px;
    left: -1px;
    width: 10px;
    height: 10px;
    border-top: 2px solid #ea580c;
    border-left: 2px solid #ea580c;
    transition: all 0.3s ease;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -1px;
    right: -1px;
    width: 10px;
    height: 10px;
    border-bottom: 2px solid #ea580c;
    border-right: 2px solid #ea580c;
    transition: all 0.3s ease;
    pointer-events: none;
  }

  &:hover {
    border-color: rgba(234, 88, 12, 0.38);
  }

  &:hover::before,
  &:hover::after {
    width: 100%;
    height: 100%;
    opacity: 0.3;
  }
`;

const CardTitle = styled.div`
  font-size: 13px;
  margin-bottom: 8px;
  padding-left: 8px;
  border-left: 3px solid #fdb961;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--color-text);

  span {
    font-size: 9px;
    color: rgba(90, 74, 66, 0.42);
    font-weight: normal;
    letter-spacing: 1px;
  }
`;

export default function Panel() {
  const topBox = useMoveTo("toBottom", 0.6);
  const leftBox = useMoveTo("toRight", 0.8, 0.5);
  const leftBox1 = useMoveTo("toRight", 0.8, 0.6);
  const leftBox2 = useMoveTo("toRight", 0.8, 0.7);
  const rightBox = useMoveTo("toLeft", 0.8, 0.5);
  const rightBox1 = useMoveTo("toLeft", 0.8, 0.6);
  const rightBox2 = useMoveTo("toLeft", 0.8, 0.7);
  const bottomBox = useMoveTo("toTop", 0.8, 0.5);

  useEffect(() => {
    const unMapPlaySub = useAppStore.subscribe(
      (s) => s.mapPlayComplete,
      (v) => {
        if (v) {
          topBox.restart();
          bottomBox.restart();
          leftBox.restart();
          leftBox1.restart();
          leftBox2.restart();
          rightBox.restart();
          rightBox1.restart();
          rightBox2.restart();
        }
      }
    );

    const unModeSub = useAppStore.subscribe(
      (s) => s.mode,
      (v) => {
        if (v) {
          topBox.reverse();
          leftBox.reverse();
          leftBox1.reverse();
          leftBox2.reverse();
          rightBox.reverse();
          rightBox1.reverse();
          rightBox2.reverse();
        } else {
          topBox.restart();
          leftBox.restart();
          leftBox1.restart();
          leftBox2.restart();
          rightBox.restart();
          rightBox1.restart();
          rightBox2.restart();
        }
      }
    );

    return () => {
      unMapPlaySub();
      unModeSub();
    };
  }, []);

  return (
    <AutoFit>
      <Header ref={topBox.ref} />
      <GridWrapper>
        <Card ref={leftBox.ref} style={{ gridArea: "1 / 1 / 3 / 2" }}>
          <CardTitle>企业类型分布<span>TYPE DISTRIBUTION</span></CardTitle>
          <Chart1 />
        </Card>
        <Card ref={leftBox1.ref} style={{ gridArea: "3 / 1 / 5 / 2" }}>
          <CardTitle>地区企业排行<span>REGION RANKING</span></CardTitle>
          <Chart2 />
        </Card>
        <Card ref={leftBox2.ref} style={{ gridArea: "5 / 1 / 7 / 2" }}>
          <CardTitle>产业链环节<span>SUPPLY CHAIN</span></CardTitle>
          <Chart4 />
        </Card>
        <Card ref={rightBox.ref} style={{ gridArea: "1 / 4 / 3 / 5" }}>
          <CardTitle>企业规模分布<span>SCALE DISTRIBUTION</span></CardTitle>
          <Chart6 />
        </Card>
        <Card ref={rightBox1.ref} style={{ gridArea: "3 / 4 / 5 / 5" }}>
          <CardTitle>各地年产量对比<span>ANNUAL OUTPUT</span></CardTitle>
          <Chart5 />
        </Card>
        <Card ref={rightBox2.ref} style={{ gridArea: "5 / 4 / 7 / 5", display: "flex", flexDirection: "column" }}>
          <CardTitle>企业列表<span>ENTERPRISE LIST</span></CardTitle>
          <Chart3 />
        </Card>
      </GridWrapper>
      <Footer ref={bottomBox.ref} />
    </AutoFit>
  );
}
