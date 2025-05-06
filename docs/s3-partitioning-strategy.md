# S3 Partitioning Strategy for Kyndly Submissions

This document outlines the S3 key naming and partitioning strategy implemented for the Kyndly ICHRA application to ensure secure, scalable, and organized storage of quote submissions from TPAs on behalf of various employers.

## Key Structure

```
s3://kyndly-ichra-documents/submissions/{tpa_id}/{employer_id}/{submission_id}/file.pdf
```

## Partitioning Principles

### TPA-Level Partitioning
Each TPA gets a top-level folder (`tpa_id`), allowing for logical isolation of data by submitting organization. This enables:
- Clear organizational boundaries
- Simplified access control for TPA users
- Easy reporting on TPA-specific submissions

### Employer Subfolders
Within each TPA folder, individual employers have their own subfolders (`employer_id`) to organize submissions. This enables:
- Logical grouping of employer-specific documents
- Fine-grained access control for employer users
- Streamlined document retrieval for a specific employer

### Submission-Level Isolation
Each submission is stored in its own folder identified by a unique `submission_id`, enabling:
- Fine-grained access control
- Detailed auditing
- Simplified lifecycle management
- Grouping of related files in a single submission

## Benefits

### Security
- IAM policies or S3 bucket policies can restrict access by `tpa_id` or `employer_id`
- Each submission is isolated, preventing unauthorized access
- Role-based access control can be implemented with simple path-based policies

### Maintainability
- Files are logically grouped and easily traceable by source
- Structure aligns with the business organization
- File paths provide contextual information about the data

### Scalability
- Supports millions of files across TPAs and employers without key collisions
- Prevents performance degradation by distributing files across logical partitions
- Follows AWS best practices for high request rates (prefix partitioning)

### Automation-Friendly
- Zapier or Lambda triggers can easily detect and process files based on the key prefix
- Path-based event filtering can drive automated workflows
- Predictable structure simplifies integration with other systems

## IAM Policy Examples

### TPA-Specific Access

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:ListBucket"
  ],
  "Resource": [
    "arn:aws:s3:::kyndly-ichra-documents",
    "arn:aws:s3:::kyndly-ichra-documents/submissions/${aws:PrincipalTag/tpa_id}/*"
  ]
}
```

### Employer-Specific Access

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:ListBucket"
  ],
  "Resource": [
    "arn:aws:s3:::kyndly-ichra-documents",
    "arn:aws:s3:::kyndly-ichra-documents/submissions/${aws:PrincipalTag/tpa_id}/${aws:PrincipalTag/employer_id}/*"
  ]
}
```

### Submission-Level Access

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject"
  ],
  "Resource": [
    "arn:aws:s3:::kyndly-ichra-documents/submissions/${aws:PrincipalTag/tpa_id}/${aws:PrincipalTag/employer_id}/${submission_id}/*"
  ]
}
```

## Performance Considerations

According to AWS [documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html), S3 automatically scales to high request rates and can achieve at least 3,500 PUT/COPY/POST/DELETE or 5,500 GET/HEAD requests per second per partitioned prefix. Our partitioning strategy naturally distributes load across multiple prefixes:

- Each TPA has its own prefix
- Each employer under a TPA has its own prefix
- Each submission has its own prefix

This structure ensures optimal performance even with high traffic, as the load is distributed across multiple partitions.

## Implementation Notes

The partitioning strategy is implemented in the `s3.service.ts` file with the `uploadQuoteFile` method:

```typescript
// Create the S3 key following the partition strategy:
// s3://bucket-name/submissions/{tpa_id}/{employer_id}/{submission_id}/file.pdf
const key = `submissions/${tpaId}/${employerId}/${actualSubmissionId}/${fileName}`;
```

This structure is used in the document and quote controllers when handling file uploads. 