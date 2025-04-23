import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/language-context";
import { registerSchema } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package } from "lucide-react";

type LoginFormValues = {
  username: string;
  password: string;
};

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("login");

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form with validation
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      role: "user",
    },
  });

  // Handle login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  // Handle register form submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      {/* Content Column */}
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 bg-primary rounded-lg text-primary-foreground mb-3">
            <Package className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold">{t("gameAccountManagement")}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t("loginToAccess")}
          </p>
        </div>

        <Tabs
          defaultValue="login"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">{t("login")}</TabsTrigger>
            <TabsTrigger value="register">{t("register")}</TabsTrigger>
          </TabsList>

          {/* Login Form */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>{t("login")}</CardTitle>
                <CardDescription>
                  {t("loginToAccess")}
                </CardDescription>
              </CardHeader>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("username")}</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("password")}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : t("login")}
                    </Button>
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {t("doNotHaveAccount")}{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => setActiveTab("register")}
                      >
                        {t("register")}
                      </Button>
                    </div>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>

          {/* Register Form */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>{t("register")}</CardTitle>
                <CardDescription>
                  Create a new account to access the dashboard
                </CardDescription>
              </CardHeader>
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("username")}</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("password")}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Choose a password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("confirmPassword")}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm your password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("role")}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="admin">{t("admin")}</SelectItem>
                              <SelectItem value="supervisor">{t("supervisor")}</SelectItem>
                              <SelectItem value="user">{t("user")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Registering..." : t("register")}
                    </Button>
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {t("alreadyHaveAccount")}{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => setActiveTab("login")}
                      >
                        {t("login")}
                      </Button>
                    </div>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Hero column with gradient background */}
      <div className="hidden sm:flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/90 to-primary-foreground text-white rounded-lg ml-8 max-w-md h-[640px]">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Game Account Management System
          </h2>
          <p className="mb-6 text-primary-foreground/90">
            Track your game accounts and items, manage sales, and optimize your profits
            with our comprehensive management system.
          </p>
          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="flex items-start">
              <div className="rounded-full bg-white/10 p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Track Products</h3>
                <p className="text-sm opacity-90">Monitor your inventory of game accounts and items</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-white/10 p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Financial Reports</h3>
                <p className="text-sm opacity-90">Analyze your sales and track profits with detailed reports</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-white/10 p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Task Management</h3>
                <p className="text-sm opacity-90">Assign tasks to team members and track progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
