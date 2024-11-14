"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  RefreshCw,
  Search,
  AlertCircle,
  Laptop,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import LogoDetection from "@/components/LogoDetection";
import AudioDetection from "@/components/AudioDetection";
import MemberWatchingState from "@/components/MemberWatchingState";
import EventsTable from "@/components/EventsTable";
import { ScrollArea } from "./ui/scroll-area";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://apmapis.webdevava.live/api";

const TIMEZONE_OFFSETS = {
  "Indian Time": 5.5,
  "Russian Time": 3,
};

export default function DevicePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deviceId, setDeviceId] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [logoData, setLogoData] = useState([]);
  const [audioData, setAudioData] = useState([]);
  const [eventData, setEventData] = useState([]);
  const [memberGuestData, setMemberGuestData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit] = useState(10);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [timezone, setTimezone] = useState("Indian Time");
  const inputRef = useRef(null);

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

  const fetchAllData = useCallback(
    async (id, page) => {
      if (!id) return;

      setIsLoading(true);
      setError("");
      try {
        const [logoResponse, afpResponse, eventResponse, memberGuestResponse] =
          await Promise.all([
            fetch(`${API_URL}/events/${id}?type=29`),
            fetch(`${API_URL}/events/${id}?type=28`),
            fetch(`${API_URL}/events/${id}?page=${page}&limit=${limit}`),
            fetch(`${API_URL}/events/latest?deviceId=${id}&type=3`),
          ]);
        const logoResult = await logoResponse.json();
        const afpResult = await afpResponse.json();
        const eventResult = await eventResponse.json();
        const memberGuestResult = await memberGuestResponse.json();

        setLogoData(logoResult.events || []);
        setAudioData(afpResult.events || []);
        setEventData(eventResult.events || []);
        setTotalRecords(eventResult.total || 0);
        setMemberGuestData(memberGuestResult.event?.Details || null);
        setLastUpdated(new Date());

        if (
          logoResult.events.length === 0 &&
          afpResult.events.length === 0 &&
          eventResult.events.length === 0 &&
          !memberGuestResult.event
        ) {
          setError("No data found for this device ID.");
        }
      } catch (error) {
        setError("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    const urlDeviceId = searchParams.get("deviceId");
    if (urlDeviceId) {
      setDeviceId(urlDeviceId);
      fetchAllData(urlDeviceId, 1);
    }

    // Load suggestions from localStorage
    const savedSuggestions = JSON.parse(
      localStorage.getItem("deviceSuggestions") || "[]"
    );
    setSuggestions(savedSuggestions);
  }, [searchParams, fetchAllData]);

  useEffect(() => {
    let intervalId;
    if (autoRefresh && deviceId) {
      intervalId = setInterval(() => {
        fetchAllData(deviceId, currentPage);
      }, parseInt(refreshInterval) * 1000);
    }
    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, deviceId, currentPage, fetchAllData]);

  const handleSearch = (id = deviceId) => {
    if (id) {
      router.push(`?deviceId=${id}`);
      setCurrentPage(1);
      fetchAllData(id, 1);

      // Save to localStorage
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

  const handleRefresh = () => {
    if (deviceId) {
      fetchAllData(deviceId, currentPage);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchAllData(deviceId, newPage);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setDeviceId(value);
    if (value) {
      const filteredSuggestions = suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions(
        JSON.parse(localStorage.getItem("deviceSuggestions") || "[]")
      );
      setShowSuggestions(false);
    }
  };

  // const handleSuggestionClick = (suggestion) => {
  //   setDeviceId(suggestion);
  //   setShowSuggestions(false);
  //   router.push(`?deviceId=${suggestion}`);
  // };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const removeSuggestion = (suggestionToRemove) => {
    const updatedSuggestions = suggestions.filter(
      (suggestion) => suggestion !== suggestionToRemove
    );
    setSuggestions(updatedSuggestions);
    localStorage.setItem(
      "deviceSuggestions",
      JSON.stringify(updatedSuggestions)
    );
  };

  return (
    <div className="mx-auto p-6 space-y-6 bg-gradient-to-b from-background to-background/80 container">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">
          Device ID: <span className="text-primary">{deviceId}</span> Live Feed
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated:{" "}
            {lastUpdated ? convertTimestamp(lastUpdated.getTime()) : "Never"}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setAutoRefresh(!autoRefresh)}
            aria-label={
              autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"
            }
          >
            <RefreshCw
              className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      <AlertDialog open={tokenExpired} onOpenChange={setTokenExpired}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Session Expired</AlertDialogTitle>
            <AlertDialogDescription>
              Your session has expired. Please log in again to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push("/login")}>
              Login Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="w-full mx-auto">
        <CardHeader className="space-y-1 p-3 ">
          <CardTitle className="text-lg">Device Search and Control</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex flex-col sm:flex-row items-center gap-4 pb-3">
            <div className="relative flex-1 w-full bg-popover">
              <Laptop className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Enter Device ID"
                value={deviceId}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10 h-12 w-full"
                ref={inputRef}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-popover border mt-1 rounded-md shadow-lg">
                  <ScrollArea className="h-48 w-full">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className=" hover:bg-accent cursor-pointer flex justify-between items-center"
                      >
                        <span
                          onClick={() =>
                            router.push(`?deviceId=${suggestion}`)
                          }
                          className=" w-full px-4 py-2"
                        >
                          {suggestion}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSuggestion(suggestion);
                          }}
                          aria-label={`Remove ${suggestion} from suggestions`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                onClick={() => handleSearch()}
                className="flex-1 h-12 bg-primary hover:bg-primary/90"
              >
                <Search className="mr-2 h-5 w-5" />
                Search Device
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="flex-1 h-12 border-2"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Refresh Data
              </Button>
            </div>
          </div>
          <Separator />
          <div className="pt-4">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="auto-refresh"
                className="text-base font-medium cursor-pointer"
              >
                Auto-refresh
              </Label>
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
            </div>
            {autoRefresh && (
              <div className="flex items-center gap-3 mt-2">
                <Label
                  htmlFor="refresh-interval"
                  className="text-sm whitespace-nowrap"
                >
                  Refresh every
                </Label>
                <Select
                  value={refreshInterval.toString()}
                  onValueChange={(value) => setRefreshInterval(parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="30 seconds" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Refresh Rates</SelectLabel>
                      <SelectItem value="5">5 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                      <SelectItem value="600">10 minutes</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-[300px] " />
            <Skeleton className="h-[300px]" />
          </>
        ) : (
          <>
              {!logoData && <LogoDetection
                data={logoData}
                convertTimestamp={convertTimestamp}
              />}
            <AudioDetection
              data={audioData}
              convertTimestamp={convertTimestamp}
            />
          </>
        )}
      </div>

      {/* {!isLoading && deviceId && memberGuestData && (
        <MemberWatchingState memberGuestData={memberGuestData} />
      )} */}

      <EventsTable
        eventData={eventData}
        convertTimestamp={convertTimestamp}
        totalRecords={totalRecords}
        limit={limit}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
      />
    </div>
  );
}