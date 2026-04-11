export type ConnectionState = 'loading' | 'online' | 'offline'
export type ViewerMode = 'stack' | 'mpr' | 'volume'
export type ViewportLoadState = 'idle' | 'loading' | 'ready' | 'error'

export interface HealthStatus {
  status: string
  service: string
  version: string
  dicomCatalogReady: boolean
}

export interface ApiConfig {
  appName: string
  viewerTitle: string
  apiPrefix: string
  dicomwebMode: 'proxy' | 'direct'
  dicomwebBaseUrl: string | null
  sampleDirectory: string
  sampleDirectoryExists: boolean
  features: string[]
}

export interface SeriesSummary {
  uid: string
  modality: string | null
  description: string | null
  bodyPart: string | null
  instanceCount: number
}

export interface StudySummary {
  uid: string
  patientId: string | null
  patientName: string | null
  description: string | null
  accessionNumber: string | null
  studyDate: string | null
  instanceCount: number
  series: SeriesSummary[]
  source: 'filesystem' | 'demo'
}

export interface RenderableInstance {
  instanceId: string
  sopInstanceUid: string | null
  instanceNumber: number | null
  imageUrl: string
  contentType: string
}

export interface ViewportSeriesManifest {
  studyUid: string
  seriesUid: string
  seriesDescription: string | null
  modality: string | null
  instanceCount: number
  initialImageIndex: number
  instances: RenderableInstance[]
}

export interface BootstrapData {
  connection: Exclude<ConnectionState, 'loading'>
  health: HealthStatus
  config: ApiConfig
  studies: StudySummary[]
  message: string
}
