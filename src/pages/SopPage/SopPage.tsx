import { useState, useMemo } from 'react';
import { BookOpen, Search, Star, StarOff, Clock, Filter, Download, FileText, FlaskConical, Microscope, AlertTriangle, TestTube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type ISop, MOCK_SOPS } from '@/data/sops';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

const CATEGORIES = [
  { id: 'all', label: '全部', icon: BookOpen },
  { id: 'detection', label: '检测方法', icon: TestTube },
  { id: 'pretreatment', label: '前处理', icon: FlaskConical },
  { id: 'instrument', label: '仪器操作', icon: Microscope },
  { id: 'microbe', label: '微生物', icon: Microscope },
];

export default function SopPage() {
  const [category, setCategory] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [selectedSop, setSelectedSop] = useState<ISop | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() =>
    storage.get<string[]>('sop_favorites', [])
  );
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  const filtered = useMemo(() => {
    let result = [...MOCK_SOPS];

    if (category !== 'all') {
      result = result.filter((s) => s.category === category);
    }

    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(kw) ||
          s.overview.toLowerCase().includes(kw)
      );
    }

    if (onlyFavorites) {
      result = result.filter((s) => favorites.includes(s.id));
    }

    if (sortBy === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [category, keyword, favorites, onlyFavorites, sortBy]);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newFavs = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(newFavs);
    storage.set('sop_favorites', newFavs);
    toast.success(favorites.includes(id) ? '已取消收藏' : '已添加到收藏夹');
  };

  const getCategoryLabel = (cat: string) => {
    const found = CATEGORIES.find((c) => c.id === cat);
    return found?.label || cat;
  };

  const estimateDuration = (sop: ISop) => {
    return sop.steps.length * 15;
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* 左侧分类 */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border/40 bg-card/30">
        <div className="p-4 border-b border-border/40">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="size-4" />
            SOP 库
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count =
              cat.id === 'all'
                ? MOCK_SOPS.length
                : MOCK_SOPS.filter((s) => s.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${
                  category === cat.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 shrink-0" />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </div>
                  <span className="text-xs opacity-60">{count}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-border/40">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Star className="size-3.5" />
            已收藏 {favorites.length} 个 SOP
          </div>
        </div>
      </aside>

      {/* 中间列表 */}
      <div className="w-full md:w-80 lg:w-96 shrink-0 border-r border-border/40 flex flex-col">
        {/* 搜索栏 */}
        <div className="p-3 border-b border-border/40 space-y-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索 SOP 名称..."
              className="pl-9 h-9"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sop-fav"
                checked={onlyFavorites}
                onChange={(e) => setOnlyFavorites(e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="sop-fav" className="text-xs text-muted-foreground cursor-pointer">
                仅显示收藏
              </label>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-7 w-28 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">按名称</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* SOP 列表 */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">未找到相关 SOP</p>
            </div>
          ) : (
            filtered.map((sop) => (
              <button
                key={sop.id}
                onClick={() => setSelectedSop(sop)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedSop?.id === sop.id
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border/40 bg-card hover:border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate">{sop.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{sop.overview}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs font-normal h-5">
                        {getCategoryLabel(sop.category)}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        约 {estimateDuration(sop)} min
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-yellow-500"
                    onClick={(e) => toggleFavorite(sop.id, e)}
                  >
                    {favorites.includes(sop.id) ? (
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="size-4" />
                    )}
                  </Button>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 右侧详情 */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {selectedSop ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* 标题区 */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline">{getCategoryLabel(selectedSop.category)}</Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="size-3" />
                  约 {estimateDuration(selectedSop)} 分钟
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedSop.steps.length} 个步骤
                </Badge>
              </div>
              <h2 className="text-2xl font-semibold text-foreground">{selectedSop.title}</h2>
              <p className="text-muted-foreground mt-2">{selectedSop.overview}</p>
            </div>

            {/* 试剂与仪器 */}
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">试剂与仪器</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">所需试剂</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSop.reagents.map((r, i) => (
                      <Badge key={i} variant="outline" className="font-normal">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">所需仪器</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSop.instruments.map((i, idx) => (
                      <Badge key={idx} variant="secondary" className="font-normal">
                        {i}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 操作步骤 */}
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">操作步骤</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {selectedSop.steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                        {i + 1}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-sm text-foreground">{step}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* 注意事项 */}
            {selectedSop.notes && selectedSop.notes.length > 0 && (
              <Card className="border border-amber-200 bg-amber-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="size-5" />
                    注意事项
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedSop.notes.map((p, i) => (
                      <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                <Download className="size-4 mr-2" />
                下载 PDF
              </Button>
              <Button
                variant="outline"
                onClick={(e) => toggleFavorite(selectedSop.id, e)}
                className="flex-1"
              >
                {favorites.includes(selectedSop.id) ? (
                  <>
                    <Star className="size-4 mr-2 fill-yellow-400 text-yellow-400" />
                    取消收藏
                  </>
                ) : (
                  <>
                    <StarOff className="size-4 mr-2" />
                    加入收藏
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <BookOpen className="size-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-foreground">选择一个 SOP 查看详情</p>
              <p className="text-sm mt-1">从左侧列表中选择标准操作规程</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
