import "./PackageHistoryStats.css";

interface PackageHistoryStatsProps {
  totalTransactions: string;
  totalRevenue: string;
}

function PackageHistoryStats({
  totalTransactions,
  totalRevenue,
}: PackageHistoryStatsProps) {
  return (
    <div className="package-history-stats">
      <div className="package-history-stat-card package-history-stat-card--pink">
        <div className="package-history-stat-value">{totalTransactions}</div>

        <div className="package-history-stat-label">Tổng số giao dịch</div>
      </div>

      <div className="package-history-stat-card package-history-stat-card--blue">
        <div className="package-history-stat-value">{totalRevenue}</div>

        <div className="package-history-stat-label">Tổng doanh thu</div>
      </div>
    </div>
  );
}

export default PackageHistoryStats;
