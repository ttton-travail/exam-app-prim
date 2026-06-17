// ===========================
// メインアプリ画面
// app/app/page.tsx（URL: /app）
// 状態管理と画面フェーズの切り替えのみを担う
// 各画面の描画はcomponents/以下に委譲
// ===========================

'use client'

import { useState } from 'react'
import { DEFAULT_SUBJECT_ID, DEFAULT_CATEGORY_ID } from '@/lib/subjects'
import { DEFAULT_QUESTION_COUNT, DEFAULT_EXAM_FORMAT } from '@/lib/config'
import { shuffleQuiz } from '@/lib/shuffle'
import { useDailyLimit } from '@/lib/useDailyLimit'
import { design, labels, styles } from '@/lib/design'
import SettingScreen from '@/components/SettingScreen'
import QuizScreen from '@/components/QuizScreen'
import ResultScreen from '@/components/ResultScreen'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import type { AppPhase, AnswerMap, Question, QuizSettings, ChoiceId } from '@/types/quiz'

const log = (stage: string, data?: unknown) =>
  console.log(`[page] ${stage}`, data ?? '')

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>('setting')
  const [settings, setSettings] = useState<QuizSettings>({
    categoryId: DEFAULT_CATEGORY_ID,
    subjectId: DEFAULT_SUBJECT_ID,
    unitIds: [],
    questionCount: DEFAULT_QUESTION_COUNT,
    examFormat: DEFAULT_EXAM_FORMAT,
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { remaining, reachedLimit, consume, limit } = useDailyLimit()

  log('render', { phase, currentIndex })

  /**
   * 問題セット取得
   * mode='stock'    : ストックのみ（すぐ・回数消費なし）
   * mode='generate' : AI新規生成（約15秒・回数を消費）
   */
  const handleGenerate = async (mode: 'stock' | 'generate') => {
    // 新規生成のみ、端末ごとの1日上限をチェック
    if (mode === 'generate' && reachedLimit) {
      setError(`本日の生成回数の上限（${limit}回）に達しました。明日また利用できます。`)
      return
    }
    setLoading(true)
    setError('')
    log('問題セット取得開始', { ...settings, mode })

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, mode }),
      })

      /** レスポンスのJSONパース失敗も考慮 */
      let data: { questions?: unknown; error?: string }
      try {
        data = await res.json()
      } catch {
        setError('レスポンスの解析に失敗しました。もう一度お試しください。')
        setLoading(false)
        return
      }

      if (!res.ok || !data.questions) {
        setError(data.error ?? '問題の取得に失敗しました')
        setLoading(false)
        return
      }

      log('問題取得成功', { count: (data.questions as unknown[]).length })
      // 新規生成のときだけ端末カウントを消費（ストックは無料・無制限）
      if (mode === 'generate') consume()
      // 問題順・選択肢順をシャッフルして位置バイアスを除去
      setQuestions(shuffleQuiz(data.questions as Question[]))
      setAnswers({})
      setCurrentIndex(0)
      setPhase('quiz')

    } catch (e) {
      log('通信エラー', e)
      setError('通信エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  /** 回答を記録 */
  const handleAnswer = (questionId: number, choiceId: ChoiceId) => {
    log('回答', { questionId, choiceId })
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }))
  }

  /**
   * 同じ問題セットで再挑戦
   * 問題順・選択肢順を混ぜ直し、回答だけリセット（API再呼び出しなし）
   * シャッフルは「stateに入れる時」に1回だけ行う（描画時にやらない）
   */
  const handleShuffleRetry = () => {
    log('シャッフル再挑戦')
    setQuestions((prev) => shuffleQuiz(prev))
    setAnswers({})
    setCurrentIndex(0)
    setPhase('quiz')
  }

  /** 設定画面に戻る（＝新しい問題を作り直す） */
  const handleBackToSetting = () => {
    setPhase('setting')
    setQuestions([])
    setAnswers({})
    setCurrentIndex(0)
    setError('')
  }

  if (phase === 'setting') {
    return (
      <>
        <Header />
        <SettingScreen
          settings={settings}
          loading={loading}
          error={error}
          remaining={remaining}
          reachedLimit={reachedLimit}
          onSettingsChange={setSettings}
          onGenerate={handleGenerate}
          onClearError={() => setError('')}
        />
        <Footer />
      </>
    )
  }

  if (phase === 'quiz') {
    return (
      <QuizScreen
        questions={questions}
        answers={answers}
        currentIndex={currentIndex}
        onAnswer={handleAnswer}
        onNext={() => setCurrentIndex((i) => i + 1)}
        onPrev={() => setCurrentIndex((i) => i - 1)}
        onFinish={() => setPhase('result')}
        onJump={(i) => setCurrentIndex(i)}
        onBackToSetting={handleBackToSetting}
      />
    )
  }

  return (
    <>
      <Header />
      <ResultScreen
        questions={questions}
        answers={answers}
        onShuffleRetry={handleShuffleRetry}
        onBackToSetting={handleBackToSetting}
      />
      <Footer />
    </>
  )
}