import { Html } from "@react-three/drei";
import { useImperativeHandle, useState, type Ref } from "react";
import styled from "styled-components";
import { cityStats } from "@/data/enterprises";

const TooltipBox = styled.div`
  background: rgba(255, 250, 244, 0.94);
  backdrop-filter: blur(12px);
  border-radius: 8px;
  padding: 12px 16px;
  color: var(--color-text-dim);
  font-size: 12px;
  pointer-events: none;
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 30px rgba(234, 88, 12, 0.18);
  min-width: 160px;
`;

const CityName = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  color: var(--color-primary);
  font-size: 14px;
  letter-spacing: 2px;
`;

const DataItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  gap: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  span:last-child {
    color: var(--color-text);
    font-weight: 500;
  }
`;

const TypeRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--color-border);
`;

const TypeTag = styled.span<{ $color: string }>`
  background: ${(p) => p.$color}22;
  border: 1px solid ${(p) => p.$color};
  color: ${(p) => p.$color};
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 11px;
`;

interface TooltipProps {
  ref?: Ref<{ open: () => void; close: () => void }>;
  data: { city: string };
  position: [number, number, number];
  visible?: boolean;
}

export default function Tooltip(props: TooltipProps) {
  const { ref, data, position } = props;
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setVisible(true),
    close: () => setVisible(false),
  }));

  const stats = cityStats[data.city as keyof typeof cityStats];

  return visible ? (
    <Html
      center
      position={position}
      distanceFactor={100}
      zIndexRange={[1001, 1500]}
      style={{ pointerEvents: "none" }}>
      <TooltipBox>
        <CityName>{data.city}</CityName>
        {stats ? (
          <>
            <DataItem><span>企业数量</span><span>{stats.enterprises} 家</span></DataItem>
            <DataItem><span>年产量</span><span>{stats.output.toFixed(1)} 万吨</span></DataItem>
            <DataItem><span>年营收</span><span>{(stats.revenue / 10000).toFixed(1)} 亿元</span></DataItem>
            <TypeRow>
              {stats.cattle > 0 && <TypeTag $color="var(--color-cattle)">牛 {stats.cattle}</TypeTag>}
              {stats.sheep > 0 && <TypeTag $color="var(--color-sheep)">羊 {stats.sheep}</TypeTag>}
              {stats.both > 0 && <TypeTag $color="var(--color-both)">综合 {stats.both}</TypeTag>}
            </TypeRow>
          </>
        ) : (
          <DataItem><span>暂无数据</span></DataItem>
        )}
      </TooltipBox>
    </Html>
  ) : null;
}
