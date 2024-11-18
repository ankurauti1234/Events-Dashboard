"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EventsLog } from "./EventsLog";
import { DeviceManagement } from "./DeviceManagement";
import { StatsSection } from "./StatsSection";
import EventsCharts from "./EventsCharts";
import PageSection from "../PageSection";
import { Badge } from "../ui/badge";
import { Activity, ArrowUpDown, CalendarRange, RefreshCcw } from "lucide-react";
import { Button } from "../ui/button";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://apmapis.webdevava.live/api";

const TIMEZONE_OFFSETS = {
  "Russian Time": 3,
  "Indian Time": 5.5,
  UTC: 0,
  EST: -5,
};

export default function DeviceEventsPage() {
  const [deviceId, setDeviceId] = useState("");
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
  const [selectedEvents, setSelectedEvents] = useState(new Set());
  const [selectedEventType, setSelectedEventType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  const formatDateToUTC = (dateStr, isEndDate = false) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isEndDate) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return date.toISOString();
  };

  const fetchData = useCallback(
    async (id, page = 1, start = null, end = null) => {
      setIsLoading(true);
      setError("");
      try {
        let url = `${API_URL}/events?deviceId=${id}&page=${page}`;

        if (start) {
          const startDateTime = formatDateToUTC(start);
          url += `&startDate=${startDateTime}`;
        }

        if (end) {
          const endDateTime = formatDateToUTC(end, true);
          url += `&endDate=${endDateTime}`;
        }

        if (itemsPerPage !== "all") {
          url += `&limit=${itemsPerPage}`;
        }

        if (selectedEventType && selectedEventType !== "all") {
          url += `&type=${selectedEventType}`;
        }

        console.log("Fetching data from URL:", url);

        const response = await fetch(url);
        const data = await response.json();

        // Handle various no data scenarios
        if (
          !response.ok ||
          (data.message &&
            (data.message.includes("No events found") ||
              data.message.includes(
                "No events found with the specified criteria"
              )))
        ) {
          setEventData({ events: [], total: 0 });
          if (!response.ok) {
            throw new Error(data.message || "Failed to fetch data");
          }
          return;
        }

        setEventData({
          events: data.events || [],
          total: data.total || 0,
        });

        setLastRefreshed(new Date());
        setSelectedEvents(new Set());
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Error fetching data");
        setEventData({ events: [], total: 0 });
      } finally {
        setIsLoading(false);
      }
    },
    [itemsPerPage, selectedEventType]
  );

  const handleSearch = useCallback(
    (id = deviceId, start = startDate, end = endDate) => {
      const queryParams = new URLSearchParams();
      if (id) queryParams.set("deviceId", id);
      // if (start) queryParams.set("startDate", start);
      // if (end) queryParams.set("endDate", end);

      router.push(`?${queryParams.toString()}`);
      setCurrentPage(1);
      setEventData({ events: [], total: 0 }); // Reset before new search
      fetchData(id, 1, start, end);
    },
    [deviceId, startDate, endDate, router, fetchData]
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchData(deviceId, newPage, startDate, endDate);
  };

  const clearSearch = () => {
    setDeviceId("");
    setStartDate("");
    setEndDate("");
    setEventData({ events: [], total: 0 });
    router.push("/");
    setCurrentPage(1);
    fetchData("", 1);
  };

  const handleDateSearch = () => {
    handleSearch(deviceId, startDate, endDate);
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setEventData({ events: [], total: 0 });
    handleSearch(deviceId);
  };

  const onRefresh = () => {
    fetchData(deviceId, currentPage, startDate, endDate);
  };

    const handleChartsRefresh = () => {
      // Call the refresh function exposed by EventsCharts
      if (window.refreshChartsData) {
        window.refreshChartsData();
      }
    };

  useEffect(() => {
    const urlDeviceId = searchParams.get("deviceId");
    const urlStartDate = searchParams.get("startDate");
    const urlEndDate = searchParams.get("endDate");
    if (urlDeviceId || urlStartDate || urlEndDate) {
      if (urlDeviceId) setDeviceId(urlDeviceId);
      if (urlStartDate) setStartDate(urlStartDate);
      if (urlEndDate) setEndDate(urlEndDate);
      fetchData(urlDeviceId || "", currentPage, urlStartDate, urlEndDate);
    } else {
      fetchData("", currentPage);
    }
  }, [searchParams, fetchData, currentPage]);

  useEffect(() => {
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchData(deviceId, currentPage, startDate, endDate);
      }, refreshInterval * 1000);
    }
    return () => clearInterval(intervalId);
  }, [
    autoRefresh,
    refreshInterval,
    deviceId,
    fetchData,
    currentPage,
    startDate,
    endDate,
  ]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageSection
        className="mb-12"
        title="Performance Analytics"
        description="Real-time performance metrics and analytics dashboard showing device activity, uptime statistics, and system health indicators"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Devices", href: "/devices" },
          { label: "Analytics" },
        ]}
        badge="live metrics"
        actions={
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Real-time
            </Badge>
            <Button
              variant="outline"
              size="icon"
              onClick={handleChartsRefresh}
              className="h-8 w-8"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        }
      >
        <EventsCharts />
      </PageSection>

      <PageSection
        title="Event Management Console"
        description="Comprehensive event tracking system with advanced filtering, search capabilities, and batch operations for device events"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Devices", href: "/devices" },
          { label: "Events" },
        ]}
        badge="all events"
        actions={
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />
              Auto-refresh
            </Badge>
          </div>
        }
      >
        <main className="flex flex-col gap-6">
          <StatsSection
            totalEvents={eventData.total}
            lastRefreshed={lastRefreshed}
            autoRefresh={autoRefresh}
            refreshInterval={refreshInterval}
            shutDownData={shutDownData}
            convertTimestamp={convertTimestamp}
          />
          <DeviceManagement
            deviceId={deviceId}
            setDeviceId={setDeviceId}
            timezone={timezone}
            setTimezone={setTimezone}
            autoRefresh={autoRefresh}
            setAutoRefresh={setAutoRefresh}
            refreshInterval={refreshInterval}
            setRefreshInterval={setRefreshInterval}
            shutDownData={shutDownData}
            convertTimestamp={convertTimestamp}
            handleSearch={handleSearch}
            clearSearch={clearSearch}
            onRefresh={onRefresh}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            handleDateSearch={handleDateSearch}
            clearDateFilter={clearDateFilter}
          />

          <EventsLog
            isLoading={isLoading}
            eventData={eventData}
            selectedEvents={selectedEvents}
            setSelectedEvents={setSelectedEvents}
            selectedEventType={selectedEventType}
            setSelectedEventType={setSelectedEventType}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
            convertTimestamp={convertTimestamp}
          />
        </main>
      </PageSection>
    </div>
  );
}
