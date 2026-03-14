## ADDED Requirements

### Requirement: Upload endpoint accepts PDF and DOCX files up to 10MB

The system SHALL expose POST /upload that accepts multipart/form-data with a field named `file`. The system SHALL allow only PDF (application/pdf) and DOCX (application/vnd.openxmlformats-officedocument.wordprocessingml.document) and SHALL enforce a maximum file size of 10MB. Validation SHALL use MIME (e.g. via magic-bytes or similar) where feasible, not only file extension. On success the system SHALL return 200 with a body containing filePath and fileType (FileUploadResponse per api-spec.yml).

#### Scenario: Valid PDF upload returns 200 and file path
- **WHEN** POST /upload is called with a valid PDF file (correct MIME, size ≤ 10MB) in the `file` field
- **THEN** the response status is 200
- **AND** the response body contains filePath and fileType (e.g. application/pdf)
- **AND** the file is stored on disk at the path indicated by filePath (relative or under configured UPLOAD_DIR)

#### Scenario: Valid DOCX upload returns 200 and file path
- **WHEN** POST /upload is called with a valid DOCX file (correct MIME, size ≤ 10MB) in the `file` field
- **THEN** the response status is 200
- **AND** the response body contains filePath and fileType (e.g. application/vnd.openxmlformats-officedocument.wordprocessingml.document)
- **AND** the file is stored on disk at the path indicated by filePath

#### Scenario: Wrong file type returns 400
- **WHEN** POST /upload is called with a file that is not PDF or DOCX (e.g. image or executable)
- **THEN** the response status is 400
- **AND** the file is not stored or is removed

#### Scenario: File over 10MB returns 400
- **WHEN** POST /upload is called with a PDF or DOCX file larger than 10MB
- **THEN** the response status is 400
- **AND** the file is not stored

### Requirement: Upload storage is secure and outside web root

The system SHALL store uploaded files in a directory configured via UPLOAD_DIR (or default e.g. backend/uploads) that is outside the public web root. The system SHALL use a server-computed filename (e.g. UUID plus safe extension) and SHALL NOT use user-controlled path or filename for storage. The system SHALL reject path traversal (e.g. filenames containing `../`) and double extensions.

#### Scenario: Stored path is server-computed and safe
- **WHEN** POST /upload succeeds
- **THEN** the stored file path is derived from server configuration and a generated identifier (e.g. uploads/<year>/<uuid>.pdf)
- **AND** no part of the original client filename is used to build the storage path in an unsafe way

#### Scenario: Path traversal in filename is rejected
- **WHEN** POST /upload is called with a filename that contains path traversal (e.g. `../etc/passwd.pdf`) or double extension
- **THEN** the request is rejected (400 or the file is not stored under an unsafe path)
- **AND** no file is written outside the configured upload directory

### Requirement: Upload response is usable in create candidate

The system SHALL return filePath and fileType in the upload response so that the client MAY include them in the optional `cv` object of CreateCandidateRequest for POST /candidates.

#### Scenario: Upload response shape matches CreateResumeRequest usage
- **WHEN** POST /upload returns 200
- **THEN** the response body has filePath (string) and fileType (string)
- **AND** the same filePath and fileType can be sent in POST /candidates body as cv.filePath and cv.fileType
