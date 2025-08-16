import { useCurrency } from '@/hooks/useCurrency';
import { formatPrice, getCurrencySymbol, getCurrencyName } from '@/lib/currency';
import { useAuth } from '@/hooks/useAuth';

export const CurrencyDiagnostic = () => {
  const { currency } = useCurrency();
  const { profile } = useAuth();
  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 text-xs">
      <h4 className="font-bold mb-2">Currency Debug Info</h4>
      <div className="space-y-1">
        <div>Current Currency: <strong>{currency}</strong></div>
        <div>Symbol: <strong>{currencySymbol}</strong></div>
        <div>Name: <strong>{getCurrencyName(currency)}</strong></div>
        <div>Profile Currency: <strong>{profile?.currency || 'Not set'}</strong></div>
        <div>Local Storage: <strong>{localStorage.getItem('preferred-currency') || 'Not set'}</strong></div>
        <div>Sample Price: <strong>{formatPrice(100, currency)}</strong></div>
      </div>
    </div>
  );
};

export default CurrencyDiagnostic;
