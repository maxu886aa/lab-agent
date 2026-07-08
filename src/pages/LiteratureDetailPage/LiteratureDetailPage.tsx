import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, StarOff, Download, FileText, Upload, Link, Copy, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ILiterature, MOCK_LITERATURES } from '@/data/literature';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';
import { capabilityClient, logger } from '@lark-apaas/client-toolkit-lite';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const LITERATURE_PARSE_PLUGIN_ID = 'food_safety_literature_search_summary_1';

const TYPE_LABELS: Record<string, string> = {
  journal: '期刊论文',
  master: '硕士论文',
  phd: '博士论文',
  conference: '会议论文',
};

interface ExtractedData {
  ld50?: string;
  noael?: string;
  adi?: string;
  lod?: string;
  loq?: string;
  recovery?: string;
  rsd?: string;
  method?: string;
  conclusion?: string;
  innovation?: string;
}

export default function LiteratureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lit = MOCK_LITERATURES.find((l) => l.id === id) || MOCK_LITERATURES[0];

  const [favorites, setFavorites] = useState<string[]>(() =>
    storage.get<string[]>('literature_favorites', [])
  );
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [activeTab, setActiveTab] = useState('abstract');
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error('文件大小不能超过20MB');
        return;
      }
      setPdfUrl(file.name);
      toast.success(`已选择文件：${file.name}`);
    }
  };

  const handleUrlConfirm = () => {
    if (tempUrl.trim()) {
      setPdfUrl(tempUrl.trim());
      setShowUrlDialog(false);
      toast.success('已添加文献链接');
    }
  };

  const toggleFavorite = () => {
    const newFavs = favorites.includes(lit.id)
      ? favorites.filter((f) => f !== lit.id)
      : [...favorites, lit.id];
    setFavorites(newFavs);
    storage.set('literature_favorites', newFavs);
    toast.success(favorites.includes(lit.id) ? '已取消收藏' : '已添加到收藏夹');
  };

  const handleParse = async () => {
    if (!pdfUrl.trim()) {
      toast.error('请输入文献链接或上传PDF');
      return;
    }
    setIsParsing(true);
    setParseResult('');
    setActiveTab('extracted');

    try {
      const stream = capabilityClient
        .load(LITERATURE_PARSE_PLUGIN_ID)
        .callStream('searchSummary', {
          search_keywords: lit.title + ' 关键数据提取 LD50 NOAEL ADI 检出限 回收率',
        });

      let full = '';
      for await (const rawChunk of stream) {
        const chunk = rawChunk as { summary?: string };
        if (chunk.summary) {
          full += chunk.summary;
          setParseResult(full);
        }
      }
    } catch (error) {
      logger.error('Parse error:', String(error));
      toast.error('文献解析失败，请稍后重试');
    } finally {
      setIsParsing(false);
    }
  };

  // 模拟提取的关键数据
  const extractedData: ExtractedData = {
    lod: '0.05 ~ 0.5 μg/kg',
    loq: '0.15 ~ 1.5 μg/kg',
    recovery: '82.3% ~ 108.5%',
    rsd: '< 10%',
    method: 'QuEChERS 前处理结合 HPLC-MS/MS 检测',
    conclusion: '该方法灵敏、准确、快速，适用于谷物、坚果等食品中多种真菌毒素的同时测定。',
    innovation: '首次将 QuEChERS 方法应用于 16 种真菌毒素的同时检测，显著提高了检测效率。',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部栏 */}
      <div className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="size-4 mr-1" />
              返回
            </Button>
            <h1 className="text-sm font-medium text-foreground truncate max-w-md">文献详情</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleFavorite}>
              {favorites.includes(lit.id) ? (
                <Star className="size-4 mr-1 fill-yellow-400 text-yellow-400" />
              ) : (
                <StarOff className="size-4 mr-1" />
              )}
              收藏
            </Button>
            <Button variant="ghost" size="sm" onClick={() => {
              if (!lit) return;
              const content = `%0 ${lit.title}\n%A ${lit.authors.join(' and ')}\n%J ${lit.journal}\n%V ${lit.volume || ''}\n%P ${lit.pages || ''}\n%D ${lit.year}\n%R ${lit.doi || ''}\n%K ${(lit.keywords || []).join(', ')}\n%X ${lit.abstract || ''}`;
              const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${lit.title.slice(0, 30).replace(/[^\w\u4e00-\u9fa5]/g, '_')}.ris`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              toast.success('文献引用已导出');
            }}>
              <Download className="size-4 mr-1" />
              下载引用
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-3.5rem-49px)] overflow-hidden">
        {/* 左侧信息面板 */}
        <div className="hidden md:flex w-80 shrink-0 flex-col border-r border-border/40 bg-card/30 overflow-y-auto">
          <div className="p-5 space-y-4">
            {/* 文献元信息 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{TYPE_LABELS[lit.type]}</Badge>
                <Badge variant="secondary">{lit.year}年</Badge>
              </div>
              <h2 className="text-lg font-semibold text-foreground leading-snug mb-2">
                {lit.title}
              </h2>
              <p className="text-sm text-muted-foreground mb-1">
                <span className="font-medium text-foreground">作者：</span>
                {lit.authors.join(', ')}
              </p>
              <p className="text-sm text-muted-foreground mb-1">
                <span className="font-medium text-foreground">期刊：</span>
                {lit.journal}
              </p>
              {lit.volume && (
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-medium text-foreground">卷期：</span>
                  {lit.volume}
                </p>
              )}
              {lit.pages && (
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-medium text-foreground">页码：</span>
                  {lit.pages}
                </p>
              )}
              {lit.doi && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">DOI：</span>
                  {lit.doi}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-border/40">
              <h3 className="text-sm font-medium text-foreground mb-2">关键词</h3>
              <div className="flex flex-wrap gap-1.5">
                {lit.keywords.map((kw) => (
                  <Badge key={kw} variant="outline" className="text-xs font-normal">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-xl font-bold text-foreground">{lit.citedCount}</div>
                <div className="text-xs text-muted-foreground">被引次数</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-xl font-bold text-foreground">{lit.downloadCount}</div>
                <div className="text-xs text-muted-foreground">下载次数</div>
              </div>
            </div>

            {/* 智能解析入口 */}
            <div className="pt-2 border-t border-border/40">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                智能文献精读
              </h3>
              <div className="space-y-2">
                <div className="relative">
                  <Link className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="输入文献链接..."
                    className="pl-9 text-sm"
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button variant="outline" size="sm" className="w-full" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="size-4 mr-2" />
                  上传PDF文件
                </Button>
                <Button size="sm" className="w-full" onClick={handleParse} disabled={isParsing}>
                  {isParsing ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      解析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4 mr-2" />
                      智能提取关键数据
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b border-border/40 px-4 md:px-6">
              <TabsList className="bg-transparent h-10 gap-1">
                <TabsTrigger value="abstract" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-4">
                  摘要
                </TabsTrigger>
                <TabsTrigger value="extracted" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-4">
                  关键数据提取
                </TabsTrigger>
                <TabsTrigger value="pdf" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-4">
                  全文预览
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="max-w-4xl mx-auto">
                <TabsContent value="abstract" className="mt-0">
                  <Card className="border border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">文献摘要</CardTitle>
                      <CardDescription>{lit.journal} · {lit.year}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">摘要</h4>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {lit.abstract}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">研究方法</h4>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          采用{extractedData.method}，对样品进行前处理后，通过仪器分析进行定性定量检测。
                          方法学验证包括线性范围、检出限、定量限、精密度和回收率等指标。
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">核心结论</h4>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {extractedData.conclusion}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">创新点</h4>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {extractedData.innovation}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="extracted" className="mt-0">
                  {parseResult ? (
                    <Card className="border border-border/50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Sparkles className="size-5 text-primary" />
                          AI 智能提取结果
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{parseResult}</ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border border-border/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">方法学参数</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center py-1 border-b border-border/30">
                            <span className="text-sm text-muted-foreground">检出限 (LOD)</span>
                            <span className="text-sm font-medium text-foreground">{extractedData.lod}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-border/30">
                            <span className="text-sm text-muted-foreground">定量限 (LOQ)</span>
                            <span className="text-sm font-medium text-foreground">{extractedData.loq}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-border/30">
                            <span className="text-sm text-muted-foreground">加标回收率</span>
                            <span className="text-sm font-medium text-emerald-600">{extractedData.recovery}</span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-sm text-muted-foreground">精密度 (RSD)</span>
                            <span className="text-sm font-medium text-emerald-600">{extractedData.rsd}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-border/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">毒理学参数</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center py-1 border-b border-border/30">
                            <span className="text-sm text-muted-foreground">LD₅₀</span>
                            <span className="text-sm font-medium text-foreground">未报道</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-border/30">
                            <span className="text-sm text-muted-foreground">NOAEL</span>
                            <span className="text-sm font-medium text-foreground">未报道</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-border/30">
                            <span className="text-sm text-muted-foreground">ADI</span>
                            <span className="text-sm font-medium text-foreground">未报道</span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-sm text-muted-foreground">基质效应</span>
                            <span className="text-sm font-medium text-amber-600">弱基质效应</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-border/50 md:col-span-2">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">研究方法概述</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {extractedData.method}。该方法具有操作简便、分析速度快、灵敏度高等优点，
                            适用于食品中多种污染物的同时筛查和定量分析。
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {!parseResult && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        以上为基于文献元数据的预提取结果，上传PDF或输入链接可获得更完整的提取
                      </p>
                      <Button variant="outline" size="sm" onClick={handleParse} disabled={isParsing}>
                        <Sparkles className="size-4 mr-2" />
                        使用 AI 深度解析
                        {isParsing && <Loader2 className="size-4 ml-2 animate-spin" />}
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="pdf" className="mt-0">
                  <Card className="border border-border/50">
                    <CardContent className="p-8 text-center">
                      <FileText className="size-16 mx-auto text-muted-foreground/30 mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">PDF 全文预览</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        上传 PDF 文件或提供文献链接以查看全文
                      </p>
                       <div className="flex gap-2 justify-center">
                         <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                           <Upload className="size-4 mr-2" />
                           上传PDF
                         </Button>
                         <Button onClick={() => { setTempUrl(''); setShowUrlDialog(true); }}>
                           <Link className="size-4 mr-2" />
                           输入链接
                         </Button>
                       </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
       </div>

      {/* 链接输入弹窗 */}
      <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>输入文献链接</DialogTitle>
            <DialogDescription>
              输入文献的在线链接，系统将尝试解析并提取关键数据。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="https://example.com/paper.pdf"
              onKeyDown={(e) => e.key === 'Enter' && handleUrlConfirm()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUrlDialog(false)}>取消</Button>
            <Button onClick={handleUrlConfirm} disabled={!tempUrl.trim()}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
