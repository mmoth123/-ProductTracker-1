import { useState, useEffect, ReactNode } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useCurrentTime } from "@/hooks/use-time";
import { useLanguage } from "@/context/language-context";
import { getTranslation, TranslationKey } from "@/lib/i18n";

import {
  LayoutDashboard,
  Package,
  ClipboardList,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
  SunMedium,
  Moon,
  Globe,
  Bell,
  ChevronDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

type NavItem = {
  label: TranslationKey;
  icon: React.ReactNode;
  href: string;
  adminOnly?: boolean;
  supervisorOnly?: boolean;
};

export function SidebarLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { currentLanguage, setLanguage } = useLanguage();
  const { formattedTime } = useCurrentTime();

  // Check user role
  const isAdmin = user?.role === "admin";
  const isSupervisor = user?.role === "supervisor";

  // Navigation items
  const navItems: NavItem[] = [
    {
      label: "dashboard",
      icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
      href: "/"
    },
    {
      label: "products",
      icon: <Package className="h-5 w-5 mr-3" />,
      href: "/products"
    },
    {
      label: "tasks",
      icon: <ClipboardList className="h-5 w-5 mr-3" />,
      href: "/tasks"
    },
    {
      label: "reports",
      icon: <BarChart3 className="h-5 w-5 mr-3" />,
      href: "/reports",
      supervisorOnly: true
    },
    {
      label: "users",
      icon: <Users className="h-5 w-5 mr-3" />,
      href: "/users",
      adminOnly: true
    },
    {
      label: "gameNames",
      icon: <Globe className="h-5 w-5 mr-3" />,
      href: "/game-names",
      adminOnly: true
    },
    {
      label: "monthRecords",
      icon: <BarChart3 className="h-5 w-5 mr-3" />,
      href: "/month-records",
      adminOnly: true
    },
    {
      label: "settings",
      icon: <Settings className="h-5 w-5 mr-3" />,
      href: "/settings"
    }
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.supervisorOnly && !isAdmin && !isSupervisor) return false;
    return true;
  });

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 transition-all duration-300 z-10 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0 absolute lg:relative h-full shadow-lg lg:shadow-none"
        }`}
      >
        {/* Logo and App Name */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center space-x-2">
            <span className="bg-primary text-primary-foreground p-1.5 rounded">
              <Package className="h-5 w-5" />
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {getTranslation("gameAccountManagement", currentLanguage)}
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <nav className="mt-4 px-2 space-y-1">
            {filteredNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  {item.icon}
                  <span>{getTranslation(item.label, currentLanguage)}</span>
                </Button>
              </Link>
            ))}

            <Separator className="my-4" />

            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 dark:text-gray-300"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>{getTranslation("logout", currentLanguage)}</span>
            </Button>
          </nav>

          {/* Current Time */}
          <div className="absolute bottom-4 left-0 right-0 px-4">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {getTranslation("currentTime", currentLanguage)}
              </div>
              <div className="text-sm font-mono">{formattedTime}</div>
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 lg:px-6">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Search */}
          <div className="flex-1 flex justify-center lg:justify-start px-2 lg:ml-6 max-w-md">
            <div className="w-full relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={getTranslation("search", currentLanguage)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-3">
            {/* Dark mode toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? (
                <SunMedium className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("en")}>
                  {getTranslation("english", currentLanguage)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("th")}>
                  {getTranslation("thai", currentLanguage)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`}
                      alt={user?.username}
                    />
                    <AvatarFallback>
                      {user?.username?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="font-medium">
                  {user?.username}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {getTranslation("myProfile", currentLanguage)}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    {getTranslation("settings", currentLanguage)}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  {getTranslation("signOut", currentLanguage)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
