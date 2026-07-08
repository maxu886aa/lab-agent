import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Calculator,
  FileText,
  FlaskConical,
  Loader2,
  Paperclip,
  PenTool,
  Send,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface IChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const QUICK_ACTIONS = [
  { icon: BookOpen, label: '文献检索', desc: '搜索食品安全相关文献', color: 'text-blue-600 bg-blue-50' },
  { icon: Calculator, label: '数据处理', desc: '实验数据计算与统计分析', color: 'text-emerald-600 bg-emerald-50' },
  { icon: FileText, label: '国标查询', desc: '查询 GB2762 / GB2760 等标准', color: 'text-amber-600 bg-amber-50' },
  { icon: FlaskConical, label: '实验设计', desc: '正交 / 响应面 / PB 设计生成', color: 'text-purple-600 bg-purple-50' },
  { icon: PenTool, label: '论文润色', desc: '学术表达优化与术语修正', color: 'text-rose-600 bg-rose-50' },
];

const WELCOME_MESSAGE = `你好！我是 **食品安全科研助手**，专注于食品科学领域的学术研究支持。

我可以帮你：
- 文献检索和研究进展梳理
- 实验数据计算与统计分析
- 国家标准与法规限值查询
- 实验设计与方法学建议
- 论文写作与学术润色

请直接输入你的研究问题，我会按食品安全研究生常用的表达方式回答。`;

export default function ChatPage() {
  const [messages, setMessages] = useState<IChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: WELCOME_MESSAGE,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: IChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const assistantId = `${Date.now()}-assistant`;

    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      },
    ]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as { reply?: string };
      const reply =
        data.reply ||
        '抱歉，这次没有拿到有效回复。请换一种问法，或补充你的研究背景、样品基质和目标指标。';

      setMessages((prev) =>
        prev.map((msg) => (msg.id === assistantId ? { ...msg, content: reply } : msg)),
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content:
                  '抱歉，当前智能服务不可用。请稍后重试，或检查服务端 API 配置是否正确。',
              }
            : msg,
        ),
      );
      toast.error('智能服务调用失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (label: string) => {
    const prompts: Record<string, string> = {
      文献检索:
        '请帮我检索关于食品中真菌毒素检测方法的最新研究进展，重点关注 HPLC-MS/MS 技术的应用。',
      数据处理:
        '我有一组加标回收率实验数据，请帮我计算回收率、平均值、标准差和 RSD。',
      国标查询:
        '请查询 GB 2762 中谷物及其制品里铅的限量标准，并和欧盟标准做简要对比。',
      实验设计:
        '我想做一个三因素三水平的实验设计，因素包括提取温度、提取时间和料液比，请帮我生成实验方案。',
      论文润色:
        '请帮我润色下面这段论文摘要，使其更符合食品安全方向的学术表达。',
    };
    setInput(prompts[label] || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {msg.role === 'user' ? '我' : <Sparkles className="size-4" />}
                </div>
                <div className={`min-w-0 flex-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`inline-block max-w-full rounded-2xl px-4 py-3 text-left text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border/50 bg-card text-foreground'
                    }`}
                  >
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content || (isLoading && msg.role === 'assistant' ? '思考中...' : '')}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.content && (
            <div className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Loader2 className="size-4 animate-spin" />
              </div>
              <div className="rounded-2xl border border-border/50 bg-card px-4 py-3 text-sm text-muted-foreground">
                正在生成回复...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {messages.length <= 1 && (
        <div className="px-4 pb-4 md:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-xs font-medium text-muted-foreground">快捷功能</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Card
                    key={action.label}
                    className="cursor-pointer border border-border/50 bg-card/50 transition-all hover:border-primary/30 hover:bg-card hover:shadow-sm"
                    onClick={() => handleQuickAction(action.label)}
                  >
                    <CardContent className="p-3">
                      <div
                        className={`mb-2 flex size-8 items-center justify-center rounded-lg ${action.color}`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="text-sm font-medium text-foreground">{action.label}</div>
                      <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {action.desc}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-border/40 bg-background/80 px-4 py-4 backdrop-blur-sm md:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="size-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题，例如：食品中黄曲霉毒素的常见检测方法有哪些？"
              className="min-h-[40px] resize-none border-0 bg-transparent py-2 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon" className="shrink-0">
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            重要科研结论请自行复核，法规和数据计算结果仅作研究辅助参考。
          </p>
        </div>
      </div>
    </div>
  );
}
