import { LLMConfig } from '../definitions';
import { LLMEngine, LLMEngineBuilder } from '../index';
import { ChatOpenAI } from "@langchain/openai";

export const OpenAIEngineBuilder: LLMEngineBuilder = (config: LLMConfig): LLMEngine => {

    const openAIAPIKey = process.env.OPENAI_API_KEY;
    if (!openAIAPIKey) {
        throw new Error('OpenAI API key not found');
    }
    const model = new ChatOpenAI({
        openAIApiKey: openAIAPIKey,
        ...config.params
    });

    return {
        name: config.name
    }

};

