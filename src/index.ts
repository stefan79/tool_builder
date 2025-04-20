import { loadLLMConfigFromFile } from './engines/llm/loader';
import { buildEngines } from './engines/llm';
import * as dotenv from 'dotenv';

const startServer = async () => {
    dotenv.config();
    const config = await loadLLMConfigFromFile();
    const engines = buildEngines(config);
    console.log(engines);
};

startServer();
