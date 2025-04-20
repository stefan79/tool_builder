import { LLMConfig } from "../definitions";

type Loader = () => Promise<LLMConfig[]>;

export const loadLLMConfigFromFile: Loader = async (): Promise<LLMConfig[]> => {
    const fs = require('fs');
    const yaml = require('js-yaml');
    const file = fs.readFileSync('config/llm.yaml', 'utf8');
    const config = yaml.load(file) as LLMConfig[];
    return config;
};
    