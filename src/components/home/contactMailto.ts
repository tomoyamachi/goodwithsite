// 問い合わせメール本文・件名のテンプレート。
// 設計書: docs/superpowers/specs/2026-05-01-contact-channels-design.md
//
// Gmail Web 版が mailto の body の改行 (%0A / %0D%0A) を解釈せず1行に潰すため、
// 本文は改行を含まない1文構成にして mailto: にそのまま載せる。
// 受け取り側のメーラー（拡張機能・ネイティブ問わず）で見栄えが崩れない。
export const MAIL_TO = 'info@goodwith.tech'
export const MAIL_SUBJECT = '[GOODWITH] お問い合わせ'
export const MAIL_BODY =
  '社名・ご相談内容・ご希望の対応形態（顧問契約 / スポット相談 / プロジェクト参画 / 未定）をご記入ください。守秘契約前提で承りますので、検討段階のご相談もお気軽にどうぞ。'

// 宛先・件名・本文を含む mailto: リンク
export const buildMailtoLink = (): string => {
  const subject = encodeURIComponent(MAIL_SUBJECT)
  const body = encodeURIComponent(MAIL_BODY)
  return `mailto:${MAIL_TO}?subject=${subject}&body=${body}`
}
