import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export interface MCPConfig {
    name: string;
    version: string;
}

export const startMCPServer = (config: MCPConfig): McpServer => {
    const server = new McpServer({...config});
    return server;
}
