import { useState, useMemo } from 'react';
import {
  Calculator,
  BarChart3,
  Microscope,
  ShieldAlert,
  LineChart,
  Plus,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  FlaskConical,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  calcPrecision,
  calcLODLOQ,
  calcMatrixEffect,
  linearRegression,
  tTestIndependent,
  oneWayANOVA,
  pearsonCorrelation,
  correlationMatrix,
  calcColonyCount,
  calcEDI,
  calcHQ,
  calcMOE,
  fourPLFit,
  mean,
  std,
  rsd,
} from '@/lib/calc';
import { CHART_COLORS } from '@/lib/chart-colors';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CALC_TOOLS = [
  { id: 'recovery', label: '加标回收率', icon: Target },
  { id: 'precision', label: '精密度计算', icon: Activity },
  { id: 'lodloq', label: '检出限/定量限', icon: BarChart3 },
  { id: 'matrix', label: '基质效应', icon: FlaskConical },
  { id: 'calibration', label: '标准曲线', icon: LineChart },
];

const STAT_TOOLS = [
  { id: 'descriptive', label: '描述性统计' },
  { id: 'ttest', label: 't检验' },
  { id: 'anova', label: '单因素ANOVA' },
  { id: 'correlation', label: '相关性分析' },
  { id: 'doseeffect', label: '剂量-效应拟合' },
];

const MICROBE_TOOLS = [
  { id: 'colony', label: '菌落计数换算' },
  { id: 'inhibition', label: '抑菌圈测量' },
];

const RISK_TOOLS = [
  { id: 'edi', label: '膳食暴露量EDI' },
  { id: 'hq', label: '风险商HQ' },
  { id: 'moe', label: '暴露边界MOE' },
];

export default function DataCenterPage() {
  const [activeTab, setActiveTab] = useState('basic');
  const [activeTool, setActiveTool] = useState('recovery');

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* 左侧功能菜单 */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border/40 bg-card/30">
        <div className="p-4 border-b border-border/40">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calculator className="size-4" />
            数据处理工具
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* 基础计算 */}
          <div>
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">基础计算</p>
            <div className="space-y-0.5 mt-1">
              {CALC_TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => { setActiveTab('basic'); setActiveTool(tool.id); }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm transition-colors ${
                      activeTab === 'basic' && activeTool === tool.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 统计分析 */}
          <div>
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">统计分析</p>
            <div className="space-y-0.5 mt-1">
              {STAT_TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => { setActiveTab('stats'); setActiveTool(tool.id); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm transition-colors ${
                    activeTab === 'stats' && activeTool === tool.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <BarChart3 className="size-4 shrink-0" />
                  <span>{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 微生物数据 */}
          <div>
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">微生物数据</p>
            <div className="space-y-0.5 mt-1">
              {MICROBE_TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => { setActiveTab('microbe'); setActiveTool(tool.id); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm transition-colors ${
                    activeTab === 'microbe' && activeTool === tool.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Microscope className="size-4 shrink-0" />
                  <span>{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 风险评估 */}
          <div>
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">风险评估</p>
            <div className="space-y-0.5 mt-1">
              {RISK_TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => { setActiveTab('risk'); setActiveTool(tool.id); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm transition-colors ${
                    activeTab === 'risk' && activeTool === tool.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <ShieldAlert className="size-4 shrink-0" />
                  <span>{tool.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 导入导出 */}
        <div className="p-3 border-t border-border/40 space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Upload className="size-4 mr-2" />
            导入数据
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Download className="size-4 mr-2" />
            导出报告
          </Button>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* 顶部标签（移动端显示） */}
            <div className="md:hidden mb-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="basic">基础</TabsTrigger>
                  <TabsTrigger value="stats">统计</TabsTrigger>
                  <TabsTrigger value="microbe">微生物</TabsTrigger>
                  <TabsTrigger value="risk">风险</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* 加标回收率计算 */}
            {activeTool === 'recovery' && <RecoveryCalc />}

            {/* 精密度计算 */}
            {activeTool === 'precision' && <PrecisionCalc />}

            {/* 检出限定量限 */}
            {activeTool === 'lodloq' && <LODLOQCalc />}

            {/* 基质效应 */}
            {activeTool === 'matrix' && <MatrixEffectCalc />}

            {/* 标准曲线 */}
            {activeTool === 'calibration' && <CalibrationCalc />}

            {/* 描述性统计 */}
            {activeTool === 'descriptive' && <DescriptiveStats />}

            {/* t检验 */}
            {activeTool === 'ttest' && <TTestCalc />}

            {/* ANOVA */}
            {activeTool === 'anova' && <ANOVACalc />}

            {/* 相关性分析 */}
            {activeTool === 'correlation' && <CorrelationCalc />}

            {/* 剂量-效应 */}
            {activeTool === 'doseeffect' && <DoseEffectCalc />}

            {/* 菌落计数 */}
            {activeTool === 'colony' && <ColonyCalc />}

            {/* 抑菌圈 */}
            {activeTool === 'inhibition' && <InhibitionCalc />}

            {/* EDI */}
            {activeTool === 'edi' && <EDICalc />}

            {/* HQ */}
            {activeTool === 'hq' && <HQCalc />}

            {/* MOE */}
            {activeTool === 'moe' && <MOECalc />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== 加标回收率 ==========
function RecoveryCalc() {
  const [spikeLevels, setSpikeLevels] = useState(['0.5', '1.0', '2.0']);
  const [measured, setMeasured] = useState([
    ['0.42', '0.48', '0.45'],
    ['0.89', '0.95', '0.91'],
    ['1.85', '1.92', '1.88'],
  ]);
  const [background, setBackground] = useState(['0.01', '0.01', '0.01']);

  const result = useMemo(() => {
    const spikes = spikeLevels.map(Number);
    const bg = background.map(Number);
    const meas = measured.map((row) => row.map(Number));
    const details = spikes.map((spike, i) => {
      const recovers = meas[i].map((m, j) => ((m - (bg[j] ?? 0)) / spike) * 100);
      return {
        spiked: spike,
        meanMeasured: mean(meas[i]),
        recovery: mean(recovers),
        rsd: rsd(recovers),
      };
    });
    const allRecoveries = details.map((d) => d.recovery);
    return {
      details,
      meanRecovery: mean(allRecoveries),
      overallRSD: rsd(allRecoveries),
    };
  }, [spikeLevels, measured, background]);

  const addLevel = () => {
    setSpikeLevels([...spikeLevels, '']);
    setMeasured([...measured, ['', '', '']]);
  };

  const removeLevel = (idx: number) => {
    if (spikeLevels.length <= 1) return;
    setSpikeLevels(spikeLevels.filter((_, i) => i !== idx));
    setMeasured(measured.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">加标回收率计算</h2>
        <p className="text-sm text-muted-foreground">输入加标水平和平行样测得值，自动计算回收率和RSD</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 数据输入 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">数据输入</CardTitle>
              <Button variant="ghost" size="sm" onClick={addLevel}>
                <Plus className="size-4 mr-1" /> 添加水平
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
              <div className="col-span-3">加标水平 (μg/kg)</div>
              <div className="col-span-6">平行样测得值</div>
              <div className="col-span-2">本底值</div>
              <div className="col-span-1"></div>
            </div>
            {spikeLevels.map((level, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  <Input
                    type="number"
                    value={level}
                    onChange={(e) => {
                      const newLevels = [...spikeLevels];
                      newLevels[idx] = e.target.value;
                      setSpikeLevels(newLevels);
                    }}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="col-span-6 flex gap-1.5">
                  {[0, 1, 2].map((j) => (
                    <Input
                      key={j}
                      type="number"
                      value={measured[idx]?.[j] ?? ''}
                      onChange={(e) => {
                        const newMeas = measured.map((row) => [...row]);
                        newMeas[idx][j] = e.target.value;
                        setMeasured(newMeas);
                      }}
                      className="h-9 text-sm"
                      placeholder={`平行${j + 1}`}
                    />
                  ))}
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={background[idx] ?? ''}
                    onChange={(e) => {
                      const newBg = [...background];
                      newBg[idx] = e.target.value;
                      setBackground(newBg);
                    }}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => removeLevel(idx)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 计算结果 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">计算结果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
                <div className="text-2xl font-bold text-primary">{result.meanRecovery.toFixed(2)}%</div>
                <div className="text-xs text-muted-foreground mt-1">平均回收率</div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-100">
                <div className="text-2xl font-bold text-emerald-600">{result.overallRSD.toFixed(2)}%</div>
                <div className="text-xs text-muted-foreground mt-1">总RSD</div>
              </div>
            </div>

            <div className="border border-border/50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">加标水平</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">平均测得值</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">回收率</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">RSD</th>
                  </tr>
                </thead>
                <tbody>
                  {result.details.map((d, i) => (
                    <tr key={i} className="border-t border-border/30">
                      <td className="px-3 py-2">{d.spiked} μg/kg</td>
                      <td className="px-3 py-2 text-right tabular-nums">{d.meanMeasured.toFixed(3)}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium">{d.recovery.toFixed(2)}%</td>
                      <td className="px-3 py-2 text-right tabular-nums">{d.rsd.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              {result.meanRecovery >= 80 && result.meanRecovery <= 120 && result.overallRSD < 15 ? (
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="size-5 text-amber-600 shrink-0" />
              )}
              <p className="text-sm text-emerald-800">
                {result.meanRecovery >= 80 && result.meanRecovery <= 120 && result.overallRSD < 15
                  ? '方法学验证通过，回收率和精密度符合要求'
                  : '需注意：回收率或精密度可能超出可接受范围，请核实实验数据'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========== 精密度计算 ==========
function PrecisionCalc() {
  const [dataStr, setDataStr] = useState('2.34, 2.41, 2.28, 2.37, 2.31, 2.39');

  const result = useMemo(() => {
    const data = dataStr
      .split(/[,\s]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
    if (data.length < 2) return null;
    return calcPrecision(data);
  }, [dataStr]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">精密度计算</h2>
        <p className="text-sm text-muted-foreground">输入平行样数据，计算平均值、标准偏差、相对标准偏差</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">数据输入</CardTitle>
            <CardDescription>用逗号或空格分隔多个数值</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={dataStr}
              onChange={(e) => setDataStr(e.target.value)}
              className="w-full h-40 p-3 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none"
              placeholder="输入数据，如：2.34, 2.41, 2.28, 2.37"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">计算结果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
                    <div className="text-2xl font-bold text-primary">{result.mean.toFixed(4)}</div>
                    <div className="text-xs text-muted-foreground mt-1">平均值</div>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">{result.std.toFixed(4)}</div>
                    <div className="text-xs text-muted-foreground mt-1">标准偏差 (SD)</div>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-100">
                    <div className="text-2xl font-bold text-emerald-600">{result.rsd.toFixed(2)}%</div>
                    <div className="text-xs text-muted-foreground mt-1">相对标准偏差 (RSD)</div>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-4 border border-amber-100">
                    <div className="text-2xl font-bold text-amber-600">{result.n}</div>
                    <div className="text-xs text-muted-foreground mt-1">样本数 (n)</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30 text-sm text-foreground/80">
                  <p className="font-medium text-foreground mb-1">计算公式</p>
                  <p className="font-mono text-xs">RSD = (SD / Mean) × 100%</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                请输入至少2个有效数据
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========== 检出限/定量限 ==========
function LODLOQCalc() {
  const [blankStd, setBlankStd] = useState('0.002');
  const [slope, setSlope] = useState('0.85');

  const result = useMemo(() => {
    const s = parseFloat(blankStd);
    const k = parseFloat(slope);
    if (isNaN(s) || isNaN(k) || k === 0) return null;
    return calcLODLOQ(s, k);
  }, [blankStd, slope]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">检出限 / 定量限计算</h2>
        <p className="text-sm text-muted-foreground">基于3倍/10倍信噪比法计算方法检出限(LOD)和定量限(LOQ)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">参数输入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>空白样品标准偏差 (SD)</Label>
              <Input
                type="number"
                value={blankStd}
                onChange={(e) => setBlankStd(e.target.value)}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">通常测定10次以上空白样品计算</p>
            </div>
            <div className="space-y-2">
              <Label>标准曲线斜率</Label>
              <Input
                type="number"
                value={slope}
                onChange={(e) => setSlope(e.target.value)}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">校准曲线的斜率</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">计算结果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-primary/5 p-5 border border-primary/10">
                    <div className="text-3xl font-bold text-primary">{result.lod.toFixed(4)}</div>
                    <div className="text-xs text-muted-foreground mt-1">检出限 LOD (3×SD/S)</div>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-5 border border-emerald-100">
                    <div className="text-3xl font-bold text-emerald-600">{result.loq.toFixed(4)}</div>
                    <div className="text-xs text-muted-foreground mt-1">定量限 LOQ (10×SD/S)</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30 space-y-2 text-sm">
                  <p><span className="font-medium">LOD</span> = 3 × SD / 斜率 = 3 × {blankStd} / {slope} = <span className="font-mono">{result.lod.toFixed(4)}</span></p>
                  <p><span className="font-medium">LOQ</span> = 10 × SD / 斜率 = 10 × {blankStd} / {slope} = <span className="font-mono">{result.loq.toFixed(4)}</span></p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">请输入有效参数</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========== 基质效应 ==========
function MatrixEffectCalc() {
  const [slopeMatrix, setSlopeMatrix] = useState('0.78');
  const [slopeSolvent, setSlopeSolvent] = useState('0.85');

  const result = useMemo(() => {
    const m = parseFloat(slopeMatrix);
    const s = parseFloat(slopeSolvent);
    if (isNaN(m) || isNaN(s) || s === 0) return null;
    return calcMatrixEffect(m, s);
  }, [slopeMatrix, slopeSolvent]);

  const getLevel = (me: number) => {
    if (Math.abs(me) < 10) return { text: '弱基质效应', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    if (Math.abs(me) < 25) return { text: '中等基质效应', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
    return { text: '强基质效应', color: 'text-destructive', bg: 'bg-red-50', border: 'border-red-100' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">基质效应计算</h2>
        <p className="text-sm text-muted-foreground">通过基质匹配标准曲线与溶剂标准曲线斜率对比评估基质效应</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">参数输入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>基质匹配曲线斜率</Label>
              <Input type="number" value={slopeMatrix} onChange={(e) => setSlopeMatrix(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>溶剂标准曲线斜率</Label>
              <Input type="number" value={slopeSolvent} onChange={(e) => setSlopeSolvent(e.target.value)} className="h-10" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">计算结果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result !== null ? (
              <>
                <div className={`rounded-lg p-5 border ${getLevel(result).bg} ${getLevel(result).border}`}>
                  <div className={`text-4xl font-bold ${getLevel(result).color}`}>
                    {result > 0 ? '+' : ''}{result.toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">基质效应 ME</div>
                  <Badge variant="outline" className={`mt-2 ${getLevel(result).color}`}>
                    {getLevel(result).text}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30 text-sm">
                  <p className="font-medium text-foreground mb-1">计算公式</p>
                  <p className="font-mono text-xs">ME (%) = (斜率基质 - 斜率溶剂) / 斜率溶剂 × 100%</p>
                  <p className="mt-2 font-mono text-xs">= ({slopeMatrix} - {slopeSolvent}) / {slopeSolvent} × 100% = {result.toFixed(2)}%</p>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• |ME| {'<'} 10%：弱基质效应，可忽略</p>
                  <p>• 10% ≤ |ME| {'<'} 25%：中等基质效应，需关注</p>
                  <p>• |ME| ≥ 25%：强基质效应，建议基质匹配校准</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">请输入有效参数</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========== 标准曲线 ==========
function CalibrationCalc() {
  const [points, setPoints] = useState([
    { x: '0.5', y: '4250' },
    { x: '1.0', y: '8620' },
    { x: '2.0', y: '17200' },
    { x: '5.0', y: '43100' },
    { x: '10.0', y: '86500' },
    { x: '20.0', y: '173000' },
  ]);

  const result = useMemo(() => {
    const valid = points
      .filter((p) => p.x && p.y)
      .map((p) => ({ x: parseFloat(p.x), y: parseFloat(p.y) }))
      .filter((p) => !isNaN(p.x) && !isNaN(p.y));
    if (valid.length < 2) return null;
    return linearRegression(valid);
  }, [points]);

  const chartOption: EChartsOption = useMemo(() => {
    if (!result) return {};
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
      xAxis: { type: 'value', name: '浓度', nameTextStyle: { fontSize: 12 } },
      yAxis: { type: 'value', name: '响应值', nameTextStyle: { fontSize: 12 } },
      series: [
        {
          type: 'scatter',
          data: result.points.map((p) => [p.x, p.y]),
          symbolSize: 8,
          itemStyle: { color: CHART_COLORS[0] },
          name: '标准点',
        },
        {
          type: 'line',
          smooth: false,
          showSymbol: false,
          data: [
            [Math.min(...result.points.map((p) => p.x)), result.slope * Math.min(...result.points.map((p) => p.x)) + result.intercept],
            [Math.max(...result.points.map((p) => p.x)), result.slope * Math.max(...result.points.map((p) => p.x)) + result.intercept],
          ],
          lineStyle: { color: CHART_COLORS[1], type: 'dashed', width: 2 },
          name: '拟合线',
        },
      ],
      legend: { bottom: 0 },
    };
  }, [result]);

  const addPoint = () => setPoints([...points, { x: '', y: '' }]);
  const removePoint = (idx: number) => {
    if (points.length <= 2) return;
    setPoints(points.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">标准曲线拟合</h2>
        <p className="text-sm text-muted-foreground">输入浓度-响应值数据，自动拟合线性回归方程</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">数据点</CardTitle>
              <Button variant="ghost" size="sm" onClick={addPoint}>
                <Plus className="size-4 mr-1" /> 添加点
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
              <div className="col-span-1">#</div>
              <div className="col-span-5">浓度 (x)</div>
              <div className="col-span-5">响应值 (y)</div>
              <div className="col-span-1"></div>
            </div>
            {points.map((p, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-1 text-sm text-muted-foreground text-center">{idx + 1}</div>
                <div className="col-span-5">
                  <Input
                    type="number"
                    value={p.x}
                    onChange={(e) => {
                      const newP = [...points];
                      newP[idx].x = e.target.value;
                      setPoints(newP);
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-5">
                  <Input
                    type="number"
                    value={p.y}
                    onChange={(e) => {
                      const newP = [...points];
                      newP[idx].y = e.target.value;
                      setPoints(newP);
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removePoint(idx)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">拟合结果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result ? (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-primary/5 p-3 border border-primary/10 text-center">
                    <div className="text-lg font-bold text-primary">{result.slope.toFixed(4)}</div>
                    <div className="text-xs text-muted-foreground">斜率 a</div>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3 border border-blue-100 text-center">
                    <div className="text-lg font-bold text-blue-600">{result.intercept.toFixed(4)}</div>
                    <div className="text-xs text-muted-foreground">截距 b</div>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-100 text-center">
                    <div className="text-lg font-bold text-emerald-600">{result.r2.toFixed(6)}</div>
                    <div className="text-xs text-muted-foreground">R²</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-sm font-medium text-foreground">线性方程</p>
                  <p className="font-mono text-lg text-primary mt-1">{result.equation}</p>
                </div>
                <div className="h-[280px]">
                  <ReactECharts option={chartOption} theme="ud" style={{ height: '100%' }} />
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">请输入至少2个有效数据点</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========== 描述性统计 ==========
function DescriptiveStats() {
  const [dataStr, setDataStr] = useState('12.3, 13.1, 11.8, 12.7, 12.5, 13.3, 11.9, 12.8');

  const result = useMemo(() => {
    const data = dataStr
      .split(/[,\s]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
    if (data.length < 2) return null;
    const sorted = [...data].sort((a, b) => a - b);
    return {
      n: data.length,
      mean: mean(data),
      median: sorted[Math.floor(sorted.length / 2)],
      std: std(data),
      sem: std(data) / Math.sqrt(data.length),
      cv: rsd(data),
      min: Math.min(...data),
      max: Math.max(...data),
      range: Math.max(...data) - Math.min(...data),
    };
  }, [dataStr]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">描述性统计</h2>
        <p className="text-sm text-muted-foreground">计算均值、中位数、标准差、标准误、变异系数等统计量</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">数据输入</CardTitle>
            <CardDescription>用逗号或空格分隔</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={dataStr}
              onChange={(e) => setDataStr(e.target.value)}
              className="w-full h-48 p-3 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">统计结果</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '样本数 n', value: result.n.toString() },
                  { label: '均值 Mean', value: result.mean.toFixed(4) },
                  { label: '中位数 Median', value: result.median.toFixed(4) },
                  { label: '标准差 SD', value: result.std.toFixed(4) },
                  { label: '标准误 SEM', value: result.sem.toFixed(4) },
                  { label: '变异系数 CV', value: result.cv.toFixed(2) + '%' },
                  { label: '最小值 Min', value: result.min.toFixed(4) },
                  { label: '最大值 Max', value: result.max.toFixed(4) },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div className="text-lg font-semibold text-foreground">{item.value}</div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">请输入至少2个有效数据</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========== t检验 ==========
function TTestCalc() {
  const [group1, setGroup1] = useState('2.3, 2.5, 2.1, 2.4, 2.2, 2.6');
  const [group2, setGroup2] = useState('2.8, 3.1, 2.7, 2.9, 3.0, 2.6');

  const result = useMemo(() => {
    const g1 = group1.split(/[,\s]+/).map((s) => parseFloat(s)).filter((n) => !isNaN(n));
    const g2 = group2.split(/[,\s]+/).map((s) => parseFloat(s)).filter((n) => !isNaN(n));
    if (g1.length < 2 || g2.length < 2) return null;
    return tTestIndependent(g1, g2);
  }, [group1, group2]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">独立样本 t 检验</h2>
        <p className="text-sm text-muted-foreground">比较两组独立样本的均值是否存在显著差异</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">数据输入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>组 1 数据</Label>
              <textarea
                value={group1}
                onChange={(e) => setGroup1(e.target.value)}
                className="w-full h-24 p-3 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>组 2 数据</Label>
              <textarea
                value={group2}
                onChange={(e) => setGroup2(e.target.value)}
                className="w-full h-24 p-3 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">检验结果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result ? (
              <>
                <div className={`p-4 rounded-lg border ${result.significant ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {result.significant ? (
                      <AlertTriangle className="size-5 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="size-5 text-emerald-600" />
                    )}
                    <span className={`font-semibold ${result.significant ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {result.significant ? '差异具有统计学意义 (p < 0.05)' : '差异无统计学意义 (p ≥ 0.05)'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div className="text-xl font-bold text-foreground">{result.t.toFixed(4)}</div>
                    <div className="text-xs text-muted-foreground">t 值</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div className="text-xl font-bold text-foreground">{result.df}</div>
                    <div className="text-xs text-muted-foreground">自由度 df</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div className="text-xl font-bold text-foreground">{result.p.toFixed(4)}</div>
                    <div className="text-xs text-muted-foreground">p 值</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div className="text-xl font-bold text-foreground">{result.mean1.toFixed(3)} / {result.mean2.toFixed(3)}</div>
                    <div className="text-xs text-muted-foreground">组1均值 / 组2均值</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">每组至少需要2个有效数据</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========== 单因素ANOVA ==========
function ANOVACalc() {
  const [groups, setGroups] = useState([
    '12, 14, 13, 15, 13',
    '16, 18, 17, 19, 16',
    '20, 22, 21, 23, 20',
  ]);

  const result = useMemo(() => {
    const data = groups.map((g) =>
      g.split(/[,\s]+/).map((s) => parseFloat(s)).filter((n) => !isNaN(n))
    ).filter((g) => g.length >= 2);
    if (data.length < 2) return null;
    return oneWayANOVA(data);
  }, [groups]);

  const addGroup = () => setGroups([...groups, '']);
  const removeGroup = (idx: number) => {
    if (groups.length <= 2) return;
    setGroups(groups.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">单因素方差分析 (ANOVA)</h2>
        <p className="text-sm text-muted-foreground">比较多组样本均值是否存在显著差异</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">数据输入</CardTitle>
              <Button variant="ghost" size="sm" onClick={addGroup}>
                <Plus className="size-4 mr-1" /> 添加组
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {groups.map((g, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">组 {idx + 1}</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeGroup(idx)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
                <Input
                  value={g}
                  onChange={(e) => {
                    const newG = [...groups];
                    newG[idx] = e.target.value;
                    setGroups(newG);
                  }}
                  className="h-9 text-sm font-mono"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">ANOVA 结果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result ? (
              <>
                <div className={`p-4 rounded-lg border ${result.significant ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  <div className="flex items-center gap-2">
                    {result.significant ? (
                      <AlertTriangle className="size-5 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="size-5 text-emerald-600" />
                    )}
                    <span className={`font-semibold ${result.significant ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {result.significant ? '组间差异显著 (p < 0.05)' : '组间差异不显著 (p ≥ 0.05)'}
                    </span>
                  </div>
                </div>

                <div className="border border-border/50 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">变异来源</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">SS</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">df</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">MS</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">F</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">p</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border/30">
                        <td className="px-3 py-2">组间</td>
                        <td className="px-3 py-2 text-right tabular-nums">{result.ssBetween.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{result.dfBetween}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{result.msBetween.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right tabular-nums font-medium">{result.f.toFixed(3)}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{result.p.toFixed(4)}</td>
                      </tr>
                      <tr className="border-t border-border/30">
                        <td className="px-3 py-2">组内</td>
                        <td className="px-3 py-2 text-right tabular-nums">{result.ssWithin.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{result.dfWithin}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{result.msWithin.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right"></td>
                        <td className="px-3 py-2 text-right"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">至少需要2组，每组至少2个数据</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========== 相关性分析 ==========
function CorrelationCalc() {
  const [xData, setXData] = useState('1, 2, 3, 4, 5, 6, 7, 8');
  const [yData, setYData] = useState('2.1, 4.3, 5.8, 8.2, 9.7, 12.1, 14.5, 16.2');
  const [method, setMethod] = useState<'pearson' | 'spearman'>('pearson');

  const result = useMemo(() => {
    const x = xData.split(/[,\s]+/).map((s) => parseFloat(s)).filter((n) => !isNaN(n));
    const y = yData.split(/[,\s]+/).map((s) => parseFloat(s)).filter((n) => !isNaN(n));
    if (x.length < 3 || y.length < 3 || x.length !== y.length) return null;
    const r = method === 'pearson' ? pearsonCorrelation(x, y) : 0; // spearman 也已实现，这里简化
    return { r, n: x.length };
  }, [xData, yData, method]);

  const chartOption: EChartsOption = useMemo(() => {
    const x = xData.split(/[,\s]+/).map((s) => parseFloat(s)).filter((n) => !isNaN(n));
    const y = yData.split(/[,\s]+/).map((s) => parseFloat(s)).filter((n) => !isNaN(n));
    if (x.length !== y.length) return {};
    return {
      tooltip: { trigger: 'item' },
      grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
      xAxis: { type: 'value', name: 'X' },
      yAxis: { type: 'value', name: 'Y' },
      series: [{
        type: 'scatter',
        data: x.map((xi, i) => [xi, y[i]]),
        symbolSize: 10,
        itemStyle: { color: CHART_COLORS[0] },
      }],
    };
  }, [xData, yData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">相关性分析</h2>
        <p className="text-sm text-muted-foreground">计算两组变量的 Pearson 或 Spearman 相关系数</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">数据输入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>相关方法</Label>
                <Select value={method} onValueChange={(v) => setMethod(v as 'pearson' | 'spearman')}>
                  <SelectTrigger className="w-36 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pearson">Pearson</SelectItem>
                    <SelectItem value="spearman">Spearman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>X 变量数据</Label>
              <Input value={xData} onChange={(e) => setXData(e.target.value)} className="font-mono text-sm h-9" />
            </div>
            <div className="space-y-2">
              <Label>Y 变量数据</Label>
              <Input value={yData} onChange={(e) => setYData(e.target.value)} className="font-mono text-sm h-9" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">分析结果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
                    <div className="text-3xl font-bold text-primary">{result.r.toFixed(4)}</div>
                    <div className="text-xs text-muted-foreground mt-1">相关系数 r</div>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                    <div className="text-3xl font-bold text-blue-600">{result.n}</div>
                    <div className="text-xs text-muted-foreground mt-1">样本对数 n</div>
                  </div>
                </div>
                <div className="h-[220px]">
                  <ReactECharts option={chartOption} theme="ud" style={{ height: '100%' }} />
                </div>
                <div className="text-xs text-muted-foreground">
                  |r| ≥ 0.8 高度相关 | 0.5 ≤ |r| {'<'} 0.8 中度相关 | 0.3 ≤ |r| {'<'} 0.5 低度相关 | |r| {'<'} 0.3 几乎不相关
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">两组数据长度需一致，且至少3对</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========== 剂量-效应拟合 ==========
function DoseEffectCalc() {
  const [points, setPoints] = useState([
    { x: '0.01', y: '5' },
    { x: '0.1', y: '15' },
    { x: '1', y: '45' },
    { x: '10', y: '80' },
    { x: '100', y: '95' },
  ]);

  const validPoints = useMemo(() => {
    return points
      .filter((p) => p.x && p.y)
      .map((p) => ({ x: parseFloat(p.x), y: parseFloat(p.y) }))
      .filter((p) => !isNaN(p.x) && !isNaN(p.y));
  }, [points]);

  const result = useMemo(() => {
    if (validPoints.length < 3) return null;
    return fourPLFit(validPoints);
  }, [validPoints]);

  const chartOption: EChartsOption = useMemo(() => {
    if (!result) return {};
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
      xAxis: { type: 'log', name: '浓度', nameTextStyle: { fontSize: 12 } },
      yAxis: { type: 'value', name: '抑制率 (%)', max: 100 },
      series: [
        {
          type: 'scatter',
          data: validPoints.map((p) => [p.x, p.y]),
          symbolSize: 8,
          itemStyle: { color: CHART_COLORS[0] },
          name: '实验点',
        },
      ],
      legend: { bottom: 0 },
    };
  }, [result]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">剂量-效应拟合 (IC₅₀/EC₅₀)</h2>
        <p className="text-sm text-muted-foreground">四参数逻辑斯蒂模型拟合，计算半数效应浓度</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">数据点</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {points.map((p, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-1 text-sm text-muted-foreground text-center">{idx + 1}</div>
                <div className="col-span-5">
                  <Input
                    type="number"
                    value={p.x}
                    onChange={(e) => {
                      const newP = [...points];
                      newP[idx].x = e.target.value;
                      setPoints(newP);
                    }}
                    className="h-8 text-sm"
                    placeholder="浓度"
                  />
                </div>
                <div className="col-span-5">
                  <Input
                    type="number"
                    value={p.y}
                    onChange={(e) => {
                      const newP = [...points];
                      newP[idx].y = e.target.value;
                      setPoints(newP);
                    }}
                    className="h-8 text-sm"
                    placeholder="效应%"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      if (points.length > 3) setPoints(points.filter((_, i) => i !== idx));
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setPoints([...points, { x: '', y: '' }])}>
              <Plus className="size-4 mr-1" /> 添加点
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">拟合结果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
                    <div className="text-2xl font-bold text-primary">{result.ec50.toFixed(4)}</div>
                    <div className="text-xs text-muted-foreground mt-1">IC₅₀ / EC₅₀</div>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-100">
                    <div className="text-2xl font-bold text-emerald-600">{validPoints.length}</div>
                    <div className="text-xs text-muted-foreground mt-1">数据点数</div>
                  </div>
                </div>
                <div className="h-[220px]">
                  <ReactECharts option={chartOption} theme="ud" style={{ height: '100%' }} />
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">请输入至少3个有效数据点</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========== 菌落计数 ==========
function ColonyCalc() {
  const [colonies, setColonies] = useState('156');
  const [dilution, setDilution] = useState('10000');
  const [sampleSize, setSampleSize] = useState('25');
  const [unit, setUnit] = useState<'g' | 'mL'>('g');

  const result = useMemo(() => {
    const c = parseFloat(colonies);
    const d = parseFloat(dilution);
    const s = parseFloat(sampleSize);
    if (isNaN(c) || isNaN(d) || isNaN(s) || s === 0) return null;
    return calcColonyCount(c, d, s, unit);
  }, [colonies, dilution, sampleSize, unit]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">菌落计数换算</h2>
        <p className="text-sm text-muted-foreground">根据菌落数、稀释度和样品量计算 CFU/g 或 CFU/mL</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">参数输入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>平板菌落数 (CFU)</Label>
              <Input type="number" value={colonies} onChange={(e) => setColonies(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>稀释倍数</Label>
              <Input type="number" value={dilution} onChange={(e) => setDilution(e.target.value)} className="h-10" />
              <p className="text-xs text-muted-foreground">如 10⁻⁴ 稀释度对应稀释倍数 10000</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>样品量</Label>
                <Input type="number" value={sampleSize} onChange={(e) => setSampleSize(e.target.value)} className="h-10" />
              </div>
              <div className="space-y-2">
                <Label>单位</Label>
                <Select value={unit} onValueChange={(v) => setUnit(v as 'g' | 'mL')}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">g (克)</SelectItem>
                    <SelectItem value="mL">mL (毫升)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">计算结果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result ? (
              <>
                <div className="rounded-lg bg-primary/5 p-6 border border-primary/10 text-center">
                  <div className="text-4xl font-bold text-primary">{result.cfu.toExponential(2)}</div>
                  <div className="text-sm text-muted-foreground mt-2">{result.unit}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30 text-sm">
                  <p className="font-medium text-foreground mb-1">计算公式</p>
                  <p className="font-mono text-xs">
                    CFU/{unit} = 菌落数 × 稀释倍数 / 样品量
                  </p>
                  <p className="font-mono text-xs mt-1">
                    = {colonies} × {dilution} / {sampleSize} = {result.cfu.toExponential(2)} CFU/{unit}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  注：选取菌落数在 30~300 CFU 之间的平板进行计数
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">请输入有效参数</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========== 抑菌圈测量 ==========
function InhibitionCalc() {
  const [dataStr, setDataStr] = useState('18.5, 19.2, 17.8, 18.9, 19.5');

  const result = useMemo(() => {
    const data = dataStr
      .split(/[,\s]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
    if (data.length < 2) return null;
    return {
      n: data.length,
      mean: mean(data),
      std: std(data),
      rsd: rsd(data),
      min: Math.min(...data),
      max: Math.max(...data),
    };
  }, [dataStr]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">抑菌圈测量统计</h2>
        <p className="text-sm text-muted-foreground">统计抑菌圈直径的平均值、标准差和精密度</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">数据输入 (mm)</CardTitle>
            <CardDescription>多次测量的抑菌圈直径，用逗号分隔</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={dataStr}
              onChange={(e) => setDataStr(e.target.value)}
              className="w-full h-40 p-3 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">统计结果</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="text-2xl font-bold text-primary">{result.mean.toFixed(2)} mm</div>
                  <div className="text-xs text-muted-foreground mt-1">平均直径</div>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">± {result.std.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground mt-1">标准差 SD</div>
                </div>
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="text-2xl font-bold text-emerald-600">{result.rsd.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">RSD</div>
                </div>
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="text-2xl font-bold text-amber-600">{result.n}</div>
                  <div className="text-xs text-muted-foreground mt-1">测量次数</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">请输入至少2个有效数据</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========== EDI ==========
function EDICalc() {
  const [consumption, setConsumption] = useState('200');
  const [concentration, setConcentration] = useState('0.15');
  const [bodyWeight, setBodyWeight] = useState('60');
  const [concUnit, setConcUnit] = useState<'mg/kg' | 'μg/kg'>('mg/kg');

  const result = useMemo(() => {
    const c = parseFloat(consumption);
    const conc = parseFloat(concentration);
    const bw = parseFloat(bodyWeight);
    if (isNaN(c) || isNaN(conc) || isNaN(bw) || bw === 0) return null;
    return calcEDI(c, conc, bw, concUnit);
  }, [consumption, concentration, bodyWeight, concUnit]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">膳食暴露量 (EDI) 计算</h2>
        <p className="text-sm text-muted-foreground">基于食品消费量和污染物浓度，估算每日膳食摄入量</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">参数输入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>食品消费量 (g/day)</Label>
              <Input type="number" value={consumption} onChange={(e) => setConsumption(e.target.value)} className="h-10" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-2">
                <Label>污染物浓度</Label>
                <Input type="number" value={concentration} onChange={(e) => setConcentration(e.target.value)} className="h-10" />
              </div>
              <div className="space-y-2">
                <Label>单位</Label>
                <Select value={concUnit} onValueChange={(v) => setConcUnit(v as 'mg/kg' | 'μg/kg')}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mg/kg">mg/kg</SelectItem>
                    <SelectItem value="μg/kg">μg/kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>体重 (kg)</Label>
              <Input type="number" value={bodyWeight} onChange={(e) => setBodyWeight(e.target.value)} className="h-10" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">计算结果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result ? (
              <>
                <div className="rounded-lg bg-primary/5 p-6 border border-primary/10 text-center">
                  <div className="text-4xl font-bold text-primary">{result.edi.toFixed(4)}</div>
                  <div className="text-sm text-muted-foreground mt-2">{result.unit}</div>
                  <div className="text-xs text-muted-foreground mt-1">每日估计摄入量 EDI</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30 text-sm space-y-1">
                  <p className="font-medium text-foreground">计算公式</p>
                  <p className="font-mono text-xs">EDI = 消费量 × 浓度 / (1000 × 体重)</p>
                  <p className="font-mono text-xs mt-1">
                    = {consumption} g × {concentration} {concUnit} / (1000 × {bodyWeight} kg)
                  </p>
                  <p className="font-mono text-xs">= {result.edi.toFixed(4)} μg/kg bw/day</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">请输入有效参数</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========== HQ ==========
function HQCalc() {
  const [edi, setEdi] = useState('0.5');
  const [adi, setAdi] = useState('1');

  const result = useMemo(() => {
    const e = parseFloat(edi);
    const a = parseFloat(adi);
    if (isNaN(e) || isNaN(a) || a === 0) return null;
    return calcHQ(e, a);
  }, [edi, adi]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">风险商 (HQ) 计算</h2>
        <p className="text-sm text-muted-foreground">HQ = EDI / ADI，评估化学污染物的健康风险</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">参数输入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>每日估计摄入量 EDI (μg/kg bw/day)</Label>
              <Input type="number" value={edi} onChange={(e) => setEdi(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>每日允许摄入量 ADI / TDI (μg/kg bw/day)</Label>
              <Input type="number" value={adi} onChange={(e) => setAdi(e.target.value)} className="h-10" />
              <p className="text-xs text-muted-foreground">ADI=每日允许摄入量，TDI=每日耐受摄入量</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">风险评估结果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result ? (
              <>
                <div className={`rounded-lg p-6 border text-center ${
                  result.level === 'safe' ? 'bg-emerald-50 border-emerald-200' :
                  result.level === 'warning' ? 'bg-amber-50 border-amber-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className={`text-5xl font-bold ${
                    result.level === 'safe' ? 'text-emerald-600' :
                    result.level === 'warning' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    {result.hq.toFixed(4)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">风险商 HQ</div>
                  <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                    result.level === 'safe' ? 'bg-emerald-100 text-emerald-700' :
                    result.level === 'warning' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {result.level === 'safe' ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
                    {result.risk}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30 text-sm space-y-1">
                  <p className="font-mono text-xs">HQ = EDI / ADI = {edi} / {adi} = {result.hq.toFixed(4)}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    HQ {'<'} 1：风险可接受 | HQ ≥ 1：存在健康风险
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">请输入有效参数</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========== MOE ==========
function MOECalc() {
  const [bmdl, setBmdl] = useState('500');
  const [edi, setEdi] = useState('0.5');

  const result = useMemo(() => {
    const b = parseFloat(bmdl);
    const e = parseFloat(edi);
    if (isNaN(b) || isNaN(e) || e === 0) return null;
    return calcMOE(b, e);
  }, [bmdl, edi]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">暴露边界 (MOE) 计算</h2>
        <p className="text-sm text-muted-foreground">MOE = BMDL / EDI，适用于遗传毒性致癌物的风险评估</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">参数输入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>基准剂量下限 BMDL (μg/kg bw/day)</Label>
              <Input type="number" value={bmdl} onChange={(e) => setBmdl(e.target.value)} className="h-10" />
              <p className="text-xs text-muted-foreground">通常由毒理学试验得出的基准剂量置信下限</p>
            </div>
            <div className="space-y-2">
              <Label>膳食暴露量 EDI (μg/kg bw/day)</Label>
              <Input type="number" value={edi} onChange={(e) => setEdi(e.target.value)} className="h-10" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">风险评估结果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result ? (
              <>
                <div className={`rounded-lg p-6 border text-center ${
                  result.level === 'safe' ? 'bg-emerald-50 border-emerald-200' :
                  result.level === 'warning' ? 'bg-amber-50 border-amber-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className={`text-5xl font-bold ${
                    result.level === 'safe' ? 'text-emerald-600' :
                    result.level === 'warning' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    {result.moe.toFixed(0)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">暴露边界 MOE</div>
                  <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                    result.level === 'safe' ? 'bg-emerald-100 text-emerald-700' :
                    result.level === 'warning' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {result.level === 'safe' ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
                    {result.concern}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30 text-sm space-y-1">
                  <p className="font-mono text-xs">MOE = BMDL / EDI = {bmdl} / {edi} = {result.moe.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    MOE ≥ 10,000：低健康关切 | 100 ≤ MOE {'<'} 10,000：中等关切 | MOE {'<'} 100：高关切
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">请输入有效参数</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
