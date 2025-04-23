import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { TranslationKey, getTranslation } from "@/lib/i18n";

// Interface for the language context
type LanguageContextType = {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  t: (key: TranslationKey) => string;
};

// Create the language context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  // Use the stored language preference or default to English
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("language") || "en";
    }
    return "en";
  });

  // Update local storage when language changes
  useEffect(() => {
    localStorage.setItem("language", currentLanguage);
  }, [currentLanguage]);

  // Function to set the language
  const setLanguage = (language: string) => {
    setCurrentLanguage(language);
  };

  // Translator function that gets translations for the current language
  const t = (key: TranslationKey) => {
    return getTranslation(key, currentLanguage);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
