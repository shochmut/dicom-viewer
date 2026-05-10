import {
  Enums as CoreEnums,
  RenderingEngine,
  cache,
  init as coreInit,
  volumeLoader,
} from '@cornerstonejs/core'
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader'
import { init as toolsInit } from '@cornerstonejs/tools'
import type { Point3, VolumeViewport3D } from '@cornerstonejs/core'

export interface CornerstoneViewportController {
  loadImageIds: (imageIds: string[], initialImageIndex?: number) => Promise<void>
  resize: () => void
  destroy: () => void
}

export interface CornerstoneVolumeViewportController {
  loadImageIdsAsVolume: (imageIds: string[]) => Promise<void>
  setInteractive: (isInteractive: boolean) => void
  resize: () => void
  destroy: () => void
}

let nextViewportSuffix = 0
let cornerstoneInitPromise: Promise<void> | null = null

export const MIN_VOLUME_DICOM_INSTANCES = 2
export const VOLUME_DICOM_INSTANCE_REQUIREMENT_MESSAGE =
  'Selected series needs at least two renderable DICOM instances for 3D volume viewing.'

async function ensureCornerstoneReady(): Promise<void> {
  if (!cornerstoneInitPromise) {
    cornerstoneInitPromise = (async () => {
      await coreInit()
      await dicomImageLoaderInit({ maxWebWorkers: 1 })
      toolsInit()
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

function subtractPoint(a: Point3, b: Point3): Point3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function addPoint(a: Point3, b: Point3): Point3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

function scalePoint(point: Point3, scale: number): Point3 {
  return [point[0] * scale, point[1] * scale, point[2] * scale]
}

function cross(a: Point3, b: Point3): Point3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}

function dot(a: Point3, b: Point3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function normalize(point: Point3): Point3 {
  const length = Math.hypot(point[0], point[1], point[2])

  if (length === 0) {
    return [0, 0, 1]
  }

  return [point[0] / length, point[1] / length, point[2] / length]
}

function rotatePoint(point: Point3, axis: Point3, angle: number): Point3 {
  const unitAxis = normalize(axis)
  const cosAngle = Math.cos(angle)
  const sinAngle = Math.sin(angle)
  const axisDotPoint = dot(unitAxis, point)
  const axisCrossPoint = cross(unitAxis, point)

  return addPoint(
    addPoint(scalePoint(point, cosAngle), scalePoint(axisCrossPoint, sinAngle)),
    scalePoint(unitAxis, axisDotPoint * (1 - cosAngle)),
  )
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

export async function createCornerstoneVolumeViewport(
  element: HTMLDivElement,
): Promise<CornerstoneVolumeViewportController> {
  await ensureCornerstoneReady()

  const viewportSuffix = `${++nextViewportSuffix}`
  const renderingEngineId = `volume-rendering-engine-${viewportSuffix}`
  const viewportId = `volume-viewport-${viewportSuffix}`
  const renderingEngine = new RenderingEngine(renderingEngineId)
  let viewport: VolumeViewport3D | null = null
  let activeVolumeId: string | null = null
  let isInteractive = false
  let isDragging = false
  let lastDragX = 0
  let lastDragY = 0

  renderingEngine.setViewports([
    {
      viewportId,
      element,
      type: CoreEnums.ViewportType.VOLUME_3D,
      defaultOptions: {
        background: [0, 0, 0],
      },
    },
  ])

  viewport = renderingEngine.getViewport(viewportId) as VolumeViewport3D

  function stopDragging() {
    isDragging = false
    element.classList.remove('viewport-target--dragging')
  }

  function rotateVolume(deltaX: number, deltaY: number) {
    if (!viewport) {
      return
    }

    const camera = viewport.getCamera()
    const focalPoint = camera.focalPoint
    const position = camera.position
    const viewUp = camera.viewUp

    if (!focalPoint || !position || !viewUp) {
      return
    }

    const viewVector = subtractPoint(position, focalPoint)
    const upVector = normalize(viewUp)
    const rightVector = normalize(cross(upVector, viewVector))
    const rotatedHorizontal = rotatePoint(viewVector, upVector, -deltaX * 0.008)
    const rotatedViewVector = rotatePoint(rotatedHorizontal, rightVector, -deltaY * 0.008)
    const rotatedViewUp = rotatePoint(upVector, rightVector, -deltaY * 0.008)

    viewport.setCamera({
      position: addPoint(focalPoint, rotatedViewVector),
      focalPoint,
      viewUp: normalize(rotatedViewUp),
    })
    viewport.render()
  }

  function handleMouseDown(event: MouseEvent) {
    if (!isInteractive || event.button !== 0) {
      return
    }

    event.preventDefault()
    isDragging = true
    lastDragX = event.clientX
    lastDragY = event.clientY
    element.classList.add('viewport-target--dragging')
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isInteractive || !isDragging) {
      return
    }

    event.preventDefault()
    const deltaX = event.clientX - lastDragX
    const deltaY = event.clientY - lastDragY
    lastDragX = event.clientX
    lastDragY = event.clientY
    rotateVolume(deltaX, deltaY)
  }

  function handleWheel(event: WheelEvent) {
    if (!isInteractive || !viewport) {
      return
    }

    event.preventDefault()
    const currentZoom = viewport.getZoom()
    const zoomFactor = event.deltaY < 0 ? 1.12 : 1 / 1.12
    const nextZoom = Math.min(8, Math.max(0.25, currentZoom * zoomFactor))

    viewport.setZoom(nextZoom)
    viewport.render()
  }

  element.addEventListener('mousedown', handleMouseDown)
  element.addEventListener('mouseleave', stopDragging)
  element.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', stopDragging)

  return {
    loadImageIdsAsVolume: async (imageIds: string[]) => {
      if (!viewport) {
        throw new Error('The 3D volume viewport is not ready.')
      }

      if (imageIds.length < MIN_VOLUME_DICOM_INSTANCES) {
        throw new Error(VOLUME_DICOM_INSTANCE_REQUIREMENT_MESSAGE)
      }

      const volumeId = `cornerstoneStreamingImageVolume:volume-${viewportSuffix}-${Date.now()}`
      const volume = await volumeLoader.createAndCacheVolume(volumeId, { imageIds })

      if ('load' in volume && typeof volume.load === 'function') {
        volume.load()
      }

      await viewport.setVolumes([{ volumeId }])
      viewport.resetCamera()
      viewport.render()

      if (activeVolumeId && activeVolumeId !== volumeId) {
        cache.removeVolumeLoadObject(activeVolumeId)
      }

      activeVolumeId = volumeId
    },
    setInteractive: (nextIsInteractive: boolean) => {
      isInteractive = nextIsInteractive
      if (!nextIsInteractive) {
        stopDragging()
      }
      element.classList.toggle('viewport-target--volume-ready', nextIsInteractive)
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
      if (activeVolumeId) {
        cache.removeVolumeLoadObject(activeVolumeId)
      }
      renderingEngine.destroy()
    },
  }
}
