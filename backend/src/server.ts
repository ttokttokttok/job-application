import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Import routes
import resumeRoutes from './routes/resume.routes';
import profileRoutes from './routes/profile.routes';
import jobsRoutes from './routes/jobs.routes';
import networkingRoutes from './routes/networking.routes';
import agentRoutes from './routes/agent.routes';
import webhooksRoutes from './routes/webhooks.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/resume', resumeRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/networking', networkingRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/webhooks', webhooksRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'JobAgent Backend API',
    version: '1.0.0',
    description: 'AI-powered job application assistant',
    endpoints: {
      resume: '/api/resume/*',
      profile: '/api/profile/*',
      jobs: '/api/jobs/*',
      networking: '/api/networking/*'
    }
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server with better error handling
const server = app.listen(PORT, () => {
  logger.info(`🚀 JobAgent backend server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🤖 Mock AGI mode: ${process.env.USE_MOCK_AGI === 'true' ? 'enabled' : 'disabled'}`);
});

// Handle port conflicts gracefully
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Trying to kill existing process...`);
    // Try to kill the process using the port
    exec(`lsof -ti:${PORT} | xargs kill -9`, (error: any) => {
      if (error) {
        logger.error(`Failed to kill process on port ${PORT}. Please kill it manually.`);
        logger.error(`Run: lsof -ti:${PORT} | xargs kill -9`);
      } else {
        logger.info(`Killed process on port ${PORT}. Please restart the server.`);
      }
      process.exit(1);
    });
  } else {
    logger.error('Server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
