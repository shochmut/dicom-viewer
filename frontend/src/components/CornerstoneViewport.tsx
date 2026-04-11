import { useEffect, useRef, useState } from 'react'
import { loadSeriesViewportManifest, resolveApiUrl } from '../lib/api'
import { buildWadoImageIds, createCornerstoneViewport } from '../lib/cornerstoneViewer'
import type { ConnectionState, ViewportLoadState } from '../types'

interface CornerstoneViewportProps {
  connectionState: ConnectionState
  studyUid: string | null
  seriesUid: string | null
  onStateChange?: (state: ViewportLoadState, message: string | null) => void
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'The sample viewer could not load this selection.'
}

function getStatusTitle(loadState: ViewportLoadState): string {
  switch (loadState) {
    case 'loading':
      return 'Loading sample series'
    case 'error':
      return 'Sample viewer unavailable'
    case 'idle':
      return 'Select a sample series'
    default:
      return 'Sample series ready'
  }
}

export default function CornerstoneViewport({
  connectionState,
  studyUid,
  seriesUid,
  onStateChange,
}: CornerstoneViewportProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const controllerRef = useRef<Awaited<ReturnType<typeof createCornerstoneViewport>> | null>(null)
  const onStateChangeRef = useRef(onStateChange)
  const loadSequenceRef = useRef(0)
  const [controllerReady, setControllerReady] = useState(false)
  const [loadState, setLoadState] = useState<ViewportLoadState>('loading')
  const [message, setMessage] = useState<string | null>('Checking viewer services.')

  onStateChangeRef.current = onStateChange

  function applyState(nextState: ViewportLoadState, nextMessage: string | null) {
    setLoadState(nextState)
    setMessage(nextMessage)
    onStateChangeRef.current?.(nextState, nextMessage)
  }

  useEffect(() => {
    let isActive = true
    const viewportElement = viewportRef.current

    if (!viewportElement) {
      return
    }

    void createCornerstoneViewport(viewportElement)
      .then((controller) => {
        if (!isActive) {
          controller.destroy()
          return
        }

        controllerRef.current = controller
        setControllerReady(true)
      })
      .catch((error) => {
        if (!isActive) {
          return
        }

        applyState('error', normalizeErrorMessage(error))
      })

    return () => {
      isActive = false
      setControllerReady(false)
      controllerRef.current?.destroy()
      controllerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!controllerReady) {
      return
    }

    const viewportElement = viewportRef.current
    if (!viewportElement) {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      controllerRef.current?.resize()
    })
    resizeObserver.observe(viewportElement)

    return () => {
      resizeObserver.disconnect()
    }
  }, [controllerReady])

  useEffect(() => {
    if (!controllerReady) {
      return
    }

    if (connectionState === 'loading') {
      applyState('loading', 'Checking viewer services.')
      return
    }

    if (connectionState === 'offline') {
      applyState('error', 'Start the backend to load local sample DICOM data.')
      return
    }

    if (!studyUid || !seriesUid) {
      applyState('idle', 'Select a sample series to load.')
      return
    }

    const abortController = new AbortController()
    const loadSequence = ++loadSequenceRef.current

    applyState('loading', 'Loading sample series.')

    async function loadSeries() {
      try {
        const manifest = await loadSeriesViewportManifest(studyUid, seriesUid, {
          signal: abortController.signal,
        })

        if (abortController.signal.aborted || loadSequence !== loadSequenceRef.current) {
          return
        }

        const imageIds = buildWadoImageIds(
          manifest.instances.map((instance) => resolveApiUrl(instance.imageUrl)),
        )

        await controllerRef.current?.loadImageIds(imageIds, manifest.initialImageIndex)

        if (abortController.signal.aborted || loadSequence !== loadSequenceRef.current) {
          return
        }

        applyState(
          'ready',
          `${manifest.modality ?? 'DICOM'} series ready. Drag to pan and use the mouse wheel to zoom.`,
        )
      } catch (error) {
        if (abortController.signal.aborted || loadSequence !== loadSequenceRef.current) {
          return
        }

        applyState('error', normalizeErrorMessage(error))
      }
    }

    void loadSeries()

    return () => {
      abortController.abort()
    }
  }, [connectionState, controllerReady, seriesUid, studyUid])

  return (
    <div className="viewport-shell">
      <div
        id="cornerstone-viewport"
        ref={viewportRef}
        className="viewport-target"
        aria-label="Cornerstone sample DICOM viewport"
      />
      {loadState !== 'ready' && (
        <div className="viewport-status">
          <div className="viewport-target__callout">
            <p>{getStatusTitle(loadState)}</p>
            <strong>{message ?? 'Select a sample series to begin.'}</strong>
          </div>
        </div>
      )}
      {loadState === 'ready' && (
        <div className="viewport-hint">Drag to pan. Mouse wheel zooms the active image.</div>
      )}
    </div>
  )
}
