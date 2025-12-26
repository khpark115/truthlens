
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { analyzeContent, fetchTopNews } from './services/geminiService';
import { TruthLensAnalysis, InputData, NewsItem, NewsCategory } from './types';
import AnalysisReport from './components/AnalysisReport';
import MethodologyCenter from './components/MethodologyCenter';
import AnalyticsDashboard from './components/AnalyticsDashboard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Home' | 'Dashboard' | 'Methodology'>('Home');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [newsLoading, setNewsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TruthLensAnalysis | null>(null);
  const [topNews, setTopNews] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('Politics');
  const [filterText, setFilterText] = useState(''); // 실시간 필터용 상태
  const [keywords, setKeywords] = useState<string[]>([]);
  const [formData, setFormData] = useState<InputData>({
    title: '', author: '', body: '', url: '', language: 'Korean', inputType: 'url'
  });

  const categories: NewsCategory[] = ['Politics', 'Economy', 'Society', 'IT/Tech', 'World', 'Keywords'];
  const categoryLabels: Record<string, string> = {
    'Politics': '정치', 'Economy': '경제', 'Society': '사회', 'IT/Tech': 'IT/기술', 'World': '세계', 'Keywords': '관심 키워드'
  };

  const truthDetectiveSteps = [
    { title: "데이터 인제스천", desc: "국내외 주요 미디어 데이터를 수집하고 있습니다..." },
    { title: "팩트 체크 엔진 가동", desc: "실시간 정보 교차 검증을 진행 중입니다..." },
    { title: "논리/편향성 분석", desc: "문장 단위의 포렌식 분석을 수행하고 있습니다..." },
    { title: "최종 리포트 생성", desc: "객관적인 분석 결과를 정리 중입니다..." }
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % truthDetectiveSteps.length);
      }, 1000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadNews = useCallback(async (category: NewsCategory, query?: string) => {
    setNewsLoading(true);
    try {
      const news = await fetchTopNews(category, 'Korean', query);
      setTopNews(news);
    } catch (err) { console.error(err); } finally { setNewsLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'Home' && !result) {
      loadNews(selectedCategory, keywords.join(' '));
    }
  }, [selectedCategory, activeTab, result, loadNews, keywords]);

  // 실시간 필터링 로직
  const filteredNews = useMemo(() => {
    if (!filterText.trim()) return topNews;
    const lowerFilter = filterText.toLowerCase();
    return topNews.filter(news => 
      news.title.toLowerCase().includes(lowerFilter) || 
      news.source.toLowerCase().includes(lowerFilter)
    );
  }, [topNews, filterText]);

  const handleAnalyze = async (input: InputData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeContent({ ...input, language: 'Korean' });
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const addKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && selectedCategory === 'Keywords') {
      const val = (e.target as HTMLInputElement).value.trim();
      if (val && !keywords.includes(val)) {
        setKeywords([...keywords, val]);
        (e.target as HTMLInputElement).value = '';
      }
    }
  };

  return (
    <div className="min-h-screen pb-32 px-4 md:px-8 bg-[#02040a] text-slate-300 font-['Noto_Sans_KR']">
      {/* 고속 분석 로딩 오버레이 */}
      {loading && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#02040a]/90 backdrop-blur-xl">
           <div className="w-48 h-48 relative flex items-center justify-center mb-10">
              <div className="absolute inset-0 border-4 border-blue-600/10 rounded-full" />
              <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin" />
              <div className="text-blue-500 text-4xl font-black">AI</div>
           </div>
           <div className="text-center space-y-3">
              <h2 className="text-xl font-bold text-white">{truthDetectiveSteps[loadingStep]?.title}</h2>
              <p className="text-slate-500 text-sm italic">{truthDetectiveSteps[loadingStep]?.desc}</p>
           </div>
        </div>
      )}

      <header className="max-w-6xl mx-auto pt-10 pb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">TRUTH<span className="text-blue-500">LENS</span> AI</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">엘리트 미디어 분석 및 팩트체크 엔진 v3.0</p>
        </div>
        <nav className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          {(['Home', 'Dashboard', 'Methodology'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-lg text-[11px] font-black uppercase transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'}`}>
              {tab === 'Home' ? '팩트체크' : tab === 'Dashboard' ? '분석 대시보드' : '방법론'}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto">
        {activeTab === 'Dashboard' ? <AnalyticsDashboard /> : 
         activeTab === 'Methodology' ? <MethodologyCenter /> :
         !result ? (
           <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-500">
              <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
                 <div className="flex gap-2 mb-8 p-1 bg-black/40 rounded-xl w-fit">
                    <button onClick={() => setFormData({...formData, inputType: 'url'})} className={`px-6 py-2.5 rounded-lg text-[11px] font-bold transition-all ${formData.inputType === 'url' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>대상 URL 입력</button>
                    <button onClick={() => setFormData({...formData, inputType: 'manual'})} className={`px-6 py-2.5 rounded-lg text-[11px] font-bold transition-all ${formData.inputType === 'manual' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>직접 텍스트 입력</button>
                 </div>
                 <div className="space-y-5">
                    {formData.inputType === 'url' ? (
                      <input type="url" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="분석할 기사 URL을 입력하세요..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-sm focus:border-blue-500 outline-none transition-all" />
                    ) : (
                      <textarea rows={6} value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} placeholder="분석할 뉴스 본문을 입력하세요..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-sm focus:border-blue-500 outline-none transition-all" />
                    )}
                    <button onClick={() => handleAnalyze(formData)} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all uppercase tracking-widest text-sm shadow-xl shadow-blue-900/30">포렌식 분석 시작</button>
                 </div>
              </div>

              {/* 뉴스 피드 섹션 */}
              <div className="space-y-8">
                 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4 flex-1">
                       <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">분석 대상 추천 피드</h3>
                       <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {categories.map(cat => (
                            <button 
                              key={cat} 
                              onClick={() => { setSelectedCategory(cat); setFilterText(''); }} 
                              className={`whitespace-nowrap px-4 py-2 rounded-lg text-[10px] font-bold border transition-all ${selectedCategory === cat ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/30' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                            >
                              {categoryLabels[cat]}
                            </button>
                          ))}
                       </div>
                    </div>
                    
                    {/* 실시간 필터 입력창 */}
                    <div className="w-full md:w-72 relative group">
                       <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5"/></svg>
                       </div>
                       <input 
                          type="text"
                          value={filterText}
                          onChange={(e) => setFilterText(e.target.value)}
                          onKeyDown={selectedCategory === 'Keywords' ? addKeyword : undefined}
                          placeholder={selectedCategory === 'Keywords' ? "새 키워드 추가 (Enter)..." : "피드 내 키워드 필터링..."}
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-[11px] font-bold focus:border-blue-500 focus:bg-slate-900 outline-none transition-all placeholder:text-slate-700"
                       />
                       {filterText && (
                         <button onClick={() => setFilterText('')} className="absolute inset-y-0 right-4 flex items-center text-slate-600 hover:text-white">
                           <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                         </button>
                       )}
                    </div>
                 </div>

                 {/* 관심 키워드 태그 영역 */}
                 {selectedCategory === 'Keywords' && keywords.length > 0 && (
                   <div className="flex flex-wrap gap-2">
                     {keywords.map(kw => (
                       <span key={kw} className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-[9px] font-black text-blue-400">
                         #{kw}
                         <button onClick={() => setKeywords(keywords.filter(k => k !== kw))} className="hover:text-white">✕</button>
                       </span>
                     ))}
                   </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {newsLoading ? [...Array(4)].map((_, i) => <div key={i} className="h-40 bg-slate-900/40 rounded-2xl animate-pulse border border-slate-800" />) : 
                     filteredNews.length > 0 ? (
                       filteredNews.map((news, i) => (
                        <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all flex flex-col justify-between group h-full shadow-lg hover:shadow-blue-900/5">
                           <div>
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{news.source}</span>
                                <span className="text-[8px] font-bold text-slate-700">{news.time}</span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-200 line-clamp-3 mb-4 group-hover:text-white transition-colors leading-relaxed">{news.title}</h4>
                           </div>
                           <button onClick={() => handleAnalyze({inputType: 'url', url: news.url, title: news.title, language: 'Korean'})} className="w-full py-2.5 bg-slate-800 hover:bg-blue-600 text-[10px] font-black text-white rounded-lg transition-all shadow-md">포렌식 분석</button>
                        </div>
                      ))
                     ) : (
                       <div className="col-span-full py-20 text-center space-y-4 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
                          <div className="text-slate-700 inline-block p-4 rounded-full bg-slate-900/40">
                             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2"/></svg>
                          </div>
                          <p className="text-xs font-bold text-slate-600">"{filterText}" 키워드와 일치하는 기사가 없습니다.</p>
                       </div>
                     )}
                 </div>
              </div>
           </div>
         ) : (
           <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button onClick={handleReset} className="mb-8 text-[11px] font-black uppercase text-slate-500 hover:text-white flex items-center gap-2 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3"/></svg> 분석 목록으로 돌아가기
              </button>
              <AnalysisReport data={result} />
           </div>
         )}
      </main>
    </div>
  );
};

export default App;
