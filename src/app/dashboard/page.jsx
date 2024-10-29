"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import Image from "next/image";
import Cookies from "js-cookie";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://apmapis.webdevava.live/api";

const TIMEZONE_OFFSETS = {
  "Indian Time": 5.5,
  "Russian Time": 3,
};

function DashboardHeader({
  deviceId,
  lastUpdated,
  autoRefresh,
  setAutoRefresh,
  convertTimestamp,
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
      <h1 className="text-3xl font-bold text-primary">Device ID: {deviceId}</h1>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Last updated:{" "}
          {lastUpdated
            ? convertTimestamp(lastUpdated.getTime() / 1000)
            : "Never"}
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
  );
}

function SearchBar({ deviceId, setDeviceId, handleSearch, handleRefresh }) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Laptop className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Enter Device ID"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="pl-10 h-12 w-full"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
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
      </CardContent>
    </Card>
  );
}

function DetectionPanel({
  data,
  type,
  convertTimestamp,
  handleSort,
  sortConfig,
}) {
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
          {type === "logo" ? "Logo Detection Output" : "Audio Detection Output"}
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
              {data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{convertTimestamp(item.TS)}</TableCell>
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
}

function MemberWatchingState({ memberGuestData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Member Watching State
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {memberGuestData.state.map((state, index) => (
            <Card
              key={index}
              className={`w-full ${
                state
                  ? "bg-green-100 dark:bg-green-900"
                  : "bg-red-100 dark:bg-red-900"
              }`}
            >
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Member {index + 1}</h3>
                <p>Status: {state ? "Active" : "Inactive"}</p>
                <p>
                  Gender:{" "}
                  {memberGuestData.gender[index] === "m" ? "Male" : "Female"}
                </p>
                <p>Age: {memberGuestData.age[index]}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EventsPanel({
  eventData,
  convertTimestamp,
  currentPage,
  totalRecords,
  limit,
  handlePageChange,
}) {
  return (
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
                  <TableCell>{convertTimestamp(event.TS)}</TableCell>
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
  );
}

export default function DevicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deviceId, setDeviceId] = useState("");
  const [logoData, setLogoData] = useState([]);
  const [audioData, setAudioData] = useState([]);
  const [eventData, setEventData] = useState([]);
  const [memberGuestData, setMemberGuestData] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit] = useState(10);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const convertTimestamp = useCallback((timestamp) => {
    const timestampMs =
      typeof timestamp === "number" && timestamp < 100000000000
        ? timestamp * 1000
        : timestamp;
    const date = new Date(timestampMs);
    const utcDate = new Date(date.getTime());
    const offset = TIMEZONE_OFFSETS["Indian Time"] || 0;
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
  }, []);

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
        const [logoResponse, afpResponse, eventResponse, memberGuestResponse] =
          await Promise.all([
            fetch(`${API_URL}/events/logo?deviceId=${id}`),
            fetch(`${API_URL}/events/afp?deviceId=${id}`),
            fetch(`${API_URL}/events/${id}?page=${page}&limit=${limit}`),
            fetch(`${API_URL}/events/member-guest/${id}`),
          ]);
        const logoResult = await logoResponse.json();
        const afpResult = await afpResponse.json();
        const eventResult = await eventResponse.json();
        const memberGuestResult = await memberGuestResponse.json();
        setLogoData(logoResult.data || []);
        setAudioData(afpResult.data || []);
        setEventData(eventResult.events || []);
        setTotalRecords(eventResult.total || 0);
        setMemberGuestData(memberGuestResult.event?.Details || null);
        setLastUpdated(new Date());
        if (
          logoResult.data.length === 0 &&
          afpResult.data.length === 0 &&
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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchAllData(deviceId, newPage);
  };

  return (
    <div className="mx-auto p-6 space-y-6 bg-gradient-to-b from-background to-background/80 container">
      <DashboardHeader
        deviceId={deviceId}
        lastUpdated={lastUpdated}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        convertTimestamp={convertTimestamp}
      />

      <SearchBar
        deviceId={deviceId}
        setDeviceId={setDeviceId}
        handleSearch={handleSearch}
        handleRefresh={handleRefresh}
      />

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

      {error && (
        <div className="flex items-center justify-center p-4 text-destructive bg-destructive/10 rounded-md">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </>
        ) : (
          <>
            <DetectionPanel
              data={logoData}
              type="logo"
              convertTimestamp={convertTimestamp}
              handleSort={handleSort}
              sortConfig={sortConfig}
            />
            <DetectionPanel
              data={audioData}
              type="audio"
              convertTimestamp={convertTimestamp}
              handleSort={handleSort}
              sortConfig={sortConfig}
            />
          </>
        )}
      </div>

      {!isLoading && deviceId && memberGuestData && (
        <MemberWatchingState memberGuestData={memberGuestData} />
      )}

      {!isLoading && (
        <EventsPanel
          eventData={eventData}
          convertTimestamp={convertTimestamp}
          currentPage={currentPage}
          totalRecords={totalRecords}
          limit={limit}
          handlePageChange={handlePageChange}
        />
      )}
    </div>
  );
}
