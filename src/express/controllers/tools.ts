import { NextFunction, Request, Response } from 'express';
import { parseToolDefinitionFromYaml, marshalToolDefinitionToYaml } from '../../tool/util';
import { ToolDefinition } from '../../tool/definition';
import { ToolRepository } from '../../tool/repository';
import * as yaml from 'js-yaml';
import {  getContext } from '../index';

export const listTools = (repository: ToolRepository) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const context = getContext(res);
    context.toolIds = await repository.getToolIds();
    serializeToolsIdsToYamlBody(req, res);
    next();
};

export const listTool = (repository: ToolRepository) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = req.params.id;
    const context = getContext(res);
    context.tool = await repository.getToolById(id);
    serializeToolDefinitionToYamlBody(req, res);
    next();
};

export const saveTool = (repository: ToolRepository) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const context = getContext(res);
    await repository.saveTool(context.tool as ToolDefinition);
    serializeToolDefinitionToYamlBody(req, res);
    next();
};

export const deleteTool = (repository: ToolRepository) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = req.params.id;
    await repository.deleteTool(id);
    next();
};

export const parseToolDefinitionFromYamlBody = (req: Request, res: Response, next: NextFunction): void => {
    if (req.headers['content-type'] === 'application/x-yaml') {
        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => {
            const yamlContent = Buffer.concat(chunks).toString('utf-8');
            try {
                const context = getContext(res);
                context.tool = parseToolDefinitionFromYaml(yamlContent);
                next();
            } catch (error) {
                res.status(400).send({ error: 'Failed to parse tool definition: ' + (error instanceof Error ? error.message : 'Unknown error') });
            }
        });
    } else {
        next();
    }
};

const serializeToolsIdsToYamlBody = (req: Request, res: Response): void => {
    const context = getContext(res);
    if (context.toolIds && Array.isArray(context.toolIds)) {
        const yamlContent = yaml.dump(context.toolIds);
        res.status(200);
        res.setHeader('Content-Type', 'text/yaml');
        res.setHeader('Content-Disposition', 'inline; filename="ids.yaml"');
        res.send(yamlContent);
    } 
};


const serializeToolDefinitionToYamlBody = (req: Request, res: Response): void => {
    const context = getContext(res);
    if (context.tool && typeof context.tool === 'object') {
        const yamlContent = marshalToolDefinitionToYaml(context.tool as ToolDefinition);
        res.status(200);
        res.setHeader('Content-Type', 'text/yaml');
        res.setHeader('Content-Disposition', 'inline; filename="tool.yaml"');
        res.send(yamlContent);
    } 
};
