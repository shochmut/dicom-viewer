import { Enums as CoreEnums, RenderingEngine, init as coreInit } from '@cornerstonejs/core'
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader'

export interface CornerstoneViewportController {
  loadImageIds: (imageIds: string[], initialImageIndex?: number) => Promise<void>
  resize: () => void
  destroy: () => void
}

let nextViewportSuffix = 0
let cornerstoneInitPromise: Promise<void> | null = null

async function ensureCornerstoneReady(): Promise<void> {
  if (!cornerstoneInitPromise) {
    cornerstoneInitPromise = (async () => {
      await coreInit()
      await dicomImageLoaderInit({ maxWebWorkers: 1 })
    })().catch((error: unknown) => {
      cornerstoneInitPromise = null
      throw error
    })
  }

  await cornerstoneInitPromise
}

export function buildWadoImageIds(instanceUrls: string[]): string[] {
  return instanceUrls.map((instanceUrl) => `wadouri:${instanceUrl}`)
}

export async function createCornerstoneViewport(
  element: HTMLDivElement,
): Promise<CornerstoneViewportController> {
  await ensureCornerstoneReady()

  const viewportSuffix = `${++nextViewportSuffix}`
  const renderingEngineId = `sample-rendering-engine-${viewportSuffix}`
  const viewportId = `sample-viewport-${viewportSuffix}`
  const renderingEngine = new RenderingEngine(renderingEngineId)
  let isDragging = false
  let dragStartX = 0
  let dragStartY = 0
  let initialPan: [number, number] = [0, 0]

  renderingEngine.setViewports([
    {
      viewportId,
      element,
      type: CoreEnums.ViewportType.STACK,
      defaultOptions: {
        background: [0, 0, 0],
      },
    },
  ])

  const viewport = renderingEngine.getStackViewport(viewportId)

  function stopDragging() {
    isDragging = false
    element.style.cursor = 'grab'
  }

  function handleMouseDown(event: MouseEvent) {
    if (event.button !== 0) {
      return
    }

    event.preventDefault()
    isDragging = true
    dragStartX = event.clientX
    dragStartY = event.clientY
    initialPan = viewport.getPan() as [number, number]
    element.style.cursor = 'grabbing'
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isDragging) {
      return
    }

    event.preventDefault()
    const deltaX = event.clientX - dragStartX
    const deltaY = event.clientY - dragStartY
    viewport.setPan([initialPan[0] + deltaX, initialPan[1] + deltaY])
    viewport.render()
  }

  function handleWheel(event: WheelEvent) {
    event.preventDefault()

    const currentZoom = viewport.getZoom()
    const zoomFactor = event.deltaY < 0 ? 1.12 : 1 / 1.12
    const nextZoom = Math.min(20, Math.max(0.1, currentZoom * zoomFactor))

    viewport.setZoom(nextZoom)
    viewport.render()
  }

  element.addEventListener('mousedown', handleMouseDown)
  element.addEventListener('mouseleave', stopDragging)
  element.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', stopDragging)

  return {
    loadImageIds: async (imageIds: string[], initialImageIndex = 0) => {
      if (imageIds.length === 0) {
        throw new Error('Selected series has no renderable DICOM instances.')
      }

      await viewport.setStack(imageIds, initialImageIndex)
      viewport.resetCamera()
      viewport.render()
    },
    resize: () => {
      renderingEngine.resize(true, true)
    },
    destroy: () => {
      element.removeEventListener('mousedown', handleMouseDown)
      element.removeEventListener('mouseleave', stopDragging)
      element.removeEventListener('wheel', handleWheel)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', stopDragging)
      renderingEngine.destroy()
    },
  }
}
