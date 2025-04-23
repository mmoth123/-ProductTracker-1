import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/context/language-context";

import { queryClient } from "./lib/queryClient";
import { ProtectedRoute } from "./lib/protected-route";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ProductsPage from "@/pages/products-page";
import TasksPage from "@/pages/tasks-page";
import ReportsPage from "@/pages/reports-page";
import UsersPage from "@/pages/users-page";
import SettingsPage from "@/pages/settings-page";
import ProductDetailPage from "@/pages/product-detail-page";
import GameNamesPage from "@/pages/game-names-page";
import MonthRecordsPage from "@/pages/month-records-page";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/products" component={ProductsPage} />
      <ProtectedRoute path="/products/:id" component={ProductDetailPage} />
      <ProtectedRoute path="/tasks" component={TasksPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <ProtectedRoute path="/users" component={UsersPage} />
      <ProtectedRoute path="/game-names" component={GameNamesPage} />
      <ProtectedRoute path="/month-records" component={MonthRecordsPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
