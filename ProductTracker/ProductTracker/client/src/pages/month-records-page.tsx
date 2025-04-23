import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/language-context";
import { getTranslation } from "@/lib/i18n";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MonthRecord } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMonthRecordSchema } from "@shared/schema";
import { z } from "zod";
import { Loader2, Plus, Lock, Unlock, Trash, RotateCw } from "lucide-react";

type FormValues = z.infer<typeof insertMonthRecordSchema>;

export default function MonthRecordsPage() {
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const t = (key: any) => getTranslation(key, currentLanguage);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(insertMonthRecordSchema),
    defaultValues: {
      name: "",
      startDate: new Date(),
      isActive: true,
    }
  });
  
  // Fetch month records
  const { data: monthRecords, isLoading } = useQuery<MonthRecord[]>({
    queryKey: ["/api/month-records"],
    enabled: !!user
  });
  
  // Add new month record
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("POST", "/api/month-records", values);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/month-records"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: t("success"),
        description: t("monthRecordAdded"),
      });
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Lock/Unlock month record
  const lockMutation = useMutation({
    mutationFn: async ({ id, isLocked }: { id: number; isLocked: boolean }) => {
      const res = await apiRequest("PATCH", `/api/month-records/${id}/lock`, { isLocked });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/month-records"] });
      toast({
        title: t("success"),
        description: t("monthRecordUpdated"),
      });
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Toggle active state
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/month-records/${id}`, { isActive });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/month-records"] });
      toast({
        title: t("success"),
        description: t("monthRecordUpdated"),
      });
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Clear month record data
  const clearMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/month-records/${id}/clear`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/month-records"] });
      toast({
        title: t("success"),
        description: t("monthRecordDataCleared"),
      });
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Submit handler
  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values);
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("monthRecords")}</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("addMonthRecord")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addMonthRecord")}</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("name")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Month 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("startDate")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''} 
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>{t("active")}</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("save")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("monthRecordsList")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="w-full flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : monthRecords && monthRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("startDate")}</TableHead>
                  <TableHead>{t("endDate")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.name}</TableCell>
                    <TableCell>
                      {new Date(record.startDate).toLocaleDateString(
                        currentLanguage === "th" ? "th-TH" : "en-US"
                      )}
                    </TableCell>
                    <TableCell>
                      {record.endDate 
                        ? new Date(record.endDate).toLocaleDateString(
                            currentLanguage === "th" ? "th-TH" : "en-US"
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {record.isActive && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                            {t("active")}
                          </Badge>
                        )}
                        {record.isLocked && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300">
                            {t("locked")}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={lockMutation.isPending}
                          onClick={() => lockMutation.mutate({ id: record.id, isLocked: !record.isLocked })}
                          title={record.isLocked ? t("unlock") : t("lock")}
                        >
                          {record.isLocked ? (
                            <Unlock className="h-4 w-4" />
                          ) : (
                            <Lock className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={toggleActiveMutation.isPending}
                          onClick={() => toggleActiveMutation.mutate({ id: record.id, isActive: !record.isActive })}
                          title={record.isActive ? t("deactivate") : t("activate")}
                          className={record.isActive ? "text-green-600" : "text-gray-400"}
                        >
                          <Switch checked={record.isActive} className="pointer-events-none" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-orange-600"
                              title={t("clearData")}
                              disabled={record.isLocked}
                            >
                              <RotateCw className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("clearMonthData")}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("clearMonthDataConfirmation")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => clearMutation.mutate(record.id)}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                {clearMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t("clearData")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t("noMonthRecords")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}