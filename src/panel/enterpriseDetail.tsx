import styled from "styled-components";
import { useDashboardData } from "@/data/dashboard";
import { useAppStore } from "@/stores";

const DetailBox = styled.div`
  position: fixed;
  bottom: 118px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  background: rgba(255, 250, 244, 0.96);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 16px 20px;
  min-width: 380px;
  max-width: 520px;
  box-shadow: 0 18px 40px rgba(234, 88, 12, 0.18);
  pointer-events: auto;
  backdrop-filter: blur(10px);
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 12px;
  background: none;
  border: none;
  color: rgba(90, 74, 66, 0.45);
  font-size: 18px;
  cursor: pointer;
  line-height: 1;

  &:hover {
    color: var(--color-primary);
  }
`;

const EName = styled.div<{ $type: string }>`
  font-size: 16px;
  font-weight: 700;
  color: ${(p) =>
    p.$type === "cattle"
      ? "var(--color-cattle)"
      : p.$type === "sheep"
        ? "var(--color-sheep)"
        : "var(--color-both)"};
  margin-bottom: 12px;
  padding-right: 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
`;

const Item = styled.div`
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const Label = styled.span`
  color: rgba(90, 74, 66, 0.56);
`;

const Value = styled.span`
  color: var(--color-text);
  font-weight: 500;
`;

const AddressRow = styled.div`
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(234, 88, 12, 0.1);
  font-size: 11px;
  color: rgba(90, 74, 66, 0.62);
`;

const ProductsRow = styled.div`
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const ProductTag = styled.span`
  background: rgba(234, 88, 12, 0.08);
  border: 1px solid rgba(234, 88, 12, 0.14);
  color: rgba(234, 88, 12, 0.82);
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 10px;
`;

const catLabel = {
  farming: "养殖",
  processing: "加工",
  sales: "销售",
  integrated: "综合",
};
const scaleLabel = { large: "大型", medium: "中型", small: "小型" };

export default function EnterpriseDetail() {
  const selected = useAppStore((s) => s.selectedEnterprise);
  const setSelected = useAppStore((s) => s.setSelectedEnterprise);
  const mode = useAppStore((s) => s.mode);
  const { enterprises } = useDashboardData();
  const current =
    enterprises.find((enterprise) => enterprise.id === selected?.id) ?? selected;

  if (!current || mode) return null;

  return (
    <DetailBox>
      <CloseBtn onClick={() => setSelected(null)}>×</CloseBtn>
      <EName $type={current.type}>{current.name}</EName>
      <Grid>
        <Item><Label>所在地区</Label><Value>{current.regionName}</Value></Item>
        <Item><Label>成立年份</Label><Value>{current.established} 年</Value></Item>
        <Item><Label>企业规模</Label><Value>{scaleLabel[current.scale]}</Value></Item>
        <Item><Label>产业环节</Label><Value>{catLabel[current.category]}</Value></Item>
        <Item><Label>年产量</Label><Value>{current.annualOutput} 万吨</Value></Item>
        <Item><Label>年营收</Label><Value>{(current.annualRevenue / 10000).toFixed(1)} 亿元</Value></Item>
        <Item><Label>员工人数</Label><Value>{current.employeeCount.toLocaleString()} 人</Value></Item>
      </Grid>
      <AddressRow>地址: {current.address}</AddressRow>
      <ProductsRow>
        {current.mainProducts.map((product) => (
          <ProductTag key={product}>{product}</ProductTag>
        ))}
      </ProductsRow>
    </DetailBox>
  );
}
