import { demoBootstrapData } from '../data/demo'
import type { BootstrapData, HealthStatus, ApiConfig, StudySummary } from '../types'

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://127.0.0.1:8000'
const apiBaseUrl = configuredApiBaseUrl.replace(/\/$/, '')

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

export async function loadBootstrapData(): Promise<BootstrapData> {
  try {
    const [health, config, studies] = await Promise.all([
      fetchJson<HealthStatus>('/api/v1/health'),
      fetchJson<ApiConfig>('/api/v1/config'),
      fetchJson<StudySummary[]>('/api/v1/studies'),
    ])

    return {
      connection: 'online',
      health,
      config,
      studies: studies.length > 0 ? studies : demoBootstrapData.studies,
      message:
        studies.length > 0
          ? `Connected to ${health.service}. Local DICOM catalog discovered ${studies.length} study entries.`
          : `Connected to ${health.service}, but no local DICOM files were found. Demo metadata is shown until sample data is added.`,
    }
  } catch {
    return demoBootstrapData
  }
}

export function getApiBaseUrl(): string {
  return apiBaseUrl
}
