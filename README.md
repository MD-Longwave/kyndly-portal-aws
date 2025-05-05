# Kyndly ICHRA Portal

Kyndly ICHRA Portal is a centralized cloud-based web portal for managing Individual Coverage Health Reimbursement Arrangements (ICHRA). This platform helps organizations administer health benefits more efficiently while providing seamless experiences for both administrators and employees.

## Features

- **Employer Management**: Create, view, and manage employer profiles
- **Quote Management**: Generate and track health plan quotes for employers
- **Document Management**: Upload, store, and organize plan documents
- **Dashboard**: Overview of key metrics and recent activities
- **Authentication**: Secure access with Auth0 integration
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Project Structure

The project is organized into frontend and backend directories:

```
kyndly/
├── frontend/                  # React TypeScript frontend
│   ├── public/                # Static assets
│   ├── src/                   # Source code
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service integrations
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Helper functions
│   ├── package.json           # Frontend dependencies
│   └── tsconfig.json          # TypeScript configuration
│
├── backend/                   # Node.js Express backend
│   ├── src/                   # Source code
│   │   ├── config/            # Configuration files 
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── utils/             # Helper functions
│   ├── package.json           # Backend dependencies
│   └── tsconfig.json          # TypeScript configuration
│
├── docs/                      # Documentation
│   ├── api-documentation.md   # API documentation
│   ├── database-schema.md     # Database schema documentation
│   ├── deployment.md          # Deployment instructions
│   ├── security.md            # Security guidelines
│   └── testing.md             # Testing documentation
│
└── README.md                  # Project overview (this file)
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- AWS S3 account (for document storage)

### Environment Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-organization/kyndly-ichra-portal.git
   cd kyndly-ichra-portal
   ```

2. Setup backend environment variables:
   - Create a `.env` file in the `backend` directory with:
   ```
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/kyndly
   NODE_ENV=development
   JWT_SECRET=your-jwt-secret
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   ```

3. Setup frontend environment variables:
   - Create a `.env` file in the `frontend` directory with:
   ```
   REACT_APP_API_URL=http://localhost:4000/api
   REACT_APP_AUTH0_DOMAIN=your-auth0-domain
   REACT_APP_AUTH0_CLIENT_ID=your-auth0-client-id
   REACT_APP_AUTH0_AUDIENCE=your-auth0-audience
   ```

### Installation and Running

1. Install and start the backend:
   ```
   cd backend
   npm install
   npm run dev
   ```

2. In a new terminal, install and start the frontend:
   ```
   cd frontend
   npm install
   npm start
   ```

3. Access the application at `http://localhost:3000`

### Development Mode Without Auth0

For local development without Auth0 configuration, the application can run in a development bypass mode:

1. Simply leave the Auth0 environment variables empty or use placeholder values
2. The application will detect development mode and bypass authentication
3. You'll be able to access all features without actual authentication

## API Documentation

For detailed API documentation, see [docs/api-documentation.md](docs/api-documentation.md).

## Deployment

For deployment instructions, see [docs/deployment.md](docs/deployment.md).

## Security

For security guidelines, see [docs/security.md](docs/security.md).

## Testing

For testing documentation, see [docs/testing.md](docs/testing.md).

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Contact

For questions or support, please contact:
- Email: support@kyndlyhealth.com
- Website: https://kyndlyhealth.com 