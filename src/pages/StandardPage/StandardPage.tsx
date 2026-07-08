import { useState, useMemo } from 'react';
import { Search, Filter, Star, StarOff, Download, Globe, FileText, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IStandard, MOCK_STANDARDS } from '@/data/standards';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const CATEGORY_LABELS: Record<string, string> = {
  pollutant: '污染物限量',
  additive: '食品添加剂',
  microbe: '微生物限量',
  method: '检测方法',
};

const CATEGORY_ICONS: Record<string, string> = {
  pollutant: '🧪',
  additive: '⚗️',
  microbe: '🦠',
  method: '📋',
};

export default function StandardPage() {
  const [category, setCategory] = useState('pollutant');
  const [keyword, setKeyword] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() =>
    storage.get<string[]>('standard_favorites', [])
  );
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const filtered = useMemo(() => {
    let result = MOCK_STANDARDS.filter((s) => s.category === category);

    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(kw) ||
          s.foodCategory.toLowerCase().includes(kw) ||
          s.standardNo.toLowerCase().includes(kw)
      );
    }

    if (onlyFavorites) {
      result = result.filter((s) => favorites.includes(s.id));
    }

    return result;
  }, [category, keyword, favorites, onlyFavorites]);

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(newFavs);
    storage.set('standard_favorites', newFavs);
    toast.success(favorites.includes(id) ? '已取消收藏' : '已添加到收藏夹');
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden">
      {/* 顶部搜索栏 */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索污染物、添加剂、微生物名称..."
                className="pl-9 h-10"
              />
            </div>
            <Button
              variant={compareMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCompareMode(!compareMode)}
              className="shrink-0"
            >
              <Globe className="size-4 mr-2" />
              中外对比
            </Button>
          </div>

          <Tabs value={category} onValueChange={setCategory}>
            <TabsList className="bg-transparent h-9 gap-1">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md h-9 px-4"
                >
                  <span className="mr-1">{CATEGORY_ICONS[key]}</span>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              共 <span className="font-medium text-foreground">{filtered.length}</span> 条标准
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="only-fav"
                  checked={onlyFavorites}
                  onCheckedChange={(checked) => setOnlyFavorites(!!checked)}
                />
                <Label htmlFor="only-fav" className="text-sm cursor-pointer">
                  仅显示收藏
                </Label>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
            <FileText className="size-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">未找到相关标准</p>
            <p className="text-sm text-muted-foreground/70 mt-1">请尝试其他关键词或分类</p>
          </CardContent>
            </Card>
          ) : (
            <Card className="border border-border/50">
              <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="whitespace-nowrap min-w-[120px]">名称</TableHead>
                        <TableHead className="whitespace-nowrap">食品类别</TableHead>
                        <TableHead className="whitespace-nowrap">标准号</TableHead>
                        {compareMode ? (
                          <>
                            <TableHead className="whitespace-nowrap text-right">中国 GB</TableHead>
                            <TableHead className="whitespace-nowrap text-right">欧盟 EC</TableHead>
                            <TableHead className="whitespace-nowrap text-right">美国 FDA</TableHead>
                            <TableHead className="whitespace-nowrap text-right">Codex</TableHead>
                          </>
                        ) : (
                          <TableHead className="whitespace-nowrap text-right">限值</TableHead>
                        )}
                        <TableHead className="whitespace-nowrap text-right w-[80px">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((item) => (
                        <TableRow key={item.id} className="group">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {item.name}
                              <Badge variant="outline" className="text-xs font-normal">
                                {item.unit}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{item.foodCategory}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{item.standardNo}</TableCell>
                          {compareMode ? (
                            <>
                              <TableCell className="text-right tabular-nums font-medium">
                                {item.gbValue !== undefined ? `${item.limit}` : '-'}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {item.euValue !== undefined ? `${item.euValue} ${item.unit}` : '-'}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {item.fdaValue !== undefined ? `${item.fdaValue} ${item.unit}` : '-'}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {item.codexValue !== undefined ? `${item.codexValue} ${item.unit}` : '-'}
                              </TableCell>
                            </>
                          ) : (
                            <TableCell className="text-right font-medium tabular-nums">
                              {item.limit} {item.unit}
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={() => toggleFavorite(item.id)}
                              >
                                {favorites.includes(item.id) ? (
                                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                                ) : (
                                  <StarOff className="size-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                              >
                                <Download className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 标准说明 */}
          <Card className="mt-6 border border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">标准说明</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><span className="font-medium text-foreground">GB 2762</span>：食品中污染物限量，规定了食品中铅、镉、汞、砷等重金属及其他有害物质的限量要求。</p>
                <p><span className="font-medium text-foreground">GB 2760</span>：食品添加剂使用标准，规定了食品添加剂的使用原则、允许使用的品种、使用范围及最大使用量。</p>
                <p><span className="font-medium text-foreground">GB 4789</span>：食品微生物学检验系列标准，规定了食品中菌落总数、大肠菌群、致病菌等微生物指标的检验方法。</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
