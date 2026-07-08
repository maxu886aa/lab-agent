import { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, FileText, Download, Star, StarOff, Clock, Quote, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ILiterature, MOCK_LITERATURES } from '@/data/literature';
import { storage } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const TYPE_LABELS: Record<string, string> = {
  journal: '期刊论文',
  master: '硕士论文',
  phd: '博士论文',
  conference: '会议论文',
};

const HOT_KEYWORDS = [
  '真菌毒素检测',
  '膳食暴露评估',
  '微生物预测模型',
  '食品添加剂安全',
  '重金属污染',
  '益生菌功能',
  '近红外光谱',
  'QuEChERS',
];

export default function LiteraturePage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('all');
  const [yearRange, setYearRange] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [favorites, setFavorites] = useState<string[]>(() =>
    storage.get<string[]>('literature_favorites', [])
  );
  const [showCite, setShowCite] = useState(false);
  const [selectedLit, setSelectedLit] = useState<ILiterature | null>(null);
  const [citeFormat, setCiteFormat] = useState<'gb7714' | 'bibtex'>('gb7714');

  const filtered = useMemo(() => {
    let result = [...MOCK_LITERATURES];

    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(kw) ||
          l.abstract.toLowerCase().includes(kw) ||
          l.authors.some((a) => a.toLowerCase().includes(kw)) ||
          l.keywords.some((k) => k.toLowerCase().includes(kw))
      );
    }

    if (type !== 'all') {
      result = result.filter((l) => l.type === type);
    }

    if (yearRange !== 'all') {
      const now = 2024;
      const minYear = now - parseInt(yearRange);
      result = result.filter((l) => l.year >= minYear);
    }

    if (sortBy === 'cited') {
      result.sort((a, b) => b.citedCount - a.citedCount);
    } else if (sortBy === 'year') {
      result.sort((a, b) => b.year - a.year);
    } else if (sortBy === 'download') {
      result.sort((a, b) => b.downloadCount - a.downloadCount);
    }

    return result;
  }, [keyword, type, yearRange, sortBy]);

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(newFavs);
    storage.set('literature_favorites', newFavs);
    toast.success(favorites.includes(id) ? '已取消收藏' : '已添加到收藏夹');
  };

  const generateCitation = (lit: ILiterature, format: 'gb7714' | 'bibtex'): string => {
    if (format === 'gb7714') {
      const authors = lit.authors.join(', ');
      if (lit.type === 'journal') {
        return `${authors}. ${lit.title}[J]. ${lit.journal}, ${lit.year}, ${lit.volume || ''}: ${lit.pages || ''}.${lit.doi ? ` DOI: ${lit.doi}` : ''}`;
      } else if (lit.type === 'master' || lit.type === 'phd') {
        const degree = lit.type === 'phd' ? '博士学位论文' : '硕士学位论文';
        return `${authors}. ${lit.title}[D]. ${lit.journal}, ${lit.year}.`;
      }
      return `${authors}. ${lit.title}[C]. ${lit.journal}, ${lit.year}.`;
    }
    const key = lit.authors[0]?.split('')[0] + lit.year + lit.id;
    return `@article{${key},
  title={${lit.title}},
  author={${lit.authors.join(' and ')}},
  journal={${lit.journal}},
  year={${lit.year}},${lit.volume ? `\n  volume={${lit.volume}},` : ''}${lit.pages ? `\n  pages={${lit.pages}},` : ''}${lit.doi ? `\n  doi={${lit.doi}},` : ''}
}`;
  };

  const handleCite = (lit: ILiterature) => {
    setSelectedLit(lit);
    setShowCite(true);
  };

  const copyCitation = () => {
    if (!selectedLit) return;
    const text = generateCitation(selectedLit, citeFormat);
    navigator.clipboard.writeText(text);
    toast.success('参考文献已复制到剪贴板');
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* 左侧筛选面板 */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border/40 bg-card/30">
        <div className="p-4 border-b border-border/40">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Filter className="size-4" />
            筛选条件
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* 文献类型 */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">文献类型</h4>
            <div className="space-y-2">
              {[
                { value: 'all', label: '全部类型' },
                { value: 'journal', label: '期刊论文' },
                { value: 'master', label: '硕士论文' },
                { value: 'phd', label: '博士论文' },
                { value: 'conference', label: '会议论文' },
              ].map((item) => (
                <div key={item.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`type-${item.value}`}
                    checked={type === item.value}
                    onCheckedChange={() => setType(item.value)}
                  />
                  <Label htmlFor={`type-${item.value}`} className="text-sm cursor-pointer">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* 发表时间 */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">发表时间</h4>
            <div className="space-y-2">
              {[
                { value: 'all', label: '不限' },
                { value: '1', label: '近1年' },
                { value: '3', label: '近3年' },
                { value: '5', label: '近5年' },
                { value: '10', label: '近10年' },
              ].map((item) => (
                <div key={item.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`year-${item.value}`}
                    checked={yearRange === item.value}
                    onCheckedChange={() => setYearRange(item.value)}
                  />
                  <Label htmlFor={`year-${item.value}`} className="text-sm cursor-pointer">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* 热门关键词 */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">热门关键词</h4>
            <div className="flex flex-wrap gap-1.5">
              {HOT_KEYWORDS.map((kw) => (
                <Badge
                  key={kw}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={() => setKeyword(kw)}
                >
                  {kw}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* 右侧主内容 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 搜索栏 */}
        <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm p-4">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索文献标题、作者、关键词..."
                  className="pl-9 h-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36 h-10">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">相关度</SelectItem>
                  <SelectItem value="cited">被引次数</SelectItem>
                  <SelectItem value="year">发表时间</SelectItem>
                  <SelectItem value="download">下载量</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                共找到 <span className="font-medium text-foreground">{filtered.length}</span> 条结果
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                检索时间约 0.32 秒
              </div>
            </div>
          </div>
        </div>

        {/* 结果列表 */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-4 max-w-4xl mx-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="size-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">未找到相关文献</p>
                <p className="text-sm text-muted-foreground/70 mt-1">请尝试其他关键词或筛选条件</p>
              </div>
            ) : (
              filtered.map((lit) => (
                <Card
                  key={lit.id}
                  className="border border-border/50 bg-card hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => navigate(`/literature/${lit.id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant="outline" className="text-xs font-normal">
                            {TYPE_LABELS[lit.type]}
                          </Badge>
                          <Badge variant="secondary" className="text-xs font-normal">
                            {lit.year}年
                          </Badge>
                        </div>
                        <h3 className="text-base font-semibold text-foreground hover:text-primary transition-colors mb-1.5 line-clamp-2">
                          {lit.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {lit.authors.join(', ')} · {lit.journal}
                          {lit.volume && `, ${lit.volume}`}
                        </p>
                        <p className="text-sm text-foreground/70 line-clamp-2 mb-3">
                          {lit.abstract}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {lit.keywords.slice(0, 4).map((kw) => (
                            <Badge key={kw} variant="outline" className="text-xs font-normal text-muted-foreground">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="size-3.5" />
                            被引 {lit.citedCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="size-3.5" />
                            下载 {lit.downloadCount}
                          </span>
                          {lit.doi && <span>DOI: {lit.doi}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-primary"
                          onClick={() => toggleFavorite(lit.id)}
                        >
                          {favorites.includes(lit.id) ? (
                            <Star className="size-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff className="size-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-primary"
                          onClick={() => handleCite(lit)}
                        >
                          <Quote className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 引用格式弹窗 */}
      <Dialog open={showCite} onOpenChange={setShowCite}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>参考文献格式</DialogTitle>
            <DialogDescription>选择格式并复制到剪贴板</DialogDescription>
          </DialogHeader>
          <Tabs value={citeFormat} onValueChange={(v) => setCiteFormat(v as 'gb7714' | 'bibtex')}>
            <TabsList className="mb-4">
              <TabsTrigger value="gb7714">GB/T 7714</TabsTrigger>
              <TabsTrigger value="bibtex">BibTeX</TabsTrigger>
            </TabsList>
          </Tabs>
          {selectedLit && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm text-foreground/90 whitespace-pre-wrap">
              {generateCitation(selectedLit, citeFormat)}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCite(false)}>关闭</Button>
            <Button onClick={copyCitation}>复制引用</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
