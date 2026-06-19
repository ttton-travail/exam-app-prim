// ===========================
// 結果画面コンポーネント
// components/ResultScreen.tsx
// ===========================

import { design, styles, labels } from '@/lib/design'
import Furigana from '@/components/Furigana'
import JapanMap from '@/components/JapanMap'
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

                {/** 県の形（画像4択）の問題は、番号＋県名で表す（位置は1始まり）。
                     正解の県の形を小さく添える（形は白・県庁点つき）。 */}
                {q.choiceRender === 'pref-shape' ? (
                  <>
                    <p style={{ ...styles.resultAnswer, color: design.color.textSecondary }}>
                      あなたの回答：
                      {userChoice
                        ? `${userIdx + 1}番「${userChoice.text}」`
                        : '未回答'}
                    </p>
                    {!correct && correctChoice && (
                      <p style={{ ...styles.resultAnswer, ...styles.resultCorrectAnswer }}>
                        正解：{correctIdx + 1}番「{correctChoice.text}」
                      </p>
                    )}
                    {correctChoice?.mapNo != null && (
                      <div style={{ maxWidth: 200, margin: '8px 0' }}>
                        <JapanMap
                          kind="pref-shape"
                          highlightMapNo={correctChoice.mapNo}
                          maxWidth={200}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
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
                  </>
                )}

                {/** 名前→地図 の問題（県/県庁/地方/23区→地図）は、結果でも地図を表示する。
                     出題では候補4つを塗るが、結果では「正解1つだけ」を問題文と同じ色（プライマリ）で塗る。 */}
                {q.answerMapNo != null && q.mapKind && q.mapKind !== 'pref-shape' && (
                  <div style={{ maxWidth: q.mapKind === 'ward' ? 360 : 520, margin: '8px auto' }}>
                    <JapanMap
                      kind={q.mapKind === 'pref' ? 'prefecture' : q.mapKind}
                      highlightMapNo={q.answerMapNo}
                      mode="correct"
                      correctColor={design.color.primary}
                      maxWidth={q.mapKind === 'ward' ? 360 : 520}
                    />
                  </div>
                )}

                {/** 地図→名前 の問題（地図/特産品→名前・県庁、組み合わせの地図参照）は、
                     結果でも対象を1つだけ地図に表示する。出題と同じく対象番号を強調する。
                     answerMapNo を持つ（名前→地図）系は上で処理済みなので、ここは
                     mapNo を持ち answerMapNo を持たないものだけを対象にする。 */}
                {q.answerMapNo == null
                  && q.mapNo != null
                  && q.mapKind
                  && q.mapKind !== 'pref-shape'
                  && q.choiceRender !== 'pref-shape' && (
                  <div style={{ maxWidth: q.mapKind === 'ward' ? 360 : 520, margin: '8px auto' }}>
                    <JapanMap
                      kind={q.mapKind === 'pref' ? 'prefecture' : q.mapKind}
                      highlightMapNo={q.mapNo}
                      mode="correct"
                      correctColor={design.color.primary}
                      showCapitals={q.showCapitals}
                      maxWidth={q.mapKind === 'ward' ? 360 : 520}
                    />
                  </div>
                )}

                {/** 県の形→名前・県の形→県庁所在地（mapKind='pref-shape', choiceRender≠pref-shape）の
                     結果には、正解の県の形を小さく添える。 */}
                {q.mapKind === 'pref-shape'
                  && q.choiceRender !== 'pref-shape'
                  && q.mapNo != null && (
                  <div style={{ maxWidth: 200, margin: '8px 0' }}>
                    <JapanMap
                      kind="pref-shape"
                      highlightMapNo={q.mapNo}
                      maxWidth={200}
                    />
                  </div>
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