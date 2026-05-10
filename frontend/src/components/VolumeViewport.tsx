import { useEffect, useRef, useState } from 'react'
import { loadSeriesViewportManifest, resolveApiUrl } from '../lib/api'
import { buildWadoImageIds, createCornerstoneVolumeViewport } from '../lib/cornerstoneViewer'
import type { ConnectionState, ViewportLoadState } from '../types'

interface VolumeViewportProps {
  connectionState: ConnectionState
  studyUid: string | null
  seriesUid: string | null
  onStateChange?: (state: ViewportLoadState, message: string | null) => void
}

function isAbortError(error: unknown): boolean {
  return (
    (typeof DOMException !== 'undefined' &&
      error instanceof DOMException &&
      error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'The 3D volume viewer could not load this selection.'
}

function getStatusTitle(loadState: ViewportLoadState): string {
  switch (loadState) {
    case 'loading':
      return 'Preparing 3D volume'
    case 'error':
      return '3D volume unavailable'
    case 'idle':
      return 'Select a series'
    default:
      return '3D volume ready'
  }
}

export default function VolumeViewport({
  connectionState,
  studyUid,
  seriesUid,
  onStateChange,
}: VolumeViewportProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const controllerRef = useRef<Awaited<ReturnType<typeof createCornerstoneVolumeViewport>> | null>(
    null,
  )
  const onStateChangeRef = useRef(onStateChange)
  const loadSequenceRef = useRef(0)
  const [controllerReady, setControllerReady] = useState(false)
  const [loadState, setLoadState] = useState<ViewportLoadState>('loading')
  const [message, setMessage] = useState<string | null>('Preparing the 3D volume viewer.')

  onStateChangeRef.current = onStateChange

  function applyState(nextState: ViewportLoadState, nextMessage: string | null) {
    setLoadState(nextState)
    setMessage(nextMessage)
    controllerRef.current?.setInteractive(nextState === 'ready')
    onStateChangeRef.current?.(nextState, nextMessage)
  }

  useEffect(() => {
    let isActive = true
    const viewportElement = viewportRef.current

    if (!viewportElement) {
      return
    }

    void createCornerstoneVolumeViewport(viewportElement)
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
      applyState('idle', 'Select a DICOM series to open a 3D volume.')
      return
    }

    const activeStudyUid = studyUid
    const activeSeriesUid = seriesUid
    const abortController = new AbortController()
    const loadSequence = ++loadSequenceRef.current

    applyState('loading', 'Preparing selected series for 3D volume viewing.')

    async function loadVolume() {
      try {
        const manifest = await loadSeriesViewportManifest(activeStudyUid, activeSeriesUid, {
          signal: abortController.signal,
        })

        if (abortController.signal.aborted || loadSequence !== loadSequenceRef.current) {
          return
        }

        if (manifest.instances.length < 2) {
          throw new Error('Selected series needs at least two DICOM images for 3D volume viewing.')
        }

        const imageIds = buildWadoImageIds(
          manifest.instances.map((instance) => resolveApiUrl(instance.imageUrl)),
        )

        await controllerRef.current?.loadImageIdsAsVolume(imageIds)

        if (abortController.signal.aborted || loadSequence !== loadSequenceRef.current) {
          return
        }

        applyState(
          'ready',
          `${manifest.modality ?? 'DICOM'} volume ready. Drag to rotate and use the mouse wheel to zoom.`,
        )
      } catch (error) {
        if (abortController.signal.aborted || loadSequence !== loadSequenceRef.current) {
          return
        }

        if (isAbortError(error)) {
          applyState('loading', 'Preparing selected series for 3D volume viewing.')
          return
        }

        applyState('error', normalizeErrorMessage(error))
      }
    }

    void loadVolume()

    return () => {
      abortController.abort()
    }
  }, [connectionState, controllerReady, seriesUid, studyUid])

  return (
    <div className="viewport-shell viewport-shell--volume">
      <div
        id="cornerstone-volume-viewport"
        ref={viewportRef}
        className="viewport-target viewport-target--volume"
        aria-label="Non-diagnostic 3D DICOM volume viewport"
      />
      {loadState !== 'ready' && (
        <div className="viewport-status">
          <div className="viewport-target__callout">
            <p>{getStatusTitle(loadState)}</p>
            <strong>{message ?? 'Select a DICOM series to begin.'}</strong>
          </div>
        </div>
      )}
      {loadState === 'ready' && (
        <div className="viewport-hint">Non-diagnostic 3D view. Drag to rotate. Mouse wheel zooms.</div>
      )}
    </div>
  )
}
