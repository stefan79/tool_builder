import express  from 'express';
import morgan from 'morgan';
import { McpServer } from    '@modelcontextprotocol/sdk/server/mcp.js';
import { routes } from './routes';
import { ToolRepository } from '../tool/repository';
import { ToolDefinition } from '../tool/definition';
import { Response } from 'express';

export interface Context {
    tool?: ToolDefinition;
    toolIds?: string[];
}


export const getContext = (res: Response): Context => {
    if (!res.locals.context) {
        res.locals.context = {
            tool: undefined,
            toolIds: []
        };
    }
  return res.locals.context;
};

export const startExpressServer = (mcpServer: McpServer, repository: ToolRepository): express.Express => {
    const app = express();
    app.use(morgan('dev')); // Log requests to console
    app.use('/', routes(mcpServer, repository));
    app.listen(3000, () => {
        console.log('Server started on port 3000');
    });
    return app;
}