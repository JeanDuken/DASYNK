import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { useBudgets, Budget } from '@/hooks/useFinance';
import { formatCurrency } from '@/lib/currencies';

interface BudgetsListProps {
  organizationId: string;
  currency: string;
  onAddClick: () => void;
  onEditClick: (budget: Budget) => void;
}

const BudgetsList: React.FC<BudgetsListProps> = ({
  organizationId,
  currency,
  onAddClick,
  onEditClick,
}) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());

  const { data: budgets, isLoading } = useBudgets(
    organizationId,
    selectedYear !== 'all' ? parseInt(selectedYear) : undefined
  );

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const incomeBudgets = budgets?.filter(b => b.type === 'income') || [];
  const expenseBudgets = budgets?.filter(b => b.type === 'expense') || [];

  const totalPlannedIncome = incomeBudgets.reduce((sum, b) => sum + Number(b.planned_amount), 0);
  const totalActualIncome = incomeBudgets.reduce((sum, b) => sum + Number(b.actual_amount), 0);
  const totalPlannedExpense = expenseBudgets.reduce((sum, b) => sum + Number(b.planned_amount), 0);
  const totalActualExpense = expenseBudgets.reduce((sum, b) => sum + Number(b.actual_amount), 0);

  const getProgressColor = (actual: number, planned: number, type: 'income' | 'expense') => {
    const percentage = planned > 0 ? (actual / planned) * 100 : 0;
    if (type === 'income') {
      if (percentage >= 100) return 'bg-green-500';
      if (percentage >= 75) return 'bg-primary';
      if (percentage >= 50) return 'bg-amber-500';
      return 'bg-red-500';
    } else {
      if (percentage <= 75) return 'bg-green-500';
      if (percentage <= 90) return 'bg-amber-500';
      if (percentage <= 100) return 'bg-orange-500';
      return 'bg-red-500';
    }
  };

  const renderBudgetCard = (budget: Budget) => {
    const percentage = budget.planned_amount > 0
      ? (Number(budget.actual_amount) / Number(budget.planned_amount)) * 100
      : 0;
    const progressColor = getProgressColor(Number(budget.actual_amount), Number(budget.planned_amount), budget.type);

    return (
      <Card
        key={budget.id}
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onEditClick(budget)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-medium">{budget.name}</h4>
              <p className="text-xs text-muted-foreground">
                {budget.category?.name || 'Sans catégorie'}
              </p>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              budget.type === 'income' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {budget.type === 'income' ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Réalisé</span>
              <span className="font-medium">
                {formatCurrency(Number(budget.actual_amount), budget.currency)}
              </span>
            </div>
            <Progress value={Math.min(percentage, 100)} className={`h-2 ${progressColor}`} />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Prévu</span>
              <span>
                {formatCurrency(Number(budget.planned_amount), budget.currency)}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {percentage.toFixed(1)}% {budget.type === 'income' ? 'atteint' : 'utilisé'}
              </span>
              <span className={`text-xs font-medium ${
                budget.type === 'income'
                  ? percentage >= 100 ? 'text-green-600' : 'text-muted-foreground'
                  : percentage > 100 ? 'text-red-600' : 'text-green-600'
              }`}>
                {budget.type === 'income'
                  ? percentage >= 100 ? 'Objectif atteint' : `${formatCurrency(Number(budget.planned_amount) - Number(budget.actual_amount), budget.currency)} restant`
                  : percentage > 100 ? `${formatCurrency(Number(budget.actual_amount) - Number(budget.planned_amount), budget.currency)} dépassé` : `${formatCurrency(Number(budget.planned_amount) - Number(budget.actual_amount), budget.currency)} disponible`
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Budget Annuel</h2>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Budget
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus Prévus</p>
                <p className="text-xl font-bold">{formatCurrency(totalPlannedIncome, currency)}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus Réalisés</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalActualIncome, currency)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dépenses Prévues</p>
                <p className="text-xl font-bold">{formatCurrency(totalPlannedExpense, currency)}</p>
              </div>
              <Target className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dépenses Réalisées</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totalActualExpense, currency)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="spinner" />
        </div>
      ) : budgets?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun budget défini pour cette période</p>
            <Button onClick={onAddClick} className="mt-4">
              Créer un Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Income Budgets */}
          {incomeBudgets.length > 0 && (
            <div>
              <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Budgets Revenus
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {incomeBudgets.map(renderBudgetCard)}
              </div>
            </div>
          )}

          {/* Expense Budgets */}
          {expenseBudgets.length > 0 && (
            <div>
              <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Budgets Dépenses
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {expenseBudgets.map(renderBudgetCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetsList;
