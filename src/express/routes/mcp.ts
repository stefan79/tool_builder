import express, { Router } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {routeSse, routeMessage}  from '../controllers/mcp';

export const mcpRoutes = (server: McpServer): Router => {
    const router = express.Router();
    

    // Health check endpoint
    router.get('/sse', routeSse(server));
    router.post('/messages', routeMessage(server));
    return router
};