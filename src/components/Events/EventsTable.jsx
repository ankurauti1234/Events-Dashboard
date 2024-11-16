import { BarChart2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function EventsTable({
  eventData,
  convertTimestamp,
  totalRecords,
  limit,
  currentPage,
  handlePageChange,
}) {
  return (
    <Card>
      <CardHeader className="p-3">
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          Events
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="rounded-lg overflow-hidden bg-popover border">
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
            <div className="flex justify-between items-center mt-4 p-2 border-t">
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
        </div>
      </CardContent>
    </Card>
  );
}
