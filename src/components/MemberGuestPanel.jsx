"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Circle, RefreshCw, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTimezoneStore } from "@/stores/timezoneStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://apmapis.webdevava.live/api";

const MemberGuestPanel = ({ deviceId }) => {
  const [memberData, setMemberData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { timezone } = useTimezoneStore();

  const fetchMemberData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/events/member-guest/${deviceId}`
      );
      const data = await response.json();
      setMemberData(data);
    } catch (err) {
      setError("Failed to fetch member-guest data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (deviceId) {
      fetchMemberData();
    }
  }, [deviceId]);

  const getStatusDisplay = (isActive) => (
    <div className="flex items-center gap-2">
      <div className={`relative flex items-center`}>
        <Circle
          className={`h-8 w-8 ${
            isActive ? "text-green-500 animate-pulse" : "text-gray-300"
          }`}
        />
        <div className={`absolute inset-0 flex items-center justify-center`}>
          <div
            className={`h-3 w-3 rounded-full ${
              isActive ? "bg-green-500 animate-ping" : "bg-gray-300"
            }`}
          />
        </div>
      </div>
      <span
        className={`font-medium ${
          isActive ? "text-green-600" : "text-gray-500"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );

  const getGenderDisplay = (genderValue) => (
    <div
      className={`px-4 py-2 rounded-full w-fit ${
        genderValue === "m"
          ? "bg-blue-50 text-blue-700 border border-blue-200"
          : "bg-pink-50 text-pink-700 border border-pink-200"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            genderValue === "m" ? "bg-blue-500" : "bg-pink-500"
          }`}
        />
        <span className="font-medium">
          {genderValue === "m" ? "Male" : "Female"}
        </span>
      </div>
    </div>
  );

  const getAgeDisplay = (age) => (
    <div className="flex items-center gap-2">
      <div
        className={`px-3 py-1 rounded-lg ${
          age < 25
            ? "bg-purple-50 text-purple-700"
            : age < 50
            ? "bg-amber-50 text-amber-700"
            : "bg-emerald-50 text-emerald-700"
        }`}
      >
        <span className="font-medium">{age}</span>
      </div>
      <span className="text-gray-500">years</span>
    </div>
  );

  if (isLoading) {
    return (
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Member & Guest Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin">
              <RefreshCw className="h-8 w-8 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!memberData?.event?.Details) {
    return (
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Member & Guest Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No member data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const { state, gender, age } = memberData.event.Details;
  const totalPeople = state.length;

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Member & Guest Analysis
          <div className="ml-2 px-3 py-1 bg-gray-100 rounded-full text-gray-700 text-sm">
            {totalPeople} People
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Member #</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Gender</TableHead>
                <TableHead className="font-semibold">Age</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.map((isActive, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    Member{index + 1}
                  </TableCell>
                  <TableCell>{getStatusDisplay(isActive)}</TableCell>
                  <TableCell>{getGenderDisplay(gender[index])}</TableCell>
                  <TableCell>{getAgeDisplay(age[index])}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberGuestPanel;