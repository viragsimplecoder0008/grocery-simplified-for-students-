import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Currency } from '@/types/grocery';
import { useAuth } from '@/hooks/useAuth';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    // Set currency from user profile if available, otherwise from localStorage
    if (profile?.currency) {
      setCurrencyState(profile.currency as Currency);
    } else {
      const savedCurrency = localStorage.getItem('preferred-currency') as Currency;
      if (savedCurrency && ['USD', 'EUR', 'GBP', 'INR'].includes(savedCurrency)) {
        setCurrencyState(savedCurrency);
      }
    }
  }, [profile]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    // Save to localStorage for anonymous users
    localStorage.setItem('preferred-currency', newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
