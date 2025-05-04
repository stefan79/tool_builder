import { ToolDefinition } from "../definition";
import { Config } from "../../config";
import { FileToolRepository } from "./file";
import { EtcdToolRepository } from "./etcd";

export interface ToolRepository {
    getToolById(id: string): Promise<ToolDefinition>;
    getToolIds(): Promise<string[]>;
    saveTool(tool: ToolDefinition): Promise<void>;
    deleteTool(id: string): Promise<void>;
}

export function createRepository(config: Config): ToolRepository {
    if (config.repositoryType === 'file') {
        return new FileToolRepository(config.file?.basePath || './data');
    } else if (config.repositoryType === 'etcd') {
        return new EtcdToolRepository(config.etcd?.endpoints?.[0] || 'localhost:2379');
    }
    throw new Error('Invalid repository type');
}