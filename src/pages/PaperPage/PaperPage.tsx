import { useState, useRef, useEffect } from 'react';
import { FileText, Sparkles, Copy, Download, RefreshCw, BookOpen, GraduationCap, PenTool, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { chatWithAI } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const WRITING_TOOLS = [
  { id: 'abstract', label: '摘要润色', icon: PenTool, desc: '优化摘要表达，提升专业度' },
  { id: 'introduction', label: '引言撰写', icon: BookOpen, desc: '构建研究背景与意义' },
  { id: 'method', label: '方法描述', icon: GraduationCap, desc: '规范实验方法表述' },
  { id: 'discussion', label: '讨论分析', icon: Lightbulb, desc: '深入讨论结果意义' },
];

export default function PaperPage() {
  const [activeTool, setActiveTool] = useState('abstract');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [targetJournal, setTargetJournal] = useState('elsevier');

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      toast.warning('请输入需要处理的内容');
      return;
    }

    setIsLoading(true);
    setOutputText('');

    try {
      const prompts: Record<string, string> = {
        abstract: `请作为食品科学领域的专业论文写作助手，帮我润色以下摘要内容，使其符合 ${targetJournal} 期刊的写作风格和规范要求。要求：语言专业精炼、逻辑清晰、突出创新性。\n\n原文：\n${inputText}`,
        introduction: `请作为食品科学领域的专业论文写作助手，帮我完善以下引言部分内容，目标期刊为 ${targetJournal}。要求：构建清晰的研究背景、明确研究缺口、突出研究意义。\n\n原文：\n${inputText}`,
        method: `请作为食品科学领域的专业论文写作助手，帮我规范以下实验方法部分的描述，目标期刊为 ${targetJournal}。要求：描述准确可重复、专业术语规范、逻辑条理清晰。\n\n原文：\n${inputText}`,
        discussion: `请作为食品科学领域的专业论文写作助手，帮我深化以下讨论部分的分析，目标期刊为 ${targetJournal}。要求：深入分析结果意义、与前人研究对比、指出研究局限、展望未来方向。\n\n原文：\n${inputText}`,
      };

      const reply = await chatWithAI(prompts[activeTool] || prompts.abstract);
      setOutputText(reply);
    } catch (error) {
      console.error('生成失败:', error);
      toast.error('生成失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    toast.success('已复制到剪贴板');
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* 左侧工具选择 */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border/40 bg-card/30">
        <div className="p-4 border-b border-border/40">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileText className="size-4" />
            论文辅助
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {WRITING_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`w-full text-left px-3 py-3 rounded-md transition-colors ${
                  activeTool === tool.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-4 shrink-0" />
                  <span className="text-sm font-medium">{tool.label}</span>
                </div>
                <p className="text-xs mt-0.5 opacity-70">{tool.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-border/40 space-y-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">目标期刊</Label>
            <Select value={targetJournal} onValueChange={setTargetJournal}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="elsevier">Elsevier 系列</SelectItem>
                <SelectItem value="wiley">Wiley 系列</SelectItem>
                <SelectItem value="springer">Springer 系列</SelectItem>
                <SelectItem value="acs">ACS 系列</SelectItem>
                <SelectItem value="nature">Nature 系列</SelectItem>
                <SelectItem value="cn">中文核心</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </aside>

      {/* 右侧主内容 */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">
              {WRITING_TOOLS.find((t) => t.id === activeTool)?.label}
            </h2>
            <p className="text-sm text-muted-foreground">
              {WRITING_TOOLS.find((t) => t.id === activeTool)?.desc}
            </p>
          </div>

          {/* 移动端工具选择 */}
          <div className="md:hidden">
            <Tabs value={activeTool} onValueChange={setActiveTool}>
              <TabsList className="w-full h-auto flex-wrap bg-transparent gap-1">
                {WRITING_TOOLS.map((tool) => (
                  <TabsTrigger
                    key={tool.id}
                    value={tool.id}
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md h-8 px-3 flex-1"
                  >
                    {tool.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 输入区 */}
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">原文输入</CardTitle>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleClear}>
                    清空
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`请输入需要${WRITING_TOOLS.find((t) => t.id === activeTool)?.label}的内容...`}
                  className="min-h-[300px] resize-none text-sm leading-relaxed"
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">
                    {inputText.length} 字
                  </span>
                  <Button onClick={handleGenerate} disabled={isLoading || !inputText.trim()}>
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4 mr-2" />
                        开始生成
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 输出区 */}
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">生成结果</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={handleCopy}
                      disabled={!outputText}
                    >
                      <Copy className="size-3.5 mr-1" />
                      复制
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      disabled={!outputText}
                    >
                      <Download className="size-3.5 mr-1" />
                      导出
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="min-h-[300px] max-h-[500px] overflow-y-auto rounded-md border border-border/40 bg-muted/20 p-4 text-sm leading-relaxed">
                  {isLoading && !outputText ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <Loader2 className="size-5 mr-2 animate-spin" />
                      AI 正在生成中...
                    </div>
                  ) : outputText ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{outputText}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <Sparkles className="size-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">生成结果将显示在这里</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">
                    {outputText.length} 字
                  </span>
                  <Badge variant="outline" className="text-xs font-normal">
                    {targetJournal} 风格
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 写作提示 */}
          <Card className="border border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">写作建议</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• <span className="font-medium text-foreground">摘要</span>：控制在 250-300 词，包含目的、方法、结果、结论四要素。</p>
              <p>• <span className="font-medium text-foreground">引言</span>：遵循"漏斗式"结构，从大背景逐步聚焦到具体研究问题。</p>
              <p>• <span className="font-medium text-foreground">方法</span>：确保描述足够详细，使其他研究者能够重复实验。</p>
              <p>• <span className="font-medium text-foreground">讨论</span>：不要重复结果，而是解释结果的意义和内在机制。</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
