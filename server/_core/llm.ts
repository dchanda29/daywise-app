import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

type LlmProvider = "gemini" | "forge" | "openrouter" | "groq" | "none";

const openAiLikeUrlByProvider = (provider: LlmProvider): string => {
  if (provider === "forge") {
    return ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
      ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
      : "https://forge.manus.im/v1/chat/completions";
  }
  if (provider === "openrouter") return ENV.openRouterApiUrl;
  if (provider === "groq") return ENV.groqApiUrl;
  throw new Error(`Provider ${provider} does not use OpenAI-compatible URL`);
};

const apiKeyByProvider = (provider: LlmProvider): string => {
  if (provider === "gemini") return ENV.geminiApiKey;
  if (provider === "forge") return ENV.forgeApiKey;
  if (provider === "openrouter") return ENV.openRouterApiKey;
  if (provider === "groq") return ENV.groqApiKey;
  return "";
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
  } = params;

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  const providers: Array<{ provider: LlmProvider; model: string }> = [
    {
      provider: ENV.llmProviderPrimary as LlmProvider,
      model: ENV.llmModelPrimary,
    },
    {
      provider: ENV.llmProviderFallback1 as LlmProvider,
      model: ENV.llmModelFallback1,
    },
    {
      provider: ENV.llmProviderFallback2 as LlmProvider,
      model: ENV.llmModelFallback2,
    },
  ].filter(item => item.provider !== "none" && item.model && item.model.trim().length > 0);

  let lastError: unknown = null;
  for (const entry of providers) {
    try {
      if (!apiKeyByProvider(entry.provider)) {
        continue;
      }
      if (entry.provider === "gemini") {
        return await invokeGemini({
          model: entry.model,
          messages,
          responseFormat: normalizedResponseFormat,
          timeoutMs: ENV.llmFailoverTimeoutMs,
        });
      }
      return await invokeOpenAiLike({
        provider: entry.provider,
        model: entry.model,
        messages,
        tools,
        toolChoice: toolChoice || tool_choice,
        responseFormat: normalizedResponseFormat,
        timeoutMs: ENV.llmFailoverTimeoutMs,
      });
    } catch (error) {
      lastError = error;
      console.warn(`[LLM] Provider ${entry.provider} failed`, error);
    }
  }

  throw new Error(`All configured LLM providers failed. Last error: ${String(lastError)}`);
}

async function invokeOpenAiLike({
  provider,
  model,
  messages,
  tools,
  toolChoice,
  responseFormat,
  timeoutMs,
}: {
  provider: LlmProvider;
  model: string;
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  responseFormat?: ResponseFormat;
  timeoutMs: number;
}): Promise<InvokeResult> {
  const payload: Record<string, unknown> = {
    model,
    messages: messages.map(normalizeMessage),
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }

  payload.max_tokens = 4096;

  if (responseFormat) {
    payload.response_format = responseFormat;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const response = await fetch(openAiLikeUrlByProvider(provider), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKeyByProvider(provider)}`,
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  });
  clearTimeout(timer);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as InvokeResult;
}

async function invokeGemini({
  model,
  messages,
  responseFormat,
  timeoutMs,
}: {
  model: string;
  messages: Message[];
  responseFormat?: ResponseFormat;
  timeoutMs: number;
}): Promise<InvokeResult> {
  if (!ENV.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const parts = messages.map(msg => {
    const content = ensureArray(msg.content)
      .map(part => (typeof part === "string" ? part : part.type === "text" ? part.text : JSON.stringify(part)))
      .join("\n");
    return {
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: `${msg.role.toUpperCase()}:\n${content}` }],
    };
  });

  const generationConfig: Record<string, unknown> = {};
  if (responseFormat?.type === "json_object" || responseFormat?.type === "json_schema") {
    generationConfig.responseMimeType = "application/json";
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${ENV.geminiApiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: parts,
        generationConfig,
      }),
      signal: controller.signal,
    }
  );
  clearTimeout(timer);

  if (!response.ok) {
    throw new Error(`Gemini invoke failed: ${response.status} ${response.statusText} - ${await response.text()}`);
  }

  const data = (await response.json()) as any;
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("\n") ?? "";
  return {
    id: data?.responseId ?? "gemini-response",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: text,
        },
        finish_reason: data?.candidates?.[0]?.finishReason ?? "stop",
      },
    ],
  };
}
