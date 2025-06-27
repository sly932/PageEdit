# LLM 模块重构计划

## 1. 现状与核心问题

当前的LLM调用实现（`llmService.ts`, `nlpProcessor.ts`）存在若干严重问题，影响功能、安全性和可维护性。

-   **A. 安全风险 (Security Risk)**: API密钥通过 Webpack 的 `DefinePlugin` 在编译时被硬编码到最终的JS文件中。这意味着任何安装扩展的用户都可以轻易地从文件内容中提取API密钥，存在泄漏风险。

-   **B. 核心功能缺陷 (Fatal Logic Flaw)**: 页面的HTML内容 (`htmlContext`) 从未被正确地包含在发送给LLM的请求中。这是导致核心"页面编辑"功能完全失效的根本原因。

-   **C. 架构与实现问题 (Architectural & Implementation Issues)**:
    -   **职责混淆**: `nlpProcessor.ts` 混合了业务逻辑、提示词构建、API调用和结果解析，违反了单一职责原则，难以测试和维护。
    -   **代码冗余**: 为不同LLM提供商构建提示词的逻辑大量重复。
    -   **API调用错误**: 部分LLM（如Claude）的API请求结构不正确。
    -   **错误处理薄弱**: 现有的错误处理机制过于笼统，无法清晰地定位到失败的根源。

## 2. 重构目标

-   **解决安全隐患**: 将API密钥管理从编译时注入改为用户在运行时配置，并安全地存储在 `chrome.storage` 中。
-   **修复核心功能**: 确保页面上下文 (`htmlContext`) 被正确捕获并传递给LLM。
-   **优化架构**: 建立一个职责清晰、可扩展、易于维护的LLM调用链路。
-   **统一接口**: 为所有LLM服务商提供统一的调用接口，简化上层逻辑。
-   **提升可维护性**: 消除代码重复，提供健壮的错误处理机制。

## 3. 核心设计方案

我们将采用分层架构，将业务逻辑、提示词构建和API调用彻底分离。

-   **A. 目录结构**:
    ```
    src/
    ├── content/
    │   └── QueryProcessor.ts  # (原 nlpProcessor.ts) 业务逻辑层
    └── utils/
        └── llm/
            ├── PromptBuilder.ts   # 提示词构建器
            ├── LLMFactory.ts      # LLM服务工厂
            └── services/
                ├── ILLMService.ts     # 统一服务接口
                ├── OpenAIService.ts   # 具体实现
                ├── ClaudeService.ts   # ...
                └── ...
    ```

-   **B. 各模块职责**:
    -   **`QueryProcessor.ts` (业务逻辑层)**
        -   负责编排整个流程：获取用户输入、获取页面HTML、调用`PromptBuilder`、通过`LLMFactory`获取服务、调用服务、解析并应用结果。
        -   从 `chrome.storage` 读取API密钥和用户配置。
        -   **不**直接进行API调用或构建提示词。

    -   **`PromptBuilder.ts` (提示词构建器)**
        -   集中管理所有提示词模板。
        -   根据传入的参数（用户请求, HTML上下文, LLM类型）生成对应厂商格式的完整请求体（prompt/messages）。

    -   **`services/ILLMService.ts` (统一接口)**
        -   定义所有LLM服务必须实现的统一接口，例如:
            ```typescript
            interface ILLMService {
              chat(request: any, apiKey: string, baseUrl?: string): Promise<string>;
            }
            ```

    -   **`services/*.ts` (具体服务实现)**
        -   每个文件对应一个LLM提供商（如 `OpenAIService.ts`）。
        -   实现 `ILLMService` 接口，仅负责处理其特定的API网络请求和错误处理。

    -   **`LLMFactory.ts` (服务工厂)**
        -   根据传入的 `provider` 名称 (e.g., 'openai', 'claude')，返回相应的服务实例。

-   **C. API密钥管理**
    -   彻底移除 `webpack.config.cjs` 中的 `DefinePlugin` 密钥注入。
    -   在 `popup.html` 或专门的设置页面中，提供UI让用户输入和保存API密钥。
    -   使用 `chrome.storage.local.set` 和 `get` 来安全地存取密钥。

## 4. 迁移实施步骤

1.  **创建新结构**: 建立 `src/utils/llm/` 及其子目录和文件。
2.  **定义接口**: 在 `ILLMService.ts` 中定义统一的 `chat` 接口。
3.  **重命名与初步重构**: 将 `nlpProcessor.ts` 重命名为 `QueryProcessor.ts`。剥离其内部的API调用和Prompt构建逻辑（可暂时注释掉）。
4.  **实现核心组件**: 创建 `PromptBuilder.ts` 和 `LLMFactory.ts` 的基本结构。
5.  **实现首个服务**: 完整实现一个LLM服务 (例如 `SiliconFlowService.ts`)。
6.  **端到端打通**: 修改 `QueryProcessor.ts` 以使用新的服务链路 (`PromptBuilder` -> `LLMFactory` -> `SiliconFlowService`)，并**确保 `htmlContext` 被正确传递**。
7.  **实现密钥存储**: 更新UI（如`popup`）以支持API密钥的输入和保存至 `chrome.storage`，并让 `QueryProcessor` 从中读取。
8.  **移除旧代码**: 在新流程验证通过后，删除 `webpack.config.cjs` 中的密钥注入，并删除旧的 `llmService.ts`。
9.  **实现其他服务**: 逐步为OpenAI, Claude等其他提供商实现对应的Service。
10. **代码清理**: 迁移完成后，清理所有相关的旧代码和兼容层。

## 5. 后续优化建议

-   支持更多LLM厂商和自定义模型。
-   增加统一的错误重试和请求超时机制。
-   为需要的功能实现流式输出支持 (Streaming)。
-   完善类型定义和参数校验。
-   提供更丰富的日志记录和监控。 