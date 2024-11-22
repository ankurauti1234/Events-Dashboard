"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  TrendingUp,
  Activity,
  Cpu,
  MonitorDot,
  RefreshCcw,
} from "lucide-react";
import {
  Pie,
  PieChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
  Label,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Switch } from "@/components/ui/switch";
import { Label as UILabel } from "@/components/ui/label";
import NumberTicker from "../ui/number-ticker";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://apmapis.webdevava.live/api";

const AUTO_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

const eventTypeColors = {
  MEMBER_GUEST_DECLARATION: "hsl(var(--chart-1))",
  AUDIO_FINGERPRINT: "hsl(var(--chart-2))",
  LOGO_DETECTED: "hsl(var(--chart-3))",
  CHANNEL_CHANGED: "hsl(var(--chart-4))",
  SHUT_DOWN: "hsl(var(--chart-5))",
};

export default function EventsCharts() {
  const [logoDetectionData, setLogoDetectionData] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [logoDetectionResponse, metricsResponse] = await Promise.all([
        // fetch(`${API_URL}/events/logo-detection?deviceIdRange=200000-200010`),
        // fetch(
        //   `${API_URL}/events/metrics?types=3,28,29,68,69&deviceIdRange=200000-200010`
        // ),
        fetch(`${API_URL}/events/logo-detection`),
        fetch(`${API_URL}/events/metrics?types=3,28,29,68,69`),
      ]);

      if (!logoDetectionResponse.ok || !metricsResponse.ok) {
        throw new Error("Network response was not ok");
      }

      const logoDetectionResult = await logoDetectionResponse.json();
      const metricsResult = await metricsResponse.json();

      setLogoDetectionData(logoDetectionResult);
      setMetricsData(metricsResult);
      setError(null);
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let intervalId;

    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchData();
      }, AUTO_REFRESH_INTERVAL);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, fetchData]);

  useEffect(() => {
    window.refreshChartsData = fetchData;
    return () => {
      delete window.refreshChartsData;
    };
  }, [fetchData]);

  const eventDistributionData = useMemo(() => {
    if (!metricsData) return [];
    return metricsData.metrics.eventsByType.map((event) => ({
      name: event.eventName,
      value: event.count,
      fill: eventTypeColors[event.eventName] || "hsl(var(--chart-6))",
    }));
  }, [metricsData]);

  const totalEvents = useMemo(() => {
    return eventDistributionData.reduce((acc, curr) => acc + curr.value, 0);
  }, [eventDistributionData]);

  const detectionTypeData = useMemo(() => {
    if (!logoDetectionData) return [];
    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ];
    return logoDetectionData.statistics.detectionTypes.map((item, index) => ({
      name: item.type,
      value: item.count,
      fill: colors[index % colors.length],
    }));
  }, [logoDetectionData]);

  const mostActiveChannel = useMemo(() => {
    if (
      !logoDetectionData?.statistics?.channels ||
      !logoDetectionData.statistics.channels.length
    ) {
      return { channelId: "N/A", count: 0 };
    }
    return logoDetectionData.statistics.channels.reduce((prev, current) =>
      prev.count > current.count ? prev : current
    );
  }, [logoDetectionData]);

  const eventDistributionConfig = {
    value: {
      label: "Events",
    },
    ...Object.fromEntries(
      eventDistributionData.map(({ name }, index) => [
        name,
        { label: name, color: `hsl(var(--chart-${index + 1}))` },
      ])
    ),
  };

  const detectionTypeConfig = {
    value: {
      label: "Detections",
      color: "hsl(var(--chart-1))",
    },
    label: {
      color: "hsl(var(--background))",
    },
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!logoDetectionData || !metricsData) return null;

  const totalDevices = metricsData.metrics.totalUniqueDevices;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 w-full">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total APM Devices
            </CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberTicker value={totalDevices} />
            </div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberTicker value={totalEvents} />
            </div>
            <p className="text-xs text-muted-foreground">+49 from yesterday</p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Most Active Channel
            </CardTitle>
            <MonitorDot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mostActiveChannel.channelId}
            </div>
            <div className="text-sm text-muted-foreground">
              {mostActiveChannel.count} detections
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Devices (RU)
            </CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberTicker
                // value={logoDetectionData.statistics.devices.uniqueDeviceCount}
                value={5}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Active devices for RU region
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 items-center w-full">
        <Card className="md:col-span-2 flex flex-col flex-1">
          <CardHeader className="items-center pb-0">
            <CardTitle>Event Distribution</CardTitle>
            <CardDescription>By Event Type</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={eventDistributionConfig}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={eventDistributionData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={80}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {totalEvents.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Events
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              Logo Detection leading at{" "}
              {Math.round(
                (metricsData.metrics.eventsByType.find(
                  (e) => e.eventName === "LOGO_DETECTED"
                )?.count /
                  totalEvents) *
                  100
              )}
              %
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing distribution of all event types
            </div>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2 w-full flex-[2]">
          <CardHeader>
            <CardTitle>Logo Detection Types</CardTitle>
            <CardDescription>
              Distribution of Logo Detection Types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={detectionTypeConfig}
              className="h-[250px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={detectionTypeData}
                layout="vertical"
                margin={{
                  right: 16,
                  left: 16,
                  top: 8,
                  bottom: 8,
                }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  hide
                />
                <XAxis dataKey="value" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar dataKey="value" layout="vertical" radius={4}>
                  <LabelList
                    dataKey="name"
                    position="insideLeft"
                    offset={8}
                    className="fill-[--color-label]"
                    fontSize={12}
                  />
                  <LabelList
                    dataKey="value"
                    position="right"
                    offset={8}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              TV detection leading at{" "}
              {Math.round(
                (detectionTypeData.find((d) => d.name === "tv")?.value /
                  detectionTypeData.reduce(
                    (sum, item) => sum + item.value,
                    0
                  )) *
                  100
              )}
              %
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing distribution of logo detection types
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
