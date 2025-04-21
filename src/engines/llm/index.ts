import { LLMConfig } from "./definitions";
import {OpenAIEngineBuilder} from "./models/openai";
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ToolDefinition, KeyedExpression, ToolParameter } from '../../tool/definition';
import * as hub from "langchain/hub/node";
import {Jexl} from 'jexl';
import { Runnable, RunnableConfig, RunnableSequence } from "@langchain/core/runnables";
import dayjs from 'dayjs';
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";
import { Callbacks } from "@langchain/core/callbacks/manager";
import { z, ZodRawShape } from 'zod';
import { CallToolResult, RegisteredTool } from "@modelcontextprotocol/sdk/types";

export interface LLMEngine {
    name: string;
    model: BaseChatModel;
}

export interface Reponse {
    value?: string;
    error?: string;
}

const jexlInstance = new Jexl();
jexlInstance.addFunction('now', () => dayjs());
jexlInstance.addTransform("format", (date: dayjs.Dayjs, format: string) => {
    return date.format(format);
})

export type registerToolType = (server: McpServer, definition: ToolDefinition, llmEngines: Record<string, LLMEngine>) => Promise<RegisteredTool>;

export const registerLLMTool: registerToolType = async (server, definition, llmEngines) => {
    const engine = llmEngines[definition.engine.name];
    if (!engine) {
        throw new Error(`LLM engine ${definition.engine.name} not found`);
    }
    const promptData = await hub.pull(definition.engine.prompt);

    const outputParser = new StringOutputParser();
    const chain = RunnableSequence.from([promptData, engine.model, outputParser]);
    const tracer = new LangChainTracer({projectName: definition.engine.project});
    const metadata = {
        id: definition.id,
        name: definition.name,
        version: definition.version
    }
    const config: RunnableConfig = {
        callbacks: [tracer],
        metadata
    }

    const skeleton = mcpToolHandler(definition.engine.variables, chain, config);

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
    config: RunnableConfig    
) => async (args: Record<string, any>): Promise<CallToolResult> => {

    const variables: Record<string, any> = {};
    for (const variableDefinition of variableDefinitions) {
        const value = await jexlInstance.eval(variableDefinition.expression, {request: args});
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
    
    