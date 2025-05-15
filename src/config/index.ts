import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  // Thresholds for intervention logic
  thresholds: {
    stress: {
      low: 2, // Below 2 is considered low stress
    },
    sleep: {
      low: 5, // Below 5 hours is considered low sleep
    },
    activity: {
      steps: {
        low: 3000, // Below 3000 steps is considered low activity
      },
      minutes: {
        low: 10, // Below 10 minutes is considered low active duration
      },
    },
  },
};
