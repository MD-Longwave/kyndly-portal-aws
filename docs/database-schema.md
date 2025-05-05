# Kyndly ICHRA Portal Database Schema

This document outlines the database schema for the Kyndly ICHRA Portal, including tables, relationships, and field descriptions.

## Database Technology

The Kyndly ICHRA Portal uses PostgreSQL as its primary database management system. The database is hosted on Amazon RDS for production environments and can be run locally using Docker for development.

## Entity Relationship Diagram

The following diagram illustrates the relationships between the main entities in the database:

```
+-------------+       +-------------+       +--------------+
|   Employer  |------>|    Quote    |------>|   Document   |
+-------------+       +-------------+       +--------------+
       |                     |                     |
       |                     |                     |
       v                     v                     v
+-------------+      +--------------+     +--------------+
|   Contact   |      |    Benefit   |     |  DocCategory |
+-------------+      +--------------+     +--------------+
```

## Tables

### Employers Table

Stores information about employer organizations using the ICHRA platform.

| Column Name      | Data Type      | Constraints       | Description                                     |
|------------------|----------------|-------------------|-------------------------------------------------|
| id               | UUID           | PK, NOT NULL      | Unique identifier for the employer              |
| name             | VARCHAR(255)   | NOT NULL          | Name of the employer organization               |
| tax_id           | VARCHAR(20)    | NOT NULL, UNIQUE  | Federal Tax ID (EIN) of the employer            |
| address_line1    | VARCHAR(255)   | NOT NULL          | Primary address line                            |
| address_line2    | VARCHAR(255)   |                   | Secondary address line (optional)               |
| city             | VARCHAR(100)   | NOT NULL          | City                                            |
| state            | VARCHAR(2)     | NOT NULL          | State (2-letter code)                           |
| zip_code         | VARCHAR(10)    | NOT NULL          | ZIP code                                        |
| industry         | VARCHAR(100)   |                   | Industry category                               |
| employee_count   | INT            | NOT NULL          | Number of employees                             |
| active           | BOOLEAN        | NOT NULL, DEFAULT true | Whether the employer is active              |
| created_at       | TIMESTAMP      | NOT NULL, DEFAULT NOW() | Creation timestamp                        |
| updated_at       | TIMESTAMP      | NOT NULL, DEFAULT NOW() | Last update timestamp                     |

### Contacts Table

Stores information about employer contacts and administrators.

| Column Name      | Data Type      | Constraints       | Description                                     |
|------------------|----------------|-------------------|-------------------------------------------------|
| id               | UUID           | PK, NOT NULL      | Unique identifier for the contact               |
| employer_id      | UUID           | FK, NOT NULL      | Reference to employer                           |
| first_name       | VARCHAR(100)   | NOT NULL          | First name                                      |
| last_name        | VARCHAR(100)   | NOT NULL          | Last name                                       |
| email            | VARCHAR(255)   | NOT NULL, UNIQUE  | Email address                                   |
| phone            | VARCHAR(20)    |                   | Phone number                                    |
| job_title        | VARCHAR(100)   |                   | Job title                                       |
| is_primary       | BOOLEAN        | NOT NULL, DEFAULT false | Whether this is the primary contact       |
| auth0_id         | VARCHAR(255)   | UNIQUE            | Auth0 identifier for user authentication        |
| created_at       | TIMESTAMP      | NOT NULL, DEFAULT NOW() | Creation timestamp                        |
| updated_at       | TIMESTAMP      | NOT NULL, DEFAULT NOW() | Last update timestamp                     |

### Quotes Table

Stores information about ICHRA quotes generated for employers.

| Column Name      | Data Type      | Constraints       | Description                                     |
|------------------|----------------|-------------------|-------------------------------------------------|
| id               | UUID           | PK, NOT NULL      | Unique identifier for the quote                 |
| employer_id      | UUID           | FK, NOT NULL      | Reference to employer                           |
| quote_name       | VARCHAR(255)   | NOT NULL          | Name/title of the quote                         |
| effective_date   | DATE           | NOT NULL          | Effective date for the quote                    |
| status           | VARCHAR(50)    | NOT NULL          | Status (e.g., draft, submitted, approved)       |
| total_amount     | DECIMAL(10,2)  | NOT NULL          | Total quote amount                              |
| monthly_premium  | DECIMAL(10,2)  | NOT NULL          | Monthly premium amount                          |
| employee_count   | INT            | NOT NULL          | Number of employees included                    |
| created_by       | UUID           | FK, NOT NULL      | Reference to contact who created the quote      |
| approved_by      | UUID           | FK                | Reference to contact who approved the quote     |
| approved_at      | TIMESTAMP      |                   | Timestamp of approval                           |
| created_at       | TIMESTAMP      | NOT NULL, DEFAULT NOW() | Creation timestamp                        |
| updated_at       | TIMESTAMP      | NOT NULL, DEFAULT NOW() | Last update timestamp                     |

### Benefits Table

Stores information about benefit options included in quotes.

| Column Name      | Data Type      | Constraints       | Description                                     |
|------------------|----------------|-------------------|-------------------------------------------------|
| id               | UUID           | PK, NOT NULL      | Unique identifier for the benefit               |
| quote_id         | UUID           | FK, NOT NULL      | Reference to quote                              |
| benefit_type     | VARCHAR(100)   | NOT NULL          | Type of benefit (e.g., medical, dental)         |
| description      | TEXT           | NOT NULL          | Description of the benefit                      |
| amount           | DECIMAL(10,2)  | NOT NULL          | Amount allocated for this benefit               |
| employee_tier    | VARCHAR(50)    | NOT NULL          | Employee tier (e.g., single, family)            |
| created_at       | TIMESTAMP      | NOT NULL, DEFAULT NOW() | Creation timestamp                        |
| updated_at       | TIMESTAMP      | NOT NULL, DEFAULT NOW() | Last update timestamp                     |

### Documents Table

Stores metadata about documents uploaded to the system.

| Column Name      | Data Type      | Constraints       | Description                                     |
|------------------|----------------|-------------------|-------------------------------------------------|
| id               | UUID           | PK, NOT NULL      | Unique identifier for the document              |
| employer_id      | UUID           | FK, NOT NULL      | Reference to employer                           |
| quote_id         | UUID           | FK                | Reference to quote (optional)                   |
| title            | VARCHAR(255)   | NOT NULL          | Document title                                  |
| description      | TEXT           |                   | Document description                            |
| file_name        | VARCHAR(255)   | NOT NULL          | Original filename                               |
| file_path        | VARCHAR(512)   | NOT NULL          | S3 path or URL to the document                  |
| file_size        | BIGINT         | NOT NULL          | Size of the file in bytes                       |
| mime_type        | VARCHAR(100)   | NOT NULL          | MIME type of the document                       |
| category_id      | UUID           | FK                | Reference to document category                  |
| uploaded_by      | UUID           | FK, NOT NULL      | Reference to contact who uploaded the document  |
| expires_at       | TIMESTAMP      |                   | Expiration date (if applicable)                 |
| created_at       | TIMESTAMP      | NOT NULL, DEFAULT NOW() | Creation timestamp                        |
| updated_at       | TIMESTAMP      | NOT NULL, DEFAULT NOW() | Last update timestamp                     |

### Document Categories Table

Stores categories for document classification.

| Column Name      | Data Type      | Constraints       | Description                                     |
|------------------|----------------|-------------------|-------------------------------------------------|
| id               | UUID           | PK, NOT NULL      | Unique identifier for the category              |
| name             | VARCHAR(100)   | NOT NULL, UNIQUE  | Category name                                   |
| description      | TEXT           |                   | Category description                            |
| created_at       | TIMESTAMP      | NOT NULL, DEFAULT NOW() | Creation timestamp                        |
| updated_at       | TIMESTAMP      | NOT NULL, DEFAULT NOW() | Last update timestamp                     |

## Indexes

To optimize query performance, the following indexes are implemented:

| Table Name       | Index Name                 | Columns                | Type      |
|------------------|----------------------------|------------------------|-----------|
| employers        | idx_employers_tax_id       | tax_id                 | UNIQUE    |
| contacts         | idx_contacts_employer_id   | employer_id            | BTREE     |
| contacts         | idx_contacts_email         | email                  | UNIQUE    |
| quotes           | idx_quotes_employer_id     | employer_id            | BTREE     |
| quotes           | idx_quotes_status          | status                 | BTREE     |
| benefits         | idx_benefits_quote_id      | quote_id               | BTREE     |
| documents        | idx_documents_employer_id  | employer_id            | BTREE     |
| documents        | idx_documents_quote_id     | quote_id               | BTREE     |
| documents        | idx_documents_category_id  | category_id            | BTREE     |

## Foreign Key Constraints

| Table Name       | Constraint Name            | Columns                | References            |
|------------------|----------------------------|------------------------|----------------------|
| contacts         | fk_contacts_employer       | employer_id            | employers(id)        |
| quotes           | fk_quotes_employer         | employer_id            | employers(id)        |
| quotes           | fk_quotes_created_by       | created_by             | contacts(id)         |
| quotes           | fk_quotes_approved_by      | approved_by            | contacts(id)         |
| benefits         | fk_benefits_quote          | quote_id               | quotes(id)           |
| documents        | fk_documents_employer      | employer_id            | employers(id)        |
| documents        | fk_documents_quote         | quote_id               | quotes(id)           |
| documents        | fk_documents_category      | category_id            | document_categories(id) |
| documents        | fk_documents_uploaded_by   | uploaded_by            | contacts(id)         |

## Database Migrations

Database migrations are managed using Sequelize CLI. Migration files can be found in the `backend/src/database/migrations` directory.

## Entity Lifecycle

### Employers
- When an employer is created, at least one contact should be created.
- Employers can be deactivated (setting `active=false`) but should not be deleted from the database.

### Quotes
- Quotes progress through several status stages: draft, submitted, under_review, approved, rejected.
- When a quote is approved, the `approved_by` and `approved_at` fields are populated.

### Documents
- Documents are stored in Amazon S3 with metadata maintained in the database.
- Documents may have an expiration date, after which they should be archived.

## Sample Queries

### Get all active employers
```sql
SELECT * FROM employers WHERE active = true ORDER BY name;
```

### Get all contacts for an employer
```sql
SELECT * FROM contacts WHERE employer_id = '00000000-0000-0000-0000-000000000000';
```

### Get all approved quotes for an employer
```sql
SELECT * FROM quotes WHERE employer_id = '00000000-0000-0000-0000-000000000000' AND status = 'approved';
```

### Get all documents for a quote
```sql
SELECT d.* FROM documents d 
WHERE d.quote_id = '00000000-0000-0000-0000-000000000000'
ORDER BY d.created_at DESC;
```

### Get all documents by category
```sql
SELECT d.*, dc.name as category_name 
FROM documents d
JOIN document_categories dc ON d.category_id = dc.id
WHERE dc.name = 'Proposals'
ORDER BY d.created_at DESC;
``` 