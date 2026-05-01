// 問い合わせメール本文・件名のテンプレート。
// 設計書: docs/superpowers/specs/2026-05-01-contact-channels-design.md
const MAIL_TO = 'info@goodwith.tech'
const SUBJECT = '[GOODWITH] お問い合わせ'
const BODY = [
  '天地様',
  '',
  '(自己紹介・社名)',
  '',
  '(ご相談内容)',
  '',
  '(対応形態のご希望: 顧問契約 / スポット相談 / プロジェクト参画 / 未定)',
  '',
  '----',
  '※ 守秘契約前提でお話を伺います。検討段階のご相談もお気軽にどうぞ。',
].join('\n')

export const buildMailtoLink = (): string => {
  const subject = encodeURIComponent(SUBJECT)
  const body = encodeURIComponent(BODY)
  return `mailto:${MAIL_TO}?subject=${subject}&body=${body}`
}
