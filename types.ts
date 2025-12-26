
export type Verdict = "Trustworthy" | "Caution" | "Misleading" | "Propaganda";
export type PoliticalLeaning = "Left" | "Center-Left" | "Center" | "Center-Right" | "Right" | "Extreme";
export type IssueType = "Factual Error" | "Logical Fallacy" | "Missing Context" | "Biased Wording" | "Exaggeration";

export interface EnsembleBreakdown {
  source: number;
  cross_check: number;
  logic: number;
  context: number;
  bias: number;
}

export interface MetaAnalysis {
  credibility_score: number;
  verdict_badge: Verdict;
  political_leaning_assessment: PoliticalLeaning;
  emotional_intensity: number; // 0-10
  ensemble_breakdown?: EnsembleBreakdown;
}

export interface HighlightAnnotation {
  quoted_text: string;
  issue_type: IssueType;
  explanation: string;
  correction_evidence: string;
  search_query_suggestion: string;
}

export interface CreatorReputationCheck {
  evaluation: string;
  check_points: string[];
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface TruthLensAnalysis {
  article_title: string;
  reporter_name: string;
  meta_analysis: MetaAnalysis;
  summary: string; 
  bias_check: string; 
  highlight_annotations: HighlightAnnotation[];
  missing_context: string[];
  creator_reputation_check: CreatorReputationCheck;
  correction_suggestion: string; 
  truthlens_commentary: string; // 신규 추가: 심층 논평
  grounding_sources?: GroundingSource[];
  analysis_time_ms?: number;
  ensemble_breakdown?: EnsembleBreakdown;
}

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  time: string;
}

export interface LiveAlert {
  id: string;
  title: string;
  source: string;
  time: string;
  url: string;
  isKeywordMatch?: boolean;
}

export type NewsCategory = 'Politics' | 'Economy' | 'Society' | 'IT/Tech' | 'World' | 'Search' | 'Keywords';

export interface InputData {
  title?: string;
  author?: string;
  body?: string;
  url?: string;
  language: 'English' | 'Korean';
  inputType: 'manual' | 'url';
}

export interface MediaLeaningPoint {
  name: string;
  x: number; 
  y: number; 
  z: number; 
  trustScore: number;
}

export interface TimelineBubble {
  id: string;
  time: string;
  label: string;
  gapRate: number; 
  importance: number; 
}
