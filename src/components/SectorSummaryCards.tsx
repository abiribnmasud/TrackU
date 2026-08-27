import React from 'react';
import { Dumbbell, Sprout, DollarSign, TrendingUp, TrendingDown, Minus, Eye } from 'lucide-react';
import type { SectorAnalytics, WeeklyInsightSummary, SectorType } from '../types/tracker';

interface SectorSummaryCardsProps {
  summaries: Record<SectorType, SectorAnalytics>;
  insights: WeeklyInsightSummary;
  onSelectSectorBreakdown?: (sector: SectorType) => void;
}

export const SectorSummaryCards: React.FC<SectorSummaryCardsProps> = ({
  summaries,
  insights,
  onSelectSectorBreakdown
}) => {
  const renderComparisonBadge = (diffPct: number, isExpense = false) => {
    if (diffPct === 0) {
      return (
        <span className="comparison-badge neutral">
          <Minus size={12} /> Same as last week
        </span>
      );
    }

    const isGood = isExpense ? diffPct < 0 : diffPct > 0;
    const Icon = diffPct > 0 ? TrendingUp : TrendingDown;
    const badgeClass = isGood ? 'positive' : 'negative';

    return (
      <span className={`comparison-badge ${badgeClass}`}>
        <Icon size={12} />
        {diffPct > 0 ? `+${diffPct}%` : `${diffPct}%`} vs last week
      </span>
    );
  };

  return (
    <div className="sector-cards-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {/* Fitness Card */}
      <div
        className="glass-panel clickable-card"
        onClick={() => onSelectSectorBreakdown?.('fitness')}
        style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}
        title="Click to view full-page Fitness breakdown, items & dates"
      >
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          background: 'var(--fitness-glow)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span className="sector-badge fitness">
            <Dumbbell size={14} /> Fitness
          </span>
          {renderComparisonBadge(insights.fitnessDiffPercentage)}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {insights.fitnessMinsThisWeek}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>mins this week</span>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span>Today's Completion</span>
            <span>{summaries.fitness.completedItemsToday} / {summaries.fitness.totalItems} items ({summaries.fitness.completionPercentageToday}%)</span>
          </div>
          <div className="progress-container">
            <div
              className="progress-bar-fill fitness"
              style={{ width: `${summaries.fitness.completionPercentageToday}%` }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: '0.75rem', color: '#34d399', fontWeight: 600, gap: '4px' }}>
          <Eye size={13} /> View Full Fitness Page & Sort
        </div>
      </div>

      {/* Growth Card */}
      <div
        className="glass-panel clickable-card"
        onClick={() => onSelectSectorBreakdown?.('growth')}
        style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}
        title="Click to view full-page Growth breakdown, items & dates"
      >
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          background: 'var(--growth-glow)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span className="sector-badge growth">
            <Sprout size={14} /> Growth
          </span>
          {renderComparisonBadge(insights.growthDiffPercentage)}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {insights.growthHoursThisWeek}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>hrs practice/study</span>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span>Today's Completion</span>
            <span>{summaries.growth.completedItemsToday} / {summaries.growth.totalItems} items ({summaries.growth.completionPercentageToday}%)</span>
          </div>
          <div className="progress-container">
            <div
              className="progress-bar-fill growth"
              style={{ width: `${summaries.growth.completionPercentageToday}%` }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600, gap: '4px' }}>
          <Eye size={13} /> View Full Growth Page & Sort
        </div>
      </div>

      {/* Finance Card */}
      <div
        className="glass-panel clickable-card"
        onClick={() => onSelectSectorBreakdown?.('finance')}
        style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}
        title="Click to view full-page Finance breakdown, items & dates"
      >
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          background: 'var(--finance-glow)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span className="sector-badge finance">
            <DollarSign size={14} /> Finance
          </span>
          {renderComparisonBadge(insights.financialDiffPercentage, true)}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            ${insights.financialExpensesThisWeek.toLocaleString()}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>expenses this week</span>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span>Today's Completion</span>
            <span>{summaries.finance.completedItemsToday} / {summaries.finance.totalItems} items ({summaries.finance.completionPercentageToday}%)</span>
          </div>
          <div className="progress-container">
            <div
              className="progress-bar-fill finance"
              style={{ width: `${summaries.finance.completionPercentageToday}%` }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600, gap: '4px' }}>
          <Eye size={13} /> View Full Finance Page & Sort
        </div>
      </div>
    </div>
  );
};
