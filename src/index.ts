import { loadLLMConfigFromFile } from './engines/llm/loader';
import { buildEngines } from './engines/llm/builder';
import { startMCPServer } from './mcp';
import * as dotenv from 'dotenv';
import { parseToolDefinition } from './tool/definition';
import { registerLLMTool } from './engines/llm';
import * as fs from 'fs';
import { startExpressServer } from './express';

const startServer = async () => {
    dotenv.config();
    const config = await loadLLMConfigFromFile();
    const engines = buildEngines(config);
    console.log(engines);

    //Create MCP Server
    const mcpServer = startMCPServer({name: 'tool_builder', version: '1.0.0'});
    const expressServer = startExpressServer(mcpServer);

    //Load Job Definition
    const fileBuffer = await fs.promises.readFile('samples/date.yml');
    const toolDefinition = parseToolDefinition(fileBuffer.toString());

    //Register Job with Server
    registerLLMTool(mcpServer, toolDefinition, engines);
};

startServer();
