# Kyndly ICHRA Portal Architecture

This document outlines the architecture of the Kyndly ICHRA Portal, including its components, design patterns, infrastructure, and interactions.

## System Overview

The Kyndly ICHRA Portal is a cloud-based web application that enables employers to manage Individual Coverage Health Reimbursement Arrangements (ICHRA) for their employees. The system provides functionalities for employer onboarding, quote management, document handling, and reporting.

## Architecture Principles

The architecture of the Kyndly ICHRA Portal is guided by the following principles:

1. **Scalability**: Ability to handle growing number of users and data
2. **Security**: Protection of sensitive health and financial information
3. **Maintainability**: Easy to maintain, update, and extend
4. **Reliability**: High availability and fault tolerance
5. **Performance**: Quick response times and efficient processing
6. **Compliance**: Adherence to HIPAA and other regulatory requirements

## High-Level Architecture

The Kyndly ICHRA Portal follows a modern, cloud-native architecture with the following layers:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  (React, Redux, TypeScript, Material-UI)                    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway Layer                         │
│  (AWS API Gateway, Auth0)                                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  (Node.js, Express, TypeScript)                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                           │
│  (Business Logic, Validation, Integration)                  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│  (PostgreSQL, Sequelize ORM, S3)                            │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Frontend Architecture

The frontend follows a component-based architecture using React and TypeScript:

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend Components                        │
│                                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐      │
│  │ Pages   │   │ Layouts │   │ UI      │   │ Features│      │
│  │         │   │         │   │Components│  │Components│     │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘      │
│                                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐      │
│  │ Redux   │   │ API     │   │ Auth    │   │ Utility │      │
│  │ Store   │   │ Services│   │ Services│   │ Functions│     │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Key Frontend Components:

1. **Pages**: Container components for each route
   - Dashboard
   - Employer Management
   - Quote Management
   - Document Repository
   - User Administration

2. **Layouts**: Structural components
   - Main Layout
   - Dashboard Layout
   - Authentication Layout

3. **UI Components**: Reusable UI elements
   - Forms
   - Tables
   - Cards
   - Modals
   - Notifications

4. **Feature Components**: Domain-specific components
   - EmployerForm
   - QuoteCalculator
   - DocumentUploader
   - UserManagement

5. **State Management**: Redux for global state
   - Authentication
   - Configuration
   - User Preferences
   - Current Context (selected employer, quote, etc.)

### 2. Backend Architecture

The backend follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    API Routes Layer                         │
│                                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐      │
│  │ Employer│   │ Quote   │   │ Document│   │ User    │      │
│  │ Routes  │   │ Routes  │   │ Routes  │   │ Routes  │      │
│  └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘      │
│       │             │             │             │           │
└───────┼─────────────┼─────────────┼─────────────┼───────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Controllers Layer                         │
│                                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐      │
│  │ Employer│   │ Quote   │   │ Document│   │ User    │      │
│  │Controller│  │Controller│  │Controller│  │Controller│     │
│  └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘      │
│       │             │             │             │           │
└───────┼─────────────┼─────────────┼─────────────┼───────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Services Layer                           │
│                                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐      │
│  │ Employer│   │ Quote   │   │ Document│   │ User    │      │
│  │ Service │   │ Service │   │ Service │   │ Service │      │
│  └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘      │
│       │             │             │             │           │
└───────┼─────────────┼─────────────┼─────────────┼───────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                        │
│                                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐      │
│  │ Employer│   │ Quote   │   │ Document│   │ User    │      │
│  │ Model   │   │ Model   │   │ Model   │   │ Model   │      │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Key Backend Components:

1. **API Routes**: Define endpoints and handle HTTP requests
   - Request validation
   - Authentication/authorization checks
   - Route to appropriate controller

2. **Controllers**: Handle business logic for operations
   - Coordinate between services
   - Handle error scenarios
   - Format responses

3. **Services**: Implement core business functionality
   - Business rules
   - Data transformation
   - Integration with external systems

4. **Data Access Layer**: Handle database operations
   - Models representing database entities
   - Queries and transactions
   - Data validation

5. **Cross-Cutting Concerns**:
   - Authentication & Authorization
   - Logging
   - Error Handling
   - Caching
   - Request Validation

### 3. Infrastructure Architecture

The system is deployed on AWS with the following components:

```
┌────────────────┐   ┌────────────────┐
│  Route 53      │───│ CloudFront     │
│  (DNS)         │   │ (CDN)          │
└────────┬───────┘   └────────┬───────┘
         │                    │
         ▼                    ▼
┌────────────────┐   ┌────────────────┐
│  API Gateway   │   │ S3 Bucket      │
│                │   │ (Static Files) │
└────────┬───────┘   └────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│ Elastic Beanstalk / ECS                │
│ ┌────────────────┐  ┌────────────────┐ │
│ │ Backend Server │  │ Backend Server │ │
│ │ (Node.js)      │  │ (Node.js)      │ │
│ └────────────────┘  └────────────────┘ │
└──────────────┬─────────────────────────┘
               │
     ┌─────────┴─────────┐
     │                   │
     ▼                   ▼
┌────────────────┐  ┌────────────────┐
│ RDS            │  │ S3 Bucket      │
│ (PostgreSQL)   │  │ (Documents)    │
└────────────────┘  └────────────────┘
```

## Data Architecture

### 1. Database Schema

The database schema follows a relational model with the following key entities:
- Employers
- Contacts
- Quotes
- Benefits
- Documents
- Document Categories
- Users

For a detailed view of the schema, see the [Database Schema](./database-schema.md) document.

### 2. Data Flow

1. **User Authentication Flow**:
   ```
   User → Auth0 → Backend → Response with JWT
   ```

2. **Employer Management Flow**:
   ```
   Client → API Gateway → Backend → Database → Response
   ```

3. **Document Upload Flow**:
   ```
   Client → Backend → S3 → Database (metadata) → Response
   ```

4. **Quote Generation Flow**:
   ```
   Client → Backend → Quote Service → Database → Response
   ```

## Security Architecture

The security architecture follows a defense-in-depth approach:

1. **Authentication**: Auth0 for identity management
   - Multi-factor authentication
   - JWT-based authorization
   - Password policies and account lockout

2. **Authorization**: Role-based access control
   - Admin roles
   - Employer admin roles
   - User roles

3. **Network Security**:
   - TLS/SSL encryption for all traffic
   - VPC configuration
   - Security groups and network ACLs
   - WAF for API Gateway

4. **Data Security**:
   - Encryption at rest for all data
   - Encryption in transit
   - Field-level encryption for sensitive data

5. **Audit and Compliance**:
   - Comprehensive audit logging
   - HIPAA compliance controls
   - Regular security assessments

For more details, see the [Security Guidelines](./security-guidelines.md) document.

## Integration Architecture

### 1. External Integrations

The system integrates with several external services:

1. **Auth0**: Identity management
   - User authentication
   - SSO capabilities
   - User provisioning

2. **AWS Services**:
   - S3 for document storage
   - CloudWatch for monitoring
   - SES for email notifications

3. **Potential Future Integrations**:
   - Health insurance carrier APIs
   - Payment processing services
   - HR systems

### 2. Integration Patterns

The system uses the following integration patterns:

1. **REST APIs**: Primary method for service-to-service communication
   - JSON payloads
   - HTTPS transport
   - Stateless interactions

2. **Webhooks**: For event notifications
   - Document processing completion
   - Auth0 events

3. **Message Queues**: For asynchronous processing
   - Document processing
   - Email notifications
   - Report generation

## Deployment Architecture

### 1. Deployment Process

The system follows a CI/CD approach:

1. **Development**:
   - Feature branches in Git
   - Automated tests
   - Code review process

2. **Staging**:
   - Automated deployment to staging
   - Integration testing
   - User acceptance testing

3. **Production**:
   - Automated deployment with approval
   - Blue/green deployment strategy
   - Automated rollback capability

### 2. Environment Strategy

The system uses the following environments:

1. **Development**: For active development
   - Local developer environments
   - Shared development resources

2. **Testing**: For automated testing
   - Integration tests
   - Performance tests
   - Security tests

3. **Staging**: Pre-production environment
   - Final validation
   - User acceptance testing
   - Performance testing

4. **Production**: Live environment
   - High availability
   - Monitoring and alerting
   - Scaled for production load

For more details, see the [Deployment Guide](./deployment.md) document.

## Scalability and Performance

### 1. Scalability Approach

1. **Horizontal Scaling**:
   - Stateless application servers
   - Load balancing
   - Auto-scaling groups

2. **Database Scaling**:
   - Read replicas for high-read scenarios
   - Connection pooling
   - Efficient indexing

3. **Content Delivery**:
   - CloudFront for static assets
   - Dynamic content caching where appropriate

### 2. Performance Optimization

1. **Frontend Performance**:
   - Code splitting
   - Lazy loading
   - Bundle optimization
   - Caching strategies

2. **Backend Performance**:
   - Query optimization
   - API response caching
   - Efficient algorithms
   - Database indexing

3. **Monitoring and Tuning**:
   - Performance metrics collection
   - Regular performance reviews
   - Load testing
   - Bottleneck identification and resolution

## Resilience and Fault Tolerance

### 1. Availability Design

1. **Multi-AZ Deployment**:
   - Application servers across multiple AZs
   - Database multi-AZ configuration
   - Load balancing across zones

2. **Failover Strategies**:
   - Automated database failover
   - Health checks and auto-recovery
   - Circuit breakers for external dependencies

### 2. Disaster Recovery

1. **Backup Strategy**:
   - Regular database backups
   - Document versioning in S3
   - Configuration backups

2. **Recovery Process**:
   - Defined RTO and RPO
   - Documented recovery procedures
   - Regular DR testing

## Monitoring and Observability

### 1. Monitoring Strategy

1. **Infrastructure Monitoring**:
   - AWS CloudWatch for resource metrics
   - Alerts for threshold violations
   - Dashboard for key metrics

2. **Application Monitoring**:
   - Custom metrics for business processes
   - API performance metrics
   - Error rates and patterns

3. **User Experience Monitoring**:
   - Page load times
   - Transaction completion rates
   - User journey tracking

### 2. Logging Strategy

1. **Log Collection**:
   - Centralized logging
   - Structured log format
   - Log retention policies

2. **Log Analysis**:
   - Error tracking
   - Pattern recognition
   - Correlation across services

3. **Audit Logging**:
   - User actions
   - System changes
   - Data access

## Future Architecture Considerations

1. **Microservices Evolution**:
   - Potential decomposition of monolith
   - Domain-driven design approach
   - Service boundary identification

2. **Serverless Components**:
   - Lambda for appropriate workloads
   - API Gateway integration
   - Event-driven architecture

3. **Machine Learning Integration**:
   - Automated document classification
   - Fraud detection
   - Recommendation systems for benefits

4. **Mobile Application Support**:
   - API extensions for mobile
   - Push notification infrastructure
   - Offline capabilities

## Architecture Decision Records

### ADR-001: Selection of Node.js for Backend

**Context**: Need to select a backend technology that offers good performance, developer productivity, and ecosystem support.

**Decision**: Use Node.js with Express and TypeScript for the backend implementation.

**Rationale**:
- JavaScript/TypeScript skills are widely available
- Excellent performance for I/O-bound operations
- Rich ecosystem of libraries and tools
- Same language across frontend and backend
- Strong typing with TypeScript improves maintainability

**Consequences**:
- Need to manage asynchronous code patterns
- CPU-intensive tasks may require special handling
- Need for disciplined testing due to dynamic typing

### ADR-002: Authentication with Auth0

**Context**: Need a secure, compliant, and feature-rich authentication system.

**Decision**: Use Auth0 as the authentication provider.

**Rationale**:
- HIPAA-compliant with BAA available
- Supports MFA, SSO, and other advanced security features
- Reduces development and maintenance burden
- Well-documented SDKs for our technology stack

**Consequences**:
- External dependency for critical path
- Subscription costs
- Need to handle token validation and refresh

### ADR-003: Document Storage with S3

**Context**: Need secure, scalable storage for various document types.

**Decision**: Use Amazon S3 for document storage with server-side encryption.

**Rationale**:
- Highly durable and available
- Cost-effective for varying storage needs
- Built-in versioning and lifecycle policies
- Strong security controls including encryption

**Consequences**:
- Need to implement proper access controls
- Metadata stored separately in database
- Requires signed URL generation for secure access

## Appendix

### Technology Stack Summary

#### Frontend:
- React
- TypeScript
- Redux
- Material-UI
- Axios

#### Backend:
- Node.js
- Express
- TypeScript
- Sequelize ORM
- Jest

#### Infrastructure:
- AWS (EBS, RDS, S3, CloudFront, Route 53)
- Docker
- GitHub Actions

#### External Services:
- Auth0 (Authentication)
- AWS SES (Email)

### Glossary

- **ICHRA**: Individual Coverage Health Reimbursement Arrangement
- **PHI**: Protected Health Information
- **PII**: Personally Identifiable Information
- **HIPAA**: Health Insurance Portability and Accountability Act
- **JWT**: JSON Web Token
- **SSO**: Single Sign-On
- **MFA**: Multi-Factor Authentication
- **CI/CD**: Continuous Integration/Continuous Deployment
- **RTO**: Recovery Time Objective
- **RPO**: Recovery Point Objective 