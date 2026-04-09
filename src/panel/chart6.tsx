import Chart from "@/components/chart";
import { useDashboardData } from "@/data/dashboard";
import { PieChart, type PieSeriesOption } from "echarts/charts";
import {
  LegendComponent,
  TooltipComponent,
  type LegendComponentOption,
  type TooltipComponentOption,
} from "echarts/components";
import type { ComposeOption } from "echarts/core";
import { LabelLayout } from "echarts/features";

type Option = ComposeOption<
  PieSeriesOption | TooltipComponentOption | LegendComponentOption
>;

export default function Chart6() {
  const { scaleOutput } = useDashboardData();

  return (
    <Chart<Option>
      use={[PieChart, TooltipComponent, LegendComponent, LabelLayout]}
      option={{
        backgroundColor: "transparent",
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(255,250,244,0.96)",
          borderColor: "rgba(234,88,12,0.22)",
          textStyle: { color: "#5a4a42" },
        },
        legend: {
          orient: "vertical",
          right: "5%",
          top: "center",
          textStyle: { color: "rgba(90,74,66,0.7)", fontSize: 11 },
          itemWidth: 10,
          itemHeight: 10,
        },
        series: [
          {
            type: "pie",
            radius: ["40%", "65%"],
            center: ["40%", "50%"],
            itemStyle: {
              borderRadius: 4,
              borderColor: "rgba(255,248,239,0.85)",
              borderWidth: 2,
            },
            label: {
              show: true,
              color: "#5a4a42",
              fontSize: 11,
              formatter: "{d}%",
            },
            data: [
              {
                value: scaleOutput.large,
                name: "澶у瀷浼佷笟",
                itemStyle: { color: "#ea580c" },
              },
              {
                value: scaleOutput.medium,
                name: "涓瀷浼佷笟",
                itemStyle: { color: "#ffb347" },
              },
              {
                value: scaleOutput.small,
                name: "灏忓瀷浼佷笟",
                itemStyle: { color: "#f6d28c" },
              },
            ],
          },
        ],
      }}
    />
  );
}
