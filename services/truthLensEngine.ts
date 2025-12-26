
import { TruthLensAnalysis, Verdict, EnsembleBreakdown } from "../types";

/**
 * TruthLens Ensemble Engine v2.6
 * 5개 분석 모듈의 가중치 융합 엔진
 */
export class TruthLensEngine {
  public static DEFAULT_WEIGHTS: EnsembleBreakdown = {
    source: 30,
    cross_check: 25,
    logic: 20,
    context: 15,
    bias: 10
  };

  /**
   * 분석 객체로부터 각 모듈의 원시 점수(0-100)를 추출합니다.
   */
  static calculateModuleScores(analysis: TruthLensAnalysis): EnsembleBreakdown {
    // 1. 출처 신뢰도: 평판 체크 포인트 수 기반
    const sourceScore = Math.max(0, 100 - (analysis.creator_reputation_check.check_points.length < 2 ? 40 : 10));
    
    // 2. 교차 검증: Grounding 소스 개수 기반
    const crossScore = analysis.grounding_sources && analysis.grounding_sources.length > 2 ? 95 : 60;
    
    // 3. 논리적 무결성: 감지된 논리적 오류 개수 기반
    const logicErrors = analysis.highlight_annotations.filter(a => a.issue_type === "Logical Fallacy").length;
    const logicScore = Math.max(0, 100 - (logicErrors * 20));
    
    // 4. 맥락 충분성: 누락된 맥락 개수 기반
    const contextScore = Math.max(0, 100 - (analysis.missing_context.length * 15));
    
    // 5. 보도 중립성: 감정 강도 기반
    const biasScore = Math.max(0, 100 - (analysis.meta_analysis.emotional_intensity * 10));

    return {
      source: sourceScore,
      cross_check: crossScore,
      logic: logicScore,
      context: contextScore,
      bias: biasScore
    };
  }

  /**
   * 동적 가중치를 적용하여 최종 앙상블 점수를 산출합니다.
   */
  static calculateEnsembleScore(
    analysis: TruthLensAnalysis, 
    customWeights?: EnsembleBreakdown
  ): { score: number, breakdown: EnsembleBreakdown, contribution: EnsembleBreakdown } {
    
    const scores = this.calculateModuleScores(analysis);
    const weights = customWeights || this.DEFAULT_WEIGHTS;
    
    const totalWeight = weights.source + weights.cross_check + weights.logic + weights.context + weights.bias;
    const safeTotalWeight = totalWeight || 1;

    // 가중 합산 점수 계산
    const weightedSum = (
      (scores.source * weights.source) +
      (scores.cross_check * weights.cross_check) +
      (scores.logic * weights.logic) +
      (scores.context * weights.context) +
      (scores.bias * weights.bias)
    );

    const finalScore = Math.round(weightedSum / safeTotalWeight);

    // 각 모듈의 최종 점수 기여도(Contribution) 계산: (W_i * S_i) / Sum(W_j * S_j)
    const totalWeightedValue = weightedSum || 1;
    const contribution: EnsembleBreakdown = {
      source: Math.round(((scores.source * weights.source) / totalWeightedValue) * 100),
      cross_check: Math.round(((scores.cross_check * weights.cross_check) / totalWeightedValue) * 100),
      logic: Math.round(((scores.logic * weights.logic) / totalWeightedValue) * 100),
      context: Math.round(((scores.context * weights.context) / totalWeightedValue) * 100),
      bias: Math.round(((scores.bias * weights.bias) / totalWeightedValue) * 100)
    };

    return {
      score: finalScore,
      breakdown: scores, // 모듈별 원시 점수
      contribution: contribution // 최종 점수 내 비중
    };
  }

  static determineVerdict(score: number): Verdict {
    if (score >= 88) return "Trustworthy";
    if (score >= 65) return "Caution";
    if (score >= 40) return "Misleading";
    return "Propaganda";
  }
}
