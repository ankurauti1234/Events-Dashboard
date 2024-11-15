import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function MemberCard({ member, index, compact }) {
  const { state, gender, age } = member;
  const isActive = state;

  return (
    <Card
      className={cn(
        "w-full transition-all duration-300 hover:scale-102 group",
        isActive
          ? " hover:shadow-sm border-green-600 bg-green-600/15 border-2"
          : "bg-secondary/25 border-secondary hover:shadow-md",
        compact ? "p-2" : "p-0"
      )}
    >
      <CardHeader className={cn("space-y-0", compact ? "p-2" : "p-4")}>
        <CardTitle
          className={cn(
            "flex justify-between items-center",
            compact ? "text-base" : "text-lg"
          )}
        >
          <span className="flex items-center gap-2">
            {!compact && (
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                  isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {index + 1}
              </div>
            )}
            <span className={compact ? "text-sm" : ""}>Member {index + 1}</span>
          </span>
          <Badge
            variant={isActive ? "success" : "secondary"}
            className={cn(
              "transition-all",
              isActive
                ? "animate-pulse bg-green-800/75 text-green-100"
                : "opacity-70",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent
        className={cn("space-y-2", compact ? "p-2 pt-0" : "p-4 pt-0")}
      >
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center bg-foreground/10 p-2 rounded-lg">
            <span
              className={cn("font-medium", compact ? "text-xs" : "text-sm")}
            >
              Gender:
            </span>
            <span
              className={cn(
                "text-muted-foreground",
                compact ? "text-xs" : "text-sm"
              )}
            >
              {gender === "m" ? "Male" : "Female"}
            </span>
          </div>
          <div className="flex justify-between items-center bg-foreground/10 p-2 rounded-lg">
            <span
              className={cn("font-medium", compact ? "text-xs" : "text-sm")}
            >
              Age:
            </span>
            <span
              className={cn(
                "text-muted-foreground",
                compact ? "text-xs" : "text-sm"
              )}
            >
              {age} years
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MemberWatchingState({
  memberGuestData,
  compact = false,
}) {
  if (!memberGuestData) return null;

  const activeMembers = memberGuestData.state.filter(
    (value) => value === true
  ).length;
  const totalMembers = memberGuestData.state.length;
  const activePercentage = (activeMembers / totalMembers) * 100;

  return (
    <Card className="transition-all duration-300 hover:shadow-sm">
      <CardHeader className={cn("border-b", compact ? "p-3" : "p-4")}>
        <CardTitle
          className={cn(
            "flex items-center gap-2",
            compact ? "text-lg" : "text-xl"
          )}
        >
          <div className="p-2 bg-primary/10 rounded-full">
            <Users
              className={cn("text-primary", compact ? "h-4 w-4" : "h-5 w-5")}
            />
          </div>
          <span>Household Members</span>
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="secondary" className="font-mono">
              {activeMembers}/{totalMembers}
            </Badge>
            <Badge
              variant={activePercentage > 50 ? "success" : "secondary"}
              className="font-mono"
            >
              {activePercentage.toFixed(0)}%
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          "grid gap-4",
          compact ? "p-3" : "p-4",
          compact
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}
      >
        {memberGuestData.state.map((state, index) => (
          <MemberCard
            key={index}
            member={{
              state: state,
              gender: memberGuestData.gender[index],
              age: memberGuestData.age[index],
            }}
            index={index}
            compact={compact}
          />
        ))}
      </CardContent>
    </Card>
  );
}
