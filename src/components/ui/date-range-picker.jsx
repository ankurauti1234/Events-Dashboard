"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

export function DateRangePicker({
  className,
  initialDateFrom,
  initialDateTo,
  onUpdate,
}) {
  const [date, setDate] = React.useState({
    from: initialDateFrom,
    to: initialDateTo,
  });

  const handleSelect = (range) => {
    setDate(range);
    onUpdate(range);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Calendar
        initialFocus
        mode="range"
        defaultMonth={date?.from}
        selected={date}
        onSelect={handleSelect}
        numberOfMonths={2}
      />
    </div>
  );
}
