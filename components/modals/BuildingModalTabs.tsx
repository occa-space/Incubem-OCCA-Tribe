import React from 'react';

type BuildingTab = 'OVERVIEW' | 'KANBAN' | 'MENTOR' | 'ACADEMY' | 'MARKET' | 'WAREHOUSE';

interface BuildingModalTabsProps {
  activeTab: BuildingTab;
  isTribalCenter: boolean;
  isMyHouse: boolean;
  onTabChange: (tab: BuildingTab) => void;
}

export default function BuildingModalTabs({ activeTab, isTribalCenter, isMyHouse, onTabChange }: BuildingModalTabsProps) {
  return (
    <div className="flex border-b border-slate-700 bg-slate-800/50">
      {isTribalCenter ? (
        <>
          <button onClick={() => onTabChange('OVERVIEW')} className={`flex-1 py-3 px-6 text-sm font-bold uppercase ${activeTab === 'OVERVIEW' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>Overview</button>
          <button onClick={() => onTabChange('MENTOR')} className={`flex-1 py-3 px-6 text-sm font-bold uppercase ${activeTab === 'MENTOR' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>Mentor</button>
          <button onClick={() => onTabChange('ACADEMY')} className={`flex-1 py-3 px-6 text-sm font-bold uppercase ${activeTab === 'ACADEMY' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>Academy</button>
          <button onClick={() => onTabChange('MARKET')} className={`flex-1 py-3 px-6 text-sm font-bold uppercase ${activeTab === 'MARKET' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>Mercado</button>
        </>
      ) : isMyHouse ? (
        <>
          <button onClick={() => onTabChange('OVERVIEW')} className={`flex-1 py-3 px-6 text-sm font-bold uppercase ${activeTab === 'OVERVIEW' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>Overview</button>
          <button onClick={() => onTabChange('KANBAN')} className={`flex-1 py-3 px-6 text-sm font-bold uppercase ${activeTab === 'KANBAN' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>Minhas Tasks</button>
          <button onClick={() => onTabChange('WAREHOUSE')} className={`flex-1 py-3 px-6 text-sm font-bold uppercase ${activeTab === 'WAREHOUSE' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>Armazém</button>
        </>
      ) : (
        <>
          <button onClick={() => onTabChange('OVERVIEW')} className={`flex-1 py-3 px-6 text-sm font-bold uppercase ${activeTab === 'OVERVIEW' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>Overview</button>
          <button onClick={() => onTabChange('KANBAN')} className={`flex-1 py-3 px-6 text-sm font-bold uppercase ${activeTab === 'KANBAN' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>Kanban</button>
        </>
      )}
    </div>
  );
}
