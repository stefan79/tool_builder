import { McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import { ToolDefinition, KeyedExpression, RegisteredTool, LLMEngineConfig } from '../../tool/definition';
import * as hub from "langchain/hub/node";
import { RunnableConfig, RunnableSequence } from "@langchain/core/runnables";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { buildJexlInstance, zodSchemaGenerator } from "../util";
import { Jexl } from 'jexl';

export interface LLMEngine {
    name: string;
    model: BaseChatModel;
}

export interface Reponse {
    value?: string;
    error?: string;
}


export const registerLLMTool = async (server: McpServer, definition: ToolDefinition, llmEngines: Record<string, LLMEngine>): Promise<RegisteredTool> => {
    const engine = llmEngines[definition.engine.name];
    if (!engine) {
        throw new Error(`LLM engine ${definition.engine.name} not found`);
    }
    const llmEngineConfig = definition.engine as LLMEngineConfig;
    const promptData = await hub.pull(llmEngineConfig.prompt);

    const outputParser = new StringOutputParser();
    const chain = RunnableSequence.from([promptData, engine.model, outputParser]);
    const tracer = new LangChainTracer({projectName: llmEngineConfig.project});
    const metadata = {
        id: definition.id,
        name: definition.name,
        version: definition.version
    }
    const config: RunnableConfig = {
        callbacks: [tracer],
        metadata
    }

    const skeleton = mcpToolHandler(llmEngineConfig.variables, chain, config, buildJexlInstance());

    return server.tool(
        definition.id,
        definition.description,
        zodSchemaGenerator(definition.request),
        skeleton
    )
}



const mcpToolHandler = (
    variableDefinitions: KeyedExpression[], 
    chain: RunnableSequence,
    config: RunnableConfig,
    jexl:  InstanceType<typeof Jexl>    
) => async (args: Record<string, unknown>): Promise<CallToolResult> => {

    const variables: Record<string, unknown> = {};
    for (const variableDefinition of variableDefinitions) {
        const value = await jexl.eval(variableDefinition.expression, {request: args});
        variables[variableDefinition.name] = value;
    }
    //const prompt = await promptTemplate.invoke(variables);
    const value = await chain.invoke({...variables},config);
    return {
        content: [
            {
                type: "text",
                text: value
            }
        ]
    }
}