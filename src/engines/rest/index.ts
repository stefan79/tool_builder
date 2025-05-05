import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { KeyedExpression } from '../../tool/definition';
import { CallToolResult } from '@modelcontextprotocol/sdk/types';
import { Jexl } from 'jexl';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { RestEngineConfig } from '../../tool/definition';
import { buildJexlInstance, zodSchemaGenerator } from '../util';
import { ToolDefinition } from '../../tool/definition';

export const registerRESTTool = async (server: McpServer, definition: ToolDefinition): Promise<RegisteredTool> => {
    const axiosInstance = axios.create();
    axiosInstance.interceptors.request.use((config) => {
        console.log("Requets:", {
            method: config.method,
            url: config.url,
            headers: config.headers,
            params: config.params,
            data: config.data
        })
        return config;
    });
    axiosInstance.interceptors.response.use((response) => {
        console.log("Response:", {
            status: response.status,
            headers: response.headers,
            data: response.data
        })
        return response;
    });
    const restEngineConfig = definition.engine as RestEngineConfig;
    const handler = mcpToolHandler(
        restEngineConfig.url,
        restEngineConfig.method,
        restEngineConfig.grouping || "",
        restEngineConfig.headers,
        restEngineConfig.parameters,
        restEngineConfig.response,
        axiosInstance,
        buildJexlInstance()
    );
    console.log("Registered tool:", definition.id);
    return server.tool(
        definition.id,
        definition.description,
        zodSchemaGenerator(definition.request),
        handler
    );
}


const mcpToolHandler = (
    urlExp: string,
    methodExp: 'GET' | 'POST' | 'PUT' | 'DELETE',
    grouping: string,
    headersExp: KeyedExpression[], 
    parametersExp: KeyedExpression[],
    responseExp: KeyedExpression[],
    axiosInstance: AxiosInstance,
    jexl: InstanceType<typeof Jexl>
) => async (args: Record<string, unknown>): Promise<CallToolResult> => {

    console.log("Handling Tool Call:", args);

    const context = {request: args, env: process.env};
    const url = await jexl.eval(urlExp, context);
    const method = await jexl.eval(methodExp, context);    
    const headers: Record<string, string> = {};
    for (const header of headersExp) {
        const value = await jexl.eval(header.expression, context);
        headers[header.name] = value;
    }   
    const parameters: Record<string, string> = {};
    for (const parameter of parametersExp) {
        const value = await jexl.eval(parameter.expression, context);
        parameters[parameter.name] = value;
    }
    const reqCfg: AxiosRequestConfig = {
        url,
        method,
        headers,
        params: parameters,
    }

    const restResponse = await axiosInstance.request(reqCfg);
    console.log("Response:", restResponse.data);

    if(restResponse.status !== 200) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${restResponse.status}`
                }
            ]
        }
    }

    let groups = [];
    if (grouping) {
        groups = await jexl.eval(grouping, {...context, response: restResponse.data});
    } else {
        groups = [restResponse.data];
    }

    if(!groups || !Array.isArray(groups)) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: Invalid response grouping field: ${grouping}`
                }
            ]
        }
    }

    const contents: CallToolResult['content'] = [];
    console.log("Groups:", groups);
    for (const group of groups) {
        let resultString = ""
        for (const item of responseExp) {
            const value = await jexl.eval(item.expression, {...context, response: restResponse.data, group});
            resultString += `* ${item.name}:`
            resultString += `${value}\n\n`;
            console.log(item.name, value);
        }
        contents.push({
            type: "text",
            text: resultString
        })
}

    return {
        content: contents
    }
}
