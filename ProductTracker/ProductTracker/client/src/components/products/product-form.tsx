import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/context/language-context";
import { getTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { Product, productValidationSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, XCircle } from "lucide-react";

// Form schema
const formSchema = productValidationSchema;
type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product;
  isEdit?: boolean;
}

export function ProductForm({ product, isEdit = false }: ProductFormProps) {
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const currentDate = new Date().toISOString().split('T')[0];
  const [monthRecords, setMonthRecords] = useState<Array<{id: number, name: string}>>([]);
  const [isLoadingMonthRecords, setIsLoadingMonthRecords] = useState(true);
  const [gameNames, setGameNames] = useState<Array<{id: number, name: string}>>([]);
  const [isLoadingGameNames, setIsLoadingGameNames] = useState(true);

  // Fetch active month records
  useEffect(() => {
    const fetchMonthRecords = async () => {
      setIsLoadingMonthRecords(true);
      try {
        const response = await fetch('/api/month-records/active');
        if (response.ok) {
          const data = await response.json();
          setMonthRecords(data);
          
          // If no month records exist, create a default one
          if (data.length === 0) {
            const createResponse = await apiRequest('POST', '/api/month-records', {
              name: 'Month 1',
              startDate: new Date(),
              isActive: true,
              isLocked: false
            });
            
            if (createResponse.ok) {
              const newRecord = await createResponse.json();
              setMonthRecords([newRecord]);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch month records:', error);
        // Create a default month record if none exists
        setMonthRecords([{id: 1, name: 'Month 1'}]);
      } finally {
        setIsLoadingMonthRecords(false);
      }
    };
    
    fetchMonthRecords();
  }, []);
  
  // Fetch game names
  useEffect(() => {
    const fetchGameNames = async () => {
      setIsLoadingGameNames(true);
      try {
        const response = await fetch('/api/game-names');
        if (response.ok) {
          const data = await response.json();
          setGameNames(data);
        }
      } catch (error) {
        console.error('Failed to fetch game names:', error);
        setGameNames([]);
      } finally {
        setIsLoadingGameNames(false);
      }
    };
    
    fetchGameNames();
  }, []);

  // Get default values for the form
  const defaultValues: Partial<FormValues> = {
    name: product?.name || "",
    gameAccount: product?.gameAccount || "",
    gameName: product?.gameName || "",
    category: product?.category || "",
    dateReceived: product?.dateReceived 
      ? new Date(product.dateReceived).toISOString().split('T')[0] 
      : currentDate,
    costPrice: product?.costPrice || 0,
    sellingPrice: product?.sellingPrice || 0,
    profit: product?.profit || 0,
    status: product?.status || "available",
    evidence: product?.evidence || "",
    monthRecordId: product?.monthRecordId || (monthRecords.length > 0 ? monthRecords[0].id : 1),
    userId: product?.userId || 1,
  };

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Watch cost and selling price to calculate profit
  const costPrice = form.watch("costPrice");
  const sellingPrice = form.watch("sellingPrice");

  // Calculate profit
  if (costPrice !== undefined && sellingPrice !== undefined) {
    form.setValue("profit", sellingPrice - costPrice);
  }

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product created",
        description: "The product has been created successfully",
      });
      navigate("/products");
    },
    onError: (error) => {
      toast({
        title: "Failed to create product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("PUT", `/api/products/${product?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${product?.id}`] });
      toast({
        title: "Product updated",
        description: "The product has been updated successfully",
      });
      navigate("/products");
    },
    onError: (error) => {
      toast({
        title: "Failed to update product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    if (isEdit && product) {
      updateProductMutation.mutate(data);
    } else {
      createProductMutation.mutate(data);
    }
  };

  // Handle file selection for evidence
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenceFile(e.target.files[0]);
      // In a real app, you would upload the file to your server/cloud storage
      // and store the URL in the evidence field
      // For now, we'll just update the filename
      form.setValue("evidence", e.target.files[0].name);
    }
  };

  // Handle file removal
  const handleFileRemove = () => {
    setEvidenceFile(null);
    form.setValue("evidence", "");
  };

  // File input reference for custom upload button
  const fileInputRef = React.createRef<HTMLInputElement>();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEdit
            ? getTranslation("editProduct", currentLanguage) ||
              `Edit ${product?.name}`
            : getTranslation("addProduct", currentLanguage)}
        </CardTitle>
        <CardDescription>
          {isEdit
            ? "Update the product information"
            : "Enter the details to add a new product"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">
                {getTranslation("productDetails", currentLanguage)}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {getTranslation("productName", currentLanguage)}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gameAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {getTranslation("gameAccount", currentLanguage)}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter game account information"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gameName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {getTranslation("gameName", currentLanguage)}
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select game" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingGameNames ? (
                              <SelectItem value="loading">Loading...</SelectItem>
                            ) : gameNames.length > 0 ? (
                              gameNames.map((gameName) => (
                                <SelectItem key={gameName.id} value={gameName.name}>
                                  {gameName.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-games">No games available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {getTranslation("category", currentLanguage)}
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Game Account">
                              Game Account
                            </SelectItem>
                            <SelectItem value="In-Game Items">
                              In-Game Items
                            </SelectItem>
                            <SelectItem value="Currency">Currency</SelectItem>
                            <SelectItem value="Skins">Skins</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">
                {getTranslation("financialSummary", currentLanguage)}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {getTranslation("costPrice", currentLanguage)}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sellingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {getTranslation("sellingPrice", currentLanguage)}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {getTranslation("profit", currentLanguage)}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          readOnly
                          {...field}
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                      </FormControl>
                      <FormDescription>
                        Calculated automatically
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">
                {getTranslation("additionalDetails", currentLanguage) || "Additional Details"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateReceived"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {getTranslation("dateReceived", currentLanguage)}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={
                            field.value
                              ? typeof field.value === "string"
                                ? field.value
                                : new Date(field.value).toISOString().split(
                                    "T"
                                  )[0]
                              : ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {getTranslation("status", currentLanguage)}
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">
                              Available
                            </SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthRecordId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month Record</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ? field.value.toString() : ""}
                          onValueChange={(value) => field.onChange(parseInt(value, 10))}
                          disabled={isLoadingMonthRecords}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select month record" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingMonthRecords ? (
                              <SelectItem value="loading">Loading...</SelectItem>
                            ) : monthRecords.length > 0 ? (
                              monthRecords.map((record) => (
                                <SelectItem key={record.id} value={record.id.toString()}>
                                  {record.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="1">No month records available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Select the month record for this product
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Evidence Upload */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="evidence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {getTranslation("evidence", currentLanguage)}
                    </FormLabel>
                    <FormControl>
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          evidenceFile
                            ? "border-primary/50 bg-primary/5"
                            : "border-gray-300 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />

                        {!evidenceFile && !field.value ? (
                          <div>
                            <Upload className="h-10 w-10 mx-auto text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              {getTranslation("dropFileHere", currentLanguage)}
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              {getTranslation("chooseFile", currentLanguage)}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              {evidenceFile ? evidenceFile.name : field.value}
                            </p>
                            <div className="flex justify-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                {getTranslation("chooseFile", currentLanguage)}
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleFileRemove}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                {getTranslation("remove", currentLanguage) || "Remove"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload evidence for this game account (e.g. screenshots)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/products")}>
              {getTranslation("cancel", currentLanguage)}
            </Button>
            <Button
              type="submit"
              disabled={createProductMutation.isPending || updateProductMutation.isPending}
            >
              {isEdit
                ? getTranslation("saveChanges", currentLanguage)
                : getTranslation("save", currentLanguage)}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
