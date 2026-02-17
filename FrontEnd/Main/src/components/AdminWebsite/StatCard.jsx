import React from 'react';
import '../AdminWebsiteCSS/StatCard.css';

/**
 * Unified stat card component used across all admin pages.
 *
 * @param {string}  label     – Short uppercase label  (e.g. "Total Students")
 * @param {string|number} value – Big number or text   (e.g. 145 or "88.5%")
 * @param {string}  [subtitle] – Optional line below the value
 * @param {'positive'|'negative'|''} [subtitleType] – Color hint for subtitle
 * @param {React.ReactNode} [icon] – Optional Lucide icon element
 * @param {'blue'|'green'|'yellow'|'purple'|'red'|'teal'} [color='blue'] – Left-border accent
 */
const StatCard = ({
  label,
  value,
  subtitle,
  subtitleType = '',
  icon,
  color = 'blue',
}) => {
  // Build accessible label for screen readers
  // Format value for better screen reader pronunciation
  const formattedValue = String(value).replace(/,/g, '');
  const ariaLabel = `${label}: ${formattedValue}${subtitle ? '. ' + subtitle : ''}`;

  return (
    <div
      className={`unified-stat-card ${color}`}
      role="group"
      aria-label={ariaLabel}
    >
      <div className="unified-stat-header">
        <span className="unified-stat-label">{label}</span>
        {icon && <span className="unified-stat-icon" aria-hidden="true">{icon}</span>}
      </div>
      <div className="unified-stat-value">{value}</div>
      {subtitle && (
        <div className={`unified-stat-subtitle ${subtitleType}`}>{subtitle}</div>
      )}
    </div>
  );
};

/**
 * Wrapper grid that lays out StatCards in a responsive row.
 */
export const StatsGrid = ({ children }) => (
  <div className="unified-stats-grid">{children}</div>
);

export default StatCard;
