
import { DollarSign, TrendingUp, ShoppingBag } from "lucide-react";
import { BudgetSummary } from "@/types/grocery";

interface BudgetCardProps {
  budget: BudgetSummary;
}

const BudgetCard = ({ budget }: BudgetCardProps) => {
  const completionPercentage = budget.totalItems > 0 
    ? Math.round((budget.purchasedItems / budget.totalItems) * 100) 
    : 0;

  return (
    <div className="budget-card animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">Budget Overview</h3>
          <p className="text-white/80 text-sm">Track your spending progress</p>
        </div>
        <DollarSign className="w-8 h-8 text-white/80" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-4 h-4 text-white/80" />
            <span className="text-white/80 text-sm">Total Budget</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${budget.totalCost.toFixed(2)}
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-white/80" />
            <span className="text-white/80 text-sm">Spent</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${budget.purchasedCost.toFixed(2)}
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-white/80" />
            <span className="text-white/80 text-sm">Remaining</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${budget.remainingCost.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm text-white/80 mb-2">
          <span>Shopping Progress</span>
          <span>{completionPercentage}% completed</span>
        </div>
        <div className="bg-white/20 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;
