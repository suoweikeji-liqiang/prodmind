'use client';

interface Stats {
  totalSessions: number;
  activeSessions: number;
  avgRounds: number;
  avgConfidence: number;
}

export function StatsOverview({ stats }: { stats: Stats }) {
  const items = [
    { label: '总会话', value: stats.totalSessions },
    { label: '进行中', value: stats.activeSessions },
    { label: '平均轮数', value: stats.avgRounds.toFixed(1) },
    { label: '平均信心', value: `${stats.avgConfidence}%` },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map(i => (
        <div key={i.label} className="rounded border p-3 text-center">
          <div className="text-lg font-bold">{i.value}</div>
          <div className="text-xs text-gray-500">{i.label}</div>
        </div>
      ))}
    </div>
  );
}
