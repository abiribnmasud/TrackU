import React from 'react';
import { Award, Dumbbell, Sprout, DollarSign, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import type { WeeklyInsightSummary, TrackedItem, LogEntry } from '../types/tracker';
import { getWeekDateStrings } from '../utils/analytics';

interface WeeklyInsightsSectionProps {
  insights: WeeklyInsightSummary;
  items: TrackedItem[];
  logs: LogEntry[];
  currentDate: string;
}

export const WeeklyInsightsSection: React.FC<WeeklyInsightsSectionProps> = ({
  insights,
  items,
  logs,
  currentDate
}) => {
  const weekDays = getWeekDateStrings(currentDate, 0); // Mon - Sun
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const logsMap = new Map<string, LogEntry>();
  logs.forEach((l) => logsMap.set(`${l.itemId}_${l.date}`, l));

  // Compute daily completion rates for the 7 days of this week
  const dailyStats = weekDays.map((dayStr, index) => {
    let completed = 0;
    items.forEach((item) => {
      const log = logsMap.get(`${item.id}_${dayStr}`);
      if (log) {
        if (item.inputType === 'percentage' && typeof log.value === 'number' && log.value > 0) {
          completed += log.value / 100;
        } else if (item.inputType === 'boolean' && log.value === true) {
          completed += 1;
        } else if (item.inputType === 'number' && Number(log.value) > 0) {
          completed += 1;
        } else if (item.inputType === 'string' && String(log.value).trim()) {
          completed += 1;
        }
      }
    });

    const maxPoss = items.length || 1;
    const score = Math.min(100, Math.round((completed / maxPoss) * 100));

    return {
      dayName: dayNames[index],
      dateStr: dayStr,
      score,
      isToday: dayStr === currentDate
    };
  });

  return (
    <section className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#a78bfa" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Automated Weekly Insights & Comparison</h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Comparing current week performance with previous week trends.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          color: '#34d399',
          fontSize: '0.85rem',
          fontWeight: 700
        }}>
          <Award size={16} />
          <span>Weekly Consistency: {insights.overallConsistencyScore}%</span>
        </div>
      </div>

      {/* Grid of Insight Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Fitness Insight */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Dumbbell size={14} /> Total Workout Time
            </span>
            <span className={`comparison-badge ${insights.fitnessDiffPercentage >= 0 ? 'positive' : 'negative'}`}>
              {insights.fitnessDiffPercentage >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {insights.fitnessDiffPercentage >= 0 ? `+${insights.fitnessDiffPercentage}%` : `${insights.fitnessDiffPercentage}%`}
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {insights.fitnessMinsThisWeek} mins
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Last week: {insights.fitnessMinsLastWeek} mins
          </p>
        </div>

        {/* Growth Insight */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#a78bfa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sprout size={14} /> Practice & Study Time
            </span>
            <span className={`comparison-badge ${insights.growthDiffPercentage >= 0 ? 'positive' : 'negative'}`}>
              {insights.growthDiffPercentage >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {insights.growthDiffPercentage >= 0 ? `+${insights.growthDiffPercentage}%` : `${insights.growthDiffPercentage}%`}
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {insights.growthHoursThisWeek} hrs
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Last week: {insights.growthHoursLastWeek} hrs
          </p>
        </div>

        {/* Finance Insight */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <DollarSign size={14} /> Total Expenses
            </span>
            <span className={`comparison-badge ${insights.financialDiffPercentage <= 0 ? 'positive' : 'negative'}`}>
              {insights.financialDiffPercentage > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {insights.financialDiffPercentage > 0 ? `+${insights.financialDiffPercentage}%` : `${insights.financialDiffPercentage}%`}
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            ${insights.financialExpensesThisWeek.toLocaleString()}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Last week: ${insights.financialExpensesLastWeek.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 7-Day Consistency Visual Heatmap Bars */}
      <div>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px' }}>
          Weekly Daily Consistency Breakdown
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {dailyStats.map((d) => (
            <div
              key={d.dateStr}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                background: d.isToday ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.4)',
                border: d.isToday ? '1px solid var(--border-bright)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 4px'
              }}
            >
              <span style={{ fontSize: '0.72rem', color: d.isToday ? '#ffffff' : 'var(--text-dim)', fontWeight: d.isToday ? 700 : 500 }}>
                {d.dayName}
              </span>

              {/* Vertical Progress Bar */}
              <div style={{
                width: '12px',
                height: '50px',
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'flex-end',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '100%',
                  height: `${d.score}%`,
                  background: 'linear-gradient(to top, #10b981, #8b5cf6)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'height 0.4s ease'
                }} />
              </div>

              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {d.score}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
