#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./server.js";

const server = await createMcpServer();
await server.connect(new StdioServerTransport());
console.error("a02-career-navigation-mcp 0.2.1 running on stdio");
