# Kyndly ICHRA API Documentation

This document describes the API endpoints for the Kyndly ICHRA Portal.

## Base URL

All API endpoints are relative to: `https://api.kyndly.com/api` (production) or `http://localhost:5000/api` (development)

## Authentication

All API endpoints require authentication using Auth0. The client must include a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Employers

### Get All Employers

```
GET /employers
```

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Acme Corporation",
      "contactPerson": "John Doe",
      "email": "john.doe@acme.com",
      "phone": "555-123-4567",
      "address": "123 Main St, New York, NY 10001",
      "employeeCount": 120,
      "status": "active",
      "createdAt": "2023-07-20T14:30:00.000Z",
      "updatedAt": "2023-07-20T14:30:00.000Z"
    },
    // ...more employers
  ]
}
```

### Get Employer by ID

```
GET /employers/:id
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Acme Corporation",
    "contactPerson": "John Doe",
    "email": "john.doe@acme.com",
    "phone": "555-123-4567",
    "address": "123 Main St, New York, NY 10001",
    "employeeCount": 120,
    "status": "active",
    "createdAt": "2023-07-20T14:30:00.000Z",
    "updatedAt": "2023-07-20T14:30:00.000Z",
    "quotes": [
      // related quotes
    ],
    "documents": [
      // related documents
    ]
  }
}
```

### Create Employer

```
POST /employers
```

**Request Body**

```json
{
  "name": "Acme Corporation",
  "contactPerson": "John Doe",
  "email": "john.doe@acme.com",
  "phone": "555-123-4567",
  "address": "123 Main St, New York, NY 10001",
  "employeeCount": 120
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Acme Corporation",
    "contactPerson": "John Doe",
    "email": "john.doe@acme.com",
    "phone": "555-123-4567",
    "address": "123 Main St, New York, NY 10001",
    "employeeCount": 120,
    "status": "pending",
    "createdAt": "2023-07-20T14:30:00.000Z",
    "updatedAt": "2023-07-20T14:30:00.000Z"
  },
  "message": "Employer created successfully"
}
```

### Update Employer

```
PUT /employers/:id
```

**Request Body**

```json
{
  "name": "Acme Corporation, Inc.",
  "contactPerson": "Jane Smith",
  "email": "jane.smith@acme.com",
  "phone": "555-987-6543",
  "address": "456 Park Ave, New York, NY 10022",
  "employeeCount": 150,
  "status": "active"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Acme Corporation, Inc.",
    "contactPerson": "Jane Smith",
    "email": "jane.smith@acme.com",
    "phone": "555-987-6543",
    "address": "456 Park Ave, New York, NY 10022",
    "employeeCount": 150,
    "status": "active",
    "createdAt": "2023-07-20T14:30:00.000Z",
    "updatedAt": "2023-07-20T15:45:00.000Z"
  },
  "message": "Employer updated successfully"
}
```

### Delete Employer

```
DELETE /employers/:id
```

**Response**

```json
{
  "success": true,
  "message": "Employer deleted successfully"
}
```

## Quotes

### Get All Quotes

```
GET /quotes
```

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "660f9500-f30c-42e5-b817-557766550000",
      "employerId": "550e8400-e29b-41d4-a716-446655440000",
      "planType": "Standard ICHRA",
      "coverageDetails": "Full medical coverage for employees",
      "employeeCount": 120,
      "effectiveDate": "2023-09-01T00:00:00.000Z",
      "expirationDate": "2024-08-31T23:59:59.000Z",
      "monthlyCost": 12000,
      "annualCost": 144000,
      "status": "approved",
      "createdAt": "2023-07-20T14:35:00.000Z",
      "updatedAt": "2023-07-22T16:20:00.000Z"
    },
    // ...more quotes
  ]
}
```

### Get Quotes with Filters

```
GET /quotes/filter?status=pending&employerId=550e8400-e29b-41d4-a716-446655440000
```

Supported query parameters:
- `status`: Filter by status (pending, processing, approved, rejected)
- `employerId`: Filter by employer
- `startDate`: Filter by effective date (start range)
- `endDate`: Filter by effective date (end range)

**Response**

```json
{
  "success": true,
  "data": [
    // filtered quotes
  ]
}
```

### Get Quote by ID

```
GET /quotes/:id
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "660f9500-f30c-42e5-b817-557766550000",
    "employerId": "550e8400-e29b-41d4-a716-446655440000",
    "planType": "Standard ICHRA",
    "coverageDetails": "Full medical coverage for employees",
    "employeeCount": 120,
    "effectiveDate": "2023-09-01T00:00:00.000Z",
    "expirationDate": "2024-08-31T23:59:59.000Z",
    "monthlyCost": 12000,
    "annualCost": 144000,
    "status": "approved",
    "createdAt": "2023-07-20T14:35:00.000Z",
    "updatedAt": "2023-07-22T16:20:00.000Z",
    "employer": {
      // employer details
    }
  }
}
```

### Create Quote

```
POST /quotes
```

**Request Body**

```json
{
  "employerId": "550e8400-e29b-41d4-a716-446655440000",
  "planType": "Standard ICHRA",
  "coverageDetails": "Full medical coverage for employees",
  "employeeCount": 120,
  "effectiveDate": "2023-09-01T00:00:00.000Z"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "660f9500-f30c-42e5-b817-557766550000",
    "employerId": "550e8400-e29b-41d4-a716-446655440000",
    "planType": "Standard ICHRA",
    "coverageDetails": "Full medical coverage for employees",
    "employeeCount": 120,
    "effectiveDate": "2023-09-01T00:00:00.000Z",
    "status": "pending",
    "createdAt": "2023-07-20T14:35:00.000Z",
    "updatedAt": "2023-07-20T14:35:00.000Z"
  },
  "message": "Quote created successfully"
}
```

### Update Quote

```
PUT /quotes/:id
```

**Request Body**

```json
{
  "planType": "Premium ICHRA",
  "coverageDetails": "Full medical, dental, and vision coverage",
  "employeeCount": 125,
  "effectiveDate": "2023-10-01T00:00:00.000Z",
  "status": "processing"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    // updated quote
  },
  "message": "Quote updated successfully"
}
```

### Delete Quote

```
DELETE /quotes/:id
```

**Response**

```json
{
  "success": true,
  "message": "Quote deleted successfully"
}
```

## Documents

### Get All Documents

```
GET /documents
```

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "770a8600-g41d-53e6-c918-668877660000",
      "employerId": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Employee Census",
      "documentType": "census",
      "fileKey": "employers/550e8400-e29b-41d4-a716-446655440000/census-2023-07-20.xlsx",
      "fileUrl": "https://kyndly-ichra-documents.s3.amazonaws.com/...",
      "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "fileSize": 32768,
      "uploadedBy": "user@example.com",
      "createdAt": "2023-07-20T14:40:00.000Z",
      "updatedAt": "2023-07-20T14:40:00.000Z"
    },
    // ...more documents
  ]
}
```

### Get Documents by Employer ID

```
GET /documents/employer/:employerId
```

**Response**

```json
{
  "success": true,
  "data": [
    // documents for the specified employer
  ]
}
```

### Get Document by ID

```
GET /documents/:id
```

**Response**

```json
{
  "success": true,
  "data": {
    // document details
  }
}
```

### Upload Document

```
POST /documents
Content-Type: multipart/form-data
```

**Form Data**

- `title`: Document title
- `employerId`: ID of the employer
- `documentType`: Type of document (e.g., census, agreement, etc.)
- `file`: The file to upload

**Response**

```json
{
  "success": true,
  "data": {
    // uploaded document details
  },
  "message": "Document uploaded successfully"
}
```

### Update Document Metadata

```
PUT /documents/:id
```

**Request Body**

```json
{
  "title": "Updated Document Title",
  "documentType": "agreement"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    // updated document details
  },
  "message": "Document updated successfully"
}
```

### Delete Document

```
DELETE /documents/:id
```

**Response**

```json
{
  "success": true,
  "message": "Document deleted successfully"
}
``` 