import { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ActivityItemProps {
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  avatars?: string[];
}

export function ActivityItem({
  icon,
  iconBgColor,
  iconColor,
  title,
  description,
  time,
  avatars = []
}: ActivityItemProps) {
  return (
    <li className="flex items-start">
      <div className={`flex-shrink-0 h-10 w-10 rounded-full ${iconBgColor} flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
          
          {avatars.length > 0 && (
            <div className="flex -space-x-2">
              {avatars.map((avatar, index) => (
                <Avatar key={index} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={avatar} alt="User avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              ))}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
