
import React from 'react';
import { MediaLeaningPoint, TimelineBubble } from '../types';

const mockScatter: MediaLeaningPoint[] = [
  { name: "글로벌 포스트", x: -60, y: 30, z: 80, trustScore: 92 },
  { name: "뉴스 24", x: 10, y: 75, z: 120, trustScore: 45 },
  { name: "더 데일리", x: 80, y: 55, z: 60, trustScore: 30 },
  { name: "트루스 네트워크", x: -10, y: 15, z: 40, trustScore: 85 },
  { name: "리버티 프레스", x: 50, y: 90, z: 90, trustScore: 25 },
];

const mockTimeline: TimelineBubble[] = [
  { id: '1', time: "10:00", label: "발단 보도", gapRate: 5, importance: 40 },
  { id: '2', time: "11:30", label: "심화 기사", gapRate: 45, importance: 90 },
  { id: '3', time: "14:00", label: "전문가 논평", gapRate: 15, importance: 60 },
  { id: '4', time: "16:45", label: "속보 전파", gapRate: 85, importance: 110 },
  { id: '5', time: "19:20", label: "정리 분석", gapRate: 20, importance: 50 },
];

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-12 pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">미디어 포렌식 현황</h2>
        <p className="text-slate-500 text-sm">최근 24시간 미디어 에코시스템 정밀 분석 데이터</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. 언론사 편향 산점도 */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">보도 성향 및 감정 강도 매트릭스</h3>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" /> <span className="text-[9px] text-slate-500">높은 신뢰</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" /> <span className="text-[9px] text-slate-500">주의 요망</span></div>
            </div>
          </div>
          <div className="relative h-64 border-l border-b border-slate-700 ml-8 mb-8">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800/50 border-dashed" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-800/50 border-dashed" />
            <span className="absolute -left-10 top-1/2 -rotate-90 text-[8px] text-slate-600 font-bold uppercase tracking-widest">감정적 선동 지수</span>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] text-slate-600 font-bold uppercase tracking-widest">정치적 편향성</span>
            {mockScatter.map((m, i) => (
              <div 
                key={i} 
                className="absolute transition-all hover:scale-110 cursor-help group"
                style={{ left: `${(m.x + 100) / 2}%`, bottom: `${m.y}%`, transform: 'translate(-50%, 50%)' }}
              >
                <div 
                  className={`rounded-full border transition-colors ${m.trustScore > 60 ? 'bg-blue-600/20 border-blue-500' : 'bg-red-600/20 border-red-500'}`}
                  style={{ width: `${m.z/3 + 10}px`, height: `${m.z/3 + 10}px` }}
                />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  <p className="text-[10px] font-bold text-white">{m.name}</p>
                  <p className="text-[8px] text-slate-500">신뢰 지수: {m.trustScore}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. 논리 오류 히트맵 */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">주요 보도 오염 지표 히트맵</h3>
          <div className="space-y-3">
            <div className="flex text-[8px] font-bold text-slate-600 uppercase pb-2">
              <div className="w-20">언론사명</div>
              <div className="flex-1 grid grid-cols-5 gap-1 text-center">
                {["사실오류", "논리결여", "맥락누락", "편향어휘", "과장보도"].map(h => <div key={h}>{h}</div>)}
              </div>
            </div>
            {mockScatter.map((m, i) => (
              <div key={i} className="flex items-center h-6">
                <div className="w-20 text-[9px] text-slate-400 truncate pr-2 font-medium">{m.name}</div>
                <div className="flex-1 grid grid-cols-5 gap-1 h-full">
                   {[...Array(5)].map((_, idx) => {
                     const intensity = Math.random();
                     return (
                       <div 
                        key={idx} 
                        className="rounded-sm bg-blue-500" 
                        style={{ opacity: intensity < 0.2 ? 0.05 : intensity }}
                        title={`${Math.round(intensity * 10)}건 감지됨`}
                       />
                     );
                   })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-end items-center gap-2">
            <span className="text-[8px] text-slate-600">감지 빈도:</span>
            <div className="flex gap-0.5">
               {[0.1, 0.3, 0.5, 0.8, 1].map(v => <div key={v} className="w-3 h-3 bg-blue-500" style={{ opacity: v }} />)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. 맥락 누락 타임라인 버블차트 */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 overflow-hidden">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-12 text-center">정보 전파 맥락 누락률 타임라인</h3>
        <div className="relative h-48 flex items-center justify-between px-10">
          <div className="absolute left-10 right-10 h-0.5 bg-slate-800" />
          {mockTimeline.map((item, i) => (
            <div key={i} className="relative flex flex-col items-center group cursor-pointer">
              <div 
                className={`rounded-full border-2 transition-all group-hover:scale-110 mb-4 flex items-center justify-center ${item.gapRate > 50 ? 'bg-orange-600/20 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-blue-600/20 border-blue-400'}`}
                style={{ width: `${item.importance/2}px`, height: `${item.importance/2}px` }}
              >
                <span className="text-[10px] font-bold text-white">{item.gapRate}%</span>
              </div>
              <span className="text-[9px] font-black text-slate-500 uppercase mb-1">{item.time}</span>
              <span className="text-[10px] font-bold text-slate-300">{item.label}</span>
              <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg whitespace-nowrap text-[9px] text-slate-400 z-10">
                맥락 누락률: {item.gapRate}% | 중요도 지수: {item.importance}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
