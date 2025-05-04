import { ToolDefinition } from "../definition";
import { ToolRepository } from "..";
import * as fs from 'fs';

import { parseToolDefinitionFromYaml, marshalToolDefinitionToYaml } from "../util";

export class FileToolRepository implements ToolRepository {

    constructor(private readonly directory: string) {}

    async getToolById(id: string): Promise<ToolDefinition> {
        const file = await fs.promises.readFile(`${this.directory}/${id}.yml`, 'utf-8');
        return parseToolDefinitionFromYaml(file);
    }
    async getToolIds(): Promise<string[]> {
        const files = await fs.promises.readdir(this.directory);
        return files.filter(file => file.endsWith('.yml')).map(file => file.replace('.yml', ''));
    }
    async saveTool(tool: ToolDefinition): Promise<void> {
        const contents = marshalToolDefinitionToYaml(tool);
        await fs.promises.writeFile(`${this.directory}/${tool.id}.yml`, contents, 'utf-8');
    }
    async deleteTool(id: string): Promise<void> {
        await fs.promises.unlink(`${this.directory}/${id}.yml`);
    }
}
