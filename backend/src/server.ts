import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { expressjwt as jwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

// Import routes
import employerRoutes from './routes/employer.routes';
import quoteRoutes from './routes/quote.routes';
import documentRoutes from './routes/document.routes';

// Import DB connection
import './config/database';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS with more permissive settings for development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://kyndly-ichra.amplifyapp.com'] 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet({ contentSecurityPolicy: false })); // Disable CSP for development
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Increase JSON limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Increase URL-encoded limit

// Auth0 JWT validation middleware (make it optional for development)
const isProduction = process.env.NODE_ENV === 'production';
const jwtCheck = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
  credentialsRequired: isProduction // Make JWT optional in development
});

// Make the health check publicly accessible
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/employers', jwtCheck, employerRoutes);
app.use('/api/quotes', quoteRoutes); // No JWT check for quotes for testing
app.use('/api/documents', jwtCheck, documentRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
  
  // Return detailed error in development
  if (process.env.NODE_ENV !== 'production') {
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: err.message,
      stack: err.stack
    });
  }
  
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app; 