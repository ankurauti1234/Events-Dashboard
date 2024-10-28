"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  AlertCircle,
  BarChart2,
  Radio,
  Tv,
  Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie";
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
import Topbar from "@/components/Topbar";
import { useTimezoneStore } from "@/stores/timezoneStore";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import MemberGuestPanel from "@/components/MemberGuestPanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://apmapis.webdevava.live/api";

const TIMEZONE_OFFSETS = {
  "Indian Time": 5.5,
  "Russian Time": 3,
};

const convertTimestamp = (timestamp, timezone) => {
  // Convert timestamp to milliseconds if it's in seconds
  const timestampMs =
    typeof timestamp === "number" && timestamp < 100000000000
      ? timestamp * 1000
      : timestamp;

  // Create date object from timestamp
  const date = new Date(timestampMs);

  // Get the UTC time
  const utcDate = new Date(date.getTime());

  // Get timezone offset in hours
  const offset = TIMEZONE_OFFSETS[timezone] || 0;

  // Convert offset hours to milliseconds and add to UTC time
  const offsetMs = offset * 60 * 60 * 1000;
  utcDate.setTime(utcDate.getTime() + offsetMs);

  // Format the date string
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
};

function DevicePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { timezone } = useTimezoneStore();
  const [deviceId, setDeviceId] = useState("");
  const [logoData, setLogoData] = useState([]);
  const [audioData, setAudioData] = useState([]);
  const [eventData, setEventData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit, setLimit] = useState(10);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get("token");
      const expiry = Cookies.get("expiry");

      if (!token) {
        router.push("/login");
      } else if (expiry && Date.now() > Number(expiry)) {
        setTokenExpired(true);
        clearAuthCookies();
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const urlDeviceId = searchParams.get("deviceId");
    if (urlDeviceId) {
      setDeviceId(urlDeviceId);
      fetchAllData(urlDeviceId, 1);
    }
  }, [searchParams]);

  useEffect(() => {
    let intervalId;
    if (autoRefresh && deviceId) {
      intervalId = setInterval(() => {
        fetchAllData(deviceId, currentPage);
      }, refreshInterval * 1000);
    }
    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, deviceId, currentPage]);

  const clearAuthCookies = () => {
    Cookies.remove("token");
    Cookies.remove("name");
    Cookies.remove("role");
    Cookies.remove("expiry");
    Cookies.remove("email");
  };

  const handleLoginRedirect = () => {
    setTokenExpired(false);
    router.push("/login");
  };

  const fetchAllData = useCallback(
    async (id, page) => {
      setIsLoading(true);
      setError("");
      try {
        const [logoResponse, afpResponse, eventResponse] = await Promise.all([
          fetch(`${API_URL}/events/logo?deviceId=${id}`),
          fetch(`${API_URL}/events/afp?deviceId=${id}`),
          fetch(`${API_URL}/events/${id}?page=${page}&limit=${limit}`),
        ]);

        const logoResult = await logoResponse.json();
        const afpResult = await afpResponse.json();
        const eventResult = await eventResponse.json();

        setLogoData(logoResult.data || []);
        setAudioData(afpResult.data || []);
        setEventData(eventResult.events || []);
        setTotalRecords(eventResult.total || 0);
        setLastUpdated(new Date());

        if (
          logoResult.data.length === 0 &&
          afpResult.data.length === 0 &&
          eventResult.events.length === 0
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

  const handleSearch = () => {
    if (deviceId) {
      router.push(`?deviceId=${deviceId}`);
      setCurrentPage(1);
      fetchAllData(deviceId, 1);
    }
  };

  const handleRefresh = () => {
    if (deviceId) {
      fetchAllData(deviceId, currentPage);
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = (data) => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchAllData(deviceId, newPage);
  };

  const renderDetectionTable = (data, type) => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {type === "logo"
                ? "No logo detection data"
                : "No audio detection data"}
            </CardTitle>
          </CardHeader>
        </Card>
      );
    }

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {type === "logo" ? (
              <Tv className="h-5 w-5" />
            ) : (
              <Radio className="h-5 w-5" />
            )}
            {type === "logo"
              ? "Logo Detection Output"
              : "Audio Detection Output"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("TS")}>
                    Timestamp
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Detection</TableHead>
                {type === "logo" && (
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("confidence")}
                    >
                      Confidence
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
          </Table>
          <ScrollArea className="h-[40vh]">
            <Table>
              <TableBody>
                {sortedData(data).map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{convertTimestamp(item.TS, timezone)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="relative w-10 h-10">
                          <Image
                            src={`https://apm-logo-bucket.s3.ap-south-1.amazonaws.com/${item.channel_id}.png`}
                            alt={item.logoDetection || item.channel_id}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-full"
                          />
                        </div>
                        {item.channel_id}
                      </div>
                    </TableCell>
                    {type === "logo" && (
                      <TableCell>
                        <Badge
                          className={`${
                            item.accuracy < 0.5
                              ? "bg-red-500 text-white"
                              : item.accuracy > 0.75
                              ? "bg-green-500 text-white"
                              : "bg-yellow-500 text-black"
                          }`}
                        >
                          {(item.accuracy * 100).toFixed(1)}%
                        </Badge>
                       
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mx-auto p-6 space-y-6 bg-gradient-to-b from-background to-background/80">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl font-bold text-foreground">
          Device ID: <span className="text-primary">{deviceId}</span> Live Feed
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated:{" "}
            {lastUpdated
              ? convertTimestamp(lastUpdated.getTime() / 1000, timezone)
              : "Never"}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setAutoRefresh(!autoRefresh)}
            aria-label={autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"}
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
            <AlertDialogAction onClick={handleLoginRedirect}>
              Login Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="w-full mx-auto shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Device Search and Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y- flex items-center">
            <div className="relative">
              <Laptop className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Enter Device ID"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="pl-10 h-12 w-96"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSearch}
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

          <div className="space-y-4 pt-4 border-t">
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
              <div className="flex items-center gap-3">
                <Label
                  htmlFor="refresh-interval"
                  className="text-sm whitespace-nowrap"
                >
                  Refresh every
                </Label>
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    id="refresh-interval"
                    type="number"
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="w-20 h-9"
                    min="5"
                  />
                  <span className="text-sm text-muted-foreground">seconds</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center justify-center p-4 text-destructive bg-destructive/10 rounded-md">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            {renderDetectionTable(logoData, "logo")}
            {renderDetectionTable(audioData, "audio")}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No events found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    eventData.map((event) => (
                      <TableRow key={event._id}>
                        <TableCell>{event.DEVICE_ID}</TableCell>
                        <TableCell>
                          {convertTimestamp(event.TS, timezone)}
                        </TableCell>
                        <TableCell>{event.Event_Name}</TableCell>
                        <TableCell>
                          {typeof event.Details === "string"
                            ? event.Details
                            : JSON.stringify(event.Details)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {totalRecords > limit && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <span>
                    Page {currentPage} of {Math.ceil(totalRecords / limit)}
                  </span>
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(totalRecords / limit)}
                    variant="outline"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Add this just before the final closing div */}
      {!isLoading && deviceId && <MemberGuestPanel deviceId={deviceId} />}
    </div>
  );
}


export default function DevicePage() {
  return (
    <>
      <Topbar />
      <React.Suspense
        fallback={
          <div className="p-6 space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        }
      >
        <DevicePageContent />
      </React.Suspense>
    </>
  );
}