import { ToolDefinition } from "../definition";
import { ToolRepository } from "./";
import { Etcd3 } from 'etcd3';

export class EtcdToolRepository implements ToolRepository {
    private readonly client: Etcd3;

    constructor(private readonly endpoint: string) {
        this.client = new Etcd3({
            hosts: [endpoint]
        });
    }

    async getToolById(id: string): Promise<ToolDefinition> {
        const jsonValue = await this.client.get(id).string()
        if (!jsonValue) {
            throw new Error("Tool not found, key " + id)
        }
        const object = JSON.parse(jsonValue) as ToolDefinition
        return object
    }

    async getToolIds(): Promise<string[]> {
        const keys = await this.client.getAll().keys()
        return keys
    }

    async saveTool(tool: ToolDefinition): Promise<void> {
        const jsonValue = JSON.stringify(tool);
        await this.client.put(tool.id).value(jsonValue);
    }

    async deleteTool(id: string): Promise<void> {
        await this.client.delete().key(id)
    }
}
