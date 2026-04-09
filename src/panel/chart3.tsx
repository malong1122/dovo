import styled from "styled-components";
import { useDashboardData } from "@/data/dashboard";
import { useAppStore } from "@/stores";

const Wrapper = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ListHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 50px 60px;
  gap: 4px;
  padding: 4px 6px;
  border-bottom: 1px solid rgba(234, 88, 12, 0.16);
  font-size: 10px;
  color: rgba(90, 74, 66, 0.56);
  letter-spacing: 1px;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(234, 88, 12, 0.2) transparent;
`;

const ListItem = styled.div<{ $selected: boolean; $type: string }>`
  display: grid;
  grid-template-columns: 1fr 50px 60px;
  gap: 4px;
  padding: 6px;
  border-bottom: 1px solid rgba(234, 88, 12, 0.1);
  cursor: pointer;
  background: ${(p) => (p.$selected ? "rgba(234, 88, 12, 0.08)" : "transparent")};
  transition: background 0.2s;

  &:hover {
    background: rgba(234, 88, 12, 0.05);
  }
`;

const EnterpriseNameCell = styled.div`
  font-size: 11px;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TypeBadge = styled.span<{ $type: string }>`
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 8px;
  border: 1px solid;
  color: ${(p) =>
    p.$type === "cattle"
      ? "var(--color-cattle)"
      : p.$type === "sheep"
        ? "var(--color-sheep)"
        : "var(--color-both)"};
  border-color: ${(p) =>
    p.$type === "cattle"
      ? "var(--color-cattle)"
      : p.$type === "sheep"
        ? "var(--color-sheep)"
        : "var(--color-both)"};
  background: ${(p) =>
    p.$type === "cattle"
      ? "rgba(255,106,31,0.12)"
      : p.$type === "sheep"
        ? "rgba(255,179,71,0.14)"
        : "rgba(255,211,122,0.16)"};
  white-space: nowrap;
  text-align: center;
  align-self: center;
`;

const OutputCell = styled.div`
  font-size: 11px;
  color: rgba(234, 88, 12, 0.82);
  text-align: right;
  align-self: center;
`;

const typeLabel = {
  cattle: "牛板块",
  sheep: "羊板块",
  both: "综合",
};

export default function Chart3() {
  const { enterprises } = useDashboardData();
  const selected = useAppStore((s) => s.selectedEnterprise);
  const setSelected = useAppStore((s) => s.setSelectedEnterprise);
  const sorted = [...enterprises].sort((a, b) => b.annualOutput - a.annualOutput);

  return (
    <Wrapper>
      <ListHeader>
        <span>龙头企业</span>
        <span style={{ textAlign: "center" }}>类型</span>
        <span style={{ textAlign: "right" }}>产量(万吨)</span>
      </ListHeader>
      <ScrollArea>
        {sorted.map((enterprise) => (
          <ListItem
            key={enterprise.id}
            $selected={selected?.id === enterprise.id}
            $type={enterprise.type}
            onClick={() =>
              setSelected(selected?.id === enterprise.id ? null : enterprise)
            }>
            <EnterpriseNameCell title={enterprise.name}>
              {enterprise.name}
            </EnterpriseNameCell>
            <TypeBadge $type={enterprise.type}>
              {typeLabel[enterprise.type]}
            </TypeBadge>
            <OutputCell>{enterprise.annualOutput}</OutputCell>
          </ListItem>
        ))}
      </ScrollArea>
    </Wrapper>
  );
}
