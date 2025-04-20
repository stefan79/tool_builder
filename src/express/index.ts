import express  from 'express';
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { McpServer } from    '@modelcontextprotocol/sdk/server/mcp.js';
import { routes } from './routes';

export const startExpressServer = (mcpServer: McpServer) => {
    const app = express();
    app.use('/', routes(mcpServer));
    app.listen(3000, () => {
        console.log('Server started on port 3000');
    });
    return app;
}