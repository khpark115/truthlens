
import React, { useState, useMemo } from 'react';
import { TruthLensEngine } from '../services/truthLensEngine';
import { EnsembleBreakdown, TruthLensAnalysis } from '../types';

const MethodologyCenter: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  // 엔진 기본 가중치로 초기화
  const [weights, setWeights] = useState<EnsembleBreakdown>({ ...TruthLensEngine.DEFAULT_WEIGHTS });

  // 시뮬레이션을 위한 가상의 분석 데이터 (엔진의 점수 계산 로직을 테스트하기 위함)
  const mockAnalysis: TruthLensAnalysis = {
    article_title: "시뮬레이션 데이터",
    reporter_name: "AI 시스템",
    summary: "",
    bias_check: "",
    correction_suggestion: "",
    // Added missing required property truthlens_commentary
    truthlens_commentary: "",
    missing_context: ["배경 지식 누락", "통계 수치 미흡"], // Context score 감점 요인
    highlight_annotations: [
      { quoted_text: "", issue_type: "Logical Fallacy", explanation: "", correction_evidence: "", search_query_suggestion: "" },
      { quoted_text: "", issue_type: "Logical Fallacy", explanation: "", correction_evidence: "", search_query_suggestion: "" }
    ], // Logic score 감점 요인
    creator_reputation_check: {
      evaluation: "",
      check_points: ["공식 인증 매체", "기존 오보 이력 없음"]
    }, // Source score 가점 요인
    meta_analysis: {
      credibility_score: 0,
      verdict_badge: "Caution",
      political_leaning_assessment: "Center",
      emotional_intensity: 4 // Bias score 감점 요인
    },
    grounding_sources: [{}, {}, {}] // Cross-check score 가점 요인
  };

  const steps = [
    { title: "포렌식 수집", icon: "📡", desc: "실시간 뉴스 쿼터 관리 시스템을 통한 데이터 인제스천" },
    { title: "주장 추출", icon: "🔍", desc: "본문 내 검증이 필요한 핵심 문장 및 인과 관계 필터링" },
    { title: "교차 검증", icon: "🔗", desc: "Gemini Grounding을 활용한 타 매체 보도 이력 대조" },
    { title: "앙상블 융합", icon: "🧠", desc: "GNN 가중치 융합 아키텍처를 통한 5대 모듈 출력값 결합" },
    { title: "최종 판정", icon: "🛡️", desc: "신뢰 지수 기반 베이지 결정 및 최종 리포트 생성" }
  ];

  const moduleLabels: Record<keyof EnsembleBreakdown, string> = {
    source: "출처 신뢰도",
    cross_check: "교차 검증",
    logic: "논리적 무결성",
    context: "맥락 충분성",
    bias: "보도 중립성"
  };

  // TruthLensEngine을 사용한 실시간 계산
  const { finalScore, contributionBreakdown, moduleScores, totalWeight } = useMemo(() => {
    const result = TruthLensEngine.calculateEnsembleScore(mockAnalysis, weights);
    const tw = weights.source + weights.cross_check + weights.logic + weights.context + weights.bias;
    
    return { 
      finalScore: result.score, 
      contributionBreakdown: result.contribution,
      moduleScores: result.breakdown,
      totalWeight: tw 
    };
  }, [weights]);

  const handleWeightChange = (key: keyof EnsembleBreakdown, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const getVerdict = (score: number) => {
    if (score >= 88) return { label: "신뢰 가능", color: "text-emerald-400" };
    if (score >= 65) return { label: "주의 요망", color: "text-yellow-400" };
    if (score >= 40) return { label: "왜곡 가능성", color: "text-orange-400" };
    return { label: "허위/선전", color: "text-red-400" };
  };

  const verdict = getVerdict(finalScore);

  return (
    <div className="space-y-20 pb-20 animate-in fade-in duration-700">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">포렌식 분석 방법론</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          TruthLens AI는 단순한 검색을 넘어, 5대 핵심 분석 모듈의 출력값을 동적으로 융합하는 
          GNN(Graph Neural Network) 기반 앙상블 파이프라인을 운영합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-800 hidden md:block" />
        {steps.map((step, i) => (
          <div 
            key={i} 
            onClick={() => setActiveStep(i)}
            className={`relative z-10 p-6 rounded-[2rem] border transition-all cursor-pointer group ${
              activeStep === i ? 'bg-blue-600 border-blue-400 shadow-2xl scale-105' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center text-xl ${
              activeStep === i ? 'bg-white shadow-lg' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
            }`}>
              {step.icon}
            </div>
            <h4 className="text-xs font-black uppercase mb-2 tracking-widest">{step.title}</h4>
            <p className={`text-[10px] leading-relaxed font-medium ${activeStep === i ? 'text-blue-100' : 'text-slate-500'}`}>{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-12 overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start relative z-10">
          <div className="space-y-8">
            <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg text-[10px] font-black text-blue-400 uppercase tracking-widest">앙상블 시뮬레이터 v2.6</div>
            <h3 className="text-3xl font-black text-white tracking-tight">가중치 동적 융합 시뮬레이션</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              각 분석 모듈의 중요도(Weight)를 직접 조정하여 최종 신뢰 지수(Credibility Score)가 어떻게 변하는지 실시간으로 확인하십시오.
            </p>
            <div className="space-y-6 pt-4">
              {(Object.keys(weights) as Array<keyof EnsembleBreakdown>).map((key) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase">
                    <span className="text-slate-500">{moduleLabels[key]} 가중치</span>
                    <span className="text-blue-400">{weights[key]}pts</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={weights[key]} 
                    onChange={(e) => handleWeightChange(key, Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[8px] text-slate-600 font-bold">
                    <span>원시 점수: {moduleScores[key]}점</span>
                    <span>중요도 설정</span>
                  </div>
                </div>
              ))}
              {totalWeight === 0 && (
                <p className="text-red-500 text-[10px] font-bold animate-pulse text-center">적어도 하나의 가중치가 0보다 커야 합니다.</p>
              )}
            </div>
          </div>

          <div className="bg-slate-950 p-10 rounded-[3rem] border border-slate-800 shadow-2xl space-y-10">
            <div className="text-center space-y-2">
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">앙상블 최종 신뢰 점수</span>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-7xl font-black text-white">{finalScore}</span>
                <span className="text-2xl font-black text-slate-700">%</span>
              </div>
              <div className={`text-xs font-black uppercase tracking-widest ${verdict.color}`}>{verdict.label}</div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">가중치 대비 점수 기여도</h4>
                 <span className="text-[8px] text-slate-600 font-bold uppercase italic">Weight × Score Attribution</span>
              </div>
              <div className="space-y-4">
                {(Object.entries(contributionBreakdown) as [keyof EnsembleBreakdown, number][]).map(([key, val]) => (
                  <div key={key} className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-bold uppercase">
                      <span className="text-slate-500">{moduleLabels[key]}</span>
                      <span className="text-slate-300">{val}% 기여</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-300" 
                        style={{ width: `${val}%`, opacity: 0.3 + (val / 100) }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-blue-600/5 rounded-2xl border border-blue-500/20">
               <div className="flex gap-4 items-start">
                  <div className="text-blue-500 pt-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2"/></svg></div>
                  <p className="text-[10px] text-blue-400/80 font-medium leading-relaxed">
                    본 시뮬레이션은 TruthLens 엔진 v2.6의 융합 알고리즘을 사용합니다. 
                    가중치가 높을수록 해당 모듈의 평가 점수가 최종 신뢰 지수에 미치는 영향력이 커지며, 
                    기여도는 가중치와 해당 모듈의 분석 점수를 곱한 값의 비중을 의미합니다.
                  </p>
               </div>
            </div>

            <button 
              onClick={() => setWeights({ ...TruthLensEngine.DEFAULT_WEIGHTS })}
              className="w-full py-4 bg-slate-900 text-slate-500 hover:text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-800 border border-slate-800 transition-all"
            >
              엔진 기본 가중치로 초기화
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MethodologyCenter;
