import React from 'react';

export const renderSprintChart = (
  sprintData: Record<number, { pa: number; complexityAvg: number; aimAvg: number }>,
  maxSprint: number
) => {
  const height = 150;
  const width = 400;
  const padding = 20;

  const sprints = Object.keys(sprintData).map(Number).sort((a, b) => a - b);
  if (sprints.length < 1) {
    return <div className="text-xs text-slate-500 text-center py-10">Sem dados suficientes para gráfico</div>;
  }

  const maxPA = Math.max(...Object.values(sprintData).map((d) => d.pa), 10);

  const getX = (sprint: number) => padding + ((sprint - 1) / Math.max(1, maxSprint - 1)) * (width - 2 * padding);
  const getY_PA = (val: number) => height - padding - (val / maxPA) * (height - 2 * padding);
  const getY_Scale = (val: number) => height - padding - (val / 3) * (height - 2 * padding);

  const linePA = sprints.map((s, i) => `${i === 0 ? 'M' : 'L'} ${getX(s)} ${getY_PA(sprintData[s].pa)}`).join(' ');
  const lineComp = sprints.map((s, i) => `${i === 0 ? 'M' : 'L'} ${getX(s)} ${getY_Scale(sprintData[s].complexityAvg)}`).join(' ');
  const lineAIM = sprints.map((s, i) => `${i === 0 ? 'M' : 'L'} ${getX(s)} ${getY_Scale(sprintData[s].aimAvg)}`).join(' ');

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" strokeWidth="1" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#475569" strokeWidth="1" />
      <path d={linePA} fill="none" stroke="#22c55e" strokeWidth="2" />
      <path d={lineComp} fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="4" />
      <path d={lineAIM} fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="2" />
      {sprints.map((s) => (
        <g key={s}>
          <circle cx={getX(s)} cy={getY_PA(sprintData[s].pa)} r="3" fill="#22c55e" />
          <circle cx={getX(s)} cy={getY_Scale(sprintData[s].complexityAvg)} r="3" fill="#eab308" />
          <circle cx={getX(s)} cy={getY_Scale(sprintData[s].aimAvg)} r="3" fill="#a855f7" />
        </g>
      ))}
    </svg>
  );
};
