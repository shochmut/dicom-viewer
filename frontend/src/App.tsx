import { useEffect, useState } from 'react'
import './App.css'
import CornerstoneViewport from './components/CornerstoneViewport'
import { getApiBaseUrl, loadBootstrapData, loadSeriesViewportManifest } from './lib/api'
import type {
  BootstrapData,
  ConnectionState,
  SeriesSummary,
  StudySummary,
  ViewerMode,
  ViewportLoadState,
} from './types'

const viewerModes: Array<{ id: ViewerMode; label: string; detail: string; available: boolean }> = [
  { id: 'stack', label: 'Stack', detail: 'Active sample review lane', available: true },
  { id: 'mpr', label: 'MPR', detail: 'Planned follow-on slice', available: false },
  { id: 'volume', label: 'Volume', detail: 'Planned 3D lane', available: false },
]

const backlogItems = [
  'Add stack scrolling and additional review tools once the base viewport is stable.',
  'Wire DICOMweb study retrieval through the FastAPI proxy or direct CORS mode.',
  'Add measurement, annotations, and future exploratory stress-strain workflows.',
]

function formatStudyDate(studyDate: string | null): string {
  if (!studyDate) {
    return 'Date pending'
  }

  const parsed = new Date(studyDate)
  if (Number.isNaN(parsed.getTime())) {
    return studyDate
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

function describeConnection(connectionState: ConnectionState): string {
  if (connectionState === 'online') {
    return 'Backend connected'
  }

  if (connectionState === 'offline') {
    return 'Frontend demo mode'
  }

  return 'Checking services'
}

function getPrimaryStudy(studies: StudySummary[], selectedStudyUid: string | null): StudySummary | null {
  return studies.find((study) => study.uid === selectedStudyUid) ?? studies[0] ?? null
}

function getPrimarySeries(
  series: SeriesSummary[],
  selectedSeriesUid: string | null,
): SeriesSummary | null {
  return series.find((currentSeries) => currentSeries.uid === selectedSeriesUid) ?? series[0] ?? null
}

async function findFirstRenderableSelection(
  studies: StudySummary[],
  signal: AbortSignal,
): Promise<{ studyUid: string; seriesUid: string } | null> {
  for (const study of studies) {
    for (const series of study.series) {
      try {
        const manifest = await loadSeriesViewportManifest(study.uid, series.uid, { signal })
        if (manifest.instanceCount > 0) {
          return {
            studyUid: study.uid,
            seriesUid: series.uid,
          }
        }
      } catch {
        continue
      }
    }
  }

  return null
}

function App() {
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('loading')
  const [selectedStudyUid, setSelectedStudyUid] = useState<string | null>(null)
  const [selectedSeriesUid, setSelectedSeriesUid] = useState<string | null>(null)
  const [viewerMode, setViewerMode] = useState<ViewerMode>('stack')
  const [viewerLoadState, setViewerLoadState] = useState<ViewportLoadState>('loading')
  const [viewerMessage, setViewerMessage] = useState<string | null>('Checking viewer services.')

  useEffect(() => {
    let isActive = true
    const abortController = new AbortController()

    async function hydrate() {
      const data = await loadBootstrapData()

      if (!isActive) {
        return
      }

      setBootstrap(data)
      setConnectionState(data.connection)

      const defaultStudyUid = data.studies[0]?.uid ?? null
      const defaultSeriesUid = data.studies[0]?.series[0]?.uid ?? null
      let initialSelection = {
        studyUid: defaultStudyUid,
        seriesUid: defaultSeriesUid,
      }

      if (data.connection === 'online') {
        const firstRenderableSelection = await findFirstRenderableSelection(
          data.studies,
          abortController.signal,
        )

        if (!isActive || abortController.signal.aborted) {
          return
        }

        if (firstRenderableSelection) {
          initialSelection = firstRenderableSelection
        }
      }

      setSelectedStudyUid((currentStudyUid) => currentStudyUid ?? initialSelection.studyUid ?? null)
      setSelectedSeriesUid(
        (currentSeriesUid) => currentSeriesUid ?? initialSelection.seriesUid ?? null,
      )
    }

    void hydrate()

    return () => {
      isActive = false
      abortController.abort()
    }
  }, [])

  const studies = bootstrap?.studies ?? []
  const selectedStudy = getPrimaryStudy(studies, selectedStudyUid)
  const selectedSeries = getPrimarySeries(selectedStudy?.series ?? [], selectedSeriesUid)
  const seriesCount = studies.reduce((count, study) => count + study.series.length, 0)
  const instanceCount = studies.reduce((count, study) => count + study.instanceCount, 0)
  const apiConfig = bootstrap?.config
  const connectionLabel = describeConnection(connectionState)
  const activeViewerMode = viewerModes.find((mode) => mode.id === viewerMode) ?? viewerModes[0]
  const viewerStatusLabel =
    viewerLoadState === 'ready' ? 'Sample series ready' : viewerMessage ?? 'Viewer idle'

  useEffect(() => {
    if (!selectedStudy) {
      if (selectedSeriesUid !== null) {
        setSelectedSeriesUid(null)
      }
      return
    }

    if (!selectedStudy.series.some((series) => series.uid === selectedSeriesUid)) {
      setSelectedSeriesUid(selectedStudy.series[0]?.uid ?? null)
    }
  }, [selectedSeriesUid, selectedStudy])

  function handleStudySelection(studyUid: string) {
    const nextStudy = studies.find((study) => study.uid === studyUid)
    setSelectedStudyUid(studyUid)
    setSelectedSeriesUid(nextStudy?.series[0]?.uid ?? null)
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Non-Diagnostic Imaging Sandbox</p>
          <h1>{apiConfig?.viewerTitle ?? 'DICOM Workbench'}</h1>
          <p className="hero-text">
            React + Vite viewer shell paired with a FastAPI service for local DICOM cataloging,
            future DICOMweb proxying, and exploratory analysis experiments.
          </p>
          <div className="hero-meta">
            <span className={`status-pill status-pill--${connectionState}`}>{connectionLabel}</span>
            <span className="meta-chip">API {getApiBaseUrl()}</span>
            <span className="meta-chip">
              DICOMweb {apiConfig?.dicomwebMode ?? 'proxy'} mode
            </span>
          </div>
        </div>

        <aside className="hero-card panel">
          <div className="stat-grid">
            <article>
              <span className="stat-label">Studies</span>
              <strong>{studies.length}</strong>
            </article>
            <article>
              <span className="stat-label">Series</span>
              <strong>{seriesCount}</strong>
            </article>
            <article>
              <span className="stat-label">Instances</span>
              <strong>{instanceCount}</strong>
            </article>
            <article>
              <span className="stat-label">Sample Dir</span>
              <strong>{apiConfig?.sampleDirectoryExists ? 'Ready' : 'Missing'}</strong>
            </article>
          </div>
          <p className="hero-note">{bootstrap?.message ?? 'Bootstrapping viewer services.'}</p>
        </aside>
      </header>

      <section className="workspace-grid">
        <aside className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Study Queue</p>
              <h2>Local and demo studies</h2>
            </div>
            <span className="panel-tag">{selectedStudy?.source ?? 'pending'}</span>
          </div>

          <div className="study-list" role="list">
            {studies.map((study) => {
              const isSelected = study.uid === selectedStudy?.uid

              return (
                <button
                  key={study.uid}
                  type="button"
                  className={`study-card ${isSelected ? 'study-card--active' : ''}`}
                  onClick={() => handleStudySelection(study.uid)}
                >
                  <span className="study-card__patient">
                    {study.patientName ?? study.patientId ?? 'Unidentified patient'}
                  </span>
                  <span className="study-card__description">
                    {study.description ?? 'Untitled study'}
                  </span>
                  <span className="study-card__meta">
                    {formatStudyDate(study.studyDate)} - {study.series.length} series -{' '}
                    {study.instanceCount} instances
                  </span>
                </button>
              )
            })}

            {connectionState === 'loading' && <div className="study-empty">Loading study list...</div>}
          </div>
        </aside>

        <section className="panel viewer-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Viewer Shell</p>
              <h2>{selectedSeries?.description ?? selectedStudy?.description ?? 'Sample viewer'}</h2>
            </div>
            <div className="mode-switch" role="tablist" aria-label="Viewer mode">
              {viewerModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={`mode-switch__button ${
                    viewerMode === mode.id ? 'mode-switch__button--active' : ''
                  }`}
                  disabled={!mode.available}
                  onClick={() => setViewerMode(mode.id)}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="viewer-stage">
            <div className="viewer-stage__overlay">
              <span>{viewerStatusLabel}</span>
              <span>
                {viewerLoadState === 'ready' ? 'Drag to pan · Wheel to zoom' : activeViewerMode.detail}
              </span>
            </div>
            <CornerstoneViewport
              connectionState={connectionState}
              studyUid={selectedStudy?.uid ?? null}
              seriesUid={selectedSeries?.uid ?? null}
              onStateChange={(state, message) => {
                setViewerLoadState(state)
                setViewerMessage(message)
              }}
            />
          </div>

          <div className="viewer-summary">
            <article className="summary-card">
              <span className="summary-label">Patient</span>
              <strong>{selectedStudy?.patientName ?? selectedStudy?.patientId ?? 'Pending data'}</strong>
            </article>
            <article className="summary-card">
              <span className="summary-label">Active Series</span>
              <strong>{selectedSeries?.description ?? 'Select a series'}</strong>
            </article>
            <article className="summary-card">
              <span className="summary-label">Series UID</span>
              <strong>{selectedSeries?.uid ?? 'Awaiting selection'}</strong>
            </article>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Series Inspector</p>
              <h2>Acquisition breakdown</h2>
            </div>
            <span className="panel-tag">{selectedSeries?.modality ?? 'pending'}</span>
          </div>

          <div className="series-list" role="list">
            {selectedStudy?.series.map((series) => (
              <button
                key={series.uid}
                type="button"
                className={`series-row ${series.uid === selectedSeries?.uid ? 'series-row--active' : ''}`}
                onClick={() => setSelectedSeriesUid(series.uid)}
              >
                <div>
                  <p className="series-row__modality">{series.modality ?? 'OT'}</p>
                  <strong>{series.description ?? 'Untitled series'}</strong>
                </div>
                <div className="series-row__meta">
                  <span>{series.instanceCount} images</span>
                  <span>{series.bodyPart ?? 'Body part pending'}</span>
                </div>
              </button>
            ))}

            {!selectedStudy && <div className="study-empty">Select a study to inspect its series.</div>}
          </div>
        </aside>
      </section>

      <section className="roadmap-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Next Integrations</p>
              <h2>Planned delivery path</h2>
            </div>
          </div>

          <ul className="backlog-list">
            {backlogItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Service Config</p>
              <h2>Backend handshake</h2>
            </div>
          </div>

          <dl className="config-list">
            <div>
              <dt>API prefix</dt>
              <dd>{apiConfig?.apiPrefix ?? '/api/v1'}</dd>
            </div>
            <div>
              <dt>Sample directory</dt>
              <dd>{apiConfig?.sampleDirectory ?? 'backend/sample_dicom'}</dd>
            </div>
            <div>
              <dt>DICOMweb base URL</dt>
              <dd>{apiConfig?.dicomwebBaseUrl ?? 'Not configured yet'}</dd>
            </div>
            <div>
              <dt>Features</dt>
              <dd>{apiConfig?.features.join(', ') ?? 'viewer-shell, study-catalog'}</dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  )
}

export default App
