import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/hooks/use-auth";
import { SidebarLayout } from "@/components/layouts/sidebar-layout";
import { ProductForm } from "@/components/products/product-form";
import { Product } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Edit, 
  Trash, 
  Package, 
  DollarSign,
  Calendar,
  Tag,
  ShoppingBag,
  Image as ImageIcon
} from "lucide-react";

// Function to parse search params from URL
function useSearchParams() {
  const [location] = useLocation();
  return new URLSearchParams(location.split("?")[1] || "");
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const productId = parseInt(params.id, 10);
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(() => {
    return searchParams.get("edit") === "true";
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Check if user has edit/delete permissions
  const canEdit = user?.role === "admin" || user?.role === "supervisor";

  // Fetch product details
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      });
      navigate("/products");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle delete button click
  const handleDelete = () => {
    deleteProductMutation.mutate();
  };

  return (
    <SidebarLayout>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/products")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing
                ? t("editProduct")
                : t("productDetails")}
            </h1>
            {!isEditing && (
              <p className="text-muted-foreground mt-1">
                View and manage product information
              </p>
            )}
          </div>
        </div>
        {!isEditing && canEdit && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t("edit")}
            </Button>
            
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  {t("delete")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this
                    product and remove its data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {isEditing ? (
        // Edit form
        <ProductForm
          product={product}
          isEdit={true}
        />
      ) : isLoading ? (
        // Loading state
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array(6).fill(null).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        // Product details view
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{product?.name}</CardTitle>
              <Badge
                variant={product?.status === "sold" ? "default" : "secondary"}
                className={
                  product?.status === "sold"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                }
              >
                {product?.status === "sold" ? t("soldProducts") : t("availableProducts")}
              </Badge>
            </div>
            <CardDescription>
              ID: #{product?.id} | {product?.gameName} | {product?.category}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">
                {t("productDetails")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-start">
                    <Package className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("gameAccount")}</p>
                      <p className="text-base">{product?.gameAccount}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <ShoppingBag className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("gameName")}</p>
                      <p className="text-base">{product?.gameName}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <Tag className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("category")}</p>
                      <p className="text-base">{product?.category}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("dateReceived")}</p>
                      <p className="text-base">
                        {product?.dateReceived
                          ? format(new Date(product.dateReceived), "MMMM dd, yyyy")
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">
                {t("financialSummary")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("costPrice")}</p>
                      <p className="text-base">
                        {product?.costPrice != null
                          ? `$${product.costPrice.toFixed(2)}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("sellingPrice")}</p>
                      <p className="text-base">
                        {product?.sellingPrice != null
                          ? `$${product.sellingPrice.toFixed(2)}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 mr-2 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("profit")}</p>
                      <p className="text-base font-medium text-green-600 dark:text-green-400">
                        {product?.profit != null
                          ? `$${product.profit.toFixed(2)}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">
                {t("evidence")}
              </h3>
              {product?.evidence ? (
                <div className="border rounded-md p-4 flex items-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mr-4" />
                  <div>
                    <p className="font-medium">{product.evidence}</p>
                    <p className="text-sm text-muted-foreground">
                      Game account evidence file
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No evidence uploaded</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 border-t justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Category:</span> {product?.month} {product?.year}
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/products")}
            >
              Back to Products
            </Button>
          </CardFooter>
        </Card>
      )}
    </SidebarLayout>
  );
}
