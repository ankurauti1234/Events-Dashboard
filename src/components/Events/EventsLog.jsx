import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart2,
  Download,
  ChevronLeft,
  ChevronRight,
  Database,
} from "lucide-react";

const eventTypeMapping = {
  3: "MEMBER_GUEST_DECLARATION",
  28: "AUDIO_FINGERPRINT",
  29: "LOGO_DETECTED",
  68: "CHANNEL_CHANGED",
  69: "SHUT_DOWN",
};

export function EventsLog({
  isLoading,
  eventData,
  selectedEvents,
  setSelectedEvents,
  selectedEventType,
  setSelectedEventType,
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  handlePageChange,
  convertTimestamp,
  exportSelectedEvents,
}) {
  const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50, `${eventData.total}`];

  return (
    <Card className="border-2 ">
      <CardHeader className="p-6 border-b">
        {/* Header content remains the same */}
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-primary" />
            Events Log
          </CardTitle>
          <div className="flex items-center gap-4">
            <Select
              value={selectedEventType}
              onValueChange={(value) => {
                setSelectedEventType(value);
                handlePageChange(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {Object.entries(eventTypeMapping).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(value === "all" ? "all" : Number(value));
                handlePageChange(1);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option === "all" ? "Show All" : `${option} per page`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedEvents.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportSelectedEvents}
                className="gap-1.5"
              >
                <Download className="h-4 w-4" />
                Export Selected ({selectedEvents.size})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-20rem)] min-h-[20vh] rounded-b-lg">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedEvents.size === eventData.events.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedEvents(
                          new Set(eventData.events.map((e) => e._id))
                        );
                      } else {
                        setSelectedEvents(new Set());
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="font-semibold">Device ID</TableHead>
                <TableHead className="font-semibold">Timestamp</TableHead>
                <TableHead className="font-semibold">Event Type</TableHead>
                <TableHead className="font-semibold">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({
                  length: itemsPerPage === "all" ? 10 : itemsPerPage,
                }).map((_, index) => (
                  <TableRow key={index} className="animate-pulse">
                    <TableCell className="w-[50px]">
                      <div className="h-4 w-4 bg-muted rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-20"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-32"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-24"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-40"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : eventData.events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
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
                  <TableRow
                    key={event._id}
                    className={`${
                      event.Event_Name === "CHANNEL_CHANGED"
                        ? "bg-yellow-500/15 hover:bg-yellow-600/25"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <TableCell className="w-[50px]">
                      <Checkbox
                        checked={selectedEvents.has(event._id)}
                        onCheckedChange={(checked) => {
                          const newSelected = new Set(selectedEvents);
                          if (checked) {
                            newSelected.add(event._id);
                          } else {
                            newSelected.delete(event._id);
                          }
                          setSelectedEvents(newSelected);
                        }}
                      />
                    </TableCell>
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
        </ScrollArea>

        {/* Pagination section remains the same */}
        {eventData.total > 0 && itemsPerPage !== "all" && (
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
              of <span className="font-medium">{eventData.total}</span> results
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
                    handlePageChange(Math.ceil(eventData.total / itemsPerPage))
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
      </CardContent>
    </Card>
  );
}
