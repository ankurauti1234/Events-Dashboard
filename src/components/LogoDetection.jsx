import { useState, useCallback } from "react";
import { ArrowUpDown, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Image from "next/image";

export default function LogoDetection({ data, convertTimestamp }) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useCallback(
    (data) => {
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
    },
    [sortConfig]
  );

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No logo detection data</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="p-3">
        <CardTitle className="flex items-center gap-2">
          <Tv className="h-5 w-5" />
          Logo Detection Output
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="rounded-lg overflow-hidden border">
          <Table className="bg-popover">
            <TableHeader>
              <TableRow className="flex w-full justify-between items-center">
                <TableHead className="w-full flex items-center justify-center">
                  <Button variant="ghost" onClick={() => handleSort("TS")}>
                    Timestamp
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-full flex items-center justify-center">
                  Detection
                </TableHead>
                <TableHead className="w-full flex items-center justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("Details.accuracy")}
                  >
                    Confidence
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
          </Table>
          <ScrollArea className="h-[45vh] bg-popover">
            <Table>
              <TableBody>
                {sortedData(data).map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{convertTimestamp(item.TS)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 border w-fit p-1 rounded-lg bg-card">
                        <div className="relative w-10 h-10">
                          <Image
                            src={`https://apm-logo-bucket.s3.ap-south-1.amazonaws.com/${item.Details.channel_id}.png`}
                            alt={item.Details.channel_id}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-lg"
                          />
                        </div>
                        {item.Details.channel_id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          item.Details.accuracy < 0.5
                            ? "bg-red-500 text-white"
                            : item.Details.accuracy > 0.75
                            ? "bg-green-500 text-white"
                            : "bg-yellow-500 text-black"
                        }
                      >
                        {(item.Details.accuracy * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
