type McpJsonRpcRequest = {
  jsonrpc: "2.0";
  id: string;
  method: string;
  params?: Record<string, unknown>;
};

type McpJsonRpcError = {
  code: number;
  message: string;
  data?: unknown;
};

type McpTextContent = {
  type: "text";
  text: string;
};

type McpCallToolResult = {
  content: McpTextContent[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

type McpJsonRpcResponse = {
  jsonrpc: "2.0";
  id: string;
  result?: McpCallToolResult;
  error?: McpJsonRpcError;
};

const getMcpUrl = () => process.env.EODHD_MCP_URL ?? "http://127.0.0.1:8000/mcp";
let mcpSessionId: string | null = null;
let mcpInitialized = false;

const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream"
  };
  const apiKey = process.env.EODHD_API_KEY;
  if (apiKey && apiKey.trim().length > 0) {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  if (mcpSessionId) {
    headers["Mcp-Session-Id"] = mcpSessionId;
  }
  return headers;
};

const parseJsonMaybe = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const parseEventStream = (payload: string) => {
  const dataLines = payload
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.replace(/^data:\s*/, ""));

  if (dataLines.length === 0) {
    return null;
  }

  const last = dataLines[dataLines.length - 1];
  try {
    return JSON.parse(last) as McpJsonRpcResponse;
  } catch {
    return null;
  }
};

const readMcpResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type") ?? "";
  const bodyText = await response.text();
  if (contentType.includes("text/event-stream")) {
    const parsed = parseEventStream(bodyText);
    if (parsed) return parsed;
  }
  if (bodyText) {
    try {
      return JSON.parse(bodyText) as McpJsonRpcResponse;
    } catch {
      return null;
    }
  }
  return null;
};

const updateSessionFromResponse = (response: Response) => {
  const header = response.headers.get("mcp-session-id") ?? response.headers.get("Mcp-Session-Id");
  if (header && header.trim().length > 0) {
    mcpSessionId = header.trim();
  }
};

const sendMcpRequest = async (requestBody: McpJsonRpcRequest, retry = true) => {
  const response = await fetch(getMcpUrl(), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(requestBody)
  });

  updateSessionFromResponse(response);
  const payload = await readMcpResponse(response);

  if (!response.ok) {
    if (retry && response.status === 400) {
      return sendMcpRequest(requestBody, false);
    }
    const message = payload?.error?.message ?? response.statusText;
    const error = new Error(`MCP request failed (${response.status}): ${message}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  if (!payload) {
    throw new Error("MCP response missing payload");
  }

  return payload;
};

const ensureMcpInitialized = async () => {
  if (mcpInitialized) return;

  const initRequest: McpJsonRpcRequest = {
    jsonrpc: "2.0",
    id: crypto.randomUUID(),
    method: "initialize",
    params: {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: {
        name: "the-list-tool",
        version: "0.1.0"
      }
    }
  };

  await sendMcpRequest(initRequest);

  const initializedNotification: McpJsonRpcRequest = {
    jsonrpc: "2.0",
    id: crypto.randomUUID(),
    method: "notifications/initialized"
  };

  await sendMcpRequest(initializedNotification, false);
  mcpInitialized = true;
};

export async function callMcpTool<T = unknown>(name: string, args: Record<string, unknown>) {
  const requestBody: McpJsonRpcRequest = {
    jsonrpc: "2.0",
    id: crypto.randomUUID(),
    method: "tools/call",
    params: {
      name,
      arguments: args
    }
  };

  await ensureMcpInitialized();
  const payload = await sendMcpRequest(requestBody);

  if (payload.error) {
    throw new Error(payload.error.message);
  }

  if (!payload.result) {
    throw new Error("MCP response missing result");
  }

  if (payload.result.isError) {
    const first = payload.result.content?.[0]?.text ?? "Unknown MCP tool error";
    throw new Error(first);
  }

  if (payload.result.structuredContent) {
    return payload.result.structuredContent as T;
  }

  const text = payload.result.content?.[0]?.text ?? "";
  return parseJsonMaybe(text) as T;
}
