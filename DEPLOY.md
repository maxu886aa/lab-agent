# 部署说明

这个项目现在已经整理成适合部署到带后端能力的平台的版本，推荐优先使用：

- Vercel
- Render
- Railway

不推荐 GitHub Pages，因为它不能安全保存 DeepSeek key。

## 当前项目结构

- `src/`
  前端页面
- `server.mjs`
  本地开发和简单部署用的服务端入口
- `vercel.json`
  Vercel 部署配置
- `.env.example`
  环境变量模板

## 需要配置的环境变量

```env
OPENAI_API_KEY=你的DeepSeek密钥
OPENAI_BASE_URL=https://api.deepseek.com
CODEX_MODEL=deepseek-chat
```

## 本地运行

```bash
npm install
npm run dev
```

## Vercel 部署建议

1. 把项目上传到 GitHub 仓库
2. 在 Vercel 中导入该仓库
3. 在 Vercel 的 Environment Variables 中添加：
   - `OPENAI_API_KEY`
   - `OPENAI_BASE_URL`
   - `CODEX_MODEL`
4. 触发部署
5. 拿到公网域名

## 小程序联动

后端部署成功后，把：

`D:\科研助手-小程序\miniprogram\app.js`

中的：

```js
apiBaseUrl: "https://your-public-api-domain.com"
```

替换为你的真实公网地址，例如：

```js
apiBaseUrl: "https://your-project.vercel.app"
```

## 重要提醒

1. 不要把 DeepSeek key 写进前端代码。
2. 不要把 `.env` 提交到公开仓库。
3. 如果部署后仍然报 `401`，说明是 key、账号权限或模型名问题，不是网页结构问题。
