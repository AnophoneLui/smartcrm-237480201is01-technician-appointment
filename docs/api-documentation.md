# API Documentation – Smart CRM Mekong Mobile

**Module:** L4 – Technician Assignment and Appointment Scheduling  
**Version:** BT3 / Release Candidate v1.0  
**Base URL:** `http://localhost:3015/api`  
**Format:** JSON (UTF-8)

## 1. Overview

This document describes the REST API implemented for the Smart CRM Mekong Mobile L4 module.

The API supports service ticket management, technician recommendations and assignment, ticket status updates, and appointment scheduling.

This document is based on the implemented Express routes, service logic, validation rules, and API data contract.

## 2. Authentication and Authorization

Authentication and role-based authorization have not been implemented in this academic prototype.

The application uses a fixed demonstration user identifier for certain audit log operations.

The API is intended for local demonstration and testing only. It must not be exposed publicly without appropriate authentication, authorization, and security controls.

## 3. Data Conventions

- Request and response bodies use JSON.
- Ticket creation and update requests use database-oriented field names such as `ticket_code` and `center_id`.
- Ticket response objects use camelCase field names such as `ticketCode` and `centerId`.
- Appointment request field: `gioHen`.
- Date-time values in API responses use ISO 8601 UTC format.
- Successful responses use the structure `{ "data": ... }`.
- Error responses use `{ "error": "...", "message": "...", "fields": {...} }`, where `fields` is optional.
- Unexpected server errors may include `maTraCuu`.

## 4. API Endpoint Summary

| No. | Method | Endpoint | Description |
|---|---|---|---|
| 1 | GET | `/api/tickets` | List and filter service tickets |
| 2 | GET | `/api/tickets/:id` | Get ticket details |
| 3 | POST | `/api/tickets` | Create a service ticket |
| 4 | PUT | `/api/tickets/:id` | Update a service ticket |
| 5 | DELETE | `/api/tickets/:id` | Soft-delete a service ticket |
| 6 | GET | `/api/tickets/:id/suggestions` | Get technician recommendations |
| 7 | PATCH | `/api/tickets/:id/technician` | Assign a technician |
| 8 | PUT | `/api/tickets/:id/technician` | Change the assigned technician |
| 9 | PATCH | `/api/tickets/:id/status` | Update ticket status |
| 10 | GET | `/api/tickets/:id/appointments` | List ticket appointments |
| 11 | POST | `/api/tickets/:id/appointments` | Create an appointment |
| 12 | PUT | `/api/tickets/:id/appointments/current` | Reschedule the current appointment |
| 13 | DELETE | `/api/tickets/:id/appointments/current` | Cancel the current appointment |

## 5. Common Error Responses

| HTTP Status | Example Error Code | Description |
|---|---|---|
| 400 | `ID_KHONG_HOP_LE` | Invalid ticket identifier |
| 400 | `JSON_KHONG_HOP_LE` | Invalid JSON request |
| 404 | `KHONG_TIM_THAY_PHIEU` | Ticket not found |
| 404 | `KHONG_CO_LICH_HEN` | No active appointment to cancel |
| 409 | `TRUNG_LICH` | Appointment scheduling conflict |
| 409 | `CHUA_PHAN_CONG` | Ticket has no assigned technician |
| 409 | `LICH_DA_THAY_DOI` | Appointment state conflict |
| 409 | `TRANG_THAI_KHONG_DOI` | Ticket status remains unchanged |
| 422 | `DU_LIEU_KHONG_HOP_LE` | Invalid request data |
| 422 | `GIO_HEN_QUA_KHU` | Appointment time is in the past |
| 422 | `LY_DO_KHONG_HOP_LE` | Invalid technician change reason |
| 500 | `LOI_HE_THONG` | Unexpected server error |

The endpoint-specific sections below will provide request parameters, JSON examples, success responses, and applicable error codes.


## 6. Endpoint Details

### API 01 – List Service Tickets

**Method:** GET  
**URL:** `/api/tickets`

**Query Parameters:**

| Parameter | Description |
|---|---|
| `status` | Optional. One or more comma-separated ticket statuses |
| `center_id` | Optional. Filter by service center |
| `limit` | Optional. Default 20, maximum 100 |
| `offset` | Optional. Default 0 |

**Request Body:** None.

**Example Request:**
```http
GET /api/tickets?status=NEW&limit=20&offset=0

```

**Success Response:** HTTP 200.

```json
{
  "data": []
}
```

The data array contains ticket objects matching the filters. An empty array means no matching tickets.

**Error Responses:** HTTP 422 `DU_LIEU_KHONG_HOP_LE` for an invalid status filter.

**Authentication/Authorization:** Not implemented in this prototype.

### API 02 – Get Ticket Details

**Method:** GET

**URL:** `/api/tickets/:id`

**Path Parameters:**

| Parameter | Description |
|---|---|
| `id` | Required. Positive integer ticket identifier |

**Request Body:** None.

**Example Request:** `GET /api/tickets/1`

**Success Response:** HTTP 200.

Example JSON (illustrative, not a verified runtime response):

```json
{
  "data": {
    "ticketId": 1,
    "ticketCode": "TK-001",
    "centerId": 1,
    "tenNhomSuCo": null,
    "uuTien": "HIGH",
    "trangThai": "NEW",
    "hanCamKet": "2026-11-20T10:00:00.000Z",
    "kyThuatVien": null
  }
}
```

**Error Responses:**
- HTTP 400 `ID_KHONG_HOP_LE` – Invalid ticket ID.
- HTTP 404 `KHONG_TIM_THAY_PHIEU` – Ticket not found.

**Authentication/Authorization:** Not implemented in this prototype.

### API 03 – Create Service Ticket

**Method:** POST

**URL:** `/api/tickets`

**Path Parameters:** None.

**Request Body:** Required, JSON format.

| Field | Type | Description |
|---|---|---|
| `ticket_code` | String | Required. Unique ticket code, maximum 20 characters |
| `center_id` | Integer | Required. Positive service center ID |
| `category_id` | Integer | Required. Positive incident category ID |
| `priority` | String | Required. `LOW`, `MEDIUM`, `HIGH`, or `URGENT` |
| `due_date` | String | Required. Valid date/time |
| `status` | String | Optional. Defaults to `NEW` |

**Example Request:**

```http
POST /api/tickets
Content-Type: application/json
```

```json
{
  "ticket_code": "TK-002",
  "center_id": 1,
  "category_id": 1,
  "priority": "HIGH",
  "due_date": "2026-12-01T10:00:00.000Z"
}
```

**Success Response:** HTTP 201 Created.

Example JSON (illustrative, not a verified runtime response):

```json
{
  "data": {
    "ticketId": 2,
    "ticketCode": "TK-002",
    "centerId": 1,
    "tenNhomSuCo": "Screen issue",
    "uuTien": "HIGH",
    "trangThai": "NEW",
    "hanCamKet": "2026-12-01T10:00:00.000Z",
    "kyThuatVien": null
  }
}
```

**Error Responses:**
- HTTP 422 `DU_LIEU_KHONG_HOP_LE` – Missing or invalid request fields.
- HTTP 409 – Ticket code already exists, if rejected by the database constraint.
- HTTP 500 `LOI_HE_THONG` – Unexpected server error.

**Authentication/Authorization:** Not implemented in this prototype.

### API 04 – Update Service Ticket

**Method:** PUT

**URL:** `/api/tickets/:id`

**Path Parameters:**

| Parameter | Description |
|---|---|
| `id` | Required. Positive integer ticket identifier |

**Request Body:** JSON object containing the ticket fields to update.

| Field | Type | Description |
|---|---|---|
| `ticket_code` | String | Optional. Ticket code, maximum 20 characters |
| `center_id` | Integer | Optional. Positive service center ID |
| `category_id` | Integer | Optional. Positive incident category ID |
| `priority` | String | Optional. `LOW`, `MEDIUM`, `HIGH`, or `URGENT` |
| `due_date` | String | Optional. Valid date/time |
| `status` | String | Not allowed. Use the status endpoint instead |

**Example Request:**

```http
PUT /api/tickets/1
Content-Type: application/json
```

```json
{
  "priority": "URGENT",
  "due_date": "2026-12-05T10:00:00.000Z"
}
```

**Success Response:** HTTP 200 OK.

Example JSON (illustrative, not a verified runtime response):

```json
{
  "data": {
    "ticketId": 1,
    "ticketCode": "TK-001",
    "centerId": 1,
    "tenNhomSuCo": null,
    "uuTien": "URGENT",
    "trangThai": "NEW",
    "hanCamKet": "2026-12-05T10:00:00.000Z",
    "kyThuatVien": null
  }
}
```

**Error Responses:**
- HTTP 400 `ID_KHONG_HOP_LE` – Invalid ticket ID.
- HTTP 404 `KHONG_TIM_THAY_PHIEU` – Ticket not found.
- HTTP 422 `DU_LIEU_KHONG_HOP_LE` – Invalid ticket fields.
- HTTP 422 `CAP_NHAT_TRANG_THAI_KHONG_HOP_LE` – Status changes must use PATCH /api/tickets/:id/status.
- HTTP 500 `LOI_HE_THONG` – Unexpected server error.

**Authentication/Authorization:** Not implemented in this prototype.

### API 05 – Delete Service Ticket

**Method:** DELETE

**URL:** `/api/tickets/:id`

**Path Parameters:**

| Parameter | Description |
|---|---|
| `id` | Required. Positive integer ticket identifier |

**Request Body:** None.

**Example Request:**

```http
DELETE /api/tickets/1
```

**Success Response:** HTTP 200 OK.

The ticket is soft-deleted rather than permanently removed from the database.

**Example Response:**

```json

{
  "data": {
    "ticketId": 1,
    "deleted": true
  }
}
```

*Note: The response above is illustrative and must be verified against the actual API implementation.*

**Error Responses:**
- HTTP 400 `ID_KHONG_HOP_LE` – Invalid ticket ID.
- HTTP 404 `KHONG_TIM_THAY_PHIEU` – Ticket not found.
- HTTP 500 `LOI_HE_THONG` – Unexpected server error.

**Authentication/Authorization:** Not implemented in this prototype.

### API 06 – Get Technician Suggestions

**Method:** GET

**URL:** `/api/tickets/:id/suggestions`

**Path Parameters:**

| Parameter | Description |
|---|---|
| `id` | Required. Positive integer ticket identifier |

**Request Body:** None.

**Example Request:**

```http
GET /api/tickets/1/suggestions
```

**Success Response:** HTTP 200 OK.

Example JSON (illustrative, not a verified runtime response):

```json
{
  "data": [
    {
      "id": 1,
      "hoTen": "Example Technician",
      "tayNghe": 4,
      "soPhieuDangXuLy": 2
    }
  ]
}
```

The API returns suggested technicians based on the ticket's assignment criteria. An empty array indicates that no suitable technicians were found.

**Error Responses:**
- HTTP 400 `ID_KHONG_HOP_LE` – Invalid ticket ID.
- HTTP 404 `KHONG_TIM_THAY_PHIEU` – Ticket not found.
- HTTP 500 `LOI_HE_THONG` – Unexpected server error.

**Authentication/Authorization:** Not implemented in this prototype.

### API 07 – Assign Technician

**Method:** PATCH

**URL:** `/api/tickets/:id/technician`

**Path Parameters:**

| Parameter | Description |
|---|---|
| `id` | Required. Positive integer ticket identifier |

**Request Body:** JSON object.

| Field | Type | Description |
|---|---|---|
| `technicianId` | Integer | Required. Positive integer technician ID |
| `reason` | String | Optional. Reason for assignment |

**Example Request:**

```http
PATCH /api/tickets/1/technician
Content-Type: application/json
```

```json
{
  "technicianId": 1,
  "reason": "Assigned based on technical skills and availability"
}
```

**Success Response:** HTTP 200 OK.

Example JSON (illustrative, not a verified runtime response):

```json
{
  "data": {
    "ticketId": 1,
    "ticketCode": "TK-001",
    "centerId": 1,
    "tenNhomSuCo": null,
    "uuTien": "HIGH",
    "trangThai": "ASSIGNED",
    "hanCamKet": "2026-11-20T10:00:00.000Z",
    "kyThuatVien": {
      "id": 1,
      "hoTen": "Example Technician"
    }
  }
}
```

**Error Responses:**
- HTTP 400 `ID_KHONG_HOP_LE` – Invalid ticket ID.
- HTTP 404 `KHONG_TIM_THAY_PHIEU` – Ticket not found.
- HTTP 422 `DU_LIEU_KHONG_HOP_LE` – Invalid or missing technician ID.
- HTTP 422 `KY_THUAT_VIEN_KHONG_DU_DIEU_KIEN` – Technician does not belong to the required service center or lacks the required proficiency.
- HTTP 409 `PHIEU_DA_THAY_DOI` – Ticket is no longer in `NEW` status or its assignment has changed.

**Authentication/Authorization:** Not implemented in this prototype.

**Business Rules:** The ticket must be eligible for assignment, and the selected technician must satisfy the applicable assignment conditions. Assignment changes are recorded in the assignment log.

### API 08 – Change Assigned Technician

**Method:** PUT

**URL:** `/api/tickets/:id/technician`

**Path Parameters:**

| Parameter | Description |
|---|---|
| `id` | Required. Positive integer ticket identifier |

**Request Body:** Required, JSON format.

| Field | Type | Description |
|---|---|---|
| `technicianId` | Integer | Required. Positive integer ID of the new technician |
| `reason` | String | Required. Reason for reassignment, 1–255 characters after trimming |

**Example Request:**

```http
PUT /api/tickets/1/technician
Content-Type: application/json
```

```json
{
  "technicianId": 2,
  "reason": "The original technician is unavailable"
}
```

**Success Response:** HTTP 200 OK.

Example JSON (illustrative, not a verified runtime response):

```json
{
  "data": {
    "ticketId": 1,
    "ticketCode": "TK-001",
    "centerId": 1,
    "tenNhomSuCo": null,
    "uuTien": "HIGH",
    "trangThai": "ASSIGNED",
    "hanCamKet": "2026-12-05T10:00:00.000Z",
    "kyThuatVien": {
      "id": 2,
      "hoTen": "New Technician"
    }
  }
}
```

**Error Responses:**
- HTTP 400 `ID_KHONG_HOP_LE` – Invalid ticket ID.
- HTTP 404 `KHONG_TIM_THAY_PHIEU` – Ticket not found.
- HTTP 422 `KY_THUAT_VIEN_KHONG_HOP_LE` – Invalid technician ID.
- HTTP 422 `LY_DO_KHONG_HOP_LE` – Missing or invalid reassignment reason.
- HTTP 422 `KY_THUAT_VIEN_KHONG_DU_DIEU_KIEN` – Technician does not meet the required conditions.
- HTTP 409 `CHUA_PHAN_CONG` – Ticket has no assigned technician.
- HTTP 409 `PHIEU_DA_HOAN_TAT` – Ticket is already completed.
- HTTP 409 `TRUNG_KY_THUAT_VIEN` – New technician is the same as the current technician.
- HTTP 409 `DANG_CO_LICH_HEN` – Cancel the active appointment before changing technicians.

**Authentication/Authorization:** Not implemented in this prototype.

**Business Rules:** Reassignment requires a valid reason and an eligible new technician. The operation is not permitted when the ticket has an active appointment or has already reached a completed state. Successful reassignment is recorded in the assignment log.

### API 09 – Update Ticket Status

**Method:** PATCH

**URL:** `/api/tickets/:id/status`

**Path Parameters:**

| Parameter | Description |
|---|---|
| `id` | Required. Positive integer ticket identifier |

**Request Body:** Required, JSON format.

| Field | Type | Description |
|---|---|---|
| `status` | String | Required. New ticket status: `NEW`, `ASSIGNED`, `IN_PROGRESS`, `WAITING`, `COMPLETED`, or `CLOSED` |

**Example Request:**

```http
PATCH /api/tickets/1/status
Content-Type: application/json
```

```json
{
  "status": "IN_PROGRESS"
}
```

**Success Response:** HTTP 200 OK.

Example JSON (illustrative, not a verified runtime response):

```json
{
  "data": {
    "ticketId": 1,
    "ticketCode": "TK-001",
    "centerId": 1,
    "tenNhomSuCo": null,
    "uuTien": "HIGH",
    "trangThai": "IN_PROGRESS",
    "hanCamKet": "2026-12-05T10:00:00.000Z",
    "kyThuatVien": {
      "id": 2,
      "hoTen": "Example Technician"
    }
  }
}
```

**Error Responses:**
- HTTP 400 `ID_KHONG_HOP_LE` – Invalid ticket ID.
- HTTP 404 `KHONG_TIM_THAY_PHIEU` – Ticket not found.
- HTTP 422 `TRANG_THAI_KHONG_HOP_LE` – Invalid status value.
- HTTP 409 `TRANG_THAI_KHONG_DOI` – The requested status is the same as the current status.
- HTTP 500 `LOI_HE_THONG` – Unexpected server error.

**Authentication/Authorization:** Not implemented in this prototype.

**Business Rules:** The new status must be valid and different from the current status. Successful status changes are recorded in the ticket status log.

### API 10 – List Ticket Appointments

**Method:** GET

**URL:** `/api/tickets/:id/appointments`

**Path Parameters:**

| Parameter | Description |
|---|---|
| `id` | Required. Positive integer ticket identifier |

**Request Body:** None.

**Example Request:**

```http
GET /api/tickets/1/appointments
```

**Success Response:** HTTP 200 OK.

Example JSON (illustrative, not a verified runtime response):

```json
{
  "data": [
    {
      "appointmentId": 1,
      "ticketId": 1,
      "kyThuatVienId": 2,
      "gioHen": "2026-12-01T09:00:00.000Z"
    }
  ]
}
```

The API returns appointments associated with the specified ticket. An empty array indicates that no appointments were found.

**Error Responses:**
- HTTP 400 `ID_KHONG_HOP_LE` – Invalid ticket ID.
- HTTP 404 `KHONG_TIM_THAY_PHIEU` – Ticket not found.
- HTTP 500 `LOI_HE_THONG` – Unexpected server error.

**Authentication/Authorization:** Not implemented in this prototype.

**Business Rules:** This endpoint retrieves appointment information for a service ticket. Appointment timestamps are represented in ISO 8601 format.

### API 11 – Create Ticket Appointment

**Method:** POST

**URL:** `/api/tickets/:id/appointments`

**Path Parameters:**

| Parameter | Description |
|---|---|
| `id` | Required. Positive integer ticket identifier |

**Request Body:** Required, JSON format.

| Field | Type | Description |
|---|---|---|
| `gioHen` | String | Required. Future appointment date/time in ISO 8601 format with timezone |

**Example Request:**

```http
POST /api/tickets/1/appointments
Content-Type: application/json
```

```json
{
  "gioHen": "2026-12-01T09:00:00.000Z"
}
```

**Success Response:** HTTP 201 Created.

Example JSON (illustrative, not a verified runtime response):

```json
{
  "data": {
    "appointmentId": 1,
    "ticketId": 1,
    "kyThuatVienId": 2,
    "gioHen": "2026-12-01T09:00:00.000Z"
  }
}
```

**Error Responses:**
- HTTP 400 `ID_KHONG_HOP_LE` – Invalid ticket ID.
- HTTP 404 `KHONG_TIM_THAY_PHIEU` – Ticket not found.
- HTTP 409 `CHUA_PHAN_CONG` – Ticket has no assigned technician.
- HTTP 409 `TRUNG_LICH` – Appointment conflicts with another appointment.
- HTTP 422 `DU_LIEU_KHONG_HOP_LE` – Invalid appointment date/time.
- HTTP 422 `GIO_HEN_QUA_KHU` – Appointment date/time is in the past.
- HTTP 500 `LOI_HE_THONG` – Unexpected server error.
- HTTP 409 `LICH_DA_THAY_DOI` – An appointment already exists or its state has changed. Reload the page.
- HTTP 409 `PHIEU_DA_THAY_DOI` – The assigned technician has changed. Reload the page.

**Authentication/Authorization:** Not implemented in this prototype.

**Business Rules:** The ticket must have an assigned technician before an appointment can be created. The appointment time must be in the future. The system checks scheduling conflicts using a 60-minute appointment window. Only one active appointment is permitted per ticket.

### API 12 – Reschedule Ticket Appointment

**Method:** PUT

**URL:** `/api/tickets/:id/appointments/current`

**Path Parameters:**

| Parameter | Description |
|---|---|
| `id` | Required. Positive integer ticket identifier |

**Request Body:** Required, JSON format.

| Field | Type | Description |
|---|---|---|
| `gioHen` | String | Required. New appointment date/time in ISO 8601 format with timezone |

**Example Request:**

```http
PUT /api/tickets/1/appointments/current
Content-Type: application/json
```

```json
{
  "gioHen": "2026-12-02T09:00:00.000Z"
}
```

**Success Response:** HTTP 200 OK.

Example JSON (illustrative, not a verified runtime response):

```json
{
  "data": {
    "appointmentId": 1,
    "ticketId": 1,
    "kyThuatVienId": 2,
    "gioHen": "2026-12-02T09:00:00.000Z"
  }
}
```

**Error Responses:**
- HTTP 400 `ID_KHONG_HOP_LE` – Invalid ticket ID.
- HTTP 404 `KHONG_TIM_THAY_PHIEU` – Ticket not found.
- HTTP 409 `TRUNG_LICH` – New appointment time conflicts with another appointment.
- HTTP 409 `LICH_DA_THAY_DOI` – No active appointment exists or the appointment state has changed.
- HTTP 422 `DU_LIEU_KHONG_HOP_LE` – Invalid appointment date/time.
- HTTP 422 `GIO_HEN_QUA_KHU` – New appointment time is in the past.
- HTTP 500 `LOI_HE_THONG` – Unexpected server error.
- HTTP 409 `CHUA_PHAN_CONG` – Ticket has no assigned technician.
- HTTP 409 `PHIEU_DA_THAY_DOI` – The assigned technician has changed. Reload the page.

**Authentication/Authorization:** Not implemented in this prototype.

**Business Rules:** An active appointment must exist before it can be rescheduled. The new time must be in the future, and the system checks scheduling conflicts using a 60-minute appointment window.

### API 13 – Cancel Ticket Appointment

**Method:** DELETE

**URL:** `/api/tickets/:id/appointments/current`

**Path Parameters:**

| Parameter | Description |
|---|---|
| `id` | Required. Positive integer ticket identifier |

**Request Body:** None.

**Example Request:**

```http
DELETE /api/tickets/1/appointments/current
```

**Success Response:** HTTP 200 OK.

Example JSON (illustrative, not a verified runtime response):

```json
{
  "data": {
    "appointmentId": 1,
    "cancelled": true
  }
}
```

**Error Responses:**
- HTTP 400 `ID_KHONG_HOP_LE` – Invalid ticket ID.
- HTTP 404 `KHONG_TIM_THAY_PHIEU` – Ticket not found.
- HTTP 404 `KHONG_CO_LICH_HEN` – No active appointment exists to cancel.
- HTTP 500 `LOI_HE_THONG` – Unexpected server error.

**Authentication/Authorization:** Not implemented in this prototype.

**Business Rules:** Only an active appointment can be cancelled. Cancellation is implemented as a soft cancellation by marking the appointment as inactive (`is_active = false`), preserving the appointment record in the database.