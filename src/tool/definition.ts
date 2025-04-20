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
  project?: string;
  variables: EngineVariable[];
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

