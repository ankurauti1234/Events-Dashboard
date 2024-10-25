'use client'

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  User,
  Clock,
  AlertCircle,
  Filter,
  Settings,
  Bell,
  Download,
  Calendar
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [autoReload, setAutoReload] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [currentPage, setCurrentPage] = useState({
    logo: 1,
    audio: 1,
    events: 1,
  });
  const itemsPerPage = 5;
  const { scrollY } = useScroll();

  const searchBarPosition = useTransform(
    scrollY,
    [0, 100],
    ["translateY(0px)", "translateY(-120px)"]
  );

  const headerSearchPosition = useTransform(
    scrollY,
    [0, 100],
    ["translateY(-60px)", "translateY(0px)"]
  );

  useEffect(() => {
    const updateScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useEffect(() => {
    let interval;
    if (autoReload) {
      interval = setInterval(() => {
        console.log("Auto reloading...");
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoReload]);

  const FilterSection = () => (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{
        height: showFilters ? "auto" : 0,
        opacity: showFilters ? 1 : 0,
      }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <Card className="p-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Time Range</label>
            <Select
              value={selectedTimeRange}
              onValueChange={setSelectedTimeRange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Event Type</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="alert">Alerts</SelectItem>
                <SelectItem value="warning">Warnings</SelectItem>
                <SelectItem value="info">Information</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Location</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="living">Living Room</SelectItem>
                <SelectItem value="kitchen">Kitchen</SelectItem>
                <SelectItem value="bedroom">Bedroom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <Button variant="outline" size="sm">
            Reset Filters
          </Button>
          <Button size="sm">Apply Filters</Button>
        </div>
      </Card>
    </motion.div>
  );

  const TablePagination = ({
    currentPage,
    totalPages,
    onChange,
    tableName,
  }) => (
    <div className="flex items-center justify-between px-2 py-4">
      <span className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="hover:bg-gray-100"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const getSeverityColor = (severity) => {
    const colors = {
      Low: "bg-green-100 text-green-800 border-green-200",
      Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      High: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[severity] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusColor = (status) => {
    const colors = {
      Active: "bg-green-500",
      Away: "bg-yellow-500",
      Inactive: "bg-gray-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
            >
              Inditronics
            </motion.div>

            <motion.div
              style={{ transform: headerSearchPosition }}
              className="hidden lg:flex items-center gap-2"
            >
              {isScrolled && (
                <>
                  <Input
                    type="text"
                    placeholder="Search Device ID..."
                    className="w-64"
                  />
                  <Button size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </>
              )}
            </motion.div>
          </div>

          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      3
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-8" />

            <motion.div
              className="h-8 w-8 rounded-full bg-gray-200 cursor-pointer"
              whileHover={{ scale: 1.05 }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Search Section */}
          <motion.div style={{ transform: searchBarPosition }} className="mb-8">
            <Card className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search Device ID..."
                      className="pl-10"
                    />
                  </div>
                  <Button className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Reload
                  </Button>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={autoReload}
                      onCheckedChange={setAutoReload}
                    />
                    <span className="text-sm text-gray-600">Auto Reload</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </div>
                <FilterSection />
              </div>
            </Card>
          </motion.div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              {
                title: "Total Devices",
                value: "24",
                change: "+2",
                icon: <Settings className="h-5 w-5" />,
              },
              {
                title: "Active Users",
                value: "12",
                change: "-1",
                icon: <User className="h-5 w-5" />,
              },
              {
                title: "Events Today",
                value: "156",
                change: "+23",
                icon: <AlertCircle className="h-5 w-5" />,
              },
              {
                title: "Uptime",
                value: "99.9%",
                change: "+0.1",
                icon: <Clock className="h-5 w-5" />,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">{item.title}</p>
                      <h3 className="text-2xl font-semibold mt-1">
                        {item.value}
                      </h3>
                      <p
                        className={`text-sm mt-1 ${
                          item.change.startsWith("+")
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.change} from last week
                      </p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">{item.icon}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Logo and Audio Detection Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Logo Detection</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <TableRow key={i} className="hover:bg-gray-50">
                        <TableCell className="font-mono">
                          {new Date().toLocaleTimeString()}
                        </TableCell>
                        <TableCell>Channel {i + 1}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{90 - i * 5}%</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  currentPage={currentPage.logo}
                  totalPages={5}
                  onChange={(page) =>
                    setCurrentPage({ ...currentPage, logo: page })
                  }
                  tableName="logo"
                />
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Audio Detection</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <TableRow key={i} className="hover:bg-gray-50">
                        <TableCell className="font-mono">
                          {new Date().toLocaleTimeString()}
                        </TableCell>
                        <TableCell>Channel {i + 1}</TableCell>
                        <TableCell>{`${i + 1}:${i * 15}`}s</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  currentPage={currentPage.audio}
                  totalPages={5}
                  onChange={(page) =>
                    setCurrentPage({ ...currentPage, audio: page })
                  }
                  tableName="audio"
                />
              </Card>
            </motion.div>
          </div>

          {/* Family Members Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Family Members</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    name: "John Doe",
                    role: "Parent",
                    age: 45,
                    gender: "Male",
                    status: "Active",
                    lastSeen: "2m ago",
                  },
                  {
                    name: "Jane Doe",
                    role: "Parent",
                    age: 42,
                    gender: "Female",
                    status: "Away",
                    lastSeen: "15m ago",
                  },
                  {
                    name: "Mike Doe",
                    role: "Child",
                    age: 15,
                    gender: "Male",
                    status: "Active",
                    lastSeen: "1m ago",
                  },
                  {
                    name: "Sarah Doe",
                    role: "Child",
                    age: 12,
                    gender: "Female",
                    status: "Inactive",
                    lastSeen: "1h ago",
                  },
                ].map((member, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * i }}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-3">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                          <User className="h-8 w-8 text-blue-600" />
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${getStatusColor(
                            member.status
                          )} ring-2 ring-white`}
                        />
                      </div>
                      <h4 className="font-medium text-gray-900">
                        {member.name}
                      </h4>
                      <Badge variant="secondary" className="mt-1">
                        {member.role}
                      </Badge>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-600">
                          Age: {member.age}
                        </p>
                        <p className="text-xs text-gray-600">
                          Gender: {member.gender}
                        </p>
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{member.lastSeen}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Events Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold">Recent Events</h3>
                  <Badge variant="secondary" className="ml-2">
                    Live
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Date Range
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow
                      key={i}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <TableCell className="font-mono">
                        EVT-{(1000 + i).toString()}
                      </TableCell>
                      <TableCell>
                        {["Motion", "Audio", "System", "Alert", "Warning"][i]}
                      </TableCell>
                      <TableCell className="font-mono">
                        {new Date().toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        {
                          [
                            "Living Room",
                            "Kitchen",
                            "Bedroom",
                            "Garden",
                            "Garage",
                          ][i]
                        }
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getSeverityColor(
                            ["Low", "Medium", "High", "Low", "Medium"][i]
                          )}`}
                        >
                          {["Low", "Medium", "High", "Low", "Medium"][i]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="cursor-help">
                              {"Event details for event #" + (i + 1)}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {"Complete event details for event #" + (i + 1)}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                currentPage={currentPage.events}
                totalPages={5}
                onChange={(page) =>
                  setCurrentPage({ ...currentPage, events: page })
                }
                tableName="events"
              />
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}