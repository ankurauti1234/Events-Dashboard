import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function MemberCard({ member, index }) {
  const { state, gender, age } = member;
  const isActive = state;

  return (
    <Card
      className={`w-full ${
        isActive
          ? "bg-popover border-green-700 border-2 "
          : "bg-popover border-secondary"
      }`}
    >
      <CardHeader className="p-4">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Member {index + 1}</span>
          <Badge
            variant={isActive ? "success" : "secondary"}
            className={isActive ? "animate-pulse" : ""}
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Gender:</span>
            <span className="text-sm">
              {gender === "m" ? "Male" : "Female"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Age:</span>
            <span className="text-sm">{age} years</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MemberWatchingState({ memberGuestData }) {
  if (!memberGuestData) return null;

  return (
    <Card>
      <CardHeader className="p-3">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Household Member
          <Badge variant="secondary">
            {memberGuestData.state.filter((value) => value === true).length}{" "}
            /
            {memberGuestData.state.length}{" "}
            active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {memberGuestData.state.map((state, index) => (
            <MemberCard
              key={index}
              member={{
                state: state,
                gender: memberGuestData.gender[index],
                age: memberGuestData.age[index],
              }}
              index={index}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
