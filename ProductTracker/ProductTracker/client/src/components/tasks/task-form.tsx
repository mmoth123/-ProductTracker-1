import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/language-context";
import { Task, taskValidationSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

// Form schema
const formSchema = taskValidationSchema;
type FormValues = z.infer<typeof formSchema>;

interface TaskFormProps {
  task?: Task;
  isEdit?: boolean;
  onComplete?: () => void;
}

export function TaskForm({ task, isEdit = false, onComplete }: TaskFormProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Get all users to populate assignee dropdown
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    // If there's an error fetching users, we'll just use an empty array
    // and the user can still create a task without assigning it
    onError: () => {
      toast({
        title: "Couldn't load users",
        description: "You can still create the task without assigning it.",
        variant: "destructive",
      });
    },
  });

  // Default values for the form
  const defaultValues: Partial<FormValues> = {
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "started",
    dueDate: task?.dueDate 
      ? format(new Date(task.dueDate), "yyyy-MM-dd")
      : "",
    assignedTo: task?.assignedTo?.toString() || undefined,
    createdBy: task?.createdBy || user?.id || 0,
  };

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/tasks", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task created",
        description: "The task has been created successfully",
      });
      if (onComplete) onComplete();
    },
    onError: (error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("PUT", `/api/tasks/${task?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${task?.id}`] });
      toast({
        title: "Task updated",
        description: "The task has been updated successfully",
      });
      if (onComplete) onComplete();
    },
    onError: (error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    // Convert assignedTo to a number if present
    if (data.assignedTo) {
      data.assignedTo = parseInt(data.assignedTo, 10);
    }

    // Add createdBy if not present
    if (!data.createdBy && user?.id) {
      data.createdBy = user.id;
    }

    if (isEdit && task) {
      updateTaskMutation.mutate(data);
    } else {
      createTaskMutation.mutate(data);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEdit
            ? t("editTask") || `Edit ${task?.title}`
            : t("newTask")}
        </CardTitle>
        <CardDescription>
          {isEdit
            ? "Update the task information"
            : "Create a new task for your team"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("taskTitle")}</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("taskDescription")}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter task description"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("taskStatus")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="started">{t("started")}</SelectItem>
                        <SelectItem value="in_progress">{t("inProgress")}</SelectItem>
                        <SelectItem value="completed">{t("completed")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("dueDate")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("assignedTo")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Not assigned</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select a user to assign this task to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onComplete}>
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              loading={createTaskMutation.isPending || updateTaskMutation.isPending}
            >
              {isEdit ? t("saveChanges") : t("save")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
