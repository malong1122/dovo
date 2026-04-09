import Chart from "@/components/chart";
import { useDashboardData } from "@/data/dashboard";
import { BarChart, type BarSeriesOption } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  type GridComponentOption,
  type LegendComponentOption,
  type TooltipComponentOption,
} from "echarts/components";
import type { ComposeOption } from "echarts/core";

type Option = ComposeOption<
  | BarSeriesOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
>;

const REGION_META = [
  { code: "150100", name: "呼和浩特" },
  { code: "150200", name: "包头" },
  { code: "150300", name: "乌海" },
  { code: "150400", name: "赤峰" },
  { code: "150500", name: "通辽" },
  { code: "150600", name: "鄂尔多斯" },
  { code: "150700", name: "呼伦贝尔" },
  { code: "150800", name: "巴彦淖尔" },
  { code: "150900", name: "乌兰察布" },
  { code: "152200", name: "兴安盟" },
  { code: "152500", name: "锡林郭勒盟" },
  { code: "152900", name: "阿拉善盟" },
];

export default function Chart5() {
  const { enterprises } = useDashboardData();

  const sumOutput = (type: "cattle" | "sheep" | "both") =>
    REGION_META.map(({ code }) =>
      enterprises
        .filter((enterprise) => enterprise.regionCode === code && enterprise.type === type)
        .reduce((sum, enterprise) => sum + enterprise.annualOutput, 0)
    );

  return (
    <Chart<Option>
      use={[BarChart, GridComponent, TooltipComponent, LegendComponent]}
      option={{
        backgroundColor: "transparent",
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(255,250,244,0.96)",
          borderColor: "rgba(234,88,12,0.22)",
          textStyle: { color: "#5a4a42" },
        },
        legend: {
          top: 0,
          textStyle: { color: "rgba(90,74,66,0.65)", fontSize: 10 },
          itemWidth: 10,
          itemHeight: 6,
          data: ["牛", "羊", "综合"],
        },
        grid: { top: 22, bottom: 18, left: "4%", right: "4%", containLabel: true },
        xAxis: {
          type: "category",
          data: REGION_META.map((region) => region.name),
          axisLabel: { color: "rgba(90,74,66,0.62)", fontSize: 10, rotate: 30 },
          axisLine: { lineStyle: { color: "rgba(234,88,12,0.15)" } },
          axisTick: { show: false },
        },
        yAxis: {
          type: "value",
          name: "万吨",
          nameTextStyle: { color: "rgba(234,88,12,0.45)", fontSize: 10 },
          axisLabel: { color: "rgba(90,74,66,0.52)", fontSize: 10 },
          splitLine: { lineStyle: { color: "rgba(234,88,12,0.07)" } },
        },
        series: [
          {
            name: "牛",
            type: "bar",
            stack: "total",
            barWidth: "50%",
            itemStyle: { color: "#ff6a1f" },
            data: sumOutput("cattle"),
          },
          {
            name: "羊",
            type: "bar",
            stack: "total",
            itemStyle: { color: "#ffb347" },
            data: sumOutput("sheep"),
          },
          {
            name: "综合",
            type: "bar",
            stack: "total",
            itemStyle: { color: "#ffd37a", borderRadius: [4, 4, 0, 0] },
            data: sumOutput("both"),
          },
        ],
      }}
    />
  );
}
