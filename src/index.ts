import { loadLLMConfigFromFile } from './engines/llm/loader';
import { buildEngines } from './engines/llm/builder';
import { startMCPServer } from './mcp';
import * as dotenv from 'dotenv';
import { registerLLMTool } from './engines/llm';
import { startExpressServer } from './express';
import { FileToolRepository } from './tool/file';
import { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp';

const tools: Record<string, RegisteredTool> = {};

const startServer = async () => {
    dotenv.config();
    const config = await loadLLMConfigFromFile();
    const engines = buildEngines(config);
    const toolRepository = new FileToolRepository('samples');

    //Create MCP Server
    const mcpServer = startMCPServer({name: 'tool_builder', version: '1.0.0'});

    //Create Express Server
    const expressServer = startExpressServer(mcpServer, toolRepository);

    //Load Job Definition
    const toolIds = await toolRepository.getToolIds();
    toolIds.forEach(async (id) => {
        const toolDefinition = await toolRepository.getToolById(id);
        const registeredTool = await registerLLMTool(mcpServer, toolDefinition, engines);
        tools[id] = registeredTool;
    });
};

startServer();
