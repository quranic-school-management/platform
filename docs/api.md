# QMS Backend – API Documentation

> **Base URL:** `http://localhost:3000`  
> **Content-Type:** `application/json`  
> **Authentication:** Bearer JWT in the `Authorization` header  
> **Date format:** ISO 8601 (`2026-11-22T18:30:00.000Z`)

---

## Table of Contents

1. [Conventions](#1-conventions)
2. [Auth](#2-auth)
3. [Users](#3-users-mushrif-only)
4. [Halaqat](#4-halaqat)
5. [Enrollment (Teachers & Students)](#5-enrollment)
6. [Sessions](#6-sessions)
7. [Attendance](#7-attendance)
8. [Recitation (Hifz & Murajaa)](#8-recitation)
9. [Dashboard & Reporting](#9-dashboard--reporting)

---

## 1. Conventions

### Request headers

| Header | Value | When |
|--------|-------|------|
| `Content-Type` | `application/json` | Every request with a body |
| `Authorization` | `Bearer <token>` | Every authenticated request |

### Response envelope

Every successful response wraps its payload in a `data` key:

```json
{ "data": { ... } }
```

Errors return:

```json
{ "error": "Human-readable message" }
```

### Pagination

Paginated endpoints accept `page` (default `1`) and `limit` (default `50`, max `100`) as query parameters and return:

```json
{
  "data": {
    "<items_key>": [ ... ],
    "total": 42,
    "page": 1,
    "limit": 50
  }
}
```

### Roles

| Role | Value | Description |
|------|-------|-------------|
| Mushrif | `mushrif` | Supervisor / admin – full access |
| Teacher | `teacher` | Runs sessions, marks attendance & recitation |
| Student | `student` | Read-only view of own data |

### Authorization (enforced on the API)

The UI hides some actions by role, but every request is also checked on the server:

| Actor | Allowed |
|-------|---------|
| Mushrif | All center data |
| Teacher | Assigned halaqat only; records of students enrolled in those halaqat. May mutate only sessions they started (attendance, recitation, notes, complete) |
| Student | Own attendance and recitation history; details of halaqat they are enrolled in |

Deactivated or soft-deleted accounts are rejected on every authenticated request, even if the JWT has not expired yet.

### Status: must_change_password

After login, if `must_change_password` is `true`, **every protected endpoint** except `POST /api/auth/change-password` and `GET /api/auth/me` will return `403`:

```json
{ "error": "You must change your default password before accessing this resource" }
```

The frontend should redirect to the change-password screen immediately.

---

## 2. Auth

### `POST /api/auth/login`

> Public — no token required

**Request body:**

```json
{
  "username": "ahmed.k",
  "password": "15-03-2010"
}
```

**Success response `200`:**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "ahmed.k",
      "full_name": "أحمد كريم",
      "role": "teacher",
      "must_change_password": true
    }
  }
}
```

**Errors:**

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Missing required field: username | Empty body |
| 401 | Invalid username or password | Wrong credentials |
| 403 | Account is deactivated. Contact the Mushrif. | `is_active = false` (also returned on later requests if the account is deactivated while a token is still valid) |

---

### `POST /api/auth/change-password`

> Authenticated — works even when `must_change_password` is `true`

**Request body:**

```json
{
  "current_password": "15-03-2010",
  "new_password": "MyStr0ng!Pass"
}
```

**Validation:** `new_password` must be ≥ 8 characters.

**Success response `200`:**

```json
{
  "data": { "message": "Password changed successfully" }
}
```

> [!IMPORTANT]
> After a successful change, the JWT still carries `must_change_password: true`. The frontend should **re-login** or call `GET /me` to get the updated flag.

**Errors:**

| Status | Error |
|--------|-------|
| 400 | Password must be at least 8 characters |
| 401 | Current password is incorrect |

---

### `GET /api/auth/me`

> Authenticated — works even when `must_change_password` is `true`

**Success response `200`:**

```json
{
  "data": {
    "id": "550e8400-...",
    "username": "ahmed.k",
    "full_name": "أحمد كريم",
    "role": "teacher",
    "is_active": true,
    "must_change_password": false,
    "created_at": "2026-11-22T10:00:00.000Z",
    "updated_at": "2026-11-22T10:30:00.000Z"
  }
}
```

---

## 3. Users (Mushrif only)

> All endpoints require role `mushrif`.

### `POST /api/users`

Create a new user account. Returns the generated username slug and default password to give to the user.

**Request body:**

```json
{
  "full_name": "محمد أحمد",
  "role": "student",
  "date_of_birth": "2010-03-15",
  "username": "mohammed.a"       // optional — auto-generated if omitted
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `full_name` | string | ✅ | Display name (Arabic OK) |
| `role` | string | ✅ | `mushrif`, `teacher`, or `student` |
| `date_of_birth` | string | ✅ | `YYYY-MM-DD`. Used as the temporary password (`DD-MM-YYYY`) |
| `username` | string | ❌ | Lowercase `[a-z0-9._-]` only. Auto-generated from name if omitted |

**Success response `201`:**

```json
{
  "data": {
    "user": {
      "id": "a1b2c3d4-...",
      "username": "mohammed.a",
      "full_name": "محمد أحمد",
      "role": "student",
      "must_change_password": true,
      "is_active": true,
      "created_at": "2026-11-22T10:00:00.000Z"
    },
    "default_password": "15-03-2010"
  }
}
```

> [!TIP]
> Display the `username` and `default_password` to the Mushrif so they can hand them to the user.

**Errors:**

| Status | Error |
|--------|-------|
| 400 | Username must contain only lowercase letters, digits, dots, dashes, and underscores |
| 400 | Missing required field: date_of_birth |
| 400 | date_of_birth must be a date in YYYY-MM-DD format |
| 400 | Invalid role: must be one of mushrif, teacher, student |
| 409 | Username is already taken |

---

### `GET /api/users`

**Query parameters:**

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `role` | string | — | Filter: `mushrif`, `teacher`, `student` |
| `is_active` | string | — | `"true"` or `"false"` |
| `search` | string | — | Searches `username` and `full_name` (case-insensitive) |
| `page` | int | 1 | |
| `limit` | int | 50 | Max 100 |

**Success response `200`:**

```json
{
  "data": {
    "users": [
      {
        "id": "...",
        "username": "ahmed.k",
        "full_name": "أحمد كريم",
        "role": "teacher",
        "is_active": true,
        "must_change_password": false,
        "created_at": "...",
        "updated_at": "..."
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 50
  }
}
```

---

### `GET /api/users/:id`

**Success response `200`:**

```json
{
  "data": {
    "id": "...",
    "username": "ahmed.k",
    "full_name": "أحمد كريم",
    "role": "teacher",
    "is_active": true,
    "must_change_password": false,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Errors:** `400` Invalid UUID | `404` User not found

---

### `PUT /api/users/:id`

**Request body** (all fields optional, at least one required):

```json
{
  "full_name": "أحمد كريم العلي",
  "role": "teacher",
  "is_active": false
}
```

**Success response `200`:** Returns the updated user object (same shape as GET).

---

### `DELETE /api/users/:id`

Soft-deletes the user (sets `deleted_at`, `is_active = false`).

**Success response `200`:**

```json
{
  "data": {
    "message": "User deleted",
    "id": "...",
    "username": "ahmed.k"
  }
}
```

---

### `POST /api/users/:id/reset-password`

Resets the user's password to their date of birth (`DD-MM-YYYY`) and sets `must_change_password = true`. Fails if the user has no date of birth.

**No request body.**

**Success response `200`:**

```json
{
  "data": {
    "user": { "id": "...", "username": "ahmed.k", "date_of_birth": "2010-03-15" },
    "default_password": "15-03-2010"
  }
}
```

---

## 4. Halaqat

> `GET /api/halaqat`: all roles (list is filtered by role).  
> `GET /api/halaqat/:id` and enrollment `GET` lists: Mushrif, or a teacher/student who belongs to that halaqa.  
> `POST`, `PUT`, `DELETE`: Mushrif only.

### `POST /api/halaqat`

**Request body:**

```json
{
  "name": "حلقة الإيمان",
  "description": "حلقة صباحية للأطفال"   // optional
}
```

**Success response `201`:**

```json
{
  "data": {
    "id": "...",
    "name": "حلقة الإيمان",
    "description": "حلقة صباحية للأطفال",
    "created_by": "mushrif-uuid",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

---

### `GET /api/halaqat`

Returns halaqat filtered by the caller's role:
- **Mushrif:** all halaqat
- **Teacher:** only assigned halaqat
- **Student:** only enrolled halaqat

**Query:** `search`, `page`, `limit`

**Success response `200`:**

```json
{
  "data": {
    "halaqat": [
      {
        "id": "...",
        "name": "حلقة الإيمان",
        "description": "...",
        "created_by": "...",
        "created_at": "...",
        "updated_at": "...",
        "student_count": 12,
        "teacher_count": 2
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 50
  }
}
```

> [!NOTE]
> `student_count` and `teacher_count` are included for Mushrif and Teacher views. Student view omits them.

---

### `GET /api/halaqat/:id`

Returns the halaqa **with its teachers and students** nested. Teachers and students receive `403 Access denied` unless they belong to the halaqa.

**Success response `200`:**

```json
{
  "data": {
    "id": "...",
    "name": "حلقة الإيمان",
    "description": "...",
    "created_by": "...",
    "created_at": "...",
    "updated_at": "...",
    "teachers": [
      { "id": "...", "username": "ahmed.k", "full_name": "أحمد كريم", "assigned_at": "..." }
    ],
    "students": [
      { "id": "...", "username": "omar.s", "full_name": "عمر سعيد", "enrolled_at": "..." }
    ]
  }
}
```

---

### `PUT /api/halaqat/:id`

**Request body** (at least one field):

```json
{
  "name": "حلقة النور",
  "description": "Updated description"
}
```

**Success response `200`:** Updated halaqa object.

---

### `DELETE /api/halaqat/:id`

Soft-deletes the halaqa.

**Success response `200`:**

```json
{ "data": { "message": "Halaqa deleted", "id": "...", "name": "حلقة الإيمان" } }
```

---

## 5. Enrollment

> All enrollment endpoints are under `/api/halaqat/:halaqaId/`.  
> `GET` list: Mushrif, or a member of that halaqa.  `POST`, `DELETE`: Mushrif only.

### Teachers

#### `GET /api/halaqat/:halaqaId/teachers`

```json
{
  "data": [
    { "id": "...", "username": "ahmed.k", "full_name": "أحمد كريم", "assigned_at": "..." }
  ]
}
```

#### `POST /api/halaqat/:halaqaId/teachers`

```json
// Request
{ "teacher_id": "uuid-of-teacher" }

// Response 201
{
  "data": {
    "id": "assignment-uuid",
    "halaqa_id": "...",
    "teacher_id": "...",
    "assigned_at": "..."
  }
}
```

**Errors:** `404` Teacher/Halaqa not found | `409` Already assigned

#### `DELETE /api/halaqat/:halaqaId/teachers/:teacherId`

```json
{ "data": { "message": "Teacher removed", "id": "...", "halaqa_id": "...", "teacher_id": "...", "removed_at": "..." } }
```

---

### Students

#### `GET /api/halaqat/:halaqaId/students`

```json
{
  "data": [
    { "id": "...", "username": "omar.s", "full_name": "عمر سعيد", "enrolled_at": "..." }
  ]
}
```

#### `POST /api/halaqat/:halaqaId/students`

```json
// Request
{ "student_id": "uuid-of-student" }

// Response 201
{
  "data": {
    "id": "enrollment-uuid",
    "halaqa_id": "...",
    "student_id": "...",
    "enrolled_at": "..."
  }
}
```

#### `POST /api/halaqat/:halaqaId/students/bulk`

Enroll multiple students at once. Partial failures are reported per student.

```json
// Request
{ "student_ids": ["uuid-1", "uuid-2", "uuid-3"] }

// Response 201
{
  "data": {
    "enrolled": [
      { "id": "...", "halaqa_id": "...", "student_id": "uuid-1", "enrolled_at": "..." },
      { "id": "...", "halaqa_id": "...", "student_id": "uuid-2", "enrolled_at": "..." }
    ],
    "errors": [
      { "student_id": "uuid-3", "error": "Student is already enrolled in this halaqa" }
    ]
  }
}
```

#### `DELETE /api/halaqat/:halaqaId/students/:studentId`

```json
{ "data": { "message": "Student withdrawn", "id": "...", "halaqa_id": "...", "student_id": "...", "left_at": "..." } }
```

---

## 6. Sessions

### `POST /api/sessions`

> **Teacher only** — starts a live session for a halaqa.

Side effects:
1. Auto-marks teacher attendance as `present` for today
2. Auto-creates `not_recorded` student attendance rows for all enrolled students

```json
// Request
{ "halaqa_id": "uuid-of-halaqa" }

// Response 201
{
  "data": {
    "id": "session-uuid",
    "halaqa_id": "...",
    "teacher_id": "...",
    "status": "active",
    "started_at": "2026-11-22T10:00:00.000Z",
    "created_at": "..."
  }
}
```

**Errors:**

| Status | Error |
|--------|-------|
| 403 | You are not assigned to this halaqa |
| 409 | This halaqa already has an active session |

---

### `GET /api/sessions`

> Mushrif sees all sessions. Teacher sees only their own.

**Query parameters:**

| Param | Type | Notes |
|-------|------|-------|
| `halaqa_id` | uuid | Filter by halaqa |
| `teacher_id` | uuid | Filter by teacher (Mushrif only; ignored for teachers) |
| `status` | string | `active`, `completed`, or `abandoned` |
| `page` | int | |
| `limit` | int | |

**Success response `200`:**

```json
{
  "data": {
    "sessions": [
      {
        "id": "...",
        "halaqa_id": "...",
        "teacher_id": "...",
        "status": "completed",
        "started_at": "...",
        "ended_at": "...",
        "closed_by": "...",
        "notes": "Good session",
        "halaqa_name": "حلقة الإيمان",
        "teacher_name": "أحمد كريم"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 50
  }
}
```

---

### `GET /api/sessions/active/:halaqaId`

Returns the currently active session for a halaqa, or `null`. Teachers must be assigned to the halaqa.

```json
{ "data": { "id": "...", "status": "active", ... } }
// or
{ "data": null }
```

---

### `GET /api/sessions/:id`

Returns full session details. Teachers can only view sessions from their assigned halaqat.

```json
{
  "data": {
    "id": "...",
    "halaqa_id": "...",
    "teacher_id": "...",
    "status": "active",
    "started_at": "...",
    "ended_at": null,
    "closed_by": null,
    "notes": null,
    "created_at": "...",
    "updated_at": "...",
    "halaqa_name": "حلقة الإيمان",
    "teacher_name": "أحمد كريم"
  }
}
```

---

### `POST /api/sessions/:id/complete`

> **Teacher only** — only the session's own teacher can complete it.

```json
{
  "data": {
    "id": "...",
    "status": "completed",
    "ended_at": "2026-11-22T12:00:00.000Z",
    "closed_by": "teacher-uuid",
    ...
  }
}
```

---

### `POST /api/sessions/:id/abandon`

> **Mushrif only** — force-close a forgotten session.

```json
{
  "data": {
    "id": "...",
    "status": "abandoned",
    "ended_at": "...",
    "closed_by": "mushrif-uuid",
    ...
  }
}
```

---

### `PATCH /api/sessions/:id/notes`

```json
// Request
{ "notes": "Student performance was excellent today" }

// Response 200
{ "data": { "id": "...", "notes": "...", "updated_at": "..." } }
```

---

## 7. Attendance

### Student Attendance

#### `POST /api/attendance/sessions/:sessionId/attendance`

> **Teacher only** — mark a single student. The caller must be the teacher who started the session.

```json
// Request
{
  "student_id": "uuid-of-student",
  "status": "present"               // "present" | "absent" | "not_recorded"
}

// Response 200
{
  "data": {
    "id": "...",
    "session_id": "...",
    "student_id": "...",
    "status": "present",
    "marked_at": "...",
    "marked_by": "teacher-uuid"
  }
}
```

---

#### `POST /api/attendance/sessions/:sessionId/attendance/bulk`

> **Teacher only** — mark multiple students at once. The caller must be the teacher who started the session.

```json
// Request
{
  "entries": [
    { "student_id": "uuid-1", "status": "present" },
    { "student_id": "uuid-2", "status": "absent" },
    { "student_id": "uuid-3", "status": "present" }
  ]
}

// Response 200
{
  "data": {
    "updated": [
      { "id": "...", "session_id": "...", "student_id": "uuid-1", "status": "present", "marked_at": "..." },
      { "id": "...", "session_id": "...", "student_id": "uuid-2", "status": "absent", "marked_at": "..." },
      { "id": "...", "session_id": "...", "student_id": "uuid-3", "status": "present", "marked_at": "..." }
    ],
    "errors": []
  }
}
```

**Error:** `400` Attendance can only be modified in an active session

---

#### `GET /api/attendance/sessions/:sessionId/attendance`

> Mushrif, or a teacher assigned to the session's halaqa.

```json
{
  "data": [
    {
      "id": "...",
      "student_id": "...",
      "status": "present",
      "marked_at": "...",
      "marked_by": "...",
      "username": "omar.s",
      "full_name": "عمر سعيد"
    }
  ]
}
```

---

#### `GET /api/attendance/students/:studentId/attendance`

> Mushrif: any student. Teacher: students in their halaqat. Student: own id only.

**Query:** `page`, `limit`

```json
{
  "data": {
    "attendance": [
      {
        "id": "...",
        "session_id": "...",
        "status": "present",
        "marked_at": "...",
        "session_date": "2026-11-22T10:00:00.000Z",
        "halaqa_name": "حلقة الإيمان"
      }
    ],
    "total": 30,
    "page": 1,
    "limit": 50
  }
}
```

---

### Teacher Attendance

#### `GET /api/attendance/teacher-attendance`

> **Mushrif only**

**Query parameters:**

| Param | Type | Notes |
|-------|------|-------|
| `teacher_id` | uuid | Filter by teacher |
| `from_date` | date | `YYYY-MM-DD` |
| `to_date` | date | `YYYY-MM-DD` |
| `page` | int | |
| `limit` | int | |

```json
{
  "data": {
    "attendance": [
      {
        "id": "...",
        "teacher_id": "...",
        "attendance_date": "2026-11-22",
        "status": "present",
        "session_id": "...",
        "marked_by": null,
        "note": null,
        "username": "ahmed.k",
        "full_name": "أحمد كريم"
      }
    ],
    "total": 20,
    "page": 1,
    "limit": 50
  }
}
```

---

#### `POST /api/attendance/teacher-attendance/:teacherId`

> **Mushrif only** — manually set or correct a teacher's attendance.

```json
// Request
{
  "attendance_date": "2026-11-22",
  "status": "absent",                  // "present" | "absent" | "not_recorded"
  "note": "Called in sick"             // optional
}

// Response 200
{
  "data": {
    "id": "...",
    "teacher_id": "...",
    "attendance_date": "2026-11-22",
    "status": "absent",
    "marked_by": "mushrif-uuid",
    "note": "Called in sick"
  }
}
```

---

## 8. Recitation

### `POST /api/recitations`

> **Teacher only** — add a hifz or murajaa entry. The caller must own the session. Student must be marked `present`.

```json
// Request
{
  "session_id": "uuid-of-active-session",
  "student_id": "uuid-of-student",
  "entry_type": "hifz",                   // "hifz" | "murajaa"
  "surah_number": 2,                      // 1–114
  "from_ayah": 1,                         // ≥ 1
  "to_ayah": 10,                          // ≥ from_ayah
  "notes": "Excellent tajweed"            // optional
}

// Response 201
{
  "data": {
    "id": "entry-uuid",
    "session_id": "...",
    "student_id": "...",
    "entry_type": "hifz",
    "surah_number": 2,
    "from_ayah": 1,
    "to_ayah": 10,
    "recorded_by": "teacher-uuid",
    "notes": "Excellent tajweed",
    "created_at": "..."
  }
}
```

**Errors:**

| Status | Error |
|--------|-------|
| 403 | Access denied | Caller is not the session teacher |
| 400 | Recitation entries can only be added to an active session |
| 400 | Student is not enrolled in this session's halaqa |
| 400 | Recitation entries can only be added for students marked present |
| 400 | surah_number must be an integer between 1 and 114 |
| 400 | to_ayah must be >= from_ayah |

> [!IMPORTANT]
> A recitation range must stay within **one surah**. If the student recited across two surahs (e.g. end of Al-Baqarah into Aal-Imran), create **two separate entries**.

---

### `GET /api/recitations/session/:sessionId`

> Mushrif, or a teacher assigned to the session's halaqa.

**Query:** `page`, `limit`

```json
{
  "data": {
    "entries": [
      {
        "id": "...",
        "student_id": "...",
        "entry_type": "hifz",
        "surah_number": 2,
        "from_ayah": 1,
        "to_ayah": 10,
        "recorded_by": "...",
        "notes": "...",
        "created_at": "...",
        "student_name": "عمر سعيد",
        "student_username": "omar.s",
        "surah_name_ar": "البقرة",
        "surah_name_en": "Al-Baqarah"
      }
    ],
    "total": 8,
    "page": 1,
    "limit": 50
  }
}
```

> [!NOTE]
> `surah_name_ar` and `surah_name_en` will be `null` until the `surahs` table is seeded.

---

### `GET /api/recitations/student/:studentId`

> Mushrif: any student. Teacher: students in their halaqat. Student: own id only.

**Query parameters:**

| Param | Type | Notes |
|-------|------|-------|
| `entry_type` | string | `hifz` or `murajaa` |
| `surah_number` | int | Filter by surah |
| `page` | int | |
| `limit` | int | |

```json
{
  "data": {
    "entries": [
      {
        "id": "...",
        "session_id": "...",
        "entry_type": "hifz",
        "surah_number": 2,
        "from_ayah": 1,
        "to_ayah": 10,
        "notes": "...",
        "created_at": "...",
        "surah_name_ar": "البقرة",
        "surah_name_en": "Al-Baqarah",
        "session_date": "2026-11-22T10:00:00.000Z",
        "halaqa_name": "حلقة الإيمان"
      }
    ],
    "summary": {
      "hifz":    { "entries": 25, "ayat": 320 },
      "murajaa": { "entries": 40, "ayat": 580 }
    },
    "total": 65,
    "page": 1,
    "limit": 50
  }
}
```

> [!TIP]
> The `summary` object is always returned with **all-time totals** (not filtered by query params). Use it to show "Total Ayat memorized" on the student's profile.

---

### `DELETE /api/recitations/:id`

> **Teacher only** — soft-deletes the entry. The caller must own the session the entry belongs to.

```json
{ "data": { "message": "Recitation entry deleted", "id": "...", "session_id": "...", "student_id": "..." } }
```

---

## 9. Dashboard & Reporting

### `GET /api/dashboard/mushrif`

> **Mushrif only** — center-wide stats at a glance.

```json
{
  "data": {
    "active_halaqat": 5,
    "total_students": 48,
    "total_teachers": 6,
    "active_sessions": 2,
    "today_student_attendance": {
      "present": 35,
      "absent": 8,
      "not_recorded": 5
    },
    "today_teacher_attendance": {
      "present": 4,
      "absent": 1,
      "not_recorded": 1
    },
    "recent_sessions": [
      {
        "id": "...",
        "status": "completed",
        "started_at": "...",
        "ended_at": "...",
        "halaqa_name": "حلقة الإيمان",
        "teacher_name": "أحمد كريم"
      }
    ]
  }
}
```

---

### `GET /api/dashboard/student/:studentId`

> Mushrif: any student. Teacher: students in their halaqat. Student: own id only.

```json
{
  "data": {
    "hifz": {
      "entries": 25,
      "total_ayat": 320
    },
    "murajaa": {
      "entries": 40,
      "total_ayat": 580
    },
    "attendance": {
      "present": 28,
      "absent": 2,
      "not_recorded": 0,
      "total": 30,
      "percentage": 93
    },
    "last_entry": {
      "entry_type": "hifz",
      "surah_number": 3,
      "from_ayah": 1,
      "to_ayah": 15,
      "created_at": "...",
      "surah_name_ar": "آل عمران",
      "surah_name_en": "Aal-Imran"
    },
    "surahs_covered": [
      { "surah_number": 1, "name_ar": "الفاتحة", "name_en": "Al-Fatihah" },
      { "surah_number": 2, "name_ar": "البقرة", "name_en": "Al-Baqarah" },
      { "surah_number": 3, "name_ar": "آل عمران", "name_en": "Aal-Imran" }
    ]
  }
}
```

---

### `GET /api/dashboard/teacher-logs`

> **Mushrif only** — session history with per-session stats.

**Query parameters:**

| Param | Type | Notes |
|-------|------|-------|
| `teacher_id` | uuid | Filter by teacher |
| `from_date` | datetime | ISO 8601 |
| `to_date` | datetime | ISO 8601 |
| `page` | int | |
| `limit` | int | |

```json
{
  "data": {
    "logs": [
      {
        "id": "session-uuid",
        "halaqa_id": "...",
        "teacher_id": "...",
        "status": "completed",
        "started_at": "...",
        "ended_at": "...",
        "halaqa_name": "حلقة الإيمان",
        "teacher_name": "أحمد كريم",
        "students_present": 10,
        "recitation_count": 8
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 50
  }
}
```

---

## Appendix: HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Not authenticated / wrong credentials |
| 403 | Forbidden (wrong role, deactivated, must change password) |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 500 | Internal server error |

---

## Appendix: Session Lifecycle Flow

```
                 Teacher
                   │
         POST /sessions {halaqa_id}
                   │
                   ▼
            ┌─────────────┐
            │   ACTIVE     │◄── auto: teacher_attendance = present
            │              │◄── auto: student_attendance rows (not_recorded)
            └──────┬───────┘
                   │
         ┌─────────┴──────────┐
         │                    │
    Teacher:              Mushrif:
  POST /:id/complete    POST /:id/abandon
         │                    │
         ▼                    ▼
   ┌───────────┐      ┌────────────┐
   │ COMPLETED │      │ ABANDONED  │
   └───────────┘      └────────────┘
```

During **ACTIVE** status the teacher can:
1. Mark attendance → `POST /attendance/sessions/:id/attendance`
2. Add recitation → `POST /recitations` (only for students marked `present`)
3. Complete → `POST /sessions/:id/complete`
