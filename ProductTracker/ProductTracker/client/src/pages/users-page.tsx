import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/hooks/use-auth";
import { SidebarLayout } from "@/components/layouts/sidebar-layout";
import { UserList } from "@/components/users/user-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function UsersPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Only admin can access users page
  const hasAccess = user?.role === "admin";

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

  return (
    <SidebarLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("users")}</h1>
        <p className="text-muted-foreground mt-1">
          Manage user accounts and permissions
        </p>
      </div>

      <UserList />
    </SidebarLayout>
  );
}
