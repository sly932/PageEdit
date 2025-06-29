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
-   **用户选择**: 支持用户在popup界面选择不同的LLM提供商。

## 3. 核心设计方案

我们将采用分层架构，将业务逻辑、提示词管理和API调用彻底分离。

-   **A. 目录结构**:
    ```
    src/
    ├── content/
    │   └── QueryProcessor.ts  # (原 nlpProcessor.ts) 业务逻辑层
    ├── popup/
    │   └── popup.html/js     # 用户选择LLM提供商界面
    └── utils/
        └── llm/
            ├── PromptManager.ts   # 统一提示词管理
            ├── LLMFactory.ts      # LLM服务工厂
            └── services/
                ├── ILLMService.ts     # 统一服务接口
                ├── OpenAIService.ts   # 具体实现(硬编码API密钥)
                ├── ClaudeService.ts   # 具体实现(硬编码API密钥)
                └── SiliconFlowService.ts # 具体实现(硬编码API密钥)
    ```

-   **B. 各模块职责**:
    -   **`QueryProcessor.ts` (业务逻辑层)**
        -   负责编排整个流程：获取用户输入、获取用户选择的LLM提供商、调用`PromptManager`获取提示词、通过`LLMFactory`获取服务、调用服务、解析并应用结果。
        -   从 `chrome.storage.local` 读取全局的LLM提供商配置，如果没有配置则默认使用 `siliconflow`。
        -   **不**直接进行API调用或管理提示词。

    -   **`PromptManager.ts` (提示词管理器)**
        -   统一管理提示词模板，所有服务使用相同的提示词。
        -   提供简单方法：
            ```typescript
            class PromptManager {
              static getSystemPrompt(userQuery: string): string {
                return `统一的提示词模板... ${userQuery}`;
              }
            }
            ```

    -   **`services/ILLMService.ts` (统一接口)**
        -   定义所有LLM服务必须实现的统一接口：
            ```typescript
            interface ILLMService {
              chat(prompt: string): Promise<string>;
              getProviderName(): string;
            }
            ```

    -   **`services/*.ts` (具体服务实现)**
        -   每个文件对应一个LLM提供商（如 `OpenAIService.ts`）。
        -   实现 `ILLMService` 接口，仅负责处理其特定的API网络请求和错误处理。
        -   **API密钥和baseURL直接硬编码在各自的服务实现中**。
        -   示例：
            ```typescript
            class OpenAIService implements ILLMService {
              private readonly apiKey = "sk-..."; // 硬编码
              private readonly baseUrl = "https://api.openai.com/v1";
              
              async chat(prompt: string): Promise<string> { ... }
              getProviderName(): string { return "OpenAI"; }
            }
            ```

    -   **`LLMFactory.ts` (服务工厂)**
        -   根据传入的 `provider` 名称 (e.g., 'openai', 'claude', 'siliconflow')，返回相应的服务实例。
        -   默认返回 `SiliconFlowService` 实例。

    -   **`popup` (用户界面)**
        -   提供下拉选择或按钮让用户选择LLM提供商。
        -   将用户选择保存到 `chrome.storage.local` 的**全局配置**中，所有页面和域名共享此配置。
        -   存储格式：`{ selectedLLMProvider: 'siliconflow' | 'openai' | 'claude' }`

-   **C. 配置管理与错误处理**:
    -   **全局配置**: LLM提供商选择通过 `chrome.storage.local` 全局存储，所有网站和页面使用相同配置。
    -   **默认提供商**: 如果用户未进行选择，默认使用 `siliconflow`。
    -   **错误处理**: 当LLM调用失败时，直接向用户显示错误信息，不进行自动切换到其他提供商。

## 4. 迁移实施步骤

1.  **创建新结构**: 建立 `src/utils/llm/` 及其子目录和文件。
2.  **定义接口**: 在 `ILLMService.ts` 中定义统一的 `chat` 接口。
3.  **实现提示词管理**: 创建简单的 `PromptManager.ts`，提供统一的提示词。
4.  **实现首个服务**: 完整实现 `SiliconFlowService.ts`，API密钥硬编码。
5.  **实现服务工厂**: 创建 `LLMFactory.ts`，支持根据provider名称返回对应服务，默认返回SiliconFlow。
6.  **修改popup界面**: 添加LLM提供商选择功能，保存到全局 `chrome.storage.local` 配置。
7.  **重构QueryProcessor**: 将 `nlpProcessor.ts` 重命名为 `QueryProcessor.ts`，使用新的服务链路，读取全局配置。
8.  **实现其他服务**: 逐步为OpenAI, Claude等其他提供商实现对应的Service。
9.  **端到端测试**: 确保用户可以选择不同提供商并正常工作，测试错误处理。
10. **移除旧代码**: 删除旧的 `llmService.ts` 和相关冗余代码。

## 5. 后续优化计划

-   **动态配置**: 将硬编码的API密钥改为可配置管理。
-   **功能扩展**: 支持更多LLM厂商和自定义模型。
-   **错误处理**: 增加统一的错误重试和请求超时机制。
-   **流式输出**: 为需要的功能实现流式输出支持 (Streaming)。
-   **类型完善**: 完善类型定义和参数校验。 