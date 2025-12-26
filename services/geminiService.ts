
import { GoogleGenAI, Type } from "@google/genai";
import { TruthLensAnalysis, InputData, NewsItem, NewsCategory } from "../types";
import { TruthLensEngine } from "./truthLensEngine";

const CACHE_KEY_PREFIX = "tl_cache_v3_";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; 

class QuotaManager {
  private lastCall = 0;
  private minInterval = 30; 

  async wait() {
    const now = Date.now();
    const diff = now - this.lastCall;
    if (diff < this.minInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minInterval - diff));
    }
    this.lastCall = Date.now();
  }
}

const quota = new QuotaManager();

function parseAiJson(text: string): any {
  if (!text) return null;
  let cleaned = text.trim();
  
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn("JSON 복구 시도 중...");
    try {
      let attempt = cleaned.replace(/[\u201C\u201D]/g, '"');
      return JSON.parse(attempt);
    } catch (e2) {
      throw new Error(`분석 결과 데이터 해석에 실패했습니다: ${e2 instanceof Error ? e2.message : String(e2)}`);
    }
  }
}

const getCache = (id: string) => {
  const item = localStorage.getItem(CACHE_KEY_PREFIX + id);
  if (!item) return null;
  const { data, timestamp } = JSON.parse(item);
  if (Date.now() - timestamp > CACHE_EXPIRY) {
    localStorage.removeItem(CACHE_KEY_PREFIX + id);
    return null;
  }
  return data;
};

const setCache = (id: string, data: any) => {
  localStorage.setItem(CACHE_KEY_PREFIX + id, JSON.stringify({ data, timestamp: Date.now() }));
};

export async function analyzeContent(input: InputData): Promise<TruthLensAnalysis> {
  const startTime = Date.now();
  const safeBody = input.body?.slice(0, 8000) || "";
  const cacheId = btoa(input.url || (input.title + safeBody.substring(0, 30)));
  const cached = getCache(cacheId);
  
  if (cached) return { ...cached, analysis_time_ms: 0 };

  await quota.wait();

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview"; 

  const targetDesc = input.inputType === 'url' 
    ? `분석 대상 URL: ${input.url} (입력된 힌트 제목: ${input.title || "알 수 없음"})` 
    : `기사 제목: ${input.title}, 본문 내용: ${safeBody}`;

  const prompt = `당신은 최고 수준의 미디어 포렌식 분석가이자 팩트체크 전문가입니다. 
다음 콘텐츠를 정밀 분석하여 신뢰성을 평가하고 보고서를 작성하십시오: ${targetDesc}. 

**중요 지침 (STRICT INSTRUCTIONS):**
1. **URL 실시간 검증**: Google Search 도구를 사용하여 제공된 URL의 실제 내용을 반드시 확인하십시오. 
   - YouTube 링크인 경우, 해당 영상의 제목, 설명, 댓글 및 외부 인용 보도를 검색하여 영상의 실제 주제와 발언 내용을 파악하십시오.
2. **허구 정보 생성 금지 (NO HALLUCINATION)**: 만약 URL에 접근할 수 없거나 검색을 통해 실제 내용을 확인할 수 없다면, 가상의 내용을 절대 지어내지 마십시오. 이 경우 'article_title'에 "분석 불가: 접근 권한 또는 정보 부족"이라고 적고, 'summary'에 그 이유를 명시하십시오.
3. **포렌식 기준**: 기사의 핵심 주장이 다른 신뢰할 수 있는 매체들과 일치하는지, 논리적 비약이 있는지, 의도적인 맥락 누락이 있는지를 데이터 기반으로 분석하십시오.
4. **심층 논평**: 'truthlens_commentary' 필드에는 확인된 사실을 바탕으로 전문 저널리즘 칼럼 형식의 논평을 작성하십시오.
5. **언어**: 모든 분석 결과는 반드시 '한국어'로 작성하십시오.`;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4000 }, 
        maxOutputTokens: 12000, 
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            article_title: { type: Type.STRING },
            reporter_name: { type: Type.STRING },
            meta_analysis: {
              type: Type.OBJECT,
              properties: {
                credibility_score: { type: Type.NUMBER },
                verdict_badge: { type: Type.STRING },
                political_leaning_assessment: { type: Type.STRING },
                emotional_intensity: { type: Type.NUMBER }
              },
              required: ["credibility_score", "verdict_badge", "political_leaning_assessment", "emotional_intensity"]
            },
            summary: { type: Type.STRING },
            bias_check: { type: Type.STRING },
            highlight_annotations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  quoted_text: { type: Type.STRING },
                  issue_type: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  correction_evidence: { type: Type.STRING },
                  search_query_suggestion: { type: Type.STRING }
                },
                required: ["quoted_text", "issue_type", "explanation", "correction_evidence", "search_query_suggestion"]
              }
            },
            missing_context: { type: Type.ARRAY, items: { type: Type.STRING } },
            creator_reputation_check: {
              type: Type.OBJECT,
              properties: {
                evaluation: { type: Type.STRING },
                check_points: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["evaluation", "check_points"]
            },
            correction_suggestion: { type: Type.STRING },
            truthlens_commentary: { type: Type.STRING }
          },
          required: ["article_title", "reporter_name", "meta_analysis", "summary", "bias_check", "highlight_annotations", "missing_context", "creator_reputation_check", "correction_suggestion", "truthlens_commentary"]
        }
      }
    });

    const analysis = parseAiJson(result.text) as TruthLensAnalysis;
    
    // 만약 모델이 분석 불가를 리턴했다면 낮은 점수 부여
    if (analysis.article_title.includes("분석 불가")) {
      analysis.meta_analysis.credibility_score = 0;
      analysis.meta_analysis.verdict_badge = "Propaganda";
    } else {
      const { score, contribution } = TruthLensEngine.calculateEnsembleScore(analysis);
      analysis.meta_analysis.credibility_score = score;
      analysis.meta_analysis.ensemble_breakdown = contribution;
      analysis.meta_analysis.verdict_badge = TruthLensEngine.determineVerdict(score);
    }

    const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      analysis.grounding_sources = chunks
        .map(c => ({ title: c.web?.title, uri: c.web?.uri }))
        .filter(s => s.uri)
        .slice(0, 5);
    }

    analysis.analysis_time_ms = Date.now() - startTime;
    setCache(cacheId, analysis);
    return analysis;
  } catch (e) {
    console.error("고속 분석 실패:", e);
    throw new Error("분석 엔진이 해당 링크의 정보를 정확히 파악하지 못했습니다. URL이 올바른지 확인하거나 잠시 후 다시 시도하십시오.");
  }
}

export async function fetchTopNews(category: NewsCategory, language: string, query?: string): Promise<NewsItem[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `반드시 한국어(Korean)로 된 최신 뉴스 8개를 JSON 배열 형태로 반환하십시오. 카테고리: ${category}. 검색어: ${query || "대한민국 주요 뉴스"}. 형식: [{title, url, source, time}].`;
  
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return parseAiJson(result.text) || [];
  } catch (e) {
    console.error("뉴스 피드 로드 실패:", e);
    return [];
  }
}
