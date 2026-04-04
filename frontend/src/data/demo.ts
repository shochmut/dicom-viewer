import type { BootstrapData } from '../types'

export const demoBootstrapData: BootstrapData = {
  connection: 'offline',
  health: {
    status: 'offline',
    service: 'DICOM Viewer API',
    version: '0.1.0',
    dicomCatalogReady: false,
  },
  config: {
    appName: 'DICOM Viewer API',
    viewerTitle: 'DICOM Workbench',
    apiPrefix: '/api/v1',
    dicomwebMode: 'proxy',
    dicomwebBaseUrl: null,
    sampleDirectory: 'backend/sample_dicom',
    sampleDirectoryExists: false,
    features: ['viewer-shell', 'study-catalog', 'analysis-placeholder'],
  },
  studies: [
    {
      uid: 'demo-study-ct-001',
      patientId: 'DEMO-CT-01',
      patientName: 'Demo Trauma CT',
      description: 'Emergency head CT',
      accessionNumber: 'ACC-4012',
      studyDate: '2026-03-28',
      instanceCount: 420,
      source: 'demo',
      series: [
        {
          uid: 'demo-study-ct-001-axial',
          modality: 'CT',
          description: 'Head axial soft tissue',
          bodyPart: 'Head',
          instanceCount: 240,
        },
        {
          uid: 'demo-study-ct-001-bone',
          modality: 'CT',
          description: 'Bone reconstruction',
          bodyPart: 'Head',
          instanceCount: 180,
        },
      ],
    },
    {
      uid: 'demo-study-mr-002',
      patientId: 'DEMO-MR-02',
      patientName: 'Demo Knee MRI',
      description: 'Left knee ligament review',
      accessionNumber: 'ACC-5820',
      studyDate: '2026-03-29',
      instanceCount: 188,
      source: 'demo',
      series: [
        {
          uid: 'demo-study-mr-002-sag',
          modality: 'MR',
          description: 'Sagittal PD FS',
          bodyPart: 'Knee',
          instanceCount: 72,
        },
        {
          uid: 'demo-study-mr-002-cor',
          modality: 'MR',
          description: 'Coronal T1',
          bodyPart: 'Knee',
          instanceCount: 58,
        },
        {
          uid: 'demo-study-mr-002-ax',
          modality: 'MR',
          description: 'Axial T2',
          bodyPart: 'Knee',
          instanceCount: 58,
        },
      ],
    },
  ],
  message:
    'Backend not reachable yet. The frontend is using demo metadata so the viewer shell can be styled and iterated in parallel.',
}
