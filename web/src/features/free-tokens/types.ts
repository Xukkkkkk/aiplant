export interface FreeTokenModel {
  id: string
  name: string
  type: 'reverse_free' | 'key_pool'
  description: string
  ratio: number
  is_zero_ratio: boolean
  status: string
}

export interface FreeTokenOverview {
  service: {
    online: boolean
    url: string
    port: number
    latency_ms: number
    service_name: string
  }
  channel: {
    found: boolean
    id: number
    name: string
    base_url: string
    models: string
    group: string
    status: number
    weight: number
  }
  models: FreeTokenModel[]
  model_ratios: Record<string, number>
  stats: {
    total_users: number
    total_free_models: number
  }
}

export interface TestModelResponse {
  success: boolean
  latency_ms: number
  reply: string
  model: string
  message?: string
}
