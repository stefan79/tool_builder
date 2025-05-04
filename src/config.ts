import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Define the repository types
export type RepositoryType = 'file' | 'etcd';

// Define the configuration schema using Zod for validation
const configSchema = z.object({
  repositoryType: z.enum(['file', 'etcd']).default('file'),
  // Add other configuration options as needed
  etcd: z.object({
    endpoints: z.array(z.string()).default(['localhost:2379']),
    dialTimeout: z.number().default(5000),
  }).optional(),
  file: z.object({
    basePath: z.string().default('./data'),
  }).optional(),
});

// Configuration interface
export type Config = z.infer<typeof configSchema>;

// Load and validate configuration
const loadConfig = (): Config => {
  const config = {
    repositoryType: process.env.REPOSITORY_TYPE as RepositoryType,
    etcd: process.env.REPOSITORY_TYPE === 'etcd' ? {
      endpoints: process.env.ETCD_ENDPOINTS?.split(',') || ['localhost:2379'],
      dialTimeout: parseInt(process.env.ETCD_DIAL_TIMEOUT || '5000'),
    } : undefined,
    file: process.env.REPOSITORY_TYPE === 'file' ? {
      basePath: process.env.FILE_REPOSITORY_PATH || './data',
    } : undefined,
  };

  return configSchema.parse(config);
};

// Export a singleton instance of the configuration
export const config = loadConfig();