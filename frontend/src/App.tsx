import { useEffect, useState } from 'react'
import './App.css'
import { getApiBaseUrl, loadBootstrapData } from './lib/api'
import type { BootstrapData, ConnectionState, StudySummary, ViewerMode } from './types'

const viewerModes: Array<{ id: ViewerMode; label: string; detail: string }> = [
  { id: 'stack', label: 'Stack', detail: 'Single-series review' },
  { id: 'mpr', label: 'MPR', detail: 'Cross-sectional reformatting' },
  { id: 'volume', label: 'Volume', detail: '3D rendering lane' },
]

const backlogItems = [
  'Attach a Cornerstone 3D rendering engine to the viewport mount point.',
  'Wire DICOMweb study retrieval through the FastAPI proxy or direct CORS mode.',
  'Add measurement, annotations, and future stress-strain analysis workflows.',
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

function App() {
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('loading')
  const [selectedStudyUid, setSelectedStudyUid] = useState<string | null>(null)
  const [viewerMode, setViewerMode] = useState<ViewerMode>('stack')

  useEffect(() => {
    let isActive = true

    async function hydrate() {
      const data = await loadBootstrapData()

      if (!isActive) {
        return
      }

      setBootstrap(data)
      setConnectionState(data.connection)
      setSelectedStudyUid((currentStudyUid) => currentStudyUid ?? data.studies[0]?.uid ?? null)
    }

    void hydrate()

    return () => {
      isActive = false
    }
  }, [])

  const studies = bootstrap?.studies ?? []
  const selectedStudy = getPrimaryStudy(studies, selectedStudyUid)
  const seriesCount = studies.reduce((count, study) => count + study.series.length, 0)
  const instanceCount = studies.reduce((count, study) => count + study.instanceCount, 0)
  const apiConfig = bootstrap?.config
  const connectionLabel = describeConnection(connectionState)

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Medical Imaging Sandbox</p>
          <h1>{apiConfig?.viewerTitle ?? 'DICOM Workbench'}</h1>
          <p className="hero-text">
            React + Vite viewer shell paired with a FastAPI service for local DICOM cataloging,
            future DICOMweb proxying, and downstream analysis experiments.
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
                  onClick={() => setSelectedStudyUid(study.uid)}
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
              <h2>{selectedStudy?.description ?? 'Cornerstone viewport mount point'}</h2>
            </div>
            <div className="mode-switch" role="tablist" aria-label="Viewer mode">
              {viewerModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={`mode-switch__button ${
                    viewerMode === mode.id ? 'mode-switch__button--active' : ''
                  }`}
                  onClick={() => setViewerMode(mode.id)}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="viewer-stage">
            <div className="viewer-stage__overlay">
              <span>Viewport target: `#cornerstone-viewport`</span>
              <span>{viewerModes.find((mode) => mode.id === viewerMode)?.detail}</span>
            </div>
            <div id="cornerstone-viewport" className="viewport-target">
              <div className="viewport-target__callout">
                <p>Rendering engine not attached yet</p>
                <strong>Scaffold ready for Cornerstone 3D initialization</strong>
              </div>
            </div>
          </div>

          <div className="viewer-summary">
            <article className="summary-card">
              <span className="summary-label">Patient</span>
              <strong>{selectedStudy?.patientName ?? selectedStudy?.patientId ?? 'Pending data'}</strong>
            </article>
            <article className="summary-card">
              <span className="summary-label">Accession</span>
              <strong>{selectedStudy?.accessionNumber ?? 'Not assigned'}</strong>
            </article>
            <article className="summary-card">
              <span className="summary-label">Study UID</span>
              <strong>{selectedStudy?.uid ?? 'Awaiting selection'}</strong>
            </article>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Series Inspector</p>
              <h2>Acquisition breakdown</h2>
            </div>
            <span className="panel-tag">{selectedStudy?.series.length ?? 0} lanes</span>
          </div>

          <div className="series-list" role="list">
            {selectedStudy?.series.map((series) => (
              <article key={series.uid} className="series-row">
                <div>
                  <p className="series-row__modality">{series.modality ?? 'OT'}</p>
                  <strong>{series.description ?? 'Untitled series'}</strong>
                </div>
                <div className="series-row__meta">
                  <span>{series.instanceCount} images</span>
                  <span>{series.bodyPart ?? 'Body part pending'}</span>
                </div>
              </article>
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
