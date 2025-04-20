import { ToolDefinition } from "./definition";

export interface ToolRepository {
    getToolById(id: string): Promise<ToolDefinition>;
    getToolIds(): Promise<string[]>;
    saveTool(tool: ToolDefinition): Promise<void>;
    deleteTool(id: string): Promise<void>;
}