import { parseToolDefinitionFromYaml, marshalToolDefinitionToYaml } from '../tool/util';

describe('Tool Definition Parser', () => {
  const validToolYaml = `
  name: date tool
  version: 1.0.0
  id: date_tool
  description: A tool to get the current date
  request:
    - name: timezone
      description: The timezone to use for the date
      type: string  
  response: 
    - name: date
      description: The date in the format of YYYY-MM-DD
      type: string
  engine:
    type: llm
    name: gpt-3.5-turbo
    prompt: "date"
    variables: 
      - name: currentDate
        expression: "now().tz(request.timezone).format('dddd, DD-MM-YYYY')"
`;

  it('should successfully parse a valid tool definition', () => {
    const result = parseToolDefinitionFromYaml(validToolYaml);
    expect(result).toEqual({
      name: 'date tool',
      version: '1.0.0',
      id: 'date_tool',
      description: 'A tool to get the current date',
      request: [{
        name: 'timezone',
        description: 'The timezone to use for the date',
        type: 'string'
      }],
      response: [{
        name: 'date',
        description: 'The date in the format of YYYY-MM-DD',
        type: 'string'
      }],
      engine: {
        type: 'llm',
        name: 'gpt-3.5-turbo',
        prompt: 'date',
        variables: [{
          name: 'currentDate',
          expression: 'now().tz(request.timezone).format(\'dddd, DD-MM-YYYY\')'
        }]
      }
    });
  });

  it('should throw error for missing required fields', () => {
    const invalidYaml = `
- name: date tool
  version: 1.0.0
  # missing id and description
  request:
    - name: timezone
      description: The timezone to use for the date
      type: string
`;
    expect(() => parseToolDefinitionFromYaml(invalidYaml)).toThrow('Failed to parse tool definition: Missing required fields in tool definition: name, version, id, description');
  });

  it('should throw error for invalid parameter type', () => {
    const invalidTypeYaml = `
  name: date tool
  version: 1.0.0
  id: date_tool
  description: A tool to get the current date
  request:
    - name: timezone
      description: The timezone to use for the date
      type: invalid_type
  response: []
  engine:
    - type: llm
      name: gpt-3.5-turbo
      prompt: "date"
`;
    expect(() => parseToolDefinitionFromYaml(invalidTypeYaml)).toThrow('Invalid parameter type');
  });

  it('should throw error for missing engine configuration', () => {
    const noEngineYaml = `
  name: date tool
  version: 1.0.0
  id: date_tool
  description: A tool to get the current date
  request: []
  response: []
  engine: {}
`;
    expect(() => parseToolDefinitionFromYaml(noEngineYaml)).toThrow('Engine configuration is required');
  });

  it('should throw error for invalid engine variable configuration', () => {
    const invalidEngineVarYaml = `
  name: date tool
  version: 1.0.0
  id: date_tool
  description: A tool to get the current date
  request: []
  response: []
  engine:
    type: llm
    name: gpt-3.5-turbo
    prompt: "date"
    variables:
      - name: currentDate
        # missing expression
`;
    expect(() => parseToolDefinitionFromYaml(invalidEngineVarYaml)).toThrow('Failed to parse tool definition: variables must be an array of objects with name and expression');
  });
});
