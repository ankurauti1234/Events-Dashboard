"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Laptop,
  Search,
  X,
  RefreshCcw,
  BadgeInfo,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Clock,
  Database,
  AlertCircle,
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://apmapis.webdevava.live/api";

const TIMEZONE_OFFSETS = {
  "Indian Time": 5.5,
  "Russian Time": 3,
  UTC: 0,
  EST: -5,
};

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

export default function DeviceEventsPage() {
  const [deviceId, setDeviceId] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [eventData, setEventData] = useState({ events: [], total: 0 });
  const [shutDownData, setShutDownData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [timezone, setTimezone] = useState("Indian Time");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const router = useRouter();
  const searchParams = useSearchParams();
  const suggestionsRef = useRef(null);

  // Add click outside handler
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
    async (id, page = 1) => {
      if (!id) return;
      setIsLoading(true);
      setError("");
      try {
        const [eventsResponse, shutDownResponse] = await Promise.all([
          fetch(`${API_URL}/events/${id}?page=${page}&limit=${itemsPerPage}`),
          fetch(`${API_URL}/events/latest?deviceId=${id}&type=69`),
        ]);

        const eventsResult = await eventsResponse.json();
        const shutDownResult = await shutDownResponse.json();

        setEventData({
          events: eventsResult.events || [],
          total: eventsResult.total || 0,
        });
        setShutDownData(shutDownResult.event || null);
        setLastRefreshed(new Date());
      } catch (error) {
        setError("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    },
    [itemsPerPage]
  );

  useEffect(() => {
    const urlDeviceId = searchParams.get("deviceId");
    if (urlDeviceId) {
      setDeviceId(urlDeviceId);
      fetchData(urlDeviceId, currentPage);
    }
    const savedSuggestions = JSON.parse(
      localStorage.getItem("deviceSuggestions") || "[]"
    );
    setSuggestions(savedSuggestions);
  }, [searchParams, fetchData, currentPage]);

  useEffect(() => {
    let intervalId;
    if (autoRefresh && deviceId) {
      intervalId = setInterval(() => {
        fetchData(deviceId, currentPage);
      }, refreshInterval * 1000);
    }
    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, deviceId, fetchData, currentPage]);

  const handleSearch = (id = deviceId) => {
    if (id) {
      router.push(`?deviceId=${id}`);
      setCurrentPage(1);
      fetchData(id, 1);
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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchData(deviceId, newPage);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="w-full">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 border-b mb-3">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <BadgeInfo className="w-5 h-5 text-primary" />
            Device Management
          </CardTitle>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-[120px] h-8 text-sm">
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
          {/* Search and Device ID Section */}
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="relative" ref={suggestionsRef}>
                <Laptop className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                  className="pl-9 h-9"
                  onFocus={() => setShowSuggestions(true)}
                />
                {showSuggestions && suggestions.length > 0 && (
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
                        <span className="text-sm font-medium">
                          {suggestion}
                        </span>
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
            <Button
              onClick={() => handleSearch()}
              className="gap-1.5"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>

          {/* Status Display */}
          <div className="flex gap-3">
            <div className="flex-1 bg-card p-3 rounded-lg border-2 border-primary/20 hover:border-primary/30 transition-all">
              <div className="text-xs font-medium text-muted-foreground">
                Current Device ID
              </div>
              <div className="text-2xl font-bold text-primary break-all">
                {deviceId || "No device ID"}
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

          {/* Controls Section */}
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
                    <SelectGroup>
                      <SelectLabel>Interval</SelectLabel>
                      {[5, 10, 30, 60].map((seconds) => (
                        <SelectItem key={seconds} value={seconds.toString()}>
                          {seconds < 60 ? `${seconds}s` : "1m"}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(deviceId, currentPage)}
              className="gap-1.5"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Events
                </p>
                <h3 className="text-2xl font-bold">{eventData.total}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Last Refresh
                </p>
                <h3 className="text-lg font-bold">
                  {lastRefreshed.toLocaleTimeString()}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Auto Refresh
                </p>
                <h3 className="text-lg font-bold">
                  {autoRefresh ? `${refreshInterval}s` : "Disabled"}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500 rounded-lg">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Last Shutdown
                </p>
                <h3 className="text-lg font-bold">
                  {shutDownData
                    ? convertTimestamp(shutDownData.TS).split(",")[0]
                    : "N/A"}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <BarChart2 className="h-6 w-6 text-primary" />
              Events Log
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                  fetchData(deviceId, 1);
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-lg overflow-auto">
            <div className="overflow-y-auto max-h-[75vh]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Device ID</TableHead>
                    <TableHead className="font-semibold">Timestamp</TableHead>
                    <TableHead className="font-semibold">Event Type</TableHead>
                    <TableHead className="font-semibold">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: itemsPerPage }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-20"></div>
                        </TableCell>
                        <TableCell className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-32"></div>
                        </TableCell>
                        <TableCell className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-24"></div>
                        </TableCell>
                        <TableCell className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-40"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : eventData.events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Database className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground font-medium">
                            No events found
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    eventData.events.map((event) => (
                      <TableRow key={event._id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {event.DEVICE_ID}
                        </TableCell>
                        <TableCell>{convertTimestamp(event.TS)}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                            {event.Event_Name}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">
                                  {typeof event.Details === "string"
                                    ? event.Details
                                    : JSON.stringify(event.Details)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs break-words">
                                  {typeof event.Details === "string"
                                    ? event.Details
                                    : JSON.stringify(event.Details, null, 2)}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Enhanced Pagination */}
            {eventData.total > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="flex-1 text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium">
                    {Math.min(
                      (currentPage - 1) * itemsPerPage + 1,
                      eventData.total
                    )}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, eventData.total)}
                  </span>{" "}
                  of <span className="font-medium">{eventData.total}</span>{" "}
                  results
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">Page</span>
                      <Input
                        type="number"
                        min={1}
                        max={Math.ceil(eventData.total / itemsPerPage)}
                        value={currentPage}
                        onChange={(e) => {
                          const page = parseInt(e.target.value);
                          if (
                            page >= 1 &&
                            page <= Math.ceil(eventData.total / itemsPerPage)
                          ) {
                            handlePageChange(page);
                          }
                        }}
                        className="w-16 h-8"
                      />
                      <span className="text-sm text-muted-foreground">
                        of {Math.ceil(eventData.total / itemsPerPage)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage >= Math.ceil(eventData.total / itemsPerPage)
                      }
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(
                          Math.ceil(eventData.total / itemsPerPage)
                        )
                      }
                      disabled={
                        currentPage >= Math.ceil(eventData.total / itemsPerPage)
                      }
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
