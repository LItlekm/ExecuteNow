# 腾讯云 SCF 部署指南

本指南说明如何将 AI 代理部署到腾讯云云函数 (SCF)，以改善中国大陆用户的访问体验。

## 前置条件

1. 腾讯云账号（需实名认证）
2. Node.js 18+ 环境
3. 智谱 API Key（从 https://open.bigmodel.cn 获取）

## 部署步骤

### 1. 安装 Serverless Framework

```bash
npm install -g serverless
```

### 2. 配置腾讯云凭证

首次使用时，运行部署命令会自动引导扫码登录腾讯云。

或者手动配置：
```bash
serverless credentials set --provider tencent --secretId YOUR_SECRET_ID --secretKey YOUR_SECRET_KEY
```

### 3. 设置环境变量

**Windows (PowerShell):**
```powershell
$env:ZHIPU_API_KEY = "your_zhipu_api_key"
$env:GEMINI_API_KEY = "your_gemini_api_key"  # 可选
```

**Windows (CMD):**
```cmd
set ZHIPU_API_KEY=your_zhipu_api_key
set GEMINI_API_KEY=your_gemini_api_key
```

**Linux/macOS:**
```bash
export ZHIPU_API_KEY=your_zhipu_api_key
export GEMINI_API_KEY=your_gemini_api_key
```

### 4. 部署

在项目根目录运行：

```bash
serverless deploy
```

部署成功后，会输出类似以下的 API 地址：

```
apigw:
  - https://service-xxxxxx-xxxxxxxxxx.sh.apigw.tencentcs.com/release
```

### 5. 更新前端配置

将 `index.html` 中的代理地址更新为新地址：

```html
<meta name="ai-proxy-url" content="https://service-xxxxxx-xxxxxxxxxx.sh.apigw.tencentcs.com/release">
```

## 测试

使用 curl 测试 API：

```bash
curl -X POST "https://service-xxx.sh.apigw.tencentcs.com/release/api/ai/steps" \
  -H "Content-Type: application/json" \
  -H "Origin: https://litlekm.github.io" \
  -d '{"provider":"zhipu","taskName":"学习英语","stepCountText":"3-5"}'
```

## 常用命令

```bash
# 部署
serverless deploy

# 查看日志
serverless logs --name executenow-ai-proxy

# 移除函数
serverless remove
```

## 费用说明

腾讯云 SCF 提供免费额度：
- 调用次数：100 万次/月
- 资源使用：40 万 GB-s/月
- API 网关：100 万次/月

正常使用基本免费。

## 故障排查

1. **部署失败**：检查腾讯云账号是否已实名认证
2. **调用超时**：确认函数超时时间设置为 30 秒
3. **API Key 错误**：在腾讯云控制台检查环境变量配置
4. **CORS 错误**：确认请求来源在白名单中

## 文件说明

| 文件 | 说明 |
|------|------|
| `src/scf-index.js` | 腾讯云 SCF 函数代码 |
| `src/index.js` | 原 Cloudflare Worker 代码（备份） |
| `serverless.yml` | Serverless Framework 配置 |
