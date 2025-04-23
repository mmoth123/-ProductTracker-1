import { useLanguage } from "@/context/language-context";
import { useTheme } from "@/hooks/use-theme";
import { SidebarLayout } from "@/components/layouts/sidebar-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { isDark, toggleTheme, mounted } = useTheme();

  // Mock settings state (in a real app, these would be saved to backend)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);
  const [taskReminders, setTaskReminders] = useState(true);

  // Function to handle settings save
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <SidebarLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("settings")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("manageAccount")}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("preferences")}</CardTitle>
          <CardDescription>
            Manage your application preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Settings */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">{t("darkMode")}</h3>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark mode
              </p>
            </div>
            <div>
              {mounted && (
                <Switch
                  checked={isDark}
                  onCheckedChange={toggleTheme}
                />
              )}
            </div>
          </div>

          {/* Language Settings */}
          <div className="flex justify-between items-center pt-6 border-t border-border">
            <div>
              <h3 className="text-lg font-medium">{t("language")}</h3>
              <p className="text-sm text-muted-foreground">
                Change the display language
              </p>
            </div>
            <div>
              <Select
                value={currentLanguage}
                onValueChange={setLanguage}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t("english")}</SelectItem>
                  <SelectItem value="th">{t("thai")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-medium mb-4">{t("notifications")}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="email-notifications" className="text-sm">
                  {t("emailNotifications")}
                </Label>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <div className="flex justify-between items-center">
                <Label htmlFor="product-updates" className="text-sm">
                  {t("productUpdates")}
                </Label>
                <Switch
                  id="product-updates"
                  checked={productUpdates}
                  onCheckedChange={setProductUpdates}
                />
              </div>
              <div className="flex justify-between items-center">
                <Label htmlFor="task-reminders" className="text-sm">
                  {t("taskReminders")}
                </Label>
                <Switch
                  id="task-reminders"
                  checked={taskReminders}
                  onCheckedChange={setTaskReminders}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 border-t border-border flex justify-end">
          <Button onClick={handleSaveSettings}>
            {t("saveChanges")}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            View and update your account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Your account settings and preferences
          </p>
          
          <Separator className="my-4" />
          
          <div className="space-y-1">
            <p className="font-medium">Version</p>
            <p className="text-sm text-muted-foreground">1.0.0</p>
          </div>
        </CardContent>
      </Card>
    </SidebarLayout>
  );
}

// Import useState since we're using it in the component
import { useState } from "react";
