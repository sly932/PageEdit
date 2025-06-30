# 浏览器插件API安全重构计划 (Browser Extension API Security Restructuring Plan)

## 📋 项目背景 (Project Background)

当前架构：浏览器插件 → Python服务器 → LLM服务提供商

**核心问题**: 一旦API接口暴露，面临被恶意调用的风险，可能导致：
- API密钥滥用
- 服务器资源消耗
- 意外的高额费用
- 系统性能下降

## 🎯 重构目标 (Restructuring Goals)

1. **安全性**: 防止未授权访问和恶意调用
2. **成本控制**: 避免意外的高额LLM调用费用
3. **性能保障**: 确保合法用户的正常使用体验
4. **可维护性**: 便于监控、调试和扩展

## 🔐 安全防护策略 (Security Protection Strategies)

### Phase 1: 基础安全层 (Basic Security Layer) - 高优先级

#### 1.1 JWT Token 身份验证
```python
# 服务端实现
import jwt
import time
from fastapi import HTTPException, Depends, Header

SECRET_KEY = "your-super-secret-key"
ALGORITHM = "HS256"

def generate_plugin_token(user_id: str, extension_id: str):
    payload = {
        'user_id': user_id,
        'extension_id': extension_id,
        'exp': time.time() + 3600,  # 1小时过期
        'iat': time.time(),
        'type': 'plugin_access',
        'version': '1.0'
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(' ')[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

```javascript
// 浏览器插件端实现
class TokenManager {
    constructor() {
        this.token = null;
        this.refreshInterval = null;
    }

    async getToken() {
        if (!this.token || this.isTokenExpired()) {
            await this.refreshToken();
        }
        return this.token;
    }

    async refreshToken() {
        const extensionId = chrome.runtime.id;
        const userFingerprint = await this.generateUserFingerprint();
        
        const response = await fetch('https://your-server.com/api/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                extension_id: extensionId,
                user_fingerprint: userFingerprint
            })
        });
        
        const data = await response.json();
        this.token = data.token;
        
        // 设置自动刷新
        this.scheduleTokenRefresh();
    }

    async generateUserFingerprint() {
        const extensionId = chrome.runtime.id;
        const version = chrome.runtime.getManifest().version;
        const timestamp = Date.now();
        
        return btoa(`${extensionId}-${version}-${timestamp}`);
    }
}
```

#### 1.2 请求限流 (Rate Limiting)
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/llm")
@limiter.limit("10/minute")  # 每分钟最多10次请求
@limiter.limit("100/hour")   # 每小时最多100次请求
@limiter.limit("500/day")    # 每天最多500次请求
async def call_llm(request: Request, token_data: dict = Depends(verify_token)):
    user_id = token_data['user_id']
    # 处理LLM请求
    pass
```

### Phase 2: 增强验证层 (Enhanced Verification Layer) - 中优先级

#### 2.1 请求签名验证
```javascript
// 浏览器插件端 - 请求签名
class RequestSigner {
    constructor(secretKey) {
        this.secretKey = secretKey;
    }

    async signRequest(data) {
        const timestamp = Date.now();
        const nonce = this.generateNonce();
        const message = JSON.stringify(data) + timestamp + nonce;
        
        const encoder = new TextEncoder();
        const keyData = encoder.encode(this.secretKey);
        const messageData = encoder.encode(message);
        
        const cryptoKey = await crypto.subtle.importKey(
            'raw', keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false, ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
        
        return {
            data,
            timestamp,
            nonce,
            signature: Array.from(new Uint8Array(signature))
        };
    }

    generateNonce() {
        return Math.random().toString(36).substring(2, 15);
    }
}
```

```python
# 服务端 - 验证签名
import hmac
import hashlib
import time

def verify_request_signature(data, timestamp, nonce, signature, secret_key):
    # 检查时间戳有效性 (5分钟内)
    if abs(time.time() * 1000 - timestamp) > 300000:
        raise HTTPException(status_code=400, detail="Request timestamp expired")
    
    # 重构消息
    message = json.dumps(data, separators=(',', ':')) + str(timestamp) + nonce
    
    # 计算期望的签名
    expected_signature = hmac.new(
        secret_key.encode(),
        message.encode(),
        hashlib.sha256
    ).digest()
    
    # 比较签名
    if not hmac.compare_digest(bytes(signature), expected_signature):
        raise HTTPException(status_code=400, detail="Invalid request signature")
```

#### 2.2 用户配额管理
```python
from datetime import datetime, timedelta
import redis

class UserQuotaManager:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.daily_limit = 1000  # 每天1000次请求
        self.hourly_limit = 100  # 每小时100次请求

    async def check_and_increment_quota(self, user_id: str):
        # 检查日配额
        daily_key = f"quota:daily:{user_id}:{datetime.now().strftime('%Y-%m-%d')}"
        daily_count = await self.redis.get(daily_key) or 0
        
        if int(daily_count) >= self.daily_limit:
            raise HTTPException(status_code=429, detail="Daily quota exceeded")
        
        # 检查时配额
        hourly_key = f"quota:hourly:{user_id}:{datetime.now().strftime('%Y-%m-%d-%H')}"
        hourly_count = await self.redis.get(hourly_key) or 0
        
        if int(hourly_count) >= self.hourly_limit:
            raise HTTPException(status_code=429, detail="Hourly quota exceeded")
        
        # 增加计数
        pipe = self.redis.pipeline()
        pipe.incr(daily_key)
        pipe.expire(daily_key, 86400)  # 24小时过期
        pipe.incr(hourly_key)
        pipe.expire(hourly_key, 3600)  # 1小时过期
        await pipe.execute()

quota_manager = UserQuotaManager(redis_client)
```

### Phase 3: 智能监控层 (Intelligent Monitoring Layer) - 低优先级

#### 3.1 行为异常检测
```python
class BehaviorAnalyzer:
    def __init__(self):
        self.suspicious_patterns = []
    
    async def analyze_request_pattern(self, user_id: str, request_data: dict):
        # 检查请求频率模式
        recent_requests = await self.get_recent_requests(user_id, minutes=10)
        
        # 检查内容相似度
        content_similarity = self.calculate_content_similarity(
            request_data.get('message', ''),
            [req['message'] for req in recent_requests]
        )
        
        # 检查时间模式 (是否为异常时间)
        time_anomaly = self.detect_time_anomaly(request_data['timestamp'])
        
        # 综合评分
        risk_score = self.calculate_risk_score(
            frequency_score=len(recent_requests),
            similarity_score=content_similarity,
            time_score=time_anomaly
        )
        
        if risk_score > 0.8:  # 高风险阈值
            await self.flag_suspicious_activity(user_id, risk_score, request_data)
            raise HTTPException(status_code=429, detail="Suspicious behavior detected")
        
        return risk_score

    def calculate_content_similarity(self, current_message: str, recent_messages: list):
        # 简单的相似度计算 (实际可使用更复杂的算法)
        if not recent_messages:
            return 0
        
        similarities = []
        for msg in recent_messages[-5:]:  # 检查最近5条消息
            similarity = self.jaccard_similarity(
                set(current_message.lower().split()),
                set(msg.lower().split())
            )
            similarities.append(similarity)
        
        return max(similarities) if similarities else 0

    def jaccard_similarity(self, set1: set, set2: set):
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        return intersection / union if union > 0 else 0
```

#### 3.2 成本监控与预警
```python
class CostMonitor:
    def __init__(self):
        self.provider_costs = {
            'openai': {'input': 0.0015, 'output': 0.002},  # per 1K tokens
            'deepseek': {'input': 0.00014, 'output': 0.00028},
            'claude': {'input': 0.0008, 'output': 0.0024}
        }
    
    async def estimate_request_cost(self, provider: str, message: str, expected_response_length: int = 1000):
        if provider not in self.provider_costs:
            return 0
        
        # 估算输入token数量 (简化计算: 1个单词约1.3个token)
        input_tokens = len(message.split()) * 1.3
        output_tokens = expected_response_length * 0.75  # 估算输出token
        
        costs = self.provider_costs[provider]
        estimated_cost = (
            (input_tokens / 1000) * costs['input'] +
            (output_tokens / 1000) * costs['output']
        )
        
        return estimated_cost
    
    async def check_cost_limits(self, user_id: str, estimated_cost: float):
        # 检查单次请求成本限制
        if estimated_cost > 0.1:  # 单次请求不超过0.1美元
            raise HTTPException(status_code=400, detail="Request cost too high")
        
        # 检查日成本限制
        daily_cost_key = f"cost:daily:{user_id}:{datetime.now().strftime('%Y-%m-%d')}"
        daily_cost = float(await redis_client.get(daily_cost_key) or 0)
        
        if daily_cost + estimated_cost > 5.0:  # 每天不超过5美元
            raise HTTPException(status_code=429, detail="Daily cost limit exceeded")
        
        return True
    
    async def record_actual_cost(self, user_id: str, actual_cost: float):
        daily_cost_key = f"cost:daily:{user_id}:{datetime.now().strftime('%Y-%m-%d')}"
        pipe = redis_client.pipeline()
        pipe.incrbyfloat(daily_cost_key, actual_cost)
        pipe.expire(daily_cost_key, 86400)
        await pipe.execute()
```

## 🚀 实施计划 (Implementation Plan)

### 第一阶段 (Week 1-2): 基础安全
- [ ] 实现JWT Token认证系统
- [ ] 添加基础请求限流
- [ ] 配置HTTPS和CORS
- [ ] 基础日志记录

### 第二阶段 (Week 3-4): 增强验证
- [ ] 实现请求签名验证
- [ ] 添加用户配额管理
- [ ] 实现Redis缓存层
- [ ] 详细的错误处理和响应

### 第三阶段 (Week 5-6): 智能监控
- [ ] 部署行为异常检测
- [ ] 实现成本监控系统
- [ ] 添加实时预警机制
- [ ] 性能优化和压力测试

## 📊 监控指标 (Monitoring Metrics)

### 安全指标
- 认证失败率
- 异常请求检测率
- IP封禁统计
- 签名验证失败率

### 性能指标
- API响应时间
- 服务器资源使用率
- 限流触发频率
- 缓存命中率

### 成本指标
- 每日LLM调用成本
- 每用户平均成本
- 异常高成本请求预警
- 成本趋势分析

## ⚙️ 配置文件示例 (Configuration Examples)

### 环境变量配置
```bash
# Security Settings
JWT_SECRET_KEY=your-super-secret-jwt-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=1

# Rate Limiting
RATE_LIMIT_PER_MINUTE=10
RATE_LIMIT_PER_HOUR=100
RATE_LIMIT_PER_DAY=500

# Cost Control
MAX_REQUEST_COST=0.10
MAX_DAILY_COST_PER_USER=5.00

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Monitoring
ENABLE_BEHAVIOR_ANALYSIS=true
SUSPICIOUS_BEHAVIOR_THRESHOLD=0.8
```

### 安全策略配置
```json
{
  "security_policies": {
    "token_refresh_interval": 3600,
    "max_concurrent_sessions": 3,
    "ip_whitelist_enabled": false,
    "geo_restriction_enabled": false,
    "suspicious_behavior_action": "throttle"
  },
  "cost_controls": {
    "per_request_limit": 0.10,
    "daily_user_limit": 5.00,
    "monthly_total_limit": 1000.00,
    "auto_suspend_threshold": 0.95
  }
}
```

## 🔧 测试策略 (Testing Strategy)

### 安全测试
- [ ] Token伪造测试
- [ ] 签名绕过测试
- [ ] 限流压力测试
- [ ] 异常行为模拟测试

### 性能测试
- [ ] 并发用户负载测试
- [ ] API响应时间测试
- [ ] 内存泄漏检测
- [ ] 缓存性能测试

### 成本测试
- [ ] 成本计算准确性验证
- [ ] 配额限制功能测试
- [ ] 异常高成本场景测试

## 📝 维护计划 (Maintenance Plan)

### 日常监控
- 每日安全日志审查
- 成本趋势分析
- 性能指标检查
- 异常用户行为报告

### 定期更新
- 每月安全策略评估
- 季度成本限制调整
- 半年度架构优化评审
- 年度安全审计

---

## 💡 实施建议 (Implementation Recommendations)

1. **渐进式部署**: 先在测试环境完整验证，再逐步推广到生产环境
2. **监控优先**: 在实施安全措施的同时建立完善的监控体系
3. **用户体验**: 确保安全措施不影响正常用户的使用体验
4. **文档维护**: 保持安全策略和实施文档的及时更新
5. **应急预案**: 制定安全事件的应急响应流程

这个重构计划将帮助你建立一个安全、高效、可控的浏览器插件API服务架构。 