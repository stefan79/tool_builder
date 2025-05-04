import { loadLLMConfigFromFile } from './engines/llm/loader';
import { buildEngines } from './engines/llm/builder';
import { startMCPServer } from './mcp';
import * as dotenv from 'dotenv';
import { registerLLMTool } from './engines/llm';
import { startExpressServer } from './express';
import { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp';
import { registerRESTTool } from './engines/rest';
import { createRepository } from './tool/repository';
import { config, Config } from './config';

const tools: Record<string, RegisteredTool> = {};

const startServer = async () => {
    dotenv.config();

    const llmConfig = await loadLLMConfigFromFile();
    const engines = buildEngines(llmConfig);
    const toolRepository = createRepository(config);

    //Create MCP Server
    const mcpServer = startMCPServer({name: 'tool_builder', version: '1.0.0'});

    //Create Express Server
    const expressServer = startExpressServer(mcpServer, toolRepository);

    //Load Job Definition
    const toolIds = await toolRepository.getToolIds();
    toolIds.forEach(async (id) => {
        const toolDefinition = await toolRepository.getToolById(id);
        if(toolDefinition.engine.type === 'rest') {
            const registeredTool = await registerRESTTool(mcpServer, toolDefinition);
            tools[id] = registeredTool;
        } else if(toolDefinition.engine.type === 'llm') {
            const registeredTool = await registerLLMTool(mcpServer, toolDefinition, engines);
            tools[id] = registeredTool;
        }
    });
};

startServer();
