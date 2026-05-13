---
name: claude-local-gateway
description: Thiết kế hệ thống tích hợp Claude API theo mô hình local-first, nơi người dùng tự cấu hình API key phía client và hệ thống đủ generic để nhiều ứng dụng khác nhau cùng dùng được. Dùng skill này khi người dùng muốn: thiết kế local AI gateway, tích hợp Claude/OpenAI vào app mà không cần backend, cho phép user tự nhập API key, hoặc xây dựng shared AI layer dùng chung giữa nhiều app. Trigger khi nghe: "local first", "người dùng tự nhập API key", "không cần server", "dùng chung Claude giữa nhiều app", "cấu hình API phía client".
---

# Claude Local Gateway — Thiết kế hệ thống AI tích hợp local-first

Skill này hướng dẫn thiết kế một **AI Gateway Layer** chạy hoàn toàn phía client (local-first), cho phép:

- Người dùng tự cấu hình và lưu API key trên thiết bị của họ
- Nhiều ứng dụng khác nhau dùng chung một lớp gọi AI
- Không cần backend server để proxy API call

---

## Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────┐
│                     USER DEVICE (Local)                  │
│                                                          │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐             │
│  │  App A   │   │  App B   │   │  App C   │             │
│  │(Language)│   │(Chatbot) │   │(Any App) │             │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘             │
│       │              │              │                    │
│       └──────────────┼──────────────┘                    │
│                      ▼                                   │
│          ┌───────────────────────┐                       │
│          │   Claude Gateway SDK  │  ← Shared layer       │
│          │  (local npm package / │                       │
│          │   shared module)      │                       │
│          │                       │                       │
│          │  - Config manager     │                       │
│          │  - API key store      │                       │
│          │  - Prompt builder     │                       │
│          │  - Response parser    │                       │
│          │  - Error handler      │                       │
│          └──────────┬────────────┘                       │
│                     │                                    │
└─────────────────────┼────────────────────────────────────┘
                      │ HTTPS (direct to Anthropic)
                      ▼
            ┌──────────────────┐
            │   Claude API     │
            │  api.anthropic   │
            │  .com/v1/messages│
            └──────────────────┘
```

---

## Thành phần cốt lõi cần thiết kế

### 1. Config Manager — Quản lý cấu hình & API key

Đây là thành phần quan trọng nhất. Phải thiết kế sao cho:

- API key được lưu an toàn trên thiết bị (không plain text)
- Hỗ trợ nhiều provider (Claude, OpenAI, Gemini)
- Config có thể export/import giữa các app

**Cấu trúc config:**

```json
{
  "version": "1.0",
  "providers": {
    "claude": {
      "api_key": "<encrypted hoặc keychain>",
      "model": "claude-sonnet-4-5",
      "max_tokens": 2000,
      "enabled": true
    },
    "openai": {
      "api_key": "<encrypted hoặc keychain>",
      "model": "gpt-4o-mini",
      "max_tokens": 2000,
      "enabled": false
    }
  },
  "default_provider": "claude",
  "app_configs": {
    "language_app": {
      "provider": "claude",
      "temperature": 0.3,
      "system_prompt_prefix": "You are an English teacher..."
    },
    "chatbot_app": {
      "provider": "claude",
      "temperature": 0.8
    }
  }
}
```

**Lưu trữ API key an toàn theo platform:**

```
Mobile (iOS/Android) → Keychain / Keystore (OS-level secure storage)
Desktop (Electron)   → electron-keytar (system keychain)
Web (PWA)            → IndexedDB với Web Crypto API (encrypt trước khi lưu)
React Native         → react-native-keychain
```

---

### 2. Gateway SDK — Interface dùng chung

Đây là lớp trừu tượng mà tất cả app gọi vào. API phải đơn giản và nhất quán.

**Interface cốt lõi:**

```typescript
// Mọi app chỉ cần gọi hàm này
interface ClaudeGateway {
  // Gọi AI với message đơn giản
  ask(prompt: string, options?: CallOptions): Promise<AIResponse>;

  // Gọi AI với system prompt + user message
  chat(messages: Message[], options?: CallOptions): Promise<AIResponse>;

  // Stream response (cho UX mượt hơn)
  stream(prompt: string, options?: CallOptions): AsyncIterator<string>;

  // Kiểm tra API key có hợp lệ không
  validateKey(apiKey: string, provider?: string): Promise<boolean>;

  // Lấy config hiện tại
  getConfig(): GatewayConfig;

  // Cập nhật config (API key, model, etc.)
  setConfig(config: Partial<GatewayConfig>): void;
}

interface CallOptions {
  systemPrompt?: string; // Override system prompt cho call này
  model?: string; // Override model
  maxTokens?: number;
  temperature?: number;
  appId?: string; // Để load app-specific config
  schema?: JSONSchema; // Yêu cầu AI trả về JSON theo schema
}

interface AIResponse {
  content: string;
  parsed?: object; // Nếu schema được cung cấp
  provider: string; // "claude" | "openai"
  model: string;
  usage: { input: number; output: number; total: number };
  cached: boolean;
}
```

---

### 3. Prompt Builder — Xây dựng prompt theo app

Mỗi app đăng ký system prompt riêng. Gateway tự động inject vào mỗi call.

```
App đăng ký:
  appId: "language_app"
  systemPrompt: "You are an English teacher..."

Khi gọi:
  gateway.ask("Chấm câu này...", { appId: "language_app" })

Gateway tự build:
  system: "You are an English teacher..." + global_prefix
  user: "Chấm câu này..."
```

---

### 4. Response Cache — Tránh gọi AI lặp lại

Cache theo hash của (systemPrompt + userMessage). TTL cấu hình được theo app.

```
Cache key = SHA256(provider + model + systemPrompt + userMessage)
Cache store = SQLite local (hoặc AsyncStorage / IndexedDB)
TTL = 7 ngày mặc định, override per app
```

---

### 5. UI Cấu hình API Key (Settings Screen)

Màn hình đơn giản cho người dùng nhập và quản lý key:

```
┌─────────────────────────────────┐
│  ⚙ AI Configuration             │
│─────────────────────────────────│
│  Provider: [Claude ▼]           │
│                                 │
│  API Key:                       │
│  [sk-ant-••••••••••••] [Test]   │
│                                 │
│  Model: [claude-sonnet-4-5 ▼]  │
│  Max tokens: [2000]             │
│                                 │
│  Status: ✓ Connected            │
│                                 │
│  [Save]  [Clear Key]            │
└─────────────────────────────────┘
```

Khi user nhấn **[Test]**: gọi thử một request nhỏ, hiển thị Connected/Failed.

---

## Quy trình triển khai

### Bước 1: Tạo shared package/module

```
Nếu dùng monorepo (nhiều app cùng codebase):
  packages/
  └── claude-gateway/
      ├── src/
      │   ├── index.ts          # Public API
      │   ├── config.ts         # Config manager
      │   ├── providers/
      │   │   ├── claude.ts
      │   │   └── openai.ts
      │   ├── cache.ts
      │   └── promptBuilder.ts
      └── package.json

Nếu các app độc lập:
  → Publish lên npm private registry
  → Hoặc copy trực tiếp vào mỗi app (ít lý tưởng hơn)
```

### Bước 2: Implement Config Manager

```typescript
// packages/claude-gateway/src/config.ts

import * as Keychain from "react-native-keychain"; // hoặc tương đương

const SERVICE_NAME = "claude-gateway";

export class ConfigManager {
  private config: GatewayConfig = defaultConfig;

  // Lưu API key vào secure storage (không plain text)
  async setApiKey(provider: string, apiKey: string): Promise<void> {
    await Keychain.setGenericPassword(`${SERVICE_NAME}:${provider}`, apiKey, {
      service: SERVICE_NAME,
    });
    this.config.providers[provider].api_key = "***stored***";
  }

  // Lấy API key từ secure storage
  async getApiKey(provider: string): Promise<string | null> {
    const creds = await Keychain.getGenericPassword({
      service: `${SERVICE_NAME}:${provider}`,
    });
    return creds ? creds.password : null;
  }

  // Xóa key (logout / reset)
  async clearApiKey(provider: string): Promise<void> {
    await Keychain.resetGenericPassword({
      service: `${SERVICE_NAME}:${provider}`,
    });
  }

  // Config không nhạy cảm lưu vào AsyncStorage / localStorage
  async saveConfig(config: Partial<GatewayConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    await AsyncStorage.setItem(
      `${SERVICE_NAME}:config`,
      JSON.stringify(this.config),
    );
  }

  async loadConfig(): Promise<GatewayConfig> {
    const raw = await AsyncStorage.getItem(`${SERVICE_NAME}:config`);
    this.config = raw ? JSON.parse(raw) : defaultConfig;
    return this.config;
  }
}
```

### Bước 3: Implement Claude Provider

```typescript
// packages/claude-gateway/src/providers/claude.ts

export class ClaudeProvider {
  async call(params: {
    apiKey: string;
    systemPrompt: string;
    messages: Message[];
    model?: string;
    maxTokens?: number;
    schema?: JSONSchema;
  }): Promise<AIResponse> {
    const body = {
      model: params.model ?? "claude-sonnet-4-5",
      max_tokens: params.maxTokens ?? 2000,
      system: params.systemPrompt,
      messages: params.messages,
    };

    // Nếu có schema → yêu cầu JSON output
    if (params.schema) {
      body.system += `\n\nRespond ONLY with valid JSON matching this schema:\n${JSON.stringify(params.schema)}`;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": params.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new ClaudeError(
        err.error?.message ?? "API call failed",
        response.status,
      );
    }

    const data = await response.json();
    const content = data.content[0].text;

    return {
      content,
      parsed: params.schema ? JSON.parse(content) : undefined,
      provider: "claude",
      model: data.model,
      usage: {
        input: data.usage.input_tokens,
        output: data.usage.output_tokens,
        total: data.usage.input_tokens + data.usage.output_tokens,
      },
      cached: false,
    };
  }

  async *stream(params: {
    apiKey: string;
    systemPrompt: string;
    messages: Message[];
    model?: string;
  }) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": params.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: params.model ?? "claude-sonnet-4-5",
        max_tokens: 2000,
        stream: true,
        system: params.systemPrompt,
        messages: params.messages,
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

      for (const line of lines) {
        const event = JSON.parse(line.slice(6));
        if (event.type === "content_block_delta") {
          yield event.delta.text;
        }
      }
    }
  }
}
```

### Bước 4: Implement Gateway (Entry Point)

```typescript
// packages/claude-gateway/src/index.ts

export class ClaudeGateway {
  private configManager = new ConfigManager();
  private claude = new ClaudeProvider();
  private openai = new OpenAIProvider();
  private cache = new ResponseCache();

  // Hàm chính — mọi app gọi vào đây
  async ask(prompt: string, options: CallOptions = {}): Promise<AIResponse> {
    return this.chat([{ role: "user", content: prompt }], options);
  }

  async chat(
    messages: Message[],
    options: CallOptions = {},
  ): Promise<AIResponse> {
    // 1. Load config
    const config = await this.configManager.loadConfig();
    const provider = options.appId
      ? config.app_configs[options.appId]?.provider
      : config.default_provider;

    // 2. Lấy API key từ secure storage
    const apiKey = await this.configManager.getApiKey(provider);
    if (!apiKey)
      throw new Error(`No API key configured for provider: ${provider}`);

    // 3. Build system prompt
    const systemPrompt = this.buildSystemPrompt(options, config);

    // 4. Kiểm tra cache
    const cacheKey = this.cache.buildKey(provider, systemPrompt, messages);
    const cached = await this.cache.get(cacheKey);
    if (cached) return { ...cached, cached: true };

    // 5. Gọi provider phù hợp
    let result: AIResponse;
    try {
      if (provider === "claude") {
        result = await this.claude.call({
          apiKey,
          systemPrompt,
          messages,
          ...options,
        });
      } else {
        result = await this.openai.call({
          apiKey,
          systemPrompt,
          messages,
          ...options,
        });
      }
    } catch (error) {
      // Fallback sang provider khác nếu cấu hình
      result = await this.callFallback(error, messages, options, config);
    }

    // 6. Lưu cache
    await this.cache.set(cacheKey, result);
    return result;
  }

  async *stream(
    prompt: string,
    options: CallOptions = {},
  ): AsyncGenerator<string> {
    const config = await this.configManager.loadConfig();
    const provider = config.default_provider;
    const apiKey = await this.configManager.getApiKey(provider);
    if (!apiKey) throw new Error("No API key configured");

    const systemPrompt = this.buildSystemPrompt(options, config);

    if (provider === "claude") {
      yield* this.claude.stream({
        apiKey,
        systemPrompt,
        messages: [{ role: "user", content: prompt }],
      });
    }
  }

  async validateKey(apiKey: string, provider = "claude"): Promise<boolean> {
    try {
      // Gọi thử với prompt tối giản
      if (provider === "claude") {
        await this.claude.call({
          apiKey,
          systemPrompt: "Reply with OK.",
          messages: [{ role: "user", content: "ping" }],
          maxTokens: 10,
        });
      }
      return true;
    } catch {
      return false;
    }
  }

  private buildSystemPrompt(
    options: CallOptions,
    config: GatewayConfig,
  ): string {
    const parts: string[] = [];
    if (
      options.appId &&
      config.app_configs[options.appId]?.system_prompt_prefix
    ) {
      parts.push(config.app_configs[options.appId].system_prompt_prefix);
    }
    if (options.systemPrompt) parts.push(options.systemPrompt);
    return parts.join("\n\n");
  }
}

// Singleton export — import một lần, dùng mọi nơi
export const gateway = new ClaudeGateway();
```

### Bước 5: Đăng ký app vào Gateway

```typescript
// Mỗi app khai báo config của mình khi khởi động

// App học ngôn ngữ
await gateway.setConfig({
  app_configs: {
    language_app: {
      provider: "claude",
      temperature: 0.3,
      system_prompt_prefix: `
        You are an expert English teacher for Vietnamese learners.
        Always explain in Vietnamese. Return JSON only when asked.
      `,
    },
  },
});

// Sau đó gọi bình thường, truyền appId:
const result = await gateway.ask('Grade this answer: "She go to school"', {
  appId: "language_app",
  schema: gradingSchema,
});
```

### Bước 6: Màn hình Settings trong mỗi App

```typescript
// Màn hình cấu hình — dùng lại cho tất cả app

function APISettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');

  const handleTest = async () => {
    setStatus('testing');
    const valid = await gateway.validateKey(apiKey, 'claude');
    setStatus(valid ? 'ok' : 'fail');
  };

  const handleSave = async () => {
    await gateway.configManager.setApiKey('claude', apiKey);
    await gateway.configManager.saveConfig({ default_provider: 'claude' });
  };

  return (
    <View>
      <TextInput
        value={apiKey}
        onChangeText={setApiKey}
        placeholder="sk-ant-api..."
        secureTextEntry
      />
      <Button title="Test Connection" onPress={handleTest} />
      {status === 'ok' && <Text>✓ Connected</Text>}
      {status === 'fail' && <Text>✗ Invalid key</Text>}
      <Button title="Save" onPress={handleSave} />
    </View>
  );
}
```

---

## Lưu ý quan trọng khi thiết kế local-first

### CORS — Vấn đề thường gặp nhất

Anthropic API có thể block request từ browser (web app) do CORS policy.

```
Giải pháp theo platform:
  Mobile (RN/Flutter)  → Không có vấn đề CORS, gọi thẳng
  Desktop (Electron)   → Không có vấn đề CORS, gọi thẳng
  Web (PWA/Browser)    → CÓ vấn đề CORS → cần proxy nhỏ
                         (có thể dùng Cloudflare Worker miễn phí)
```

**Nếu bắt buộc dùng web:** Deploy một Cloudflare Worker đơn giản làm proxy — user vẫn dùng API key của họ, Worker chỉ forward request.

### Bảo mật API key trong local-first

```
✓ Dùng OS Keychain / Keystore (secure hardware)
✓ KHÔNG lưu vào localStorage (plain text, dễ bị đọc)
✓ KHÔNG log API key ra console
✓ Cho phép user xóa key bất cứ lúc nào
✓ Hiển thị key dạng masked: sk-ant-••••••ab12
```

### Offline / Error handling

```typescript
// Gateway nên handle gracefully:

class ClaudeError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
  }
}

// Mapping error code → thông báo thân thiện:
const ERROR_MESSAGES = {
  401: "API key không hợp lệ. Vui lòng kiểm tra lại trong Cài đặt.",
  429: "Bạn đã dùng quá giới hạn. Thử lại sau ít phút.",
  500: "Dịch vụ AI tạm thời không khả dụng.",
  0: "Không có kết nối mạng. Kiểm tra internet của bạn.",
};
```

---

## Checklist triển khai

```
Giai đoạn 1 — Core Gateway (1–2 tuần)
  [ ] Tạo shared package/module
  [ ] Implement ConfigManager với secure storage
  [ ] Implement ClaudeProvider (call + stream)
  [ ] Implement ResponseCache (SQLite / AsyncStorage)
  [ ] Implement validateKey()
  [ ] Unit test với mock API

Giai đoạn 2 — Tích hợp vào App đầu tiên (1 tuần)
  [ ] Màn hình Settings nhập API key
  [ ] Test connection button
  [ ] Hiển thị trạng thái kết nối
  [ ] Handle lỗi thân thiện với người dùng
  [ ] Test end-to-end với Claude API thật

Giai đoạn 3 — Mở rộng sang App thứ hai (2–3 ngày)
  [ ] Import gateway package vào App mới
  [ ] Đăng ký app config (system prompt, provider)
  [ ] Reuse màn hình Settings (hoặc embed vào Settings của app mới)
  [ ] Verify cùng API key hoạt động cho cả hai app
```
