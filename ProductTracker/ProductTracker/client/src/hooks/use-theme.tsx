import { useEffect, useState } from "react";
import { useTheme as useNextTheme } from "next-themes";

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Only show theme UI once mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return {
    theme,
    setTheme,
    isDark: mounted && (resolvedTheme === "dark"),
    isLight: mounted && (resolvedTheme === "light"),
    toggleTheme,
    mounted
  };
}
