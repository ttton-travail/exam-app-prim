// ===========================
// 結果画面コンポーネント
// app/components/ResultScreen.tsx
// ===========================

import { design, styles, labels } from '@/lib/design'
import Furigana from '@/components/Furigana'
import { displayKey } from '@/lib/shuffle'
import { useResponsive } from '@/lib/useBreakpoint'
import type { Question, AnswerMap } from '@/types/quiz'

interface Props {
  questions: Question[]
  answers: AnswerMap
  onShuffleRetry: () => void
  onBackToSetting: () => void
}

export default function ResultScreen({
  questions,
  answers,
  onShuffleRetry,
  onBackToSetting,
}: Props) {
  const score = questions.filter((q) => answers[q.id] === q.answer).length
  const { r, bp } = useResponsive()

  return (
    <main style={styles.page}>
      <div style={{ ...styles.card, padding: r.cardPadding, marginTop: r.cardMarginY, marginBottom: r.cardMarginY }}>

        <h2 style={styles.title}>結果</h2>
        <p style={styles.scoreText}>
          {score}
          <span style={styles.scoreTotal}> / {questions.length}問正解</span>
        </p>

        <div style={styles.resultList}>
          {questions.map((q, index) => {
            const userChoiceId = answers[q.id]
            const correct = userChoiceId === q.answer

            // この問題内での表示位置（A/B/C/D）と中身を引く
            const userIdx = q.choices.findIndex((c) => c.id === userChoiceId)
            const correctIdx = q.choices.findIndex((c) => c.id === q.answer)
            const userChoice = userIdx >= 0 ? q.choices[userIdx] : null
            const correctChoice = correctIdx >= 0 ? q.choices[correctIdx] : null

            return (
              <div
                key={q.id}
                style={{
                  ...styles.resultItem,
                  ...(correct ? styles.resultItemCorrect : styles.resultItemIncorrect),
                }}
              >
                <p style={styles.resultLabel}>
                  <span style={correct ? styles.resultMarkCorrect : styles.resultMarkIncorrect}>
                    {correct ? labels.result.correctMark : labels.result.incorrectMark}
                  </span>{' '}
                  {/* シャッフルされた q.id ではなく、表示順(index)をベースに番号を振る */}
                  Q{index + 1}. <Furigana text={q.unit} />
                </p>
                <p style={styles.resultQuestion}><Furigana text={q.question} /></p>

                <p style={{ ...styles.resultAnswer, color: design.color.textSecondary }}>
                  あなたの回答：
                  {userChoice
                    ? `${displayKey(userIdx)}「${userChoice.text}」`
                    : '未回答'}
                </p>

                {!correct && correctChoice && (
                  <p style={{ ...styles.resultAnswer, ...styles.resultCorrectAnswer }}>
                    正解：{displayKey(correctIdx)}「{correctChoice.text}」
                  </p>
                )}

                <p style={styles.explanation}>💡 <Furigana text={q.explanation} /></p>

                {q.keywords && q.keywords.length > 0 && (
                  <p style={styles.keywords}>
                    キーワード：{q.keywords.join('・')}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/** ボタン2分岐：同じ問題で再挑戦 / 問題作成画面に戻る */}
        {/** スマホ画面幅のときだけ「同じ問題で再挑戦」と「（順番シャッフル）」を改行する。
             PC/タブレットでは \n を除いて1行表示にする。 */}
        <button
          onClick={onShuffleRetry}
          style={bp === 'mobile' ? { ...styles.primaryButton, whiteSpace: 'pre-line' } : styles.primaryButton}
        >
          {bp === 'mobile'
            ? <Furigana text={labels.result.shuffleRetry} />
            : <Furigana text={labels.result.shuffleRetry.replace('\n', '')} />}
        </button>
        <button
          onClick={onBackToSetting}
          style={{ ...styles.secondaryButton, width: '100%', marginTop: design.spacing.sm }}
        >
          <Furigana text={labels.result.backToSetting} />
        </button>

      </div>
    </main>
  )
}