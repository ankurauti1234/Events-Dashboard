// StatsSection.jsx
import { Card, CardContent } from "@/components/ui/card";
import { Database, Clock, Settings, AlertCircle } from "lucide-react";
import NumberTicker from "../ui/number-ticker";

export function StatsSection({
  totalEvents,
  lastRefreshed,
  autoRefresh,
  refreshInterval,
  shutDownData,
  convertTimestamp,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <CardContent className="p-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Events
              </p>
              <h3 className="text-2xl font-bold">
                <NumberTicker value={totalEvents} />
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
        <CardContent className="p-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Last Sync
              </p>
              <h3 className="text-lg font-bold">
                {lastRefreshed.toLocaleTimeString()}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
        <CardContent className="p-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Auto Refresh
              </p>
              <h3 className="text-lg font-bold">
                {autoRefresh ? `${refreshInterval}s` : "Disabled"}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
