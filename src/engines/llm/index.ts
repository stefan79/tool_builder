import { LLMConfig } from "./definitions";
import {OpenAIEngineBuilder} from "./models/openai";


export type LLMEngineBuilder = (config: LLMConfig) => LLMEngine;

export interface LLMEngine {
    name: string;
}

const builders: Record<LLMConfig['type'], LLMEngineBuilder> = {
    openai: OpenAIEngineBuilder,
    anthropic: (config: LLMConfig) => {
        throw new Error('Anthropic engine not implemented');
    }
};

const buildEngine = (config: LLMConfig): LLMEngine => {
    const builder = builders[config.type];
    if (!builder) {
        throw new Error(`Unknown LLM type: ${config.type}`);
    }
    return builder(config);
};

export const buildEngines = (configs: LLMConfig[]): Record<string, LLMEngine> => {
    return configs.map(buildEngine).reduce((acc, engine) => {
        acc[engine.name] = engine;
        return acc;
    }, {} as Record<string, LLMEngine>);
};
