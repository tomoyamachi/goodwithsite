import { API_ENDPOINT, NOTION_TOKEN } from './server-constants'

export default async function rpc(fnName: string, body: any) {
  if (!NOTION_TOKEN) {
    throw new Error('NOTION_TOKEN is not set in env')
  }
  const res = await fetch(`${API_ENDPOINT}/${fnName}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `token_v2=${NOTION_TOKEN}`,
    },
    body: JSON.stringify(body),
  })

  if (res.ok) {
    const json = await res.json()
    // Notion APIのrecordMap形式が { value: { value: {...}, role } } に変わったので
    // 旧来の { value: {...}, role } 形に正規化して、呼び出し側の互換を保つ
    if (json && typeof json === 'object' && json.recordMap) {
      json.recordMap = normalizeRecordMap(json.recordMap)
    }
    return json
  } else {
    throw new Error(await getError(res))
  }
}

// recordMap内の各エントリを { value: {...}, role } 形式に正規化する。
// 新スキーマ: { spaceId?, value: { value: {...}, role } } → { value: {...}, role }
function normalizeRecordMap(recordMap: any) {
  if (!recordMap || typeof recordMap !== 'object') return recordMap

  for (const tableKey of Object.keys(recordMap)) {
    if (tableKey === '__version__') continue
    const table = recordMap[tableKey]
    if (!table || typeof table !== 'object') continue

    for (const id of Object.keys(table)) {
      const entry = table[id]
      if (
        entry &&
        entry.value &&
        entry.value.value &&
        entry.value.role !== undefined
      ) {
        table[id] = entry.value
      }
    }
  }
  return recordMap
}

export async function getError(res: Response) {
  return `Notion API error (${res.status}) \n${getJSONHeaders(
    res
  )}\n ${await getBodyOrNull(res)}`
}

export function getJSONHeaders(res: Response) {
  const headers: Record<string, string> = {}
  res.headers.forEach((value, key) => {
    headers[key] = value
  })
  return JSON.stringify(headers)
}

export function getBodyOrNull(res: Response) {
  try {
    return res.text()
  } catch (err) {
    return null
  }
}

export function values(obj: any) {
  const vals: any = []

  Object.keys(obj).forEach(key => {
    vals.push(obj[key])
  })
  return vals
}
