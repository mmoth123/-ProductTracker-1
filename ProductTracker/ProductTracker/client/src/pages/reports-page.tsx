import { useState } from "react";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/hooks/use-auth";
import { SidebarLayout } from "@/components/layouts/sidebar-layout";
import { ProfitReport } from "@/components/reports/profit-report";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Download, Printer } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocation } from "wouter";

export default function ReportsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.toLocaleString('default', { month: 'long' });
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    return new Date().getFullYear().toString();
  });

  // Check if user has permission to access reports
  const hasAccess = user?.role === "admin" || user?.role === "supervisor";

  // If user doesn't have access, show access denied message
  if (!hasAccess) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-full pt-16">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("accessDenied")}</AlertTitle>
            <AlertDescription>
              {t("noPermission")}
            </AlertDescription>
          </Alert>
        </div>
      </SidebarLayout>
    );
  }

  // Get all months for dropdown
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Get years for dropdown (current year and 2 previous years)
  const currentYear = new Date().getFullYear();
  const years = [
    currentYear.toString(),
    (currentYear - 1).toString(),
    (currentYear - 2).toString()
  ];

  // Handle generate report button click
  const handleGenerateReport = () => {
    // Fetch report data for the selected month and year
    console.log(`Generating report for ${selectedMonth} ${selectedYear}`);
  };

  return (
    <SidebarLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("reports")}</h1>
        <p className="text-muted-foreground mt-1">
          View and generate reports of your game account sales
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
          <TabsTrigger value="financial">Financial Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales Report</CardTitle>
              <CardDescription>
                View sales performance for a specific month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <label htmlFor="month">{t("month")}</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger id="month">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <label htmlFor="year">{t("year")}</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger id="year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGenerateReport}>
                  {t("generateReport")}
                </Button>
              </div>

              <div className="flex justify-end gap-2 mb-4">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  {t("downloadReport")}
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  {t("printReport")}
                </Button>
              </div>

              <ProfitReport month={selectedMonth} year={selectedYear} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("financialSummary")}</CardTitle>
              <CardDescription>
                View your financial performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Financial summary charts would go here */}
              <div className="h-80 w-full bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">
                  Financial summary chart will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SidebarLayout>
  );
}
