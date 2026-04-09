import Chart from "@/components/chart";
import { useDashboardData } from "@/data/dashboard";
import { PieChart, type PieSeriesOption } from "echarts/charts";
import { TooltipComponent, type TooltipComponentOption } from "echarts/components";
import type { ComposeOption } from "echarts/core";
import { LabelLayout } from "echarts/features";

type Option = ComposeOption<PieSeriesOption | TooltipComponentOption>;

const catColors = {
  farming: "#4ade80",
  processing: "#fbbf24",
  sales: "#60a5fa",
  integrated: "#f472b6",
};

const catLabel = {
  farming: "养殖",
  processing: "加工",
  sales: "销售",
  integrated: "综合",
};

export default function Chart4() {
  const { categoryOutput } = useDashboardData();

  return (
    <Chart<Option>
      use={[PieChart, TooltipComponent, LabelLayout]}
      option={{
        backgroundColor: "transparent",
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(255,250,244,0.96)",
          borderColor: "rgba(234,88,12,0.22)",
          textStyle: { color: "#5a4a42" },
        },
        series: [
          {
            type: "pie",
            radius: ["0%", "60%"],
            center: ["50%", "50%"],
            itemStyle: {
              borderRadius: 4,
              borderColor: "rgba(255,248,239,0.85)",
              borderWidth: 2,
            },
            label: {
              show: true,
              color: "#5a4a42",
              fontSize: 11,
              formatter: "{b}\n{d}%",
            },
            labelLine: {
              lineStyle: { color: "rgba(234,88,12,0.25)" },
            },
            data: Object.entries(categoryOutput).map(([cat, val]) => ({
              value: val,
              name: catLabel[cat as keyof typeof catLabel],
              itemStyle: { color: catColors[cat as keyof typeof catColors] },
            })),
          },
        ],
      }}
    />
  );
}
