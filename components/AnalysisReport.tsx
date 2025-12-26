
import React from 'react';
import { TruthLensAnalysis } from '../types';

interface AnalysisReportProps {
  data: TruthLensAnalysis;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({ data }) => {
  const verdictMap: Record<string, { label: string; range: string; styles: string; desc: string }> = {
    'Trustworthy': { 
      label: "신뢰", 
      range: "88-100%", 
      styles: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      desc: "내용이 객관적이며 교차 검증이 완료된 고품질 기사입니다."
    },
    'Caution': { 
      label: "주의", 
      range: "65-87%", 
      styles: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      desc: "사실이나 자극적인 표현이나 일부 배경 설명이 누락되었습니다."
    },
    'Misleading': { 
      label: "왜곡", 
      range: "40-64%", 
      styles: 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]',
      desc: "의도적인 맥락 누락이나 논리적 비약이 다수 발견되었습니다."
    },
    'Propaganda': { 
      label: "선전", 
      range: "0-39%", 
      styles: 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
      desc: "특정 의도를 가진 허위 사실 유포나 감정 선동 목적의 콘텐츠입니다."
    },
  };

  const issueTypeMap: Record<string, string> = {
    "Factual Error": "사실 관계 오류",
    "Logical Fallacy": "논리적 오류",
    "Missing Context": "맥락 누락",
    "Biased Wording": "편향적 어휘",
    "Exaggeration": "과장 보도"
  };

  const moduleLabels: Record<string, string> = {
    source: "출처 신뢰도",
    cross_check: "교차 검증",
    logic: "논리적 무결성",
    context: "맥락 충분성",
    bias: "보도 중립성"
  };

  const currentVerdict = verdictMap[data.meta_analysis.verdict_badge] || { label: "미분류", range: "-", styles: 'bg-slate-500/20 text-slate-400 border-slate-500/50', desc: "" };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      
      {/* Article Info Section */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 md:p-14 backdrop-blur-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-7v-2h7v2zm3-4h-10v-2h10v2zm0-4h-10V7h10v2z"/></svg>
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-blue-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">앙상블 분석 로직 적용됨</span>
             {data.analysis_time_ms !== undefined && (
               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">분석 소요: {data.analysis_time_ms === 0 ? "캐시됨" : `${(data.analysis_time_ms/1000).toFixed(2)}초`}</span>
             )}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">{data.article_title}</h2>
          <div className="flex flex-col md:flex-row gap-6 text-slate-400 items-start md:items-center pt-4 border-t border-slate-800">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2"/></svg></div>
                <div><p className="text-[8px] font-black uppercase text-slate-600">작성자/출처</p><p className="text-slate-200 font-bold text-sm">{data.reporter_name}</p></div>
             </div>
             <p className="text-sm font-medium leading-relaxed max-w-2xl">{data.summary}</p>
          </div>
        </div>
      </div>

      {/* Main Analysis Stats & Verdict Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-[3rem] p-10 flex flex-col items-center justify-center space-y-4 shadow-2xl">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">최종 신뢰 지수</span>
          <div className="text-7xl font-black text-white tracking-tighter">{data.meta_analysis.credibility_score}<span className="text-xl text-slate-700">%</span></div>
          <div className={`px-5 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${currentVerdict.styles}`}>{currentVerdict.label}</div>
        </div>

        {/* 1. 판정 기준 가이드 섹션 */}
        <div className="lg:col-span-1 bg-slate-950/40 border border-slate-800 rounded-[3rem] p-8 space-y-4">
           <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">지수 판정 가이드</span>
           <div className="space-y-3">
              {Object.entries(verdictMap).map(([key, info]) => (
                <div key={key} className={`flex items-center gap-3 p-2 rounded-xl border ${data.meta_analysis.verdict_badge === key ? 'bg-slate-800 border-slate-700' : 'border-transparent opacity-40'}`}>
                   <div className={`w-2 h-2 rounded-full ${info.styles.split(' ')[0]}`} />
                   <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                         <span className="text-[10px] font-black text-slate-200">{info.label}</span>
                         <span className="text-[8px] font-bold text-slate-500">{info.range}</span>
                      </div>
                      <p className="text-[8px] text-slate-500 leading-tight">{info.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-[3rem] p-10 space-y-8">
          <div className="space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">앙상블 GNN 세부 기여도</span>
                <span className="text-[9px] text-blue-400 font-bold uppercase">TruthLens Engine v3.0</span>
             </div>
             <div className="grid grid-cols-5 gap-2 h-16">
                {data.meta_analysis.ensemble_breakdown && Object.entries(data.meta_analysis.ensemble_breakdown).map(([key, val]) => (
                  <div key={key} className="relative group flex flex-col justify-end">
                    <div className="w-full bg-blue-600 rounded-sm transition-all duration-1000" style={{ height: `${val}%` }} />
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-950 border border-slate-800 px-2 py-1 rounded text-[7px] text-white whitespace-nowrap z-10">{moduleLabels[key] || key}: {val}%</div>
                  </div>
                ))}
             </div>
             <div className="flex justify-between text-[8px] text-slate-600 font-bold uppercase pt-1">
                <span>출처</span><span>교차</span><span>논리</span><span>맥락</span><span>중립</span>
             </div>
          </div>
          <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800">
            <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">보도 중립성 코멘트</span>
            <p className="text-xs font-bold text-orange-400 italic leading-relaxed">{data.bias_check}</p>
          </div>
        </div>
      </div>

      {/* Forensic Annotations */}
      <div className="space-y-8">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.5em] px-4">포렌식 어노테이션</h3>
        <div className="grid grid-cols-1 gap-6">
          {data.highlight_annotations.map((item, i) => (
            <div key={i} className="group bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10 hover:border-blue-500/20 transition-all">
              <div className="flex flex-col lg:flex-row gap-12">
                 <div className="flex-1 space-y-5">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-[9px] font-black uppercase tracking-widest">{issueTypeMap[item.issue_type] || item.issue_type}</span>
                    </div>
                    <p className="text-xl font-bold text-white italic leading-relaxed border-l-4 border-slate-700 pl-8">"{item.quoted_text}"</p>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.explanation}</p>
                 </div>
                 <div className="lg:w-96 flex flex-col justify-center space-y-4">
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
                       <span className="text-emerald-500 text-[9px] font-black uppercase mb-3 block">검증 증거 및 근거</span>
                       <p className="text-slate-200 text-xs italic font-medium leading-relaxed">"{item.correction_evidence}"</p>
                    </div>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(item.search_query_suggestion)}`} target="_blank" className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800 text-[9px] font-black uppercase text-blue-400 hover:bg-slate-800 transition-all">
                       교차 검증 검색 ↗
                    </a>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 포렌식 보정 권고 (위치 변경) */}
      <div className="bg-blue-600 rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/40 relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-xl">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5"/></svg>
            </div>
            <div>
               <h4 className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em] mb-2">포렌식 보정 권고</h4>
               <p className="text-xl md:text-2xl font-bold text-white italic leading-relaxed">"{data.correction_suggestion}"</p>
            </div>
         </div>
      </div>

      {/* 3. 트루스렌즈 에디토리얼 논평 (기사 형식) */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-12 md:p-16 space-y-8 relative">
        <div className="flex items-center gap-4 mb-4">
           <div className="h-px flex-1 bg-slate-800" />
           <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em]">TruthLens Editorial</span>
           <div className="h-px flex-1 bg-slate-800" />
        </div>
        <div className="max-w-4xl mx-auto space-y-10">
           <h3 className="text-2xl md:text-4xl font-black text-white text-center leading-snug tracking-tight underline decoration-blue-500/30 underline-offset-8">
             [분석 논평] {data.article_title.length > 30 ? data.article_title.substring(0, 30) + '...' : data.article_title}
           </h3>
           
           <div className="flex justify-center items-center gap-4 text-[10px] font-bold text-slate-500 uppercase">
             <span>발행: 트루스렌즈 AI 분석팀</span>
             <span className="w-1 h-1 rounded-full bg-slate-700" />
             <span>주제: 미디어 리터러시 및 팩트체크</span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-8 space-y-6 text-slate-300 leading-loose text-lg font-medium">
                 {data.truthlens_commentary.split('\n').map((para, i) => (
                   para.trim() && <p key={i} className="first-letter:text-4xl first-letter:font-black first-letter:text-blue-500 first-letter:float-left first-letter:mr-3">{para}</p>
                 ))}
              </div>
              <div className="md:col-span-4 space-y-6">
                 <div className="p-8 bg-slate-950 border-l-4 border-blue-600 rounded-r-2xl">
                    <span className="text-[9px] font-black text-slate-600 uppercase mb-4 block">핵심 요약</span>
                    <p className="text-sm font-bold text-white italic leading-relaxed">
                      "본 기사는 {data.meta_analysis.verdict_badge === 'Trustworthy' ? '신뢰할 수 있는 데이터 구조를 갖추고 있으나' : '다양한 포렌식 결함이 발견되었으며'}, 특히 {data.missing_context[0] || '배경 맥락'} 부분에서 보정이 시급합니다."
                    </p>
                 </div>
                 <div className="text-[9px] text-slate-500 leading-relaxed italic border-t border-slate-800 pt-4">
                   *본 논평은 트루스렌즈 AI의 5대 분석 모듈과 Google Search 교차 검증 데이터를 기반으로 자동 생성되었습니다.
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Grounding Sources */}
      {data.grounding_sources && data.grounding_sources.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.5em] px-4">검증 데이터 소스</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
            {data.grounding_sources.map((source, idx) => (
              <a 
                key={idx} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-5 bg-slate-900/60 border border-slate-800 rounded-3xl hover:border-blue-500/40 transition-all flex flex-col gap-2 group shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">데이터 소스 {idx + 1}</span>
                  <svg className="w-4 h-4 text-slate-600 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2"/></svg>
                </div>
                <span className="text-slate-200 text-xs font-bold truncate group-hover:text-white transition-colors">{source.title || "외부 검증 링크"}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisReport;
