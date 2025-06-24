# LLM模块重构计划

## 目标
- 支持多种LLM服务商（如OpenAI、Anthropic Claude、SiliconFlow、DeepSeek等）
- 职责分离，LLM服务只负责API调用和结果返回，不处理提示词内容
- 统一接口，便于扩展和维护
- 灵活支持不同LLM的参数和消息格式
- 逐步迁移，保证现有功能不受影响

## 主要改动点
1. 新建 `llm` 目录，所有新实现放在此目录下
2. 定义统一的 LLMService 接口（如 chat 方法，参数包括 system message、other messages、baseUrl、apiKey 等）
3. 针对每个LLM厂商实现独立的Service类（如 OpenAILLMService、AnthropicLLMService 等）
4. 实现 LLMRouter 或工厂，根据 baseUrl/provider 路由到不同的实现
5. 结果解析逻辑与 LLMService 解耦，由上层负责
6. 保留原有 nlp 目录，逐步迁移调用到新架构

## 分层设计
- `ILLMService` 接口：定义统一的 chat 方法
- 各厂商实现类：OpenAILLMService、AnthropicLLMService、SiliconFlowLLMService、DeepSeekLLMService 等
- LLMRouter/Factory：根据 baseUrl/provider 选择具体实现
- 上层业务：负责拼接 prompt、解析结果、调用 LLMService

## 迁移策略
- 新功能优先在 llm 目录下开发
- 现有调用逐步切换到新接口，保留兼容层
- 充分测试新旧接口，确保平滑过渡
- 迁移完成后，逐步废弃旧实现

## 后续优化建议
- 支持更多厂商和自定义LLM
- 增加统一的错误处理和重试机制
- 支持异步流式输出（如OpenAI的stream模式）
- 完善类型定义和参数校验
- 提供更丰富的监控和日志 