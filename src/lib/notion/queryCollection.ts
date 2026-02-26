import rpc from './rpc'

// queryCollection APIのレスポンスはloadPageChunkと異なり
// recordMap内の各エントリが { spaceId, value: { value: {...}, role } } 形式。
// loadPageChunkと同じ { value: {...}, role } 形式に正規化する。
function normalizeRecordMap(recordMap: any) {
  if (!recordMap) return recordMap

  for (const key of Object.keys(recordMap)) {
    if (key === '__version__') continue
    const table = recordMap[key]
    if (!table || typeof table !== 'object') continue

    for (const id of Object.keys(table)) {
      const entry = table[id]
      // { spaceId, value: { value: {...}, role } } → { value: {...}, role }
      if (entry && entry.value && entry.value.value && entry.value.role !== undefined) {
        table[id] = entry.value
      }
    }
  }
  return recordMap
}

export default async function queryCollection({
  collectionId,
  collectionViewId,
  loader = {},
  query = {},
}: any) {
  const queryCollectionBody = {
    loader: {
      type: 'reducer',
      reducers: {
        collection_group_results: {
          type: 'results',
          limit: 999,
          loadContentCover: true,
        },
        'table:uncategorized:title:count': {
          type: 'aggregation',
          aggregation: {
            property: 'title',
            aggregator: 'count',
          },
        },
      },
      searchQuery: '',
      userTimeZone: 'America/Phoenix',
    },
  }

  const data = await rpc('queryCollection', {
    collectionId,
    collectionViewId,
    ...queryCollectionBody,
  })

  // recordMapを正規化
  if (data && data.recordMap) {
    data.recordMap = normalizeRecordMap(data.recordMap)
  }

  return data
}
