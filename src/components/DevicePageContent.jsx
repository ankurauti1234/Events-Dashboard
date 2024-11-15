"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Laptop,
  Search,
  X,
  Settings,
  LayoutGrid,
  LayoutList,
  TableProperties,
  Eye,
  EyeOff,
  RefreshCcw,
  Download,
  Users,
  BadgeInfo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogoDetectionTable } from "./LogoDetection";
import { AudioDetectionTable } from "./AudioDetection";
import MemberWatchingState from "./MemberWatchingState";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://apmapis.webdevava.live/api";

const TIMEZONE_OFFSETS = {
  "Indian Time": 5.5,
  "Russian Time": 3,
  UTC: 0,
  EST: -5,
};

const LAYOUTS = {
  SIDE_BY_SIDE: "side-by-side",
  STACKED: "stacked",
  TABBED: "tabbed",
};

export default function EnhancedDevicePageContent() {
  const [deviceId, setDeviceId] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [logoData, setLogoData] = useState({ events: [], total: 0 });
  const [audioData, setAudioData] = useState({ events: [], total: 0 });
  const [memberGuestData, setMemberGuestData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [timezone, setTimezone] = useState("Indian Time");

  const router = useRouter();
  const searchParams = useSearchParams();

  const convertTimestamp = useCallback(
    (timestamp) => {
      const timestampMs =
        typeof timestamp === "number" && timestamp < 100000000000
          ? timestamp * 1000
          : timestamp;
      const date = new Date(timestampMs);
      const utcDate = new Date(date.getTime());
      const offset = TIMEZONE_OFFSETS[timezone] || 0;
      const offsetMs = offset * 60 * 60 * 1000;
      utcDate.setTime(utcDate.getTime() + offsetMs);
      return utcDate.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "UTC",
      });
    },
    [timezone]
  );

  const fetchData = useCallback(
    async (
      id,
      logoPage = 1,
      logoLimit = 10,
      audioPage = 1,
      audioLimit = 10
    ) => {
      if (!id) return;
      setIsLoading(true);
      setError("");
      try {
        const [logoResponse, audioResponse, memberGuestResponse] =
          await Promise.all([
            fetch(
              `${API_URL}/events/${id}?type=29&page=${logoPage}&limit=${logoLimit}`
            ),
            fetch(
              `${API_URL}/events/${id}?type=28&page=${audioPage}&limit=${audioLimit}`
            ),
            fetch(`${API_URL}/events/latest?deviceId=${id}&type=3`),
          ]);
        const logoResult = await logoResponse.json();
        const audioResult = await audioResponse.json();
        const memberGuestResult = await memberGuestResponse.json();

        setLogoData({
          events: logoResult.events || [],
          total: logoResult.total || 0,
        });

        setAudioData({
          events: audioResult.events || [],
          total: audioResult.total || 0,
        });

        setMemberGuestData(memberGuestResult.event?.Details || null);
      } catch (error) {
        setError("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const urlDeviceId = searchParams.get("deviceId");
    if (urlDeviceId) {
      setDeviceId(urlDeviceId);
      fetchData(urlDeviceId);
    }
    const savedSuggestions = JSON.parse(
      localStorage.getItem("deviceSuggestions") || "[]"
    );
    setSuggestions(savedSuggestions);
  }, [searchParams, fetchData]);

  useEffect(() => {
    let intervalId;
    if (autoRefresh && deviceId) {
      intervalId = setInterval(() => {
        fetchData(deviceId);
      }, refreshInterval * 1000);
    }
    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, deviceId, fetchData]);

  const handleSearch = (id = deviceId) => {
    if (id) {
      router.push(`?deviceId=${id}`);
      fetchData(id);
      const savedSuggestions = JSON.parse(
        localStorage.getItem("deviceSuggestions") || "[]"
      );
      if (!savedSuggestions.includes(id)) {
        savedSuggestions.unshift(id);
        localStorage.setItem(
          "deviceSuggestions",
          JSON.stringify(savedSuggestions)
        );
        setSuggestions(savedSuggestions);
      }
    }
  };

  const handleExport = (dataType, selectedData) => {
    const csvContent = convertToCSV(selectedData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${dataType}_detection_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    const excludeFields = ["__v", "_id", "TS", "ID"];
    const processRow = (item) => {
      const row = {};
      Object.entries(item).forEach(([key, value]) => {
        if (!excludeFields.includes(key)) {
          if (key === "Details" && typeof value === "object") {
            Object.entries(value).forEach(([detailKey, detailValue]) => {
              row[detailKey] = detailValue;
            });
          } else {
            row[key] = value;
          }
        }
      });
      return row;
    };

    const processedData = data.map(processRow);
    const headers = Object.keys(processedData[0]);
    const rows = processedData.map((row) =>
      headers
        .map((header) =>
          typeof row[header] === "number" && header === "accuracy"
            ? (row[header] * 100).toFixed(1) + "%"
            : row[header]
        )
        .join(",")
    );

    return [headers.join(","), ...rows].join("\n");
  };

  const [settings, setSettings] = useState({
    showLogoTable: true,
    showAudioTable: true,
    showMemberWatching: true,
    layout: LAYOUTS.SIDE_BY_SIDE,
    darkMode: false,
    compactView: false,
  });

  const [activeTab, setActiveTab] = useState("logo");

  const toggleTableVisibility = (tableType) => {
    setSettings((prev) => ({
      ...prev,
      [`show${tableType}`]: !prev[`show${tableType}`],
    }));
  };

  const getLayoutClassName = () => {
    switch (settings.layout) {
      case LAYOUTS.SIDE_BY_SIDE:
        return "flex flex-col lg:flex-row gap-6";
      case LAYOUTS.STACKED:
        return "flex flex-col gap-6";
      case LAYOUTS.TABBED:
        return "flex flex-col gap-6";
      default:
        return "flex flex-col lg:flex-row gap-6";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-row-reverse">
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <BadgeInfo className="w-6 h-6 text-primary" />
              Device Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-accent p-4 rounded-lg border ">
              <div className="text-sm text-secondary-foreground mb-1">
                Currently Searched Device ID
              </div>
              <div className="text-3xl font-bold text-primary break-all">
                {deviceId || "No device selected"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              Device Search and Control
            </CardTitle>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Display Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <Label>Show Logo Detection</Label>
                      <Switch
                        checked={settings.showLogoTable}
                        onCheckedChange={() =>
                          toggleTableVisibility("LogoTable")
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Audio Detection</Label>
                      <Switch
                        checked={settings.showAudioTable}
                        onCheckedChange={() =>
                          toggleTableVisibility("AudioTable")
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Member Watching</Label>
                      <Switch
                        checked={settings.showMemberWatching}
                        onCheckedChange={() =>
                          toggleTableVisibility("MemberWatching")
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Layout</Label>
                      <Select
                        value={settings.layout}
                        onValueChange={(value) =>
                          setSettings((prev) => ({ ...prev, layout: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={LAYOUTS.SIDE_BY_SIDE}>
                            Side by Side
                          </SelectItem>
                          <SelectItem value={LAYOUTS.STACKED}>
                            Stacked
                          </SelectItem>
                          <SelectItem value={LAYOUTS.TABBED}>Tabbed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Compact View</Label>
                      <Switch
                        checked={settings.compactView}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            compactView: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(TIMEZONE_OFFSETS).map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Laptop className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter Device ID"
                    value={deviceId}
                    onChange={(e) => {
                      const newValue = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 10);
                      setDeviceId(newValue);
                    }}
                    className="pl-8"
                    onFocus={() => setShowSuggestions(true)}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <ScrollArea className="absolute z-10 w-full max-h-32 bg-popover border rounded-md shadow-md">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 hover:bg-accent cursor-pointer"
                          onClick={() => {
                            setDeviceId(suggestion);
                            setShowSuggestions(false);
                            handleSearch(suggestion);
                          }}
                        >
                          <span>{suggestion}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newSuggestions = suggestions.filter(
                                (s) => s !== suggestion
                              );
                              setSuggestions(newSuggestions);
                              localStorage.setItem(
                                "deviceSuggestions",
                                JSON.stringify(newSuggestions)
                              );
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                </div>
                <Button
                  onClick={() => handleSearch()}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-refresh"
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                    />
                    <Label htmlFor="auto-refresh">Auto-refresh</Label>
                  </div>
                  {autoRefresh && (
                    <Select
                      value={refreshInterval.toString()}
                      onValueChange={(value) =>
                        setRefreshInterval(parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Refresh interval</SelectLabel>
                          <SelectItem value="5">5 seconds</SelectItem>
                          <SelectItem value="10">10 seconds</SelectItem>
                          <SelectItem value="30">30 seconds</SelectItem>
                          <SelectItem value="60">1 minute</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchData(deviceId)}
                  className="flex items-center gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {settings.layout === LAYOUTS.TABBED ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger
              value="logo"
              disabled={!settings.showLogoTable}
              className="w-full"
            >
              Logo Detection
            </TabsTrigger>
            <TabsTrigger
              value="audio"
              disabled={!settings.showAudioTable}
              className="w-full"
            >
              Audio Detection
            </TabsTrigger>
          </TabsList>
          {settings.showLogoTable && activeTab === "logo" && (
            <LogoDetectionTable
              data={logoData}
              convertTimestamp={convertTimestamp}
              onExport={(selectedData) => handleExport("logo", selectedData)}
              onPageChange={(page, limit) =>
                fetchData(deviceId, page, limit, undefined, undefined)
              }
              compact={settings.compactView}
            />
          )}
          {settings.showAudioTable && activeTab === "audio" && (
            <AudioDetectionTable
              data={audioData}
              convertTimestamp={convertTimestamp}
              onExport={(selectedData) => handleExport("audio", selectedData)}
              onPageChange={(page, limit) =>
                fetchData(deviceId, undefined, undefined, page, limit)
              }
              compact={settings.compactView}
            />
          )}
        </Tabs>
      ) : (
        <div className={getLayoutClassName()}>
          {settings.showLogoTable && (
            <LogoDetectionTable
              data={logoData}
              convertTimestamp={convertTimestamp}
              onExport={(selectedData) => handleExport("logo", selectedData)}
              onPageChange={(page, limit) =>
                fetchData(deviceId, page, limit, undefined, undefined)
              }
              compact={settings.compactView}
            />
          )}
          {settings.showAudioTable && (
            <AudioDetectionTable
              data={audioData}
              convertTimestamp={convertTimestamp}
              onExport={(selectedData) => handleExport("audio", selectedData)}
              onPageChange={(page, limit) =>
                fetchData(deviceId, undefined, undefined, page, limit)
              }
              compact={settings.compactView}
            />
          )}
        </div>
      )}

      {settings.showMemberWatching && (
        <MemberWatchingState
          memberGuestData={memberGuestData}
          compact={settings.compactView}
        />
      )}
    </div>
  );
}
