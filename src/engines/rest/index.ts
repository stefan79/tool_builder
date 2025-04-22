import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { KeyedExpression } from '../../tool/definition';
import { CallToolResult } from '@modelcontextprotocol/sdk/types';
import { Jexl } from 'jexl';
import axios from 'axios';

const mcpToolHandler = (
    urlExp: string,
    methodExp: 'GET' | 'POST' | 'PUT' | 'DELETE',
    headersExp: KeyedExpression[], 
    parametersExp: KeyedExpression[],
    responseExp: KeyedExpression[],
) => async (args: Record<string, any>): Promise<CallToolResult> => {

    const jexlInstance = new Jexl();
    const context = {request: args};
    const url = await jexlInstance.eval(urlExp, context);
    const method = await jexlInstance.eval(methodExp, context);    
    const headers: Record<string, string> = {};
    for (const header of headersExp) {
        const value = await jexlInstance.eval(header.expression, context);
        headers[header.name] = value;
    }   
    const parameters: Record<string, string> = {};
    for (const parameter of parametersExp) {
        const value = await jexlInstance.eval(parameter.expression, context);
        parameters[parameter.name] = value;
    }
    const reqCfg: AxiosRequestConfig = {
        url,
        method,
        headers,
        params: parameters,
    }

    const restResponse = await axios.request(reqCfg);

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

    let resultString = ""
    for (const item of responseExp) {
        const value = await jexlInstance.eval(item.expression, context);
        resultString += `#${item.name}\n`
        resultString += `${value}\n\n`;
    }

    return {
        content: [
            {
                type: "text",
                text: resultString
            }
        ]
    }
}
