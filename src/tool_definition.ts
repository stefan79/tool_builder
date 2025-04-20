
import * as yaml from 'js-yaml';

export interface ToolParameter {
  name: string;
  description: string;
  type: 'string' | 'object' | 'boolean';
}

export interface EngineVariable {
  name: string;
  expression: string;
}

export interface EngineConfig {
  type: 'llm' | 'http';
  name: string;
  prompt: string;
  variables?: EngineVariable[];
}

export interface ToolDefinition {
  name: string;
  version: string;
  id: string;
  description: string;
  request: ToolParameter[];
  response: ToolParameter[];
  engine: EngineConfig;
}

export function parseToolDefinition(yamlContent: string): ToolDefinition {
  try {
    const parsed = yaml.load(yamlContent);
    if (Array.isArray(parsed)) {
      if (parsed.length !== 1) {
        throw new Error('Expected exactly one tool definition');
      }
      return validateToolDefinition(parsed[0]);
    }
    return validateToolDefinition(parsed);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to parse tool definition: ${errorMessage}`);
  }
}

function validateToolDefinition(parsed: unknown): ToolDefinition {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid tool definition format');
  }

  const tool = parsed as Record<string, unknown>;
  
  // Validate required fields
  if (!tool.name || typeof tool.name !== 'string' ||
      !tool.version || typeof tool.version !== 'string' ||
      !tool.id || typeof tool.id !== 'string' ||
      !tool.description || typeof tool.description !== 'string') {
    throw new Error('Missing required fields in tool definition');
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
      if (!['string', 'object', 'boolean'].includes(p.type)) {
        throw new Error(`Invalid parameter type: ${p.type}`);
      }
      return {
        name: p.name,
        description: p.description,
        type: p.type as 'string' | 'object' | 'boolean'
      };
    });
  };

  const request = validateParameters(tool.request);
  const response = validateParameters(tool.response);

  // Validate engine configuration
  if (!tool.engine || typeof tool.engine !== 'object' || Object.keys(tool.engine).length === 0) {
    throw new Error('Engine configuration is required');
  }

  const e = tool.engine as Record<string, unknown>;
  if (!e.type || typeof e.type !== 'string' ||
      !e.name || typeof e.name !== 'string' ||
      !e.prompt || typeof e.prompt !== 'string') {
    throw new Error('Invalid engine configuration');
  }

  const engine: EngineConfig = {
    type: e.type as 'llm' | 'http',
    name: e.name,
    prompt: e.prompt
  };

  if (e.variables) {
    if (!Array.isArray(e.variables)) {
      throw new Error('Engine variables must be an array');
    }

    engine.variables = e.variables.map(v => {
      if (!v || typeof v !== 'object') {
        throw new Error('Invalid engine variable configuration');
      }
      const variable = v as Record<string, unknown>;
      if (!variable.name || typeof variable.name !== 'string' ||
          !variable.expression || typeof variable.expression !== 'string') {
        throw new Error('Invalid engine variable configuration');
      }
      return {
        name: variable.name,
        expression: variable.expression
      };
    });
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
