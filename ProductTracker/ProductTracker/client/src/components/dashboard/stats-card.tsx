import { ReactNode } from "react";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconColor?: string;
  iconBgColor?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  iconColor = "text-primary-600 dark:text-primary-400",
  iconBgColor = "bg-primary-50 dark:bg-primary-900/30"
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBgColor} ${iconColor}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
