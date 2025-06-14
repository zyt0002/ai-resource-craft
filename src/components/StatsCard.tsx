
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

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
}

export default function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  className = ""
}: StatsCardProps) {
  return (
    <Card className={`border-none shadow-card bg-gradient-to-b from-emerald-50 via-sky-50 to-orange-50 hover:shadow-hover hover:scale-105 transition-all duration-300 animate-fade-pop ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-500">{title}</CardTitle>
        <Icon className="h-5 w-5 text-fuchsia-500 drop-shadow" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-sky-900 dark:text-sky-200">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">相比上月</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

