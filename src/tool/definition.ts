export interface ToolParameter {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean';
}

export interface KeyedExpression {
  name: string;
  expression: string;
}

export interface BaseEngineConfig {
  type: 'llm' | 'rest';
  name: string;
}

export interface LLMEngineConfig extends BaseEngineConfig {
  type: 'llm';
  prompt: string;
  project?: string;
  variables: KeyedExpression[];
}

export interface RestEngineConfig extends BaseEngineConfig {
  type: 'rest';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  grouping?: string;
  headers: KeyedExpression[];
  parameters: KeyedExpression[];
  response: KeyedExpression[];
}

export interface ToolDefinition {
  name: string;
  version: string;
  id: string;
  description: string;
  request: ToolParameter[];
  response: ToolParameter[];
  engine: LLMEngineConfig | RestEngineConfig;
}

