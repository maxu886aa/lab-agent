# Vercel 快速部署

如果你的目标是“给别人一个网址直接打开使用”，建议走这条路线：

1. 上传 `D:\科研助手` 到 GitHub
2. 用 Vercel 导入仓库
3. 配置 DeepSeek 环境变量
4. 部署完成后把网址给别人

## 需要填的环境变量

- `OPENAI_API_KEY`
- `OPENAI_BASE_URL=https://api.deepseek.com`
- `CODEX_MODEL=deepseek-chat`

## 部署后用途

- 网页端可直接访问
- 小程序可复用同一个后端接口
- API key 不暴露在浏览器中
