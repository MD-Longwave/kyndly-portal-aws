import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from './logger';

// Load environment variables
dotenv.config();

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
} = process.env;

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: DB_HOST || 'localhost',
  port: parseInt(DB_PORT || '5432', 10),
  database: DB_NAME || 'ichra_portal',
  username: DB_USER || 'postgres',
  password: DB_PASSWORD || 'postgres',
  logging: (msg) => logger.debug(msg),
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test connection
const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    
    // In development mode, sync the models with the database
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database models synchronized.');
    }
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Connect to the database
connectToDatabase();

export default sequelize; 