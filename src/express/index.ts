import express  from 'express';
import morgan from 'morgan';
import { McpServer } from    '@modelcontextprotocol/sdk/server/mcp.js';
import { routes } from './routes';
import { ToolRepository } from '../tool';

export const startExpressServer = (mcpServer: McpServer, repository: ToolRepository): void => {
    const app = express();
    app.use(morgan('dev')); // Log requests to console
    app.use('/', routes(mcpServer, repository));
    app.listen(3000, () => {
        console.log('Server started on port 3000');
    });
    return app;
}