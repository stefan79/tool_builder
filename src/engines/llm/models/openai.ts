import { LLMConfig } from '../definitions';
import { LLMEngine } from '../index';
import {chatter} from '../definitions';
import { ChatOpenAI } from "@langchain/openai";
import { LLMEngineBuilder } from '../builder';


const localChatter = (model: ChatOpenAI): chatter => async (messages) => {
    const chunk = await model.invoke(messages);
    return chunk.text;
}
    

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
        name: config.name,
        model
    }

};
