import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Product } from "@shared/schema";

interface ProfitReportProps {
  month: string;
  year: string;
}

export function ProfitReport({ month, year }: ProfitReportProps) {
  const { t } = useLanguage();

  // Fetch monthly report data
  const { data: reportData, isLoading } = useQuery({
    queryKey: [`/api/reports/monthly?month=${month}&year=${year}`],
    enabled: !!month && !!year,
  });

  // Extract products from report data or use empty array if not available
  const products: Product[] = reportData?.products || [];

  // If there's no data, show a no data message
  if (!isLoading && (!reportData || products.length === 0)) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t("noDataAvailable")}</p>
        <p className="text-sm text-muted-foreground mt-2">
          No products found for {month} {year}
        </p>
      </div>
    );
  }

  // Prepare data for the charts
  const prepareChartData = () => {
    // Status distribution for pie chart
    const statusData = [
      {
        name: "Sold",
        value: reportData?.soldProducts || 0,
      },
      {
        name: "Available",
        value: reportData?.availableProducts || 0,
      },
    ];

    // Game distribution for bar chart
    const gameData = products.reduce((acc: Record<string, number>, product) => {
      if (!acc[product.gameName]) {
        acc[product.gameName] = 0;
      }
      acc[product.gameName]++;
      return acc;
    }, {});

    const barChartData = Object.entries(gameData).map(([name, count]) => ({
      name,
      count,
    }));

    return { statusData, barChartData };
  };

  const { statusData, barChartData } = isLoading ? { 
    statusData: [], 
    barChartData: [] 
  } : prepareChartData();

  // Colors for pie chart
  const COLORS = ["#3f51b5", "#00acc1", "#ff9100", "#f44336"];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">
              {t("totalProducts")}
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <div className="text-2xl font-bold mt-1">
                {reportData?.totalProducts || 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">
              {t("soldProducts")}
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <div className="text-2xl font-bold mt-1">
                {reportData?.soldProducts || 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">
              {t("totalProfit")}
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <div className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
                ${(reportData?.totalProfit || 0).toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">
              {t("availableProducts")}
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <div className="text-2xl font-bold mt-1">
                {reportData?.availableProducts || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">Status Distribution</h3>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Game Distribution */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">Game Distribution</h3>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3f51b5" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Product Details</h3>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Game</TableHead>
                    <TableHead>Date Received</TableHead>
                    <TableHead>Cost Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.gameName}</TableCell>
                      <TableCell>
                        {new Date(product.dateReceived).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${product.costPrice?.toFixed(2) || "N/A"}</TableCell>
                      <TableCell>${product.sellingPrice?.toFixed(2) || "N/A"}</TableCell>
                      <TableCell className="text-green-600 dark:text-green-400">
                        ${product.profit?.toFixed(2) || "N/A"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.status === "sold"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                          }`}
                        >
                          {product.status === "sold" ? "Sold" : "Available"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
