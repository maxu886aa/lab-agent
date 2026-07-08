import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ===== API 路由 =====
const systemPrompt = [
  '你是食品安全科研助手。',
  '用户主要是食品安全专业研究生。',
  '默认使用简洁、专业的中文回答。',
  '优先帮助用户完成文献调研、实验设计、数据分析、法规比对、风险评估和论文写作。',
  '不要编造法规条文、实验数据或参考文献。',
  '遇到法规限值、最新研究或高风险判断时，如不确定，要明确提醒用户进一步核实。'
].join(' ');

app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY || '';
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
  const model = process.env.CODEX_MODEL || 'deepseek-chat';

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY on server' });
  }

  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message) {
    return res.status(400).json({ error: 'Missing message' });
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.4,
        stream: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    const reply = data?.choices?.[0]?.message?.content || '抱歉，这次没有生成有效回复。';
    res.json({ reply });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown server error',
    });
  }
});

// ===== 前端静态文件 =====
app.use(express.static(path.join(__dirname, 'dist')));

// SPA 路由：所有非 API 路径返回 index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return;
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
