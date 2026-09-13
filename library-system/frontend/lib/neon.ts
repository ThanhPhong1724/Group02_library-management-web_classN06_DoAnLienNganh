import { neon } from '@neondatabase/serverless';

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is missing.');
  }
  return url;
};

export const getDb = () => {
  return neon(getDatabaseUrl());
};
