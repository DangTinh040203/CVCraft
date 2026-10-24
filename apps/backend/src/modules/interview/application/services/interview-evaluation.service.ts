import { ThinkingLevel } from '@google/genai';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { PromptSanitizer } from '@/libs/utils/prompt-sanitizer.util';
import {
  EVALUATION_SCHEMA,
  evaluationPrompt,
  INTERVIEW_CRITERIA,
} from '@/modules/interview/application/constants';
import { formatTranscript } from '@/modules/interview/application/services/interview.service';
import {
  type InterviewFeedback,
  type InterviewSession,
  type InterviewVerdict,
  type QuestionFeedback,
} from '@/modules/interview/domain';
import { LlmService } from '@/modules/llm/application/services';

type Entry = Record<string, unknown>;

const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const list = (value: unknown) =>
  Array.isArray(value) ? (value as Entry[]) : [];
const clampScore = (value: unknown) =>
  Math.round(Math.min(100, Math.max(0, Number(value) || 0)));
const strings = (value: unknown, max: number) =>
  [...new Set(list(value).map(str))].filter(Boolean).slice(0, max);

/** Resume and JD are context for the coach; the transcript is what counts. */
const MAX_CONTEXT_CHARS = 6000;

export function verdictFor(score: number): InterviewVerdict {
  if (score >= 70) return 'PASS';
  if (score >= 50) return 'BORDERLINE';
  return 'FAIL';
}

/**
 * Scores a finished interview from its transcript. The model grades each
 * criterion and question; the overall score and verdict are computed here,
 * so they always follow the same weights and thresholds.
 */
@Injectable()
export class InterviewEvaluationService {
  constructor(private readonly llmService: LlmService) {}

  async evaluate(session: InterviewSession): Promise<InterviewFeedback> {
    const base = {
      questionsAnswered: session.questionsAnswered,
      totalQuestions: session.totalQuestions,
      durationSeconds: session.durationSeconds,
      transcript: session.conversation.map(({ role, content }) => ({
        role,
        content,
      })),
    };

    // Nothing to judge: say so rather than have the model invent feedback
    if (!session.conversation.some((turn) => turn.role === 'candidate')) {
      return {
        ...base,
        overallScore: 0,
        verdict: 'FAIL',
        summary:
          'The interview ended before you answered a question, so there is nothing to score yet. Start a new interview when you are ready.',
        criteria: INTERVIEW_CRITERIA.map(({ key, name, weight }) => ({
          key,
          name,
          weight,
          score: 0,
          explanation: '',
        })),
        questions: [],
        strengths: [],
        improvements: [],
      };
    }

    const response = await this.llmService.sendMessage(
      evaluationPrompt({
        interviewType: session.interviewType,
        language: session.language,
        questionsAnswered: session.questionsAnswered,
        totalQuestions: session.totalQuestions,
        durationMinutes: Math.max(1, Math.round(session.durationSeconds / 60)),
        resume: PromptSanitizer.sanitize(
          session.resumeText.slice(0, MAX_CONTEXT_CHARS),
        ),
        jobDescription: PromptSanitizer.sanitize(
          session.jobDescription.slice(0, MAX_CONTEXT_CHARS),
        ),
        transcript: PromptSanitizer.sanitize(
          formatTranscript(session.conversation),
        ),
      }),
      EVALUATION_SCHEMA,
      // Re-reading the same transcript should give the same grade
      {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        temperature: 0,
      },
    );

    let raw: Entry;
    try {
      raw = JSON.parse(response) as Entry;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to parse the interview evaluation as JSON',
        { cause: error },
      );
    }
    return { ...base, ...this.normalize(raw, session.questionsAnswered) };
  }

  /**
   * Every criterion in a fixed order with its weight, scores clamped, and
   * the overall score computed from them. Most answers scoring 0 caps it.
   */
  private normalize(raw: Entry, answered: number) {
    const returned = new Map(list(raw.criteria).map((c) => [str(c.key), c]));
    const criteria = INTERVIEW_CRITERIA.map(({ key, name, weight }) => ({
      key,
      name,
      weight,
      score: clampScore(returned.get(key)?.score),
      explanation: str(returned.get(key)?.explanation),
    }));

    const questions: QuestionFeedback[] = list(raw.questions)
      .map((q, index) => ({
        questionNumber: index + 1,
        question: str(q.question),
        score: clampScore(q.score),
        feedback: str(q.feedback),
        suggestion: str(q.suggestion),
      }))
      .filter((q) => q.question)
      .slice(0, Math.max(answered, 1));

    let overallScore = Math.round(
      criteria.reduce((sum, c) => sum + (c.score * c.weight) / 100, 0),
    );
    const zeros = questions.filter((q) => q.score === 0).length;
    if (questions.length && zeros > questions.length / 2) {
      overallScore = Math.min(overallScore, 20);
    }

    return {
      overallScore,
      verdict: verdictFor(overallScore),
      summary: str(raw.summary),
      criteria,
      questions,
      strengths: strings(raw.strengths, 5),
      improvements: strings(raw.improvements, 5),
    };
  }
}
