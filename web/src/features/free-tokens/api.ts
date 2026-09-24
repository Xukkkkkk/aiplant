import { api } from '@/lib/api'
import type { FreeTokenOverview, TestModelResponse } from './types'

export async function getFreeTokenOverview() {
  const res = await api.get<{ success: boolean; data: FreeTokenOverview }>(
    '/api/free-token/overview'
  )
  return res.data.data
}

export async function testFreeTokenModel(model: string) {
  const res = await api.post<TestModelResponse>('/api/free-token/test-model', {
    model,
  })
  return res.data
}

export async function setFreeModelsZeroRatio() {
  const res = await api.post<{ success: boolean; message: string }>(
    '/api/free-token/set-zero-ratio'
  )
  return res.data
}

export async function syncFreeTokenChannel() {
  const res = await api.post<{ success: boolean; message: string }>(
    '/api/free-token/sync'
  )
  return res.data
}
