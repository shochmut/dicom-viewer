import { demoBootstrapData } from '../data/demo'
import type {
  ApiConfig,
  BootstrapData,
  HealthStatus,
  StudySummary,
  ViewportSeriesManifest,
} from '../types'

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://127.0.0.1:8000'
const apiBaseUrl = configuredApiBaseUrl.replace(/\/$/, '')

function buildApiUrl(path: string): string {
  return new URL(path, `${apiBaseUrl}/`).toString()
}

async function readErrorDetail(response: Response): Promise<string | null> {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return null
  }

  try {
    const payload = (await response.json()) as { detail?: string }
    return payload.detail ?? null
  } catch {
    return null
  }
}

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    const detail = await readErrorDetail(response)
    throw new Error(detail ?? `Request to ${path} failed with status ${response.status}`)
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

export function resolveApiUrl(path: string): string {
  return buildApiUrl(path)
}

export async function loadSeriesViewportManifest(
  studyUid: string,
  seriesUid: string,
  options: { signal?: AbortSignal } = {},
): Promise<ViewportSeriesManifest> {
  return fetchJson<ViewportSeriesManifest>(
    `/api/v1/studies/${encodeURIComponent(studyUid)}/series/${encodeURIComponent(seriesUid)}/viewport`,
    options.signal,
  )
}
