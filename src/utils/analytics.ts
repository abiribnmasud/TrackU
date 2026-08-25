import type { TrackedItem, LogEntry, SectorAnalytics, WeeklyInsightSummary, SectorType } from '../types/tracker';

// Parse date YYYY-MM-DD safely
export const parseDateString = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const formatDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Get array of 7 date strings (Monday to Sunday) containing target date
export const getWeekDateStrings = (targetDateStr: string, weekOffset = 0): string[] => {
  const date = parseDateString(targetDateStr);
  const dayOfWeek = date.getDay(); // 0 is Sun, 1 is Mon, etc.
  const diffToMon = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek) + weekOffset * 7;
  
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMon);

  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(formatDateString(d));
  }
  return weekDates;
};

// Calculate numeric contribution of a single log entry for aggregate calculations
const getLogNumericValue = (item: TrackedItem, log?: LogEntry): number => {
  if (!log) return 0;

  if (item.inputType === 'percentage') {
    const pct = typeof log.value === 'number' ? log.value : (log.percentageValue ?? 0);
    const target = item.targetValue || 30; // default target if unassigned
    return (pct / 100) * target;
  }

  if (item.inputType === 'number') {
    return typeof log.value === 'number' ? log.value : Number(log.value) || 0;
  }

  if (item.inputType === 'boolean') {
    return log.value === true ? (item.targetValue || 1) : 0;
  }

  return 0;
};

export const calculateWeeklyInsights = (
  items: TrackedItem[],
  logs: LogEntry[],
  currentDateStr: string
): WeeklyInsightSummary => {
  const thisWeekDays = getWeekDateStrings(currentDateStr, 0);
  const lastWeekDays = getWeekDateStrings(currentDateStr, -1);

  const logsByDateMap = new Map<string, LogEntry>();
  logs.forEach((l) => {
    logsByDateMap.set(`${l.itemId}_${l.date}`, l);
  });

  // Sector-based aggregates
  let fitnessMinsThisWeek = 0;
  let fitnessMinsLastWeek = 0;

  let growthMinsThisWeek = 0;
  let growthMinsLastWeek = 0;

  let finExpThisWeek = 0;
  let finExpLastWeek = 0;

  let totalCheckinsPossibleThisWeek = 0;
  let totalCheckinsCompletedThisWeek = 0;

  items.forEach((item) => {
    // Check this week
    thisWeekDays.forEach((day) => {
      totalCheckinsPossibleThisWeek++;
      const log = logsByDateMap.get(`${item.id}_${day}`);
      if (log) {
        // Evaluate completion
        if (item.inputType === 'percentage' && typeof log.value === 'number' && log.value > 0) {
          totalCheckinsCompletedThisWeek += (log.value / 100);
        } else if (item.inputType === 'boolean' && log.value === true) {
          totalCheckinsCompletedThisWeek += 1;
        } else if (item.inputType === 'number' && Number(log.value) > 0) {
          totalCheckinsCompletedThisWeek += 1;
        } else if (item.inputType === 'string' && String(log.value).trim().length > 0) {
          totalCheckinsCompletedThisWeek += 1;
        }
      }

      const numVal = getLogNumericValue(item, log);
      if (item.sector === 'fitness') {
        fitnessMinsThisWeek += numVal;
      } else if (item.sector === 'growth') {
        growthMinsThisWeek += numVal;
      } else if (item.sector === 'finance' && item.type === 'expense') {
        finExpThisWeek += numVal;
      }
    });

    // Check last week
    lastWeekDays.forEach((day) => {
      const log = logsByDateMap.get(`${item.id}_${day}`);
      const numVal = getLogNumericValue(item, log);
      if (item.sector === 'fitness') {
        fitnessMinsLastWeek += numVal;
      } else if (item.sector === 'growth') {
        growthMinsLastWeek += numVal;
      } else if (item.sector === 'finance' && item.type === 'expense') {
        finExpLastWeek += numVal;
      }
    });
  });

  const calcDiffPct = (curr: number, prev: number): number => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const fitnessDiffPercentage = calcDiffPct(fitnessMinsThisWeek, fitnessMinsLastWeek);
  
  const growthHoursThisWeek = Number((growthMinsThisWeek / 60).toFixed(1));
  const growthHoursLastWeek = Number((growthMinsLastWeek / 60).toFixed(1));
  const growthDiffPercentage = calcDiffPct(growthHoursThisWeek, growthHoursLastWeek);

  const financialExpensesThisWeek = Math.round(finExpThisWeek);
  const financialExpensesLastWeek = Math.round(finExpLastWeek);
  const financialDiffPercentage = calcDiffPct(financialExpensesThisWeek, financialExpensesLastWeek);

  const overallConsistencyScore = totalCheckinsPossibleThisWeek > 0
    ? Math.min(100, Math.round((totalCheckinsCompletedThisWeek / totalCheckinsPossibleThisWeek) * 100))
    : 0;

  return {
    fitnessMinsThisWeek: Math.round(fitnessMinsThisWeek),
    fitnessMinsLastWeek: Math.round(fitnessMinsLastWeek),
    fitnessDiffPercentage,

    growthHoursThisWeek,
    growthHoursLastWeek,
    growthDiffPercentage,

    financialExpensesThisWeek,
    financialExpensesLastWeek,
    financialDiffPercentage,

    overallConsistencyScore
  };
};

export const getSectorSummaries = (
  items: TrackedItem[],
  logs: LogEntry[],
  dateStr: string
): Record<SectorType, SectorAnalytics> => {
  const sectors: SectorType[] = ['fitness', 'growth', 'finance'];

  const thisWeekDays = getWeekDateStrings(dateStr, 0);
  const lastWeekDays = getWeekDateStrings(dateStr, -1);

  const logsMap = new Map<string, LogEntry>();
  logs.forEach((l) => logsMap.set(`${l.itemId}_${l.date}`, l));

  const result: Partial<Record<SectorType, SectorAnalytics>> = {};

  sectors.forEach((sec) => {
    const secItems = items.filter((i) => i.sector === sec);
    let completedToday = 0;

    let weekNumThis = 0;
    let weekNumLast = 0;

    secItems.forEach((item) => {
      const todayLog = logsMap.get(`${item.id}_${dateStr}`);
      if (todayLog) {
        if (item.inputType === 'percentage' && typeof todayLog.value === 'number' && todayLog.value >= 100) {
          completedToday++;
        } else if (item.inputType === 'boolean' && todayLog.value === true) {
          completedToday++;
        } else if (item.inputType === 'number' && Number(todayLog.value) > 0) {
          completedToday++;
        } else if (item.inputType === 'string' && String(todayLog.value).trim()) {
          completedToday++;
        }
      }

      thisWeekDays.forEach((d) => {
        weekNumThis += getLogNumericValue(item, logsMap.get(`${item.id}_${d}`));
      });
      lastWeekDays.forEach((d) => {
        weekNumLast += getLogNumericValue(item, logsMap.get(`${item.id}_${d}`));
      });
    });

    const completionPercentageToday = secItems.length > 0
      ? Math.round((completedToday / secItems.length) * 100)
      : 0;

    const percentageChangeWeekly = weekNumLast === 0
      ? (weekNumThis > 0 ? 100 : 0)
      : Math.round(((weekNumThis - weekNumLast) / weekNumLast) * 100);

    let unitLabel = 'items';
    if (sec === 'fitness') unitLabel = 'mins';
    else if (sec === 'growth') unitLabel = 'mins';
    else if (sec === 'finance') unitLabel = '$';

    result[sec] = {
      sector: sec,
      totalItems: secItems.length,
      completedItemsToday: completedToday,
      completionPercentageToday,
      weeklyTotalNumeric: Math.round(weekNumThis),
      previousWeeklyTotalNumeric: Math.round(weekNumLast),
      percentageChangeWeekly,
      unitLabel
    };
  });

  return result as Record<SectorType, SectorAnalytics>;
};
