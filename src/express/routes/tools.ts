import express, { Router } from 'express';
import { ToolRepository } from '../../tool/index';
import { listTools, listTool, saveTool, deleteTool } from '../controllers/tools';
import { parseToolDefinitionFromYamlBody, createContext } from '../controllers/tools';

export const toolsRoutes = (repository: ToolRepository): Router => {
    
    const functionRouter = express.Router();

    functionRouter.get('/', 
        createContext,
        listTools(repository)
    );

    functionRouter.get('/:id', 
        createContext,
        listTool(repository));
    
    functionRouter.post('/', 
        createContext,
        parseToolDefinitionFromYamlBody,
        saveTool(repository)
    );

    functionRouter.delete('/:id', 
        createContext,
        deleteTool(repository)
    );

    const toolRouter = express.Router();
    toolRouter.use("/tools", functionRouter)

    return toolRouter
};