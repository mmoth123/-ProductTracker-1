import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/language-context";
import { getTranslation } from "@/lib/i18n";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { GameName } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gameNameValidationSchema } from "@shared/schema";
import { z } from "zod";
import { Loader2, Plus, Trash } from "lucide-react";

type FormValues = z.infer<typeof gameNameValidationSchema>;

export default function GameNamesPage() {
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const t = (key: any) => getTranslation(key, currentLanguage);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(gameNameValidationSchema),
    defaultValues: {
      name: "",
      createdBy: user?.id || 0
    }
  });
  
  // Fetch game names
  const { data: gameNames, isLoading } = useQuery<GameName[]>({
    queryKey: ["/api/game-names"],
    enabled: !!user
  });
  
  // Add new game name
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("POST", "/api/game-names", values);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/game-names"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: t("success"),
        description: t("gameNameAdded"),
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
  
  // Delete game name
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/game-names/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/game-names"] });
      setAlertDialogOpen(false);
      toast({
        title: t("success"),
        description: t("gameNameDeleted"),
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
  
  // Handle delete
  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
    setAlertDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("gameNames")}</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("addGameName")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addGameName")}</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("gameName")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("enterGameName")} {...field} />
                      </FormControl>
                      <FormMessage />
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
          <CardTitle>{t("gameNamesList")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="w-full flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : gameNames && gameNames.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("id")}</TableHead>
                  <TableHead>{t("gameName")}</TableHead>
                  <TableHead>{t("createdAt")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gameNames.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell>{game.id}</TableCell>
                    <TableCell className="font-medium">{game.name}</TableCell>
                    <TableCell>
                      {new Date(game.createdAt).toLocaleString(
                        currentLanguage === "th" ? "th-TH" : "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog open={alertDialogOpen && deleteTargetId === game.id} onOpenChange={setAlertDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive/90"
                            onClick={() => handleDelete(game.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("gameNameDeleteConfirmation")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={confirmDelete}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              {t("delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t("noGameNames")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}