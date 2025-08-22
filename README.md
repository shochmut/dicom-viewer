# dicom-viewer
Just a fun personal project I'm starting to better learn some current DICOM viewer frameworks and tools out there.
Starting out with a monorepo structure with the following to be determined:
Front End:
    React and Vite to bootstrap it up
    Cornerstone 3D
    DICOMweb access --> call backend with a proxy or talk directly to DICOMweb serverr through CORS

Back End:
    Web API --> FastAPI or Flask
    DICOM --> pydicom, pynetdicom, gdcm
    Analysis --> TBD, stress-strain analysis modeling, diagnostic models
    PACS/DICOMweb server --> dcm4chee
