import Chart from "@/components/chart";
import { useDashboardData } from "@/data/dashboard";
import { BarChart, type BarSeriesOption } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  type GridComponentOption,
  type TooltipComponentOption,
} from "echarts/components";
import type { ComposeOption } from "echarts/core";

type Option = ComposeOption<
  BarSeriesOption | TooltipComponentOption | GridComponentOption
>;

export default function Chart2() {
  const { sortedRegions } = useDashboardData();
  const sorted = sortedRegions.slice(0, 8);

  return (
    <Chart<Option>
      use={[BarChart, GridComponent, TooltipComponent]}
      option={{
        backgroundColor: "transparent",
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(255,250,244,0.96)",
          borderColor: "rgba(234,88,12,0.22)",
          textStyle: { color: "#5a4a42" },
        },
        grid: { top: 8, bottom: 4, left: "25%", right: "12%", containLabel: false },
        xAxis: { show: false },
        yAxis: {
          type: "category",
          inverse: true,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: "rgba(90,74,66,0.72)",
            fontSize: 11,
          },
          data: sorted.map(([name]) => name),
        },
        series: [
          {
            type: "bar",
            barWidth: 8,
            data: sorted.map(([, s]) => s.output),
            itemStyle: {
              borderRadius: 4,
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: "#f7c26f" },
                  { offset: 1, color: "#ea580c" },
                ],
              },
            },
            label: {
              show: true,
              position: "right",
              color: "rgba(234,88,12,0.85)",
              fontSize: 11,
              formatter: "{c} 万吨",
            },
            showBackground: true,
            backgroundStyle: { color: "rgba(234,88,12,0.08)", borderRadius: 4 },
          },
        ],
      }}
    />
  );
}
