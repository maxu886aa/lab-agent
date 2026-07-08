import { useState, useMemo } from 'react';
import { FlaskConical, Plus, Download, Copy, Grid3X3, LineChart, Layers, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { generateOrthogonalArray, getOrthogonalTableName, generateBBD, getBBDName, generatePBDesign, getPBName, generateFullFactorial, getFullFactorialName } from '@/lib/calc';
import { toast } from 'sonner';

const DESIGN_TYPES = [
  { id: 'orthogonal', label: '正交试验设计', icon: Grid3X3, desc: '多因素多水平实验优化' },
  { id: 'response', label: '响应面设计', icon: LineChart, desc: 'Box-Behnken / Central Composite' },
  { id: 'pb', label: 'Plackett-Burman', icon: Layers, desc: '多因素筛选实验' },
  { id: 'fullfact', label: '全因子设计', icon: Box, desc: '2^k 全因子实验' },
];

export default function ExperimentPage() {
  const [activeDesign, setActiveDesign] = useState('orthogonal');

  const exportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('实验方案已导出');
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* 左侧设计类型 */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border/40 bg-card/30">
        <div className="p-4 border-b border-border/40">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FlaskConical className="size-4" />
            实验设计
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {DESIGN_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setActiveDesign(type.id)}
                className={`w-full text-left px-3 py-3 rounded-md transition-colors ${
                  activeDesign === type.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-4 shrink-0" />
                  <span className="text-sm font-medium">{type.label}</span>
                </div>
                <p className="text-xs mt-0.5 opacity-70">{type.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-border/40">
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => toast.info('请在右侧实验方案卡片中点击导出按钮')}>
             <Download className="size-4 mr-2" />
             导出方案
           </Button>
        </div>
      </aside>

      {/* 右侧主内容 */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          {activeDesign === 'orthogonal' && <OrthogonalDesign />}
          {activeDesign === 'response' && <ResponseSurfaceDesign />}
          {activeDesign === 'pb' && <PBDesign />}
          {activeDesign === 'fullfact' && <FullFactDesign />}
        </div>
      </div>
    </div>
  );
}

// ===== 正交试验设计 =====
function OrthogonalDesign() {
  const [factors, setFactors] = useState(3);
  const [levels, setLevels] = useState(3);
  const [factorNames, setFactorNames] = useState(['提取温度', '提取时间', '料液比']);
  const [levelValues, setLevelValues] = useState([
    ['50', '60', '70'],
    ['30', '60', '90'],
    ['1:10', '1:15', '1:20'],
  ]);
  const [replicates, setReplicates] = useState(1);

  const array = useMemo(() => generateOrthogonalArray(factors, levels), [factors, levels]);
  const tableName = getOrthogonalTableName(factors, levels);

  const updateFactorName = (idx: number, val: string) => {
    const newNames = [...factorNames];
    newNames[idx] = val;
    setFactorNames(newNames);
  };

  const updateLevelValue = (fIdx: number, lIdx: number, val: string) => {
    const newVals = levelValues.map((row) => [...row]);
    newVals[fIdx][lIdx] = val;
    setLevelValues(newVals);
  };

  const addFactor = () => {
    if (factors >= 4) return;
    setFactors(factors + 1);
    setFactorNames([...factorNames, `因素${factors + 1}`]);
    setLevelValues([...levelValues, Array(levels).fill('')]);
  };

  const copyTable = () => {
    const header = ['试验号', ...factorNames.slice(0, factors), '结果'];
    const rows = array.map((row, i) => {
      const rowData = row.map((v, j) => levelValues[j]?.[v - 1] ?? `水平${v}`);
      return [i + 1, ...rowData, ''];
    });
    const text = [header, ...rows].map((r) => r.join('\t')).join('\n');
    navigator.clipboard.writeText(text);
    toast.success('实验表已复制到剪贴板');
  };

  const handleExport = () => {
    const headers = ['试验号', ...factorNames.slice(0, factors), '实验结果'];
    const rows = array.map((row, i) => [
      String(i + 1),
      ...row.slice(0, factors).map((v, j) => levelValues[j]?.[v - 1] ?? `水平${v}`),
      '',
    ]);
    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `正交实验_${tableName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('实验方案已导出');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">正交试验设计</h2>
        <p className="text-sm text-muted-foreground">选择因素数和水平数，自动生成正交实验方案</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 参数配置 */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">参数配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>因素数</Label>
                <Select value={factors.toString()} onValueChange={(v) => setFactors(parseInt(v))}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 因素</SelectItem>
                    <SelectItem value="3">3 因素</SelectItem>
                    <SelectItem value="4">4 因素</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>水平数</Label>
                <Select value={levels.toString()} onValueChange={(v) => setLevels(parseInt(v))}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 水平</SelectItem>
                    <SelectItem value="3">3 水平</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>重复数</Label>
              <Select value={replicates.toString()} onValueChange={(v) => setReplicates(parseInt(v))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 次</SelectItem>
                  <SelectItem value="2">2 次</SelectItem>
                  <SelectItem value="3">3 次</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 border-t border-border/40">
              <div className="flex items-center justify-between mb-2">
                <Label>因素与水平设置</Label>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={addFactor} disabled={factors >= 4}>
                  <Plus className="size-3 mr-1" /> 添加因素
                </Button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Array.from({ length: factors }).map((_, fIdx) => (
                  <div key={fIdx} className="space-y-1.5">
                    <Input
                      value={factorNames[fIdx] || ''}
                      onChange={(e) => updateFactorName(fIdx, e.target.value)}
                      className="h-8 text-sm font-medium"
                      placeholder={`因素 ${fIdx + 1}`}
                    />
                    <div className="flex gap-1.5">
                      {Array.from({ length: levels }).map((_, lIdx) => (
                        <Input
                          key={lIdx}
                          value={levelValues[fIdx]?.[lIdx] || ''}
                          onChange={(e) => updateLevelValue(fIdx, lIdx, e.target.value)}
                          className="h-7 text-xs"
                          placeholder={`水平${lIdx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 实验方案 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">实验方案 - {tableName}</CardTitle>
                <CardDescription>共 {array.length} 组实验，{replicates} 次重复</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyTable}>
                  <Copy className="size-4 mr-1" /> 复制
                </Button>
                <Button size="sm" onClick={handleExport}>
                  <Download className="size-4 mr-1" /> 导出
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="whitespace-nowrap w-16">试验号</TableHead>
                    {factorNames.slice(0, factors).map((name, i) => (
                      <TableHead key={i} className="whitespace-nowrap">{name}</TableHead>
                    ))}
                    <TableHead className="whitespace-nowrap">实验结果</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {array.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-center">{i + 1}</TableCell>
                      {row.slice(0, factors).map((level, j) => (
                        <TableCell key={j}>
                          <Badge variant="outline" className="font-normal">
                            {levelValues[j]?.[level - 1] || `水平${level}`}
                          </Badge>
                        </TableCell>
                      ))}
                      <TableCell className="text-muted-foreground italic">待填写</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 设计说明 */}
      <Card className="border border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">设计说明</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>正交试验设计是利用正交表来安排与分析多因素试验的一种设计方法，通过代表性的试验点代替全面试验，大大减少试验次数。</p>
          <p><span className="font-medium text-foreground">正交表 {tableName}</span>：L 表示正交表，{array.length} 表示试验次数，{levels} 表示水平数，{factors} 表示最多可安排的因素数。</p>
          <p>使用时请根据实际研究目的选择合适的因素和水平，将因素分配到正交表的列上，按表中组合进行实验。</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== 响应面设计 =====
function ResponseSurfaceDesign() {
  const [method, setMethod] = useState('bbd');
  const [factors, setFactors] = useState(3);
  const [factorNames, setFactorNames] = useState(['温度', '时间', 'pH']);
  const [lowValues, setLowValues] = useState(['50', '30', '5.0']);
  const [highValues, setHighValues] = useState(['80', '90', '7.0']);

  const bbdArray = useMemo(() => generateBBD(factors), [factors]);

  const getLevelLabel = (code: number, factorIdx: number): string => {
    const low = lowValues[factorIdx] || '-1';
    const high = highValues[factorIdx] || '+1';
    if (code === -1) return low + ' (低)';
    if (code === 1) return high + ' (高)';
    return '中心点';
  };

  const getLevelBadgeClass = (code: number): string => {
    if (code === -1) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (code === 1) return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const handleFactorChange = (idx: number, name: string, low: string, high: string) => {
    const newNames = [...factorNames];
    newNames[idx] = name;
    setFactorNames(newNames);
    const newLow = [...lowValues];
    newLow[idx] = low;
    setLowValues(newLow);
    const newHigh = [...highValues];
    newHigh[idx] = high;
    setHighValues(newHigh);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">响应面设计</h2>
        <p className="text-sm text-muted-foreground">Box-Behnken 或 Central Composite 设计，用于响应面优化实验</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">参数配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>设计方法</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bbd">Box-Behnken</SelectItem>
                  <SelectItem value="ccd">Central Composite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>因素数</Label>
              <Select value={factors.toString()} onValueChange={(v) => setFactors(parseInt(v))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 因素</SelectItem>
                  <SelectItem value="4">4 因素</SelectItem>
                  <SelectItem value="5">5 因素</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-2 border-t border-border/40">
              <Label className="mb-2 block">因素设置（低/高水平）</Label>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Array.from({ length: factors }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Input
                      value={factorNames[i] || ''}
                      onChange={(e) => handleFactorChange(i, e.target.value, lowValues[i], highValues[i])}
                      className="h-8 text-sm font-medium"
                      placeholder={`因素 ${i + 1}`}
                    />
                    <div className="flex gap-1.5">
                      <Input
                        value={lowValues[i] || ''}
                        onChange={(e) => handleFactorChange(i, factorNames[i], e.target.value, highValues[i])}
                        className="h-7 text-xs"
                        placeholder="低水平"
                      />
                      <Input
                        value={highValues[i] || ''}
                        onChange={(e) => handleFactorChange(i, factorNames[i], lowValues[i], e.target.value)}
                        className="h-7 text-xs"
                        placeholder="高水平"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  实验方案 - {getBBDName(factors)}
                </CardTitle>
                <CardDescription>
                  共 {bbdArray.length} 组实验，含中心点
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  const header = ['试验号', ...factorNames.slice(0, factors), '响应值'];
                  const rows = bbdArray.map((row, i) => [i + 1, ...row.map((v, j) => getLevelLabel(v, j)), '']);
                  const text = [header, ...rows].map((r) => r.join('\t')).join('\n');
                  navigator.clipboard.writeText(text);
                  toast.success('实验表已复制到剪贴板');
                }}>
                  <Copy className="size-4 mr-1" /> 复制
                </Button>
                <Button size="sm" onClick={() => {
                  const headers = ['试验号', ...factorNames.slice(0, factors), '响应值'];
                  const rows = bbdArray.map((row, i) => [
                    String(i + 1),
                    ...row.slice(0, factors).map((v, j) => getLevelLabel(v, j)),
                    '',
                  ]);
                  const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
                  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `响应面_${getBBDName(factors)}.csv`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  toast.success('实验方案已导出');
                }}>
                  <Download className="size-4 mr-1" /> 导出
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="whitespace-nowrap w-16">试验号</TableHead>
                    {factorNames.slice(0, factors).map((name, i) => (
                      <TableHead key={i} className="whitespace-nowrap">{name}</TableHead>
                    ))}
                    <TableHead className="whitespace-nowrap">响应值</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bbdArray.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-center">{i + 1}</TableCell>
                      {row.slice(0, factors).map((code, j) => (
                        <TableCell key={j}>
                          <Badge variant="outline" className={`font-normal ${getLevelBadgeClass(code)}`}>
                            {getLevelLabel(code, j)}
                          </Badge>
                        </TableCell>
                      ))}
                      <TableCell className="text-muted-foreground italic">待填写</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">设计说明</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><span className="font-medium text-foreground">Box-Behnken 设计</span>：每个因素取3水平，实验次数相对较少，适用于3-5个因素的响应面优化。</p>
          <p><span className="font-medium text-foreground">编码方式</span>：-1 代表低水平，+1 代表高水平，0 代表中心点。</p>
          <p>实验完成后，可使用响应面分析法（RSM）拟合二次多项式回归模型，寻找最优工艺条件。</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== PB 设计 =====
function PBDesign() {
  const [factors, setFactors] = useState(5);
  const [factorNames, setFactorNames] = useState(['温度', '时间', 'pH', '料液比', '转速']);
  const [lowValues, setLowValues] = useState(['50', '30', '5.0', '1:10', '200']);
  const [highValues, setHighValues] = useState(['80', '90', '7.0', '1:20', '500']);

  const pbArray = useMemo(() => generatePBDesign(factors), [factors]);

  const getLevelLabel = (code: number, factorIdx: number): string => {
    const low = lowValues[factorIdx] || '-1';
    const high = highValues[factorIdx] || '+1';
    return code === 1 ? high + ' (高)' : low + ' (低)';
  };

  const handleFactorChange = (idx: number, name: string, low: string, high: string) => {
    const newNames = [...factorNames];
    newNames[idx] = name;
    setFactorNames(newNames);
    const newLow = [...lowValues];
    newLow[idx] = low;
    setLowValues(newLow);
    const newHigh = [...highValues];
    newHigh[idx] = high;
    setHighValues(newHigh);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Plackett-Burman 筛选设计</h2>
        <p className="text-sm text-muted-foreground">用于从众多因素中快速筛选出显著影响因素</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">参数配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>因素数</Label>
              <Select value={factors.toString()} onValueChange={(v) => setFactors(parseInt(v))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 因素</SelectItem>
                  <SelectItem value="5">5 因素</SelectItem>
                  <SelectItem value="7">7 因素</SelectItem>
                  <SelectItem value="11">11 因素</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-2 border-t border-border/40">
              <Label className="mb-2 block">因素设置（低/高水平）</Label>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {Array.from({ length: factors }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Input
                      value={factorNames[i] || ''}
                      onChange={(e) => handleFactorChange(i, e.target.value, lowValues[i], highValues[i])}
                      className="h-8 text-sm font-medium"
                      placeholder={`因素 ${i + 1}`}
                    />
                    <div className="flex gap-1.5">
                      <Input
                        value={lowValues[i] || ''}
                        onChange={(e) => handleFactorChange(i, factorNames[i], e.target.value, highValues[i])}
                        className="h-7 text-xs"
                        placeholder="低水平"
                      />
                      <Input
                        value={highValues[i] || ''}
                        onChange={(e) => handleFactorChange(i, factorNames[i], lowValues[i], e.target.value)}
                        className="h-7 text-xs"
                        placeholder="高水平"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">实验方案 - {getPBName(factors)}</CardTitle>
                <CardDescription>共 {pbArray.length} 组筛选实验</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  const header = ['试验号', ...factorNames.slice(0, factors), '响应值'];
                  const rows = pbArray.map((row, i) => [i + 1, ...row.map((v, j) => getLevelLabel(v, j)), '']);
                  const text = [header, ...rows].map((r) => r.join('\t')).join('\n');
                  navigator.clipboard.writeText(text);
                  toast.success('实验表已复制到剪贴板');
                }}>
                  <Copy className="size-4 mr-1" /> 复制
                </Button>
                <Button size="sm" onClick={() => {
                  const headers = ['试验号', ...factorNames.slice(0, factors), '响应值'];
                  const rows = pbArray.map((row, i) => [
                    String(i + 1),
                    ...row.slice(0, factors).map((v, j) => getLevelLabel(v, j)),
                    '',
                  ]);
                  const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
                  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `PB设计_${getPBName(factors)}.csv`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  toast.success('实验方案已导出');
                }}>
                  <Download className="size-4 mr-1" /> 导出
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="whitespace-nowrap w-16">试验号</TableHead>
                    {factorNames.slice(0, factors).map((name, i) => (
                      <TableHead key={i} className="whitespace-nowrap">{name}</TableHead>
                    ))}
                    <TableHead className="whitespace-nowrap">响应值</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pbArray.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-center">{i + 1}</TableCell>
                      {row.slice(0, factors).map((code, j) => (
                        <TableCell key={j}>
                          <Badge variant="outline" className={`font-normal ${code === 1 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {getLevelLabel(code, j)}
                          </Badge>
                        </TableCell>
                      ))}
                      <TableCell className="text-muted-foreground italic">待填写</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">设计说明</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><span className="font-medium text-foreground">Plackett-Burman 设计</span>：一种两水平的部分因子实验设计，主要用于从众多因素中筛选出对响应值有显著影响的因素。</p>
          <p>实验次数为4的倍数（8、12、16、20等），最多可考察 n-1 个因素。</p>
          <p>筛选出显著因素后，建议进一步使用响应面设计进行优化实验。</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== 全因子设计 =====
function FullFactDesign() {
  const [factors, setFactors] = useState(3);
  const [levels, setLevels] = useState(2);
  const [factorNames, setFactorNames] = useState(['温度', '时间', '浓度']);

  const ffArray = useMemo(() => generateFullFactorial(factors, levels), [factors, levels]);

  const handleFactorNameChange = (idx: number, val: string) => {
    const newNames = [...factorNames];
    newNames[idx] = val;
    setFactorNames(newNames);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">全因子实验设计</h2>
        <p className="text-sm text-muted-foreground">{levels}^k 全因子设计，考察所有因素水平组合</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">参数配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>因素数</Label>
                <Select value={factors.toString()} onValueChange={(v) => setFactors(parseInt(v))}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 因素</SelectItem>
                    <SelectItem value="3">3 因素</SelectItem>
                    <SelectItem value="4">4 因素</SelectItem>
                    <SelectItem value="5">5 因素</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>水平数</Label>
                <Select value={levels.toString()} onValueChange={(v) => setLevels(parseInt(v))}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 水平</SelectItem>
                    <SelectItem value="3">3 水平</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="pt-2 border-t border-border/40">
              <Label className="mb-2 block">因素名称</Label>
              <div className="space-y-2">
                {Array.from({ length: factors }).map((_, i) => (
                  <Input
                    key={i}
                    value={factorNames[i] || ''}
                    onChange={(e) => handleFactorNameChange(i, e.target.value)}
                    className="h-8 text-sm font-medium"
                    placeholder={`因素 ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">实验方案 - {getFullFactorialName(factors, levels)}</CardTitle>
                <CardDescription>所有因素水平的完全组合</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  const header = ['试验号', ...factorNames.slice(0, factors), '响应值'];
                  const rows = ffArray.map((row, i) => [i + 1, ...row.map((v) => `水平${v}`), '']);
                  const text = [header, ...rows].map((r) => r.join('\t')).join('\n');
                  navigator.clipboard.writeText(text);
                  toast.success('实验表已复制到剪贴板');
                }}>
                  <Copy className="size-4 mr-1" /> 复制
                </Button>
                <Button size="sm" onClick={() => {
                  const headers = ['试验号', ...factorNames.slice(0, factors), '响应值'];
                  const rows = ffArray.map((row, i) => [
                    String(i + 1),
                    ...row.slice(0, factors).map((v) => `水平${v}`),
                    '',
                  ]);
                  const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
                  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `全因子_${getFullFactorialName(factors, levels)}.csv`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  toast.success('实验方案已导出');
                }}>
                  <Download className="size-4 mr-1" /> 导出
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="whitespace-nowrap w-16">试验号</TableHead>
                    {factorNames.slice(0, factors).map((name, i) => (
                      <TableHead key={i} className="whitespace-nowrap">{name}</TableHead>
                    ))}
                    <TableHead className="whitespace-nowrap">响应值</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ffArray.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-center">{i + 1}</TableCell>
                      {row.slice(0, factors).map((level, j) => (
                        <TableCell key={j}>
                          <Badge variant="outline" className="font-normal">
                            水平{level}
                          </Badge>
                        </TableCell>
                      ))}
                      <TableCell className="text-muted-foreground italic">待填写</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">设计说明</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><span className="font-medium text-foreground">全因子设计</span>：考察所有因素水平的组合，能够全面评估各因素的主效应和交互效应。</p>
          <p>{levels}^{factors} 全因子设计共 {ffArray.length} 组实验。因素数较多时建议使用部分因子设计以减少实验量。</p>
          <p>适用于因素数量较少（通常≤5个）且需要全面了解因素间交互作用的情况。</p>
        </CardContent>
      </Card>
    </div>
  );
}
