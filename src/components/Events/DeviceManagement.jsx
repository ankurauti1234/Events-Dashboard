"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Laptop,
  Search,
  X,
  RefreshCcw,
  BadgeInfo,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TIMEZONE_OFFSETS = {
  "Nepal Time": 5.75,
  "Indian Time": 5.5,
  "Russian Time": 3,
  UTC: 0,
  EST: -5,
};

export function DeviceManagement({
  deviceId,
  setDeviceId,
  timezone,
  setTimezone,
  autoRefresh,
  setAutoRefresh,
  refreshInterval,
  setRefreshInterval,
  shutDownData,
  convertTimestamp,
  handleSearch,
  clearSearch,
  onRefresh,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  handleDateSearch,
  clearDateFilter,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dateError, setDateError] = useState("");
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const savedSuggestions = JSON.parse(
      localStorage.getItem("deviceSuggestions") || "[]"
    ).slice(0, 5); // Limit to 5 suggestions
    setSuggestions(savedSuggestions);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const validateDateRange = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        setDateError("Start date cannot be after end date");
        return false;
      }
    }
    setDateError("");
    return true;
  };

  const handleDateSearchClick = () => {
    if (validateDateRange()) {
      handleDateSearch();
    }
  };

  const showDateFilterButtons = startDate || endDate;
  const shouldShowSuggestions =
    showSuggestions && deviceId && suggestions.length > 0;

  return (
    <Card className="border-2">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 border-b mb-3">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <BadgeInfo className="w-5 h-5 text-primary" />
          {deviceId ? "Device Management" : "All Devices"}
        </CardTitle>
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="w-96 h-8 text-sm">
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
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="relative" ref={suggestionsRef}>
              <Laptop className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter Device ID (leave empty for all devices)"
                value={deviceId}
                onChange={(e) => {
                  const newValue = e.target.value
                    .replace(/[^0-9]/g, "")
                    .slice(0, 10);
                  setDeviceId(newValue);
                }}
                className="pl-9 h-9"
                onFocus={() => setShowSuggestions(true)}
              />
              {shouldShowSuggestions && (
                <ScrollArea className="absolute z-50 w-full max-h-40 mt-1 bg-popover border rounded-md shadow-lg">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 hover:bg-accent cursor-pointer"
                      onClick={() => {
                        setDeviceId(suggestion);
                        setShowSuggestions(false);
                        handleSearch(suggestion);
                      }}
                    >
                      <span className="text-sm font-medium">{suggestion}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7"
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
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </div>
          </div>
          <Button onClick={() => handleSearch(deviceId)} className="gap-1.5">
            <Search className="h-4 w-4" />
            Search
          </Button>
          {deviceId && (
            <Button variant="outline" onClick={clearSearch} className="gap-1.5">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label
                htmlFor="start-date"
                className="flex items-center gap-2 text-sm font-medium mb-2"
              >
                <Calendar className="h-4 w-4" />
                Start Date
              </Label>
              <Input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateError("");
                }}
                className="w-full"
              />
            </div>
            <ArrowRight className="h-4 w-4 mt-8 text-muted-foreground" />
            <div className="flex-1">
              <Label
                htmlFor="end-date"
                className="flex items-center gap-2 text-sm font-medium mb-2"
              >
                <Calendar className="h-4 w-4" />
                End Date
              </Label>
              <Input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateError("");
                }}
                className="w-full"
              />
            </div>
            {showDateFilterButtons && (
              <div className="flex flex-col gap-2 mt-6">
                <Button onClick={handleDateSearchClick} className="gap-1.5">
                  <Search className="h-4 w-4" />
                  Apply Filter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    clearDateFilter();
                    setDateError("");
                  }}
                  className="gap-1.5"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            )}
          </div>
          {dateError && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{dateError}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex-1 bg-card p-3 rounded-lg border-2 border-primary/20 hover:border-primary/30 transition-all">
            <div className="text-xs font-medium text-muted-foreground">
              {deviceId ? "Current Device ID" : "Viewing"}
            </div>
            <div className="text-2xl font-bold text-primary break-all">
              {deviceId || "All Devices"}
            </div>
          </div>

          {shutDownData && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-1 bg-muted/30 p-3 rounded-lg border hover:bg-muted/40 cursor-help">
                    <div className="text-xs font-medium text-muted-foreground">
                      Last Shutdown
                    </div>
                    <div className="text-lg font-semibold">
                      {convertTimestamp(shutDownData.TS)}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">
                    Full timestamp of last device shutdown
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                className="scale-90"
              />
              <Label htmlFor="auto-refresh" className="text-sm">
                Auto-refresh
              </Label>
            </div>
            {autoRefresh && (
              <Select
                value={refreshInterval.toString()}
                onValueChange={(value) => setRefreshInterval(parseInt(value))}
              >
                <SelectTrigger className="w-[110px] h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 10, 30, 60].map((seconds) => (
                    <SelectItem key={seconds} value={seconds.toString()}>
                      {seconds < 60 ? `${seconds}s` : "1m"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="gap-1.5"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
