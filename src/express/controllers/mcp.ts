import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {RequestHandler } from 'express';

const transports: Record<string, SSEServerTransport> = {}; // Store active SSE transports by session ID

export const routeSse = (server: McpServer): RequestHandler => {
    return async (_, res) => {
        const transport = new SSEServerTransport("/messages", res);
        transports[transport.sessionId] = transport;

        // Clean up on connection close
        res.on("close", () => {
            delete transports[transport.sessionId];
        });

        server.connect(transport);
    };
};

export const routeMessage = (): RequestHandler => {
    return async (req, res) => {
        const sessionId = req.query.sessionId as string;
        const transport = transports[sessionId];

        if (transport) {
            transport.handlePostMessage(req, res); // Forward messages to the server
        } else {
            res.status(400).send("No active session found for this sessionId");
        }
    };
};