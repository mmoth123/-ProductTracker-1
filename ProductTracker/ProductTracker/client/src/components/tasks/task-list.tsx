import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { useLanguage } from "@/context/language-context";
import { getTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

import { ClipboardList, Sparkles, CheckCircle, Calendar, MessageSquare, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const TaskStatusFilter = ({
  activeStatus,
  setActiveStatus,
}: {
  activeStatus: string;
  setActiveStatus: (status: string) => void;
}) => {
  const { currentLanguage } = useLanguage();
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Input
              type="text"
              placeholder={getTranslation("search", currentLanguage)}
              className="pl-9"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setActiveStatus("all")}
            variant={activeStatus === "all" ? "secondary" : "ghost"}
            className="font-medium text-sm"
          >
            All
          </Button>
          <Button
            onClick={() => setActiveStatus("started")}
            variant={activeStatus === "started" ? "secondary" : "ghost"}
            className="font-medium text-sm"
          >
            Started
          </Button>
          <Button
            onClick={() => setActiveStatus("in_progress")}
            variant={activeStatus === "in_progress" ? "secondary" : "ghost"}
            className="font-medium text-sm"
          >
            In Progress
          </Button>
          <Button
            onClick={() => setActiveStatus("completed")}
            variant={activeStatus === "completed" ? "secondary" : "ghost"}
            className="font-medium text-sm"
          >
            Completed
          </Button>
        </div>
      </div>
    </div>
  );
};

// Task status badge component
const TaskStatusBadge = ({ status }: { status: string }) => {
  const { currentLanguage } = useLanguage();
  
  if (status === "started") {
    return (
      <Badge variant="default" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30">
        {getTranslation("started", currentLanguage)}
      </Badge>
    );
  } else if (status === "in_progress") {
    return (
      <Badge variant="default" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30">
        {getTranslation("inProgress", currentLanguage)}
      </Badge>
    );
  } else {
    return (
      <Badge variant="default" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30">
        {getTranslation("completed", currentLanguage)}
      </Badge>
    );
  }
};

// Task icon by status
const TaskIcon = ({ status }: { status: string }) => {
  if (status === "started") {
    return (
      <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 mr-3">
        <Sparkles className="h-5 w-5" />
      </div>
    );
  } else if (status === "in_progress") {
    return (
      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
        <ClipboardList className="h-5 w-5" />
      </div>
    );
  } else {
    return (
      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mr-3">
        <CheckCircle className="h-5 w-5" />
      </div>
    );
  }
};

export function TaskList() {
  const { currentLanguage } = useLanguage();
  const { user } = useAuth();
  const [activeStatus, setActiveStatus] = useState("all");
  
  // Fetch tasks
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  // Filter tasks based on selected status
  const filteredTasks = tasks?.filter(task => 
    activeStatus === "all" || task.status === activeStatus
  );
  
  return (
    <div>
      <TaskStatusFilter 
        activeStatus={activeStatus} 
        setActiveStatus={setActiveStatus} 
      />
      
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          Array(3).fill(null).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <Skeleton className="h-8 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="p-4">
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </Card>
          ))
        ) : filteredTasks?.length === 0 ? (
          // No tasks found
          <Card className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">
              {getTranslation("noDataAvailable", currentLanguage)}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {activeStatus === "all" 
                ? "No tasks have been created yet." 
                : `No tasks with status '${activeStatus}' found.`}
            </p>
          </Card>
        ) : (
          // Task list
          filteredTasks?.map(task => (
            <Card key={task.id} className="overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center">
                  <TaskIcon status={task.status} />
                  <div>
                    <h3 className="text-lg font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {task.description || "No description provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <TaskStatusBadge status={task.status} />
                  <div className="flex -space-x-2 ml-3">
                    {/* Using API to generate avatars based on assigned user */}
                    {task.assignedTo && (
                      <Avatar className="h-8 w-8 border-2 border-background">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=User${task.assignedTo}`}
                        />
                        <AvatarFallback>
                          {`U${task.assignedTo}`}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {task.dueDate && (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getTranslation("dueDate", currentLanguage)}: {" "}
                        {format(new Date(task.dueDate), "MMM dd, yyyy")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      0 comments
                    </span>
                  </div>
                </div>
                <div>
                  <Button variant="ghost" className="text-primary font-medium">
                    <Eye className="h-4 w-4 mr-1" />
                    {getTranslation("viewDetails", currentLanguage)}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
