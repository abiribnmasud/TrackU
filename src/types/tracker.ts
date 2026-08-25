export type SectorType = 'fitness' | 'growth' | 'finance';

export type ItemType = 'goal' | 'habit' | 'expense' | 'saving' | 'milestone';

export type FrequencyPeriod = 
  | 'daily' 
  | 'weekly' 
  | 'monthly' 
  | '3_months' 
  | '6_months' 
  | 'yearly';

export type InputType = 'percentage' | 'number' | 'boolean' | 'string';

export interface TrackedItem {
  id: string;
  title: string;
  sector: SectorType;
  type: ItemType;
  period: FrequencyPeriod;
  inputType: InputType;
  unit?: string; // e.g. "$", "km", "mins", "pages"
  targetValue?: number; // target number e.g. 30 mins, 5 days, 100%
  addRemark: boolean;
  isDefault?: boolean;
  createdAt: string;
}

export interface LogEntry {
  id: string;
  itemId: string;
  date: string; // YYYY-MM-DD
  value: number | boolean | string;
  percentageValue?: number; // calculated or explicitly provided percentage (0-100)
  remark?: string;
  timestamp: number;
}

export interface SectorAnalytics {
  sector: SectorType;
  totalItems: number;
  completedItemsToday: number;
  completionPercentageToday: number;
  weeklyTotalNumeric: number; // e.g. total fitness mins or total expenses
  previousWeeklyTotalNumeric: number;
  percentageChangeWeekly: number; // +X% or -Y%
  unitLabel: string;
}

export interface WeeklyInsightSummary {
  fitnessMinsThisWeek: number;
  fitnessMinsLastWeek: number;
  fitnessDiffPercentage: number;
  
  growthHoursThisWeek: number;
  growthHoursLastWeek: number;
  growthDiffPercentage: number;
  
  financialExpensesThisWeek: number;
  financialExpensesLastWeek: number;
  financialDiffPercentage: number;
  
  overallConsistencyScore: number; // 0 - 100%
}
