import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { EtcdToolRepository } from '../../tool/repository/etcd';
import { ToolDefinition } from '../../tool/definition';
import { execSync } from 'child_process';

describe('EtcdToolRepository Integration Tests', () => {
    let container: StartedTestContainer;
    let repository: EtcdToolRepository;
    const testDirectory = 'test-tools';

    beforeAll(async () => {
        // Start the test environment using docker-compose
        execSync('docker-compose -f docker-compose.test.yml up -d');
        
        // Create repository instance with fixed port (as defined in docker-compose)
        repository = new EtcdToolRepository('http://localhost:2379');
        
        // Give etcd a moment to start up
        await new Promise(resolve => setTimeout(resolve, 2000));
    });

    
    afterAll(async () => {
        execSync('docker-compose -f docker-compose.test.yml down');
    });

    beforeEach(async () => {
        // Clean up any existing data
        const ids = await repository.getToolIds();
        for (const id of ids) {
            await repository.deleteTool(id);
        }
    });

    const createTestTool = (id: string): ToolDefinition => ({
        id,
        name: `Test Tool ${id}`,
        version: '1.0.0',
        description: 'A test tool',
        response: [{ name: 'foo', description: 'A test response', type: 'string' }],
        request: [{ name: 'bar', description: 'A test request', type: 'string' }],
        engine: {
            type: 'llm',
            name: 'gpt-3.5-turbo',
            project: 'test',
            prompt: 'test',
            variables: [
                {
                    name: 'foo',
                    expression: 'bar'
                }
            ]
        }
    });

    it('should save and retrieve a tool', async () => {
        const testTool = createTestTool('test1');
        await repository.saveTool(testTool);

        const retrievedTool = await repository.getToolById('test1');
        expect(retrievedTool).toEqual(testTool);
    });

    it('should throw error when getting non-existent tool', async () => {
        await expect(repository.getToolById('non-existent'))
            .rejects
            .toThrow('Tool not found, key non-existent');
    });

    it('should list all tool ids', async () => {
        const tools = [
            createTestTool('test1'),
            createTestTool('test2'),
            createTestTool('test3')
        ];

        for (const tool of tools) {
            await repository.saveTool(tool);
        }

        const ids = await repository.getToolIds();
        expect(ids.sort()).toEqual(['test1', 'test2', 'test3'].sort());
    });

    it('should delete a tool', async () => {
        const testTool = createTestTool('test1');
        await repository.saveTool(testTool);
        
        await repository.deleteTool('test1');
        
        await expect(repository.getToolById('test1'))
            .rejects
            .toThrow('Tool not found, key test1');
    });
});