import { useMemo } from "react";
import { enterprises as baseEnterprises } from "@/data/enterprises";
import { useAppStore } from "@/stores";
import type { Enterprise } from "@/types/map";

type CityStats = {
  enterprises: number;
  output: number;
  revenue: number;
  cattle: number;
  sheep: number;
  both: number;
};

function round(num: number, digits = 1) {
  return Number(num.toFixed(digits));
}

function calcWave(tick: number, seed: number, speed = 0.4) {
  return (
    Math.sin((tick + seed) * speed) * 0.55 +
    Math.cos((tick + seed * 1.7) * speed * 0.6) * 0.3
  );
}

function createLiveEnterprise(
  enterprise: Enterprise,
  tick: number,
  index: number
): Enterprise {
  const outputWave = calcWave(tick, index + 1, 0.52);
  const revenueWave = calcWave(tick, index + 11, 0.43);
  const outputFactor = 1 + outputWave * 0.1;
  const revenueFactor = 1 + revenueWave * 0.12;

  return {
    ...enterprise,
    annualOutput: round(enterprise.annualOutput * outputFactor, 1),
    annualRevenue: Math.round(enterprise.annualRevenue * revenueFactor),
  };
}

function sumTypeOutput(enterprises: Enterprise[]) {
  return enterprises.reduce(
    (acc, enterprise) => {
      acc[enterprise.type] += enterprise.annualOutput;
      return acc;
    },
    { cattle: 0, sheep: 0, both: 0 }
  );
}

function sumCategoryOutput(enterprises: Enterprise[]) {
  return enterprises.reduce(
    (acc, enterprise) => {
      acc[enterprise.category] += enterprise.annualOutput;
      return acc;
    },
    { farming: 0, processing: 0, sales: 0, integrated: 0 }
  );
}

function sumScaleOutput(enterprises: Enterprise[]) {
  return enterprises.reduce(
    (acc, enterprise) => {
      acc[enterprise.scale] += enterprise.annualOutput;
      return acc;
    },
    { large: 0, medium: 0, small: 0 }
  );
}

function createCityStats(enterprises: Enterprise[]) {
  return enterprises.reduce<Record<string, CityStats>>((acc, enterprise) => {
    const current = acc[enterprise.regionName] ?? {
      enterprises: 0,
      output: 0,
      revenue: 0,
      cattle: 0,
      sheep: 0,
      both: 0,
    };

    current.enterprises += 1;
    current.output = round(current.output + enterprise.annualOutput, 1);
    current.revenue += enterprise.annualRevenue;
    current[enterprise.type] += 1;

    acc[enterprise.regionName] = current;
    return acc;
  }, {});
}

export function buildDashboardData(tick: number) {
  const enterprises = baseEnterprises.map((enterprise, index) =>
    createLiveEnterprise(enterprise, tick, index)
  );
  const cityStats = createCityStats(enterprises);
  const typeOutput = sumTypeOutput(enterprises);
  const categoryOutput = sumCategoryOutput(enterprises);
  const scaleOutput = sumScaleOutput(enterprises);
  const totalOutput = round(
    enterprises.reduce((sum, enterprise) => sum + enterprise.annualOutput, 0),
    1
  );
  const totalRevenue = enterprises.reduce(
    (sum, enterprise) => sum + enterprise.annualRevenue,
    0
  );
  const sortedRegions = Object.entries(cityStats).sort(
    (a, b) => b[1].output - a[1].output
  );

  return {
    enterprises,
    cityStats,
    typeOutput,
    categoryOutput,
    scaleOutput,
    totalOutput,
    totalRevenue,
    enterpriseCount: enterprises.length,
    sortedRegions,
  };
}

export function useDashboardData() {
  const liveTick = useAppStore((s) => s.liveTick);

  return useMemo(() => buildDashboardData(liveTick), [liveTick]);
}
