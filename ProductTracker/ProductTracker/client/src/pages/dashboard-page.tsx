import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/language-context";
import { SidebarLayout } from "@/components/layouts/sidebar-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { ActivityItem } from "@/components/dashboard/activity-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Package,
  CheckCircle,
  Archive,
  DollarSign,
  ShoppingCart,
  Award,
  Users
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Fetch products data for stats
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  // Get statistics from products data
  const getTotalProducts = () => products?.length || 0;
  const getSoldProducts = () => products?.filter(p => p.status === "sold").length || 0;
  const getAvailableProducts = () => products?.filter(p => p.status === "available").length || 0;
  const getTotalProfit = () => {
    if (!products) return 0;
    return products
      .filter(p => p.status === "sold")
      .reduce((sum, p) => sum + (p.profit || 0), 0);
  };

  // Format currency with dollar sign
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <SidebarLayout>
      {/* Welcome header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("dashboard")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("welcomeBack")}, {user?.username}!
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {productsLoading ? (
          // Skeleton loading for stats cards
          Array(4).fill(null).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatsCard
              title={t("totalProducts")}
              value={getTotalProducts()}
              icon={<Package className="h-6 w-6" />}
              iconBgColor="bg-primary-50 dark:bg-primary-900/30"
              iconColor="text-primary-600 dark:text-primary-400"
            />
            <StatsCard
              title={t("soldProducts")}
              value={getSoldProducts()}
              icon={<CheckCircle className="h-6 w-6" />}
              iconBgColor="bg-green-50 dark:bg-green-900/30"
              iconColor="text-green-600 dark:text-green-400"
            />
            <StatsCard
              title={t("availableProducts")}
              value={getAvailableProducts()}
              icon={<Archive className="h-6 w-6" />}
              iconBgColor="bg-blue-50 dark:bg-blue-900/30"
              iconColor="text-blue-600 dark:text-blue-400"
            />
            <StatsCard
              title={t("totalProfit")}
              value={formatCurrency(getTotalProfit())}
              icon={<DollarSign className="h-6 w-6" />}
              iconBgColor="bg-amber-50 dark:bg-amber-900/30"
              iconColor="text-amber-600 dark:text-amber-400"
            />
          </>
        )}
      </div>

      {/* Chart and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <SalesChart />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{t("recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              // Skeleton loading for activities
              <div className="space-y-4">
                {Array(3).fill(null).map((_, i) => (
                  <div key={i} className="flex">
                    <Skeleton className="h-10 w-10 rounded-full mr-3" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-4">
                <ActivityItem
                  icon={<ShoppingCart className="h-5 w-5" />}
                  iconBgColor="bg-green-100 dark:bg-green-900/30"
                  iconColor="text-green-600 dark:text-green-400"
                  title="Game Account Sold"
                  description="League of Legends - Gold Rank"
                  time="2 hours ago"
                  avatars={[
                    "https://api.dicebear.com/7.x/initials/svg?seed=JS",
                  ]}
                />
                <ActivityItem
                  icon={<Package className="h-5 w-5" />}
                  iconBgColor="bg-blue-100 dark:bg-blue-900/30"
                  iconColor="text-blue-600 dark:text-blue-400"
                  title="New Account Received"
                  description="Valorant - Diamond Rank"
                  time="5 hours ago"
                  avatars={[
                    "https://api.dicebear.com/7.x/initials/svg?seed=AR",
                  ]}
                />
                <ActivityItem
                  icon={<Award className="h-5 w-5" />}
                  iconBgColor="bg-purple-100 dark:bg-purple-900/30"
                  iconColor="text-purple-600 dark:text-purple-400"
                  title="Monthly Goal Reached"
                  description="Sold 25 accounts this month"
                  time="1 day ago"
                  avatars={[
                    "https://api.dicebear.com/7.x/initials/svg?seed=TM",
                    "https://api.dicebear.com/7.x/initials/svg?seed=JD",
                  ]}
                />
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
