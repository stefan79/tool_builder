import express, { Router } from 'express';
import { ToolRepository } from '../../tool/repository';
import { listTools, listTool, saveTool, deleteTool } from '../controllers/tools';
import { parseToolDefinitionFromYamlBody } from '../controllers/tools';

export const toolsRoutes = (repository: ToolRepository): Router => {
    
    const functionRouter = express.Router();

    functionRouter.get('/', 
        listTools(repository)
    );

    functionRouter.get('/:id', 
        listTool(repository));
    
    functionRouter.post('/', 
        parseToolDefinitionFromYamlBody,
        saveTool(repository)
    );

    functionRouter.delete('/:id', 
        deleteTool(repository)
    );

    const toolRouter = express.Router();
    toolRouter.use("/tools", functionRouter)

    return toolRouter
};