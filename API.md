# 📡 API Documentation

Complete reference for all REST API endpoints.

## Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require JWT token:

```
Header: Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register New User

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created)**:
```json
{
  "user": {
    "id": "uuid-string",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK)**:
```json
{
  "user": {
    "id": "uuid-string",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (401 Unauthorized)**:
```json
{
  "error": true,
  "status": 401,
  "message": "Invalid credentials"
}
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "id": "uuid-string",
  "name": "John Doe",
  "email": "john@example.com"
}
```

---

## 🎬 Project Endpoints

### List All Projects

```http
GET /projects
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
[
  {
    "id": "project-uuid",
    "userId": "user-uuid",
    "title": "My First Video",
    "videoUrl": "https://s3.amazonaws.com/...",
    "status": "analyzed",
    "thumbnailUrl": "https://s3.amazonaws.com/...",
    "analysis": {
      "requiredPoses": [
        {
          "id": 1,
          "description": "Reference pose 1",
          "frameNumber": 0,
          "timestamp": "0s",
          "angle": "Front view",
          "expression": "Neutral",
          "confidence": 0.95,
          "keypoints": { ... }
        }
      ],
      "frameCount": 300,
      "duration": 10,
      "fps": 30,
      "resolution": "1920x1080"
    },
    "referencePhotos": [],
    "outputVideoUrl": null,
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-01-15T10:35:00Z"
  }
]
```

### Create New Project (Upload Video)

```http
POST /projects
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <video.mp4>
title: "My Video Title" (optional)
```

**Response (201 Created)**:
```json
{
  "id": "project-uuid",
  "userId": "user-uuid",
  "title": "My Video Title",
  "videoUrl": "https://s3.amazonaws.com/videos/project-uuid.mp4",
  "status": "uploaded",
  "analysis": null,
  "referencePhotos": [],
  "createdAt": "2026-01-15T10:30:00Z"
}
```

**Errors**:
- `400 Bad Request` - No video file
- `413 Payload Too Large` - Video exceeds 500MB
- `415 Unsupported Media Type` - Not a video file

### Get Project Details

```http
GET /projects/:projectId
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "id": "project-uuid",
  "userId": "user-uuid",
  "title": "My Video",
  "videoUrl": "https://s3.amazonaws.com/...",
  "status": "analyzed",
  "analysis": { ... },
  "referencePhotos": [],
  "outputVideoUrl": null,
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T10:35:00Z"
}
```

**Errors**:
- `404 Not Found` - Project doesn't exist or belongs to different user

### Analyze Video

```http
POST /projects/:projectId/analyze
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "id": "project-uuid",
  "status": "analyzed",
  "analysis": {
    "requiredPoses": [
      {
        "id": 1,
        "description": "Reference pose 1",
        "frameNumber": 0,
        "timestamp": "0s",
        "angle": "Front view",
        "expression": "Neutral",
        "confidence": 0.95,
        "keypoints": {
          "nose": { "x": 0.5, "y": 0.3, "confidence": 0.95 },
          "leftShoulder": { "x": 0.3, "y": 0.5, "confidence": 0.92 },
          "rightShoulder": { "x": 0.7, "y": 0.5, "confidence": 0.92 },
          ...
        }
      },
      {
        "id": 2,
        ...
      },
      {
        "id": 3,
        ...
      }
    ],
    "frameCount": 300,
    "duration": 10,
    "fps": 30,
    "resolution": "1920x1080"
  }
}
```

**Processing Time**: 10-30 seconds depending on video length

**Errors**:
- `404 Not Found` - Project not found
- `500 Server Error` - Video analysis failed

### Upload Reference Photos

```http
POST /projects/:projectId/upload-photos
Authorization: Bearer <token>
Content-Type: multipart/form-data

photos: [<photo1.jpg>, <photo2.jpg>, <photo3.jpg>]
```

**Response (200 OK)**:
```json
{
  "id": "project-uuid",
  "referencePhotos": [
    "https://s3.amazonaws.com/photos/...",
    "https://s3.amazonaws.com/photos/...",
    "https://s3.amazonaws.com/photos/..."
  ],
  "analysis": { ... },
  "status": "analyzed"
}
```

**Requirements**:
- 1-10 images (JPG, PNG, GIF, WebP)
- Match number of required poses from analysis
- Clear, well-lit photos showing full body or upper body

**Errors**:
- `400 Bad Request` - No photos provided
- `404 Not Found` - Project not found
- `415 Unsupported Media Type` - Not image files

### Generate Final Video

```http
POST /projects/:projectId/generate
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "id": "project-uuid",
  "status": "complete",
  "analysis": { ... },
  "referencePhotos": [ ... ],
  "outputVideoUrl": "https://s3.amazonaws.com/videos/project-uuid-output.mp4",
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T11:15:00Z"
}
```

**Processing Time**: 30-60 seconds depending on video length

**Requirements**:
- Project must be analyzed
- Reference photos uploaded

**Errors**:
- `400 Bad Request` - Missing analysis or photos
- `404 Not Found` - Project not found
- `500 Server Error` - Video generation failed

### Delete Project

```http
DELETE /projects/:projectId
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "message": "Project deleted"
}
```

**Notes**:
- Deletes project record (S3 files may remain for backup)
- Cannot be undone

**Errors**:
- `404 Not Found` - Project not found

---

## 🏥 Health Check

```http
GET /health
```

**Response (200 OK)**:
```json
{
  "status": "OK",
  "message": "SMS Video Editor Backend is running"
}
```

Use this to verify backend is running and accessible.

---

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "error": true,
  "status": 400,
  "message": "Human-readable error message"
}
```

### Common Status Codes

| Code | Meaning | Common Cause |
|------|---------|-------------|
| 200 | Success | Request completed |
| 201 | Created | Resource created (project, user) |
| 400 | Bad Request | Missing/invalid parameters |
| 401 | Unauthorized | Invalid or missing token |
| 404 | Not Found | Resource doesn't exist |
| 413 | Payload Too Large | File exceeds size limit |
| 415 | Unsupported Media | Wrong file type |
| 500 | Server Error | Internal error (check logs) |

---

## 📊 Data Types

### Pose Object
```json
{
  "id": 1,
  "description": "Reference pose 1",
  "frameNumber": 0,
  "timestamp": "0s",
  "angle": "Front view",
  "expression": "Neutral",
  "confidence": 0.95,
  "keypoints": {
    "nose": { "x": 0.5, "y": 0.3, "confidence": 0.95 },
    "leftEye": { "x": 0.45, "y": 0.25, "confidence": 0.94 },
    "rightEye": { "x": 0.55, "y": 0.25, "confidence": 0.94 },
    ...
  }
}
```

### Project Object
```json
{
  "id": "uuid-string",
  "userId": "user-uuid",
  "title": "Project Title",
  "videoUrl": "https://s3.amazonaws.com/...",
  "status": "uploaded|analyzed|complete",
  "thumbnailUrl": "https://s3.amazonaws.com/...",
  "analysis": { ... },
  "referencePhotos": [ ... ],
  "outputVideoUrl": "https://s3.amazonaws.com/...",
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp"
}
```

---

## 🔄 Workflow Example

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secure123"
  }'

# Response: { "user": {...}, "token": "eyJ..." }
TOKEN="eyJ..."

# 2. Create project (upload video)
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -F "video=@video.mp4"

# Response: { "id": "proj-uuid", "status": "uploaded", ... }
PROJECT_ID="proj-uuid"

# 3. Analyze video
curl -X POST http://localhost:5000/api/projects/$PROJECT_ID/analyze \
  -H "Authorization: Bearer $TOKEN"

# Response: { "status": "analyzed", "analysis": {...}, ... }

# 4. Upload reference photos
curl -X POST http://localhost:5000/api/projects/$PROJECT_ID/upload-photos \
  -H "Authorization: Bearer $TOKEN" \
  -F "photos=@photo1.jpg" \
  -F "photos=@photo2.jpg" \
  -F "photos=@photo3.jpg"

# Response: { "referencePhotos": [...], ... }

# 5. Generate final video
curl -X POST http://localhost:5000/api/projects/$PROJECT_ID/generate \
  -H "Authorization: Bearer $TOKEN"

# Response: { "status": "complete", "outputVideoUrl": "https://...", ... }
```

---

## 🔐 Authentication Notes

- Tokens expire after **7 days**
- Tokens included in Authorization header format: `Bearer <token>`
- All endpoints except register/login require valid token
- Tokens are JWT (JSON Web Tokens)
- Do not share tokens - they grant full access

---

## 📝 Notes

- All timestamps are ISO-8601 format
- All IDs are UUIDs
- File URLs point to AWS S3 buckets
- Confidence scores range from 0.0 to 1.0
- Analysis and photo processing is asynchronous

---

**API Version**: 1.0.0 | **Last Updated**: March 2026
