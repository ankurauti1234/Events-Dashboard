import { useState, useCallback } from "react";
import {
  Download,
  AlertCircle,
  Image as ImageIcon,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

export function LogoDetectionTable({
  data,
  convertTimestamp,
  onExport,
  onPageChange,
  compact = false,
}) {
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSelectAll = useCallback(
    (checked) => {
      const newSelectedItems = {};
      data.events?.forEach((item) => {
        newSelectedItems[item._id] = checked;
      });
      setSelectedItems(newSelectedItems);
      setSelectAll(checked);
    },
    [data.events]
  );

  const handleSelectItem = useCallback((id, checked) => {
    setSelectedItems((prev) => ({ ...prev, [id]: checked }));
    setSelectAll(false);
  }, []);

  const handleExport = useCallback(() => {
    const selectedData = data.events?.filter((item) => selectedItems[item._id]);
    onExport(selectedData?.length > 0 ? selectedData : data.events);
  }, [data.events, selectedItems, onExport]);

  const handleLimitChange = useCallback(
    (newLimit) => {
      const parsedLimit = parseInt(newLimit, 10);
      setLimit(parsedLimit);
      setCurrentPage(1);
      onPageChange(1, parsedLimit);
    },
    [onPageChange]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      setCurrentPage(newPage);
      onPageChange(newPage, limit);
    },
    [limit, onPageChange]
  );

  const getConfidenceColor = (confidence) => {
    if (confidence >= 75) return "bg-green-500";
    if (confidence >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const totalPages = Math.ceil((data.total || 0) / limit);
  const selectedCount = Object.values(selectedItems).filter(Boolean).length;
  const totalCount = data.events?.length || 0;

  if (!data.events || data.events.length === 0) {
    return (
      <Card className={compact ? "w-full p-2" : "w-full"}>
        <CardHeader className={compact ? "p-2" : ""}>
          <CardTitle className={compact ? "text-lg" : "text-xl font-semibold"}>
            Logo Detection Output
          </CardTitle>
          <CardDescription className={compact ? "text-sm" : ""}>
            Monitor and analyze logo detection events
          </CardDescription>
        </CardHeader>
        <CardContent className={compact ? "p-2" : ""}>
          <div
            className={`flex flex-col items-center justify-center ${
              compact ? "h-[40vh]" : "h-[70vh]"
            } space-y-4`}
          >
            <div className={`rounded-full bg-muted ${compact ? "p-4" : "p-6"}`}>
              <ImageIcon className={compact ? "h-8 w-8" : "h-12 w-12"} />
            </div>
            <div className="text-center space-y-2">
              <h3
                className={
                  compact ? "text-base font-medium" : "text-lg font-semibold"
                }
              >
                No Logo Detections Found
              </h3>
              <p
                className={`text-muted-foreground ${
                  compact ? "text-xs max-w-xs" : "max-w-sm"
                }`}
              >
                There are currently no logo detection events recorded for this
                device. New detections will appear here automatically once
                captured.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={compact ? "w-full p-2" : "w-full"}>
      <CardHeader className={compact ? "space-y-2 p-2" : "space-y-4"}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle
              className={compact ? "text-lg" : "text-xl font-semibold"}
            >
              Logo Detection Output
            </CardTitle>
            <CardDescription className={compact ? "text-sm" : ""}>
              Showing {data.events.length} of {data.total} total detections
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleExport}
                  className={compact ? "text-sm px-2 py-1" : "space-x-2"}
                >
                  <Download className={compact ? "h-3 w-3 mr-1" : "h-4 w-4"} />
                  <span>
                    Export {selectedCount > 0 ? `(${selectedCount})` : "All"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download detection data as CSV</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {selectedCount > 0 && (
          <Alert className={compact ? "p-2" : ""}>
            <AlertCircle className={compact ? "h-3 w-3" : "h-4 w-4"} />
            <AlertTitle className={compact ? "text-sm" : ""}>
              Selection Active
            </AlertTitle>
            <AlertDescription className={compact ? "text-xs" : ""}>
              {selectedCount} of {totalCount} detections selected
            </AlertDescription>
          </Alert>
        )}
        <Progress
          value={(selectedCount / totalCount) * 100}
          className={compact ? "h-1" : "h-2"}
        />
      </CardHeader>
      <Separator />
      <CardContent className={compact ? "mt-2" : "mt-4"}>
        <ScrollArea
          className={
            compact
              ? "h-[40vh] rounded-md border"
              : "h-[60vh] rounded-md border"
          }
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className={compact ? "w-[30px] p-2" : "w-[50px]"}>
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className={compact ? "p-2" : ""}>
                  Timestamp
                </TableHead>
                <TableHead className={compact ? "p-2" : ""}>
                  Channel ID
                </TableHead>
                <TableHead className={compact ? "p-2" : ""}>
                  Confidence Score
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.events.map((item) => (
                <TableRow key={item._id} className="hover:bg-muted/50">
                  <TableCell className={compact ? "p-2" : ""}>
                    <Checkbox
                      checked={selectedItems[item._id] || false}
                      onCheckedChange={(checked) =>
                        handleSelectItem(item._id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell className={compact ? "p-2" : ""}>
                    <Badge
                      variant="secondary"
                      className={compact ? "text-xs px-1 py-0" : ""}
                    >
                      {convertTimestamp(item.TS)}
                    </Badge>
                  </TableCell>
                  <TableCell className={compact ? "p-2" : ""}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`relative ${
                          compact ? "w-6 h-6" : "w-10 h-10"
                        } rounded-lg overflow-hidden border bg-muted`}
                      >
                        <Image
                          src={`https://apm-logo-bucket.s3.ap-south-1.amazonaws.com/${item.Details.channel_id.trim()}.png`}
                          alt={item.Details.channel_id}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-lg"
                        />
                      </div>
                      <span className={compact ? "text-sm" : "font-medium"}>
                        {item.Details.channel_id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className={compact ? "p-2" : ""}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2">
                            <div
                              className={`${
                                compact ? "w-16" : "w-24"
                              } bg-muted rounded-full h-2`}
                            >
                              <div
                                className={`h-full rounded-full ${getConfidenceColor(
                                  item.Details.accuracy * 100
                                )}`}
                                style={{
                                  width: `${item.Details.accuracy * 100}%`,
                                }}
                              />
                            </div>
                            <span
                              className={`${
                                compact ? "text-xs" : "text-sm"
                              } font-medium flex items-center gap-1`}
                            >
                              {(item.Details.accuracy * 100).toFixed(1)}
                              <Percent
                                className={compact ? "h-2 w-2" : "h-3 w-3"}
                              />
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Detection Confidence Score</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <div
          className={`flex items-center justify-between ${
            compact ? "mt-2" : "mt-4"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={compact ? "text-xs px-2 py-1" : ""}
            >
              Previous
            </Button>
            <Badge
              variant="secondary"
              className={compact ? "px-2 py-1 text-xs" : "px-4 py-2"}
            >
              Page {currentPage} of {totalPages}
            </Badge>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={compact ? "text-xs px-2 py-1" : ""}
            >
              Next
            </Button>
          </div>
          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger
              className={compact ? "w-[120px] text-xs" : "w-[180px]"}
            >
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className={compact ? "text-xs" : ""}>
                  Items per page
                </SelectLabel>
                <SelectItem value="10" className={compact ? "text-xs" : ""}>
                  10 items
                </SelectItem>
                <SelectItem value="25" className={compact ? "text-xs" : ""}>
                  25 items
                </SelectItem>
                <SelectItem value="50" className={compact ? "text-xs" : ""}>
                  50 items
                </SelectItem>
                <SelectItem value="100" className={compact ? "text-xs" : ""}>
                  100 items
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

export default LogoDetectionTable;
