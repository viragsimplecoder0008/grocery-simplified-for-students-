import { useState } from 'react';
import { Currency } from '@/types/grocery';
import { CURRENCIES, getCurrencyName, getCurrencySymbol } from '@/lib/currency';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: Currency) => void;
  compact?: boolean;
}

const CurrencySelector = ({ 
  onCurrencyChange,
  compact = false 
}: CurrencySelectorProps) => {
  const { user, profile } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [loading, setLoading] = useState(false);

  const handleCurrencyChange = async (newCurrency: Currency) => {
    if (!user) {
      // For anonymous users, just call the callback
      setCurrency(newCurrency);
      if (onCurrencyChange) {
        onCurrencyChange(newCurrency);
      }
      toast.success(`Currency changed to ${getCurrencyName(newCurrency)}`);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ currency: newCurrency })
        .eq('id', user.id);

      if (error) {
        // If the currency column doesn't exist, just use localStorage
        if (error.message?.includes('column "currency" does not exist')) {
          console.warn('Currency column not yet available in database, using localStorage');
          setCurrency(newCurrency);
          if (onCurrencyChange) {
            onCurrencyChange(newCurrency);
          }
          toast.success(`Currency changed to ${getCurrencyName(newCurrency)} (saved locally)`);
          return;
        }
        throw error;
      }

      setCurrency(newCurrency);
      if (onCurrencyChange) {
        onCurrencyChange(newCurrency);
      }
      
      toast.success(`Currency updated to ${getCurrencyName(newCurrency)}`);
      
      // Refresh the page to update all price displays
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error updating currency:', error);
      
      // Fallback to localStorage even for logged in users if database update fails
      setCurrency(newCurrency);
      if (onCurrencyChange) {
        onCurrencyChange(newCurrency);
      }
      toast.success(`Currency changed to ${getCurrencyName(newCurrency)} (saved locally)`);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <Select 
        value={currency} 
        onValueChange={handleCurrencyChange}
        disabled={loading}
      >
        <SelectTrigger className="w-24">
          <SelectValue>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {getCurrencySymbol(currency)}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CURRENCIES).map(([code, info]) => (
            <SelectItem key={code} value={code}>
              <div className="flex items-center gap-2">
                <span>{info.symbol}</span>
                <span>{info.name}</span>
                {currency === code && <Check className="w-3 h-3" />}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Currency Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Currency</label>
          <Select 
            value={currency} 
            onValueChange={handleCurrencyChange}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CURRENCIES).map(([code, info]) => (
                <SelectItem key={code} value={code}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{info.symbol}</span>
                    <div>
                      <div className="font-medium">{info.name}</div>
                      <div className="text-xs text-gray-500">{code}</div>
                    </div>
                    {currency === code && (
                      <Check className="w-4 h-4 text-green-600 ml-auto" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">Preview:</div>
          <div className="flex items-center gap-4 text-sm">
            <span>$10.00 USD →</span>
            <span className="font-semibold">
              {CURRENCIES[currency].symbol}
              {(10 * CURRENCIES[currency].exchangeRate).toFixed(2)} {currency}
            </span>
          </div>
        </div>

        {!user && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xs text-blue-700">
              💡 Sign in to save your currency preference across sessions
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrencySelector;
