import { Router } from 'express';
import { mcpRoutes } from './mcp';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';


export const routes =  (server: McpServer): Router => {
    const router = Router();

    // Register all route modules

    router.use('/', mcpRoutes(server));

    return router;
};