import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Request, Response } from 'express';

const transports: Record<string, SSEServerTransport> = {}; // Store active SSE transports by session ID

export const routeSse = (server: McpServer) => (req: Request, res: Response) => {
  const transport = new SSEServerTransport("/messages", res);
  transports[transport.sessionId] = transport;

  // Clean up on connection close
  res.on("close", () => {
    delete transports[transport.sessionId];
  });

  return server.connect(transport);
}

export const routeMessage = (_server: McpServer) => (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];

  if (transport) {
    return transport.handlePostMessage(req, res); // Forward messages to the server
  } else {
    res.status(400).send("No active session found for this sessionId");
  }
}