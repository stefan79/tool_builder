import { McpServer, RegisteredTool} from '@modelcontextprotocol/sdk/server/mcp.js';
import { ToolDefinition, KeyedExpression, ToolParameter, LLMEngineConfig } from '../../tool/definition';
import * as hub from "langchain/hub/node";
import { RunnableConfig, RunnableSequence } from "@langchain/core/runnables";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";
import { z, ZodRawShape } from 'zod';
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { buildJexlInstance } from "../util";
import { Jexl } from 'jexl';

export interface LLMEngine {
    name: string;
    model: BaseChatModel;
}

export interface Reponse {
    value?: string;
    error?: string;
}

export type registerToolType = (server: McpServer, definition: ToolDefinition, llmEngines: Record<string, LLMEngine>) => Promise<RegisteredTool>;

export const registerLLMTool: registerToolType = async (server, definition, llmEngines) => {
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

const zodSchemaGenerator = (request: ToolParameter[]): ZodRawShape => {
    const schema = request.reduce((acc, param) => {
        let zodField;
        switch (param.type) {
            case "string":
                zodField = z.string();
                break;
            case "object":
                zodField = z.object({});
                break;
            case "boolean":
                zodField = z.boolean();
                break;
        }
        acc[param.name] = zodField.describe(param.description);
        return acc;
    }, {} as ZodRawShape);
    return schema;
}

const mcpToolHandler = (
    variableDefinitions: KeyedExpression[], 
    chain: RunnableSequence,
    config: RunnableConfig,
    jexl:  InstanceType<typeof Jexl>    
) => async (args: Record<string, any>): Promise<CallToolResult> => {

    const variables: Record<string, any> = {};
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