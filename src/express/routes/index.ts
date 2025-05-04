import { Router } from 'express';
import { mcpRoutes } from './mcp';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ToolRepository } from '../../tool/repository';
import { toolsRoutes } from './tools';

export const routes =  (server: McpServer, repository: ToolRepository): Router => {
    const router = Router();

    // Register all route modules

    router.use('/', mcpRoutes(server));
    router.use('/api', toolsRoutes(repository));

    return router;
};