import { describe, it, expect } from 'vitest'
import { buildMailtoLink } from '../src/components/home/contactMailto'

describe('buildMailtoLink', () => {
  it('mailto: スキームと宛先を含む', () => {
    const url = buildMailtoLink()
    expect(url.startsWith('mailto:info@goodwith.tech?')).toBe(true)
  })

  it('件名に [GOODWITH] プレフィックスを含み URL エンコードされている', () => {
    const url = buildMailtoLink()
    expect(url).toContain('subject=%5BGOODWITH%5D%20%E3%81%8A%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B')
  })

  it('本文に天地様の宛名と必要項目が含まれる', () => {
    const url = buildMailtoLink()
    const bodyParam = new URL(url).searchParams.get('body')
    expect(bodyParam).not.toBeNull()
    expect(bodyParam).toContain('天地様')
    expect(bodyParam).toContain('(自己紹介・社名)')
    expect(bodyParam).toContain('(ご相談内容)')
    expect(bodyParam).toContain('(対応形態のご希望: 顧問契約 / スポット相談 / プロジェクト参画 / 未定)')
    expect(bodyParam).toContain('守秘契約前提でお話を伺います')
  })

  it('本文の改行が保たれている', () => {
    const url = buildMailtoLink()
    const bodyParam = new URL(url).searchParams.get('body')
    expect(bodyParam).toMatch(/天地様\n\n\(自己紹介・社名\)/)
  })
})
