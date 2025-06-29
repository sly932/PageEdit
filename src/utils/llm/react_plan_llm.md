# LLM 模块重构计划

## 1. 现状与核心问题

当前的LLM调用实现（`llmService.ts`, `nlpProcessor.ts`）存在若干严重问题，影响功能和可维护性。

-   **A. 架构与实现问题 (Architectural & Implementation Issues)**:
    -   **职责混淆**: `nlpProcessor.ts` 混合了业务逻辑、提示词构建、API调用和结果解析，违反了单一职责原则，难以测试和维护。
    -   **代码冗余**: 为不同LLM提供商构建提示词的逻辑大量重复。
    -   **API调用错误**: 部分LLM（如Claude）的API请求结构不正确。
    -   **错误处理薄弱**: 现有的错误处理机制过于笼统，无法清晰地定位到失败的根源。

## 2. 重构目标

-   **优化架构**: 建立一个职责清晰、可扩展、易于维护的LLM调用链路。
-   **统一接口**: 为所有LLM服务商提供统一的调用接口，简化上层逻辑。
-   **提升可维护性**: 消除代码重复，提供健壮的错误处理机制。
-   **完善配置管理**: 支持用户在popup界面配置详细的LLM参数。
-   **支持消息对话**: 支持多轮对话和历史消息传递。
-   **自定义提供商**: 支持用户自定义LLM服务配置。

## 3. 核心设计方案

我们将采用分层架构，将业务逻辑、提示词管理和API调用彻底分离。

-   **A. 目录结构**:
    ```
    src/
    ├── content/
    │   └── QueryProcessor.ts  # (原 nlpProcessor.ts) 业务逻辑层
    ├── popup/
    │   ├── popup.html        # 包含LLM Settings界面
    │   └── popup.js          # popup界面逻辑，处理LLM配置
    └── utils/
        └── llm/
            ├── PromptManager.ts   # 统一提示词管理
            ├── LLMFactory.ts      # LLM服务工厂
            ├── ConfigManager.ts   # LLM配置管理
            ├── types.ts           # LLM消息类型定义
            └── services/
                ├── ILLMService.ts     # 统一服务接口
                ├── OpenAIService.ts   # 具体实现(硬编码API密钥)
                ├── AnthropicService.ts # Claude服务
                ├── DeepSeekService.ts  # DeepSeek服务
                ├── GoogleService.ts    # Google AI服务
                └── SelfDefineService.ts # 用户自定义服务
    ```

-   **B. 各模块职责**:
    -   **`QueryProcessor.ts` (业务逻辑层)**
        -   负责编排整个流程：获取用户输入、获取LLM配置、调用`PromptManager`获取提示词、通过`LLMFactory`获取服务、调用服务、解析并应用结果。
        -   从 `ConfigManager` 读取全局的LLM配置，如果没有配置则使用默认设置。
        -   **不**直接进行API调用或管理提示词。

    -   **`ConfigManager.ts` (配置管理器)**
        -   管理LLM相关的所有配置，提供统一的配置读取和写入接口。
        -   配置结构：
            ```typescript
            interface LLMConfig {
              provider: 'openai' | 'anthropic' | 'deepseek' | 'google' | 'self-define';
              model: string;
              maxTokens: number;
              temperature: number;
              // 自定义提供商额外配置
              customConfig?: {
                baseUrl: string;
                apiKey: string;
                customModels: string[]; // 用户自定义的模型列表
              };
            }
            
            class ConfigManager {
              static async getLLMConfig(): Promise<LLMConfig>
              static async saveLLMConfig(config: LLMConfig): Promise<void>
              static getAvailableModels(provider: string): string[]
              static getMaxTokensForModel(provider: string, model: string): number
            }
            ```

    -   **`types.ts` (消息类型定义)**
        -   定义统一的消息格式，兼容不同LLM的role定义：
            ```typescript
            interface LLMMessage {
              role: 'user' | 'assistant' | 'system';
              content: string;
            }
            
            interface LLMRequest {
              messages: LLMMessage[];
              systemMessage?: string; // 某些LLM需要单独的系统消息
            }
            ```

    -   **`PromptManager.ts` (提示词管理器)**
        -   统一管理提示词模板，所有服务使用相同的提示词。
        -   返回结构化的消息对象：
            ```typescript
            class PromptManager {
              static getSystemMessage(): string // 系统消息
              static formatUserMessage(userQuery: string): LLMMessage // 用户消息
              static buildRequest(userQuery: string, history?: LLMMessage[]): LLMRequest
            }
            ```

    -   **`services/ILLMService.ts` (统一接口)**
        -   定义所有LLM服务必须实现的统一接口：
            ```typescript
            interface LLMRequestConfig {
              model: string;
              maxTokens: number;
              temperature: number;
            }
            
            interface ILLMService {
              chat(request: LLMRequest, config: LLMRequestConfig): Promise<string>;
              getProviderName(): string;
              getSupportedModels(): string[];
              getMaxTokensForModel(model: string): number;
            }
            ```

    -   **`services/*.ts` (具体服务实现)**
        -   每个文件对应一个LLM提供商（如 `OpenAIService.ts`）。
        -   实现 `ILLMService` 接口，支持消息列表和系统消息的不同处理方式。
        -   **API密钥和baseURL直接硬编码在各自的服务实现中**。
        -   示例：
            ```typescript
            class OpenAIService implements ILLMService {
              private readonly apiKey = "sk-..."; // 硬编码
              private readonly baseUrl = "https://api.openai.com/v1";
              
              async chat(request: LLMRequest, config: LLMRequestConfig): Promise<string> {
                // OpenAI将系统消息放在messages数组中
                const messages = request.systemMessage 
                  ? [{ role: 'system', content: request.systemMessage }, ...request.messages]
                  : request.messages;
                // 调用OpenAI API
              }
              
              getProviderName(): string { return "OpenAI"; }
              getSupportedModels(): string[] { return ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"]; }
            }
            
            class AnthropicService implements ILLMService {
              async chat(request: LLMRequest, config: LLMRequestConfig): Promise<string> {
                // Claude需要将系统消息单独处理
                const requestBody = {
                  model: config.model,
                  messages: request.messages, // 不包含系统消息
                  system: request.systemMessage, // 单独的系统消息字段
                  max_tokens: config.maxTokens,
                  temperature: config.temperature
                };
                // 调用Anthropic API
              }
            }
            ```

    -   **`SelfDefineService.ts` (自定义服务)**
        -   支持用户自定义的LLM服务配置：
            ```typescript
            class SelfDefineService implements ILLMService {
              constructor(private customConfig: CustomConfig) {}
              
              async chat(request: LLMRequest, config: LLMRequestConfig): Promise<string> {
                // 使用用户自定义的baseUrl和apiKey
                const response = await fetch(`${this.customConfig.baseUrl}/chat/completions`, {
                  headers: { 'Authorization': `Bearer ${this.customConfig.apiKey}` },
                  // ...
                });
              }
              
              getSupportedModels(): string[] { 
                return this.customConfig.customModels || []; 
              }
            }
            ```

    -   **`LLMFactory.ts` (服务工厂)**
        -   根据传入的 `provider` 名称，返回相应的服务实例。
        -   支持创建自定义服务实例。
        -   默认返回 `OpenAIService` 实例。

    -   **`popup` (用户界面)**
        -   **LLM Settings 区域**，包含可折叠的配置选项：
            - **Provider**: 下拉框，选项包括 "OpenAI", "Anthropic", "DeepSeek", "Google", "Self Define"
            - **Model**: 下拉框，根据选择的Provider动态显示对应的模型列表
              - 当Provider为"Self Define"时，变为可编辑的下拉框，支持用户添加自定义模型
            - **Max Token**: 只读显示框，显示当前选择模型的最大Token数
            - **Temperature**: 数字输入框，范围0.0-2.0
            - **自定义配置**（仅当Provider为"Self Define"时显示）:
              - **Base URL**: 可编辑文本框
              - **API Key**: 可编辑文本框（密码类型）
              - **Custom Models**: 可编辑的标签列表，支持添加/删除模型
        -   将用户配置保存到 `chrome.storage.local` 的**全局配置**中。
        -   存储格式：
            ```javascript
            {
              llmConfig: {
                provider: 'self-define',
                model: 'custom-model-1',
                maxTokens: 4096,
                temperature: 0.7,
                customConfig: {
                  baseUrl: 'https://api.custom-llm.com/v1',
                  apiKey: 'sk-custom-key',
                  customModels: ['custom-model-1', 'custom-model-2']
                }
              }
            }
            ```

-   **C. 配置管理与错误处理**:
    -   **全局配置**: LLM配置通过 `chrome.storage.local` 全局存储，所有网站和页面使用相同配置。
    -   **默认配置**: 
        ```javascript
        {
          provider: 'openai',
          model: 'gpt-4',
          maxTokens: 4096,
          temperature: 0.7
        }
        ```
    -   **模型与Token映射**: 每个Provider的不同模型对应不同的最大Token数，在ConfigManager中维护。
    -   **错误处理**: 当LLM调用失败时，直接向用户显示错误信息，不进行自动切换到其他提供商。

## 4. 迁移实施步骤

1.  ✅ **创建新结构**: 建立 `src/utils/llm/` 及其子目录和文件。
2.  ✅ **定义消息类型**: 在 `types.ts` 中定义统一的LLM消息格式。
3.  ✅ **更新接口定义**: 在 `ILLMService.ts` 中更新接口支持消息列表传递。
4.  ✅ **实现配置管理**: 更新 `ConfigManager.ts`，支持自定义提供商配置。
5.  ✅ **实现提示词管理**: 更新 `PromptManager.ts`，返回结构化消息对象。
6.  ✅ **实现首个服务**: 更新 `OpenAIService.ts`，支持消息列表和参数配置。
7.  ✅ **实现自定义服务**: 创建 `SelfDefineService.ts`，支持用户自定义配置。
8.  ✅ **实现服务工厂**: 更新 `LLMFactory.ts`，支持创建自定义服务，默认返回OpenAI。
9.  ✅ **设计popup界面**: 实现LLM Settings UI，包含自定义提供商的配置选项。
10. ✅ **实现popup逻辑**: 实现配置的读取、保存、自定义模型管理等功能。
11. ✅ **重构QueryProcessor**: 更新 `QueryProcessor.ts`，使用新的消息格式。
12. ❌ **实现其他服务**: 逐步为Anthropic, DeepSeek, Google等其他提供商实现对应的Service。
13. ❌ **端到端测试**: 确保用户可以配置不同参数并正常工作，测试自定义提供商功能。
14. ❌ **移除旧代码**: 删除旧的 `llmService.ts` 和相关冗余代码。

### 📊 完成进度: 10/14 (71%)

**✅ 已完成的核心功能**:
- 消息格式重构 - 支持多轮对话和不同LLM的role定义
- 自定义提供商支持 - 用户可配置自定义API端点和模型
- 统一服务接口 - 所有LLM使用相同的调用方式
- 配置管理系统 - 支持全局存储和自定义配置
- OpenAI服务实现 - 完整支持新消息格式
- 自定义服务实现 - 支持用户自定义LLM服务
- 业务逻辑重构 - QueryProcessor使用新架构
- Popup界面设计 - 完整的LLM Settings UI，支持所有配置选项
- Popup交互逻辑 - 配置读取、保存、自定义模型管理、主题适配

**❌ 待完成的功能**:
- 其他LLM服务实现 - Anthropic, DeepSeek, Google服务
- 端到端功能测试 - 验证所有功能正常工作
- 旧代码清理 - 移除nlpProcessor.ts和llmService.ts

## 5. 最新完成的Popup界面功能

### 5.1 界面设计特点
- **完整的LLM Settings区域**: 在popup.html中添加了可折叠的LLM配置面板
- **Provider选择**: 支持OpenAI、Anthropic、DeepSeek、Google、Self Define五种选项
- **动态模型选择**: Model下拉框根据选择的Provider动态更新模型列表
- **智能参数显示**: Max Token根据选择的模型自动显示对应的最大Token数
- **Temperature控制**: 数字输入框，支持0.0-2.0范围的温度设置
- **自定义配置区域**: 当选择"Self Define"时显示：
  - Base URL输入框
  - API Key密码输入框  
  - 自定义模型标签管理（可添加/删除）

### 5.2 交互逻辑实现
- **配置加载**: 页面加载时从chrome.storage.local读取现有配置
- **动态更新**: Provider变化时自动更新模型列表和相关UI状态
- **实时保存**: 所有配置变更立即保存到全局存储
- **自定义模型管理**: 支持添加新模型、删除现有模型、输入验证
- **主题兼容**: 完全兼容现有的复古/夜间/白天三主题系统
- **用户体验**: 提供配置验证、错误提示、状态反馈等完整交互体验

### 5.3 技术实现亮点
- **模块化设计**: LLM配置逻辑独立封装，便于维护和扩展
- **类型安全**: TypeScript类型定义确保配置数据的正确性
- **异步处理**: 使用async/await处理存储操作，保证数据一致性
- **CSS动画**: 平滑的折叠展开动画和状态变化效果

## 6. LLM提供商与模型配置

-   **OpenAI**:
    - 模型: gpt-4, gpt-4-turbo, gpt-3.5-turbo
    - Max Tokens: 4096, 4096, 4096
    - 消息处理: 系统消息放在messages数组首位

-   **Anthropic**:
    - 模型: claude-3-opus, claude-3-sonnet, claude-3-haiku
    - Max Tokens: 4096, 4096, 4096
    - 消息处理: 系统消息使用单独的system字段

-   **DeepSeek**:
    - 模型: deepseek-chat, deepseek-coder
    - Max Tokens: 4096, 4096
    - 消息处理: 类似OpenAI格式

-   **Google**:
    - 模型: gemini-pro, gemini-pro-vision
    - Max Tokens: 4096, 4096
    - 消息处理: 需要转换为Gemini格式

-   **Self Define**:
    - 模型: 用户自定义列表
    - Max Tokens: 用户配置或默认4096
    - 消息处理: 假设使用OpenAI兼容格式

## 7. 后续优化计划

-   **动态配置**: 将硬编码的API密钥改为可配置管理。
-   **功能扩展**: 支持更多LLM厂商和自定义模型。
-   **错误处理**: 增加统一的错误重试和请求超时机制。
-   **流式输出**: 为需要的功能实现流式输出支持 (Streaming)。
-   **类型完善**: 完善类型定义和参数校验。
-   **历史对话**: 支持多轮对话历史记录和上下文管理。 