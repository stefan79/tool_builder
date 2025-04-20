import { NextFunction, Request, Response } from 'express';
import { parseToolDefinitionFromYaml, marshalToolDefinitionToYaml } from '../../tool/util';
import { ToolDefinition } from '../../tool/definition';
import { ToolRepository } from '../../tool/index';
import * as yaml from 'js-yaml';

declare global{
    namespace Express {
        interface Request {
            context: {
                tool?: ToolDefinition;
                toolIds?: string[];
            }
        }
    }
}



export const listTools = (repository: ToolRepository) => async (req: Request, res: Response, next: NextFunction) => {
    req.context.toolIds = await repository.getToolIds();
    serializeToolsIdsToYamlBody(req, res);
    next();
};

export const listTool = (repository: ToolRepository) => async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    req.context.tool = await repository.getToolById(id);
    serializeToolDefinitionToYamlBody(req, res);
    next();
};

export const saveTool = (repository: ToolRepository) => async (req: Request, res: Response, next: NextFunction) => {
    const tool = req.context.tool as ToolDefinition;
    await repository.saveTool(tool);
    serializeToolDefinitionToYamlBody(req, res);
    next();
};

export const deleteTool = (repository: ToolRepository) => async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    await repository.deleteTool(id);
    next();
};

export const createContext = (req: Request, res: Response, next: NextFunction) => {
    if (!req.context) {
        req.context = {};
    }
    next();
};


export const parseToolDefinitionFromYamlBody = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers['content-type'] === 'application/x-yaml') {
        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => {
            const yamlContent = Buffer.concat(chunks).toString('utf-8');
            try {
                req.context.tool = parseToolDefinitionFromYaml(yamlContent);
                next();
            } catch (error) {
                res.status(400).send({ error: 'Failed to parse tool definition: ' + error.message });
            }
        });
    } else {
        next();
    }
};

const serializeToolsIdsToYamlBody = (req: Request, res: Response) => {
    if (req.context.toolIds && Array.isArray(req.context.toolIds)) {
        const yamlContent = yaml.dump(req.context.toolIds);
        res.status(200);
        res.setHeader('Content-Type', 'text/yaml');
        res.setHeader('Content-Disposition', 'inline; filename="ids.yaml"');
        res.send(yamlContent);
    } 
};


const serializeToolDefinitionToYamlBody = (req: Request, res: Response) => {
    if (req.context.tool && typeof req.context.tool === 'object') {
        const yamlContent = marshalToolDefinitionToYaml(req.context.tool as ToolDefinition);
        res.status(200);
        res.setHeader('Content-Type', 'text/yaml');
        res.setHeader('Content-Disposition', 'inline; filename="tool.yaml"');
        res.send(yamlContent);
    } 
};
