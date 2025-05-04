import { LLMConfig } from "../definitions";
import * as fs from 'fs';
import * as yaml from 'js-yaml';

type Loader = () => Promise<LLMConfig[]>;

export const loadLLMConfigFromFile: Loader = async (): Promise<LLMConfig[]> => {
    const file = fs.readFileSync('config/llm.yaml', 'utf8');
    const config = yaml.load(file) as LLMConfig[];
    return config;
};
    