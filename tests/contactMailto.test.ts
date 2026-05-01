import { describe, it, expect } from 'vitest'
import { buildMailtoLink, MAIL_BODY } from '../src/components/home/contactMailto'

describe('buildMailtoLink', () => {
  it('mailto: スキームと宛先を含む', () => {
    const url = buildMailtoLink()
    expect(url.startsWith('mailto:info@goodwith.tech?')).toBe(true)
  })

  it('件名に [GOODWITH] プレフィックスを含み URL エンコードされている', () => {
    const url = buildMailtoLink()
    expect(url).toContain('subject=%5BGOODWITH%5D%20%E3%81%8A%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B')
  })

  it('本文 (body) を含み、必要キーワードを網羅している', () => {
    const url = buildMailtoLink()
    const bodyParam = new URL(url).searchParams.get('body')
    expect(bodyParam).not.toBeNull()
    expect(bodyParam).toContain('社名')
    expect(bodyParam).toContain('ご相談内容')
    expect(bodyParam).toContain('顧問契約 / スポット相談 / プロジェクト参画 / 未定')
    expect(bodyParam).toContain('守秘契約前提')
  })

  it('本文に宛名「天地様」を含めない', () => {
    const url = buildMailtoLink()
    const bodyParam = new URL(url).searchParams.get('body')
    expect(bodyParam).not.toContain('天地様')
  })

  // Gmail Web 版が mailto の改行を解釈しない問題への対応として、本文は1文構成。
  it('本文には改行 (CR/LF) を一切含まない', () => {
    expect(MAIL_BODY).not.toMatch(/[\r\n]/)
    const url = buildMailtoLink()
    expect(url).not.toContain('%0A')
    expect(url).not.toContain('%0D')
  })
})
