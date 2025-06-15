
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  cardColor?: "blue" | "green" | "purple" | "orange";
}

const colorMap = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200",
  green: "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200",
  purple: "bg-purple-100 text-purple-600 dark:bg-purple-800 dark:text-purple-200",
  orange: "bg-orange-100 text-orange-600 dark:bg-orange-800 dark:text-orange-200",
};

export default function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  className = "",
  cardColor = "blue",
}: StatsCardProps) {
  return (
    <Card className={cn(
      "border border-gray-200 shadow-card bg-card dark:bg-zinc-900 hover:shadow-soft transition-all duration-300 rounded-xl min-w-[180px] overflow-hidden",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-base font-semibold text-gray-700 dark:text-gray-200">{title}</CardTitle>
        <div className={cn(
          "rounded-lg p-2 flex items-center justify-center shadow-sm",
          colorMap[cardColor]
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-1">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span className={cn("text-xs font-medium", trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-gray-400 ml-1">相比上月</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
