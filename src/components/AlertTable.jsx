import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Phone,
  Smartphone,
  Battery,
  ToggleRight,
  Thermometer,
} from "lucide-react";

// Mock data - replace with your API call
const mockAlerts = [
  {
    id: 1,
    deviceId: "100001",
    type: "sim_alert",
    timestamp: "2024-10-29T10:00:00",
    details: { message: "SIM card removed" },
  },
  {
    id: 2,
    deviceId: "100002",
    type: "sos_alert",
    timestamp: "2024-10-29T09:45:00",
    details: { message: "SOS button pressed" },
  },
  {
    id: 3,
    deviceId: "100003",
    type: "tamper",
    timestamp: "2024-10-29T09:30:00",
    details: { message: "Device tampered with" },
  },
  {
    id: 4,
    deviceId: "100004",
    type: "temperature",
    timestamp: "2024-10-29T09:15:00",
    details: { message: "High temperature detected (40°C)" },
  },
  {
    id: 5,
    deviceId: "100005",
    type: "battery",
    timestamp: "2024-10-29T09:00:00",
    details: { message: "Battery level critical (10%)" },
  },
  {
    id: 6,
    deviceId: "100006",
    type: "system_alert",
    timestamp: "2024-10-29T08:45:00",
    details: { message: "Firmware update available" },
  },
  {
    id: 7,
    deviceId: "100007",
    type: "sim_alert",
    timestamp: "2024-10-29T08:30:00",
    details: { message: "SIM card expired" },
  },
  {
    id: 8,
    deviceId: "100008",
    type: "tamper",
    timestamp: "2024-10-29T08:15:00",
    details: { message: "Unauthorized access detected" },
  },
  {
    id: 9,
    deviceId: "100009",
    type: "temperature",
    timestamp: "2024-10-29T08:00:00",
    details: { message: "Low temperature detected (5°C)" },
  },
  {
    id: 10,
    deviceId: "100010",
    type: "battery",
    timestamp: "2024-10-29T07:45:00",
    details: { message: "Battery level low (30%)" },
  },
];

const AlertTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination
  const totalPages = Math.ceil(mockAlerts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAlerts = mockAlerts.slice(startIndex, endIndex);

  // Helper function to get alert type icon
  const getAlertTypeIcon = (type) => {
    switch (type) {
      case "sim_alert":
        return <Phone className="w-4 h-4" />;
      case "sos_alert":
        return <Smartphone className="w-4 h-4" />;
      case "tamper":
        return <ToggleRight className="w-4 h-4" />;
      case "temperature":
        return <Thermometer className="w-4 h-4" />;
      case "battery":
        return <Battery className="w-4 h-4" />;
      case "system_alert":
        return <Info className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Helper function to get alert type badge
  const getAlertTypeBadge = (type) => {
    const configs = {
      sim_alert: {
        icon: <Phone className="w-4 h-4" />,
        variant: "secondary",
      },
      sos_alert: {
        icon: <Smartphone className="w-4 h-4" />,
        variant: "destructive",
      },
      tamper: {
        icon: <ToggleRight className="w-4 h-4" />,
        variant: "warning",
      },
      temperature: {
        icon: <Thermometer className="w-4 h-4" />,
        variant: "info",
      },
      battery: {
        icon: <Battery className="w-4 h-4" />,
        variant: "warning",
      },
      system_alert: {
        icon: <Info className="w-4 h-4" />,
        variant: "secondary",
      },
    };

    const config = configs[type] || configs.error;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        <span className="capitalize">{type.replace("_", " ")}</span>
      </Badge>
    );
  };

  // Format timestamp
  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Device Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Device ID</TableHead>
                <TableHead className="w-[150px]">Timestamp</TableHead>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-mono">
                      {getAlertTypeIcon(alert.type)}
                      {alert.deviceId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(alert.timestamp)}
                    </span>
                  </TableCell>
                  <TableCell>{getAlertTypeBadge(alert.type)}</TableCell>
                  <TableCell>
                    <span className="text-sm">{alert.details.message}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, mockAlerts.length)} of{" "}
            {mockAlerts.length} alerts
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertTable;
