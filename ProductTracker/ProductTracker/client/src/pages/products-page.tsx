import { useState } from "react";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/hooks/use-auth";
import { SidebarLayout } from "@/components/layouts/sidebar-layout";
import { ProductList } from "@/components/products/product-list";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Plus } from "lucide-react";
import { ProductForm } from "@/components/products/product-form";

export default function ProductsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);

  // Check if user has permission to add products
  const canAddProducts = user?.role === "admin" || user?.role === "supervisor";

  return (
    <SidebarLayout>
      {showAddForm ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{t("addProduct")}</h1>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              {t("cancel")}
            </Button>
          </div>
          <ProductForm />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">{t("products")}</h1>
              <p className="text-muted-foreground mt-1">
                Manage your game accounts and items inventory
              </p>
            </div>
            {canAddProducts && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("addProduct")}
              </Button>
            )}
          </div>
          <ProductList />
        </>
      )}
    </SidebarLayout>
  );
}
