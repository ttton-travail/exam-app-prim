// ===========================
// 結果画面コンポーネント
// components/ResultScreen.tsx
// ===========================

import { useState } from 'react'
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

  // 解説は初期は閉じる（全体スクロールを抑える）。問題ごとに開閉する。
  const [openExpl, setOpenExpl] = useState<Record<number, boolean>>({})
  const toggleExpl = (id: number) =>
    setOpenExpl((prev) => ({ ...prev, [id]: !prev[id] }))

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
            // 県の形（画像4択）は番号、それ以外は A/B/C/D で表示位置を表す
            const isPrefShape = q.choiceRender === 'pref-shape'
            const open = !!openExpl[q.id]

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

                {/** 回答・正解（初期表示）。県の形は番号、それ以外は A/B/C/D。 */}
                <p style={{ ...styles.resultAnswer, color: design.color.textSecondary }}>
                  あなたの回答：
                  {userChoice
                    ? (isPrefShape
                        ? `${userIdx + 1}番「${userChoice.text}」`
                        : `${displayKey(userIdx)}「${userChoice.text}」`)
                    : '未回答'}
                </p>
                {!correct && correctChoice && (
                  <p style={{ ...styles.resultAnswer, ...styles.resultCorrectAnswer }}>
                    正解：
                    {isPrefShape
                      ? `${correctIdx + 1}番「${correctChoice.text}」`
                      : `${displayKey(correctIdx)}「${correctChoice.text}」`}
                  </p>
                )}

                {/** 折りたたみ：選択肢一覧＋地図＋解説＋キーワード（初期は閉じる） */}
                <button
                  type="button"
                  onClick={() => toggleExpl(q.id)}
                  style={styles.explanationToggle}
                  aria-expanded={open}
                >
                  {open ? labels.result.explanationHide : labels.result.explanationShow}
                </button>

                {open && (
                  <>
                    {/* 4択すべての選択肢一覧（正解＝青・選んだ誤答＝朱赤で色分け） */}
                    <div style={styles.resultChoiceList}>
                      {q.choices.map((c, i) => {
                        const isCorrect = c.id === q.answer
                        const isUser = c.id === userChoiceId
                        const keyLabel = isPrefShape ? `${i + 1}番` : displayKey(i)
                        return (
                          <div
                            key={c.id}
                            style={{
                              ...styles.resultChoiceItem,
                              ...(isCorrect ? styles.resultChoiceCorrect : {}),
                              ...(isUser && !isCorrect ? styles.resultChoiceUserWrong : {}),
                            }}
                          >
                            <span style={styles.resultChoiceKey}>{keyLabel}</span>
                            <span><Furigana text={c.text} /></span>
                            {(isCorrect || isUser) && (
                              <span
                                style={{
                                  ...styles.resultChoiceTag,
                                  color: isCorrect ? design.color.correct : design.color.incorrect,
                                }}
                              >
                                {isCorrect ? '正解' : 'あなた'}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/** 県の形（画像4択）の正解の形を小さく添える（形は白・県庁点つき）。 */}
                    {isPrefShape && correctChoice?.mapNo != null && (
                      <div style={{ maxWidth: 200, margin: '8px 0' }}>
                        <JapanMap
                          kind="pref-shape"
                          highlightMapNo={correctChoice.mapNo}
                          maxWidth={200}
                        />
                      </div>
                    )}

                    {/** 名前→地図 の問題（県/県庁/地方/23区→地図）は、正解1つだけを問題文と同じ色で塗る。 */}
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

                    {/** 地図→名前 の問題は対象を1つだけ地図に表示する。 */}
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

                    {/** 県の形→名前・県の形→県庁所在地 の正解の県の形を小さく添える。 */}
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

                    <p style={styles.explanation}><Furigana text={q.explanation} /></p>

                    {q.keywords && q.keywords.length > 0 && (
                      <p style={styles.keywords}>
                        キーワード：{q.keywords.join('・')}
                      </p>
                    )}
                  </>
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
