import { LLMEngineConfig, ToolDefinition, ToolParameter, RestEngineConfig, KeyedExpression } from "./definition";
import * as yaml from 'js-yaml';

const keyedExpressionValidator = (keyName: string, input: Record<string, unknown>): KeyedExpression[] => {
  let result: KeyedExpression[] = [];
  if (!input[keyName]){
    return result;
  }
  if (!Array.isArray(input[keyName])) {
    throw new Error(`${keyName} must be an array`);
  }

  result = input[keyName].map(v => {
    if (!v || typeof v !== 'object') {
      throw new Error(`${keyName} must be an array of objects`);
    }
    const variable = v as Record<string, unknown>;
    if (!variable.name || typeof variable.name !== 'string' ||
        !variable.expression || typeof variable.expression !== 'string') {
      throw new Error(`${keyName} must be an array of objects with name and expression, got ${JSON.stringify(v)}`);
    }
    return {
      name: variable.name,
      expression: variable.expression
    };
  });

  return result;
};

const restEngineValidator = (input: unknown): RestEngineConfig => {
  const e = input as Record<string, unknown>;
  if (!e.type || typeof e.type !== 'string' ||
      !e.name || typeof e.name !== 'string' ||
      !e.url || typeof e.url !== 'string' ||
      !e.method || typeof e.method !== 'string' ||
      !['GET', 'POST', 'PUT', 'DELETE'].includes(e.method)) {
    throw new Error('Invalid engine configuration');
  }

  const engine: RestEngineConfig = {
    name: e.name as string,
    type: 'rest',
    url: e.url,
    method: e.method as 'GET' | 'POST' | 'PUT' | 'DELETE',
    headers: [],
    parameters: [],
    response: []
  };

  engine.grouping = e.grouping ? e.grouping as string : undefined;

  engine.headers = keyedExpressionValidator('headers', e);
  engine.parameters = keyedExpressionValidator('parameters', e);
  engine.response = keyedExpressionValidator('response', e);

  return engine;
};


const llmEngineValidator = (input: unknown): LLMEngineConfig => {
  const e = input as Record<string, unknown>;
  if (!e.type || typeof e.type !== 'string' ||
      !e.name || typeof e.name !== 'string' ||
      !e.prompt || typeof e.prompt !== 'string') {
    throw new Error('Invalid engine configuration');
  }

  const engine: LLMEngineConfig = {
    type: 'llm',
    name: e.name,
    prompt: e.prompt,
    project: e.project ? e.project as string : undefined,
    variables: []
  };

  engine.variables = keyedExpressionValidator('variables', e);

  return engine;
};

export function parseToolDefinitionFromYaml(yamlContent: string): ToolDefinition {
    try {
      const parsed = yaml.load(yamlContent);
      return validateToolDefinition(parsed);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to parse tool definition: ${errorMessage}`);
    }
  }

export function marshalToolDefinitionToYaml(tool: ToolDefinition): string {
    return yaml.dump(tool);
  }

  function validateToolDefinition(parsed: unknown): ToolDefinition {
    if (!parsed || typeof parsed !== 'object') {
      const definition = typeof parsed;
      throw new Error(`Invalid tool definition format: ${definition}`);
    }
  
    const tool = parsed as Record<string, unknown>;
    
    // Validate required fields
    if (!tool.name || typeof tool.name !== 'string' ||
        !tool.version || typeof tool.version !== 'string' ||
        !tool.id || typeof tool.id !== 'string' ||
        !tool.description || typeof tool.description !== 'string') {
      throw new Error('Missing required fields in tool definition: name, version, id, description');
    }
  
    // Validate request and response parameters
    if (!Array.isArray(tool.request) || !Array.isArray(tool.response)) {
      throw new Error('Request and response must be arrays');
    }
  
    // Validate parameter types
    const validateParameters = (params: unknown[]): ToolParameter[] => {
      return params.map(param => {
        if (!param || typeof param !== 'object') {
          throw new Error('Invalid parameter definition');
        }
        const p = param as Record<string, unknown>;
        if (!p.name || typeof p.name !== 'string' ||
            !p.description || typeof p.description !== 'string' ||
            !p.type || typeof p.type !== 'string') {
          throw new Error('Invalid parameter definition');
        }
        if (!['string', 'number', 'boolean'].includes(p.type)) {
          throw new Error(`Invalid parameter type: ${p.type}`);
        }
        return {
          name: p.name,
          description: p.description,
          type: p.type as 'string' | 'boolean' | 'number'
        };
      });
    };
  
    const request = validateParameters(tool.request);
    const response = validateParameters(tool.response);
  
    // Validate engine configuration
    if (!tool.engine || typeof tool.engine !== 'object' || Object.keys(tool.engine).length === 0) {
      throw new Error('Engine configuration is required');
    }

    let engine: LLMEngineConfig | RestEngineConfig;
    const engineConfig = tool.engine as Record<string, unknown>;
    switch (engineConfig.type) {
      case 'llm':
        engine = llmEngineValidator(engineConfig);
        break;
      case 'rest':
        engine = restEngineValidator(engineConfig);
        break;
      default:
        throw new Error(`Invalid engine type: ${engineConfig.type}`);
    }
  
    return {
      name: tool.name,
      version: tool.version,
      id: tool.id,
      description: tool.description,
      request,
      response,
      engine
    };
  }