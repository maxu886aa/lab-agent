// 食品安全实验数据计算工具函数

// ===== 基础统计 =====
export function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

export function std(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

export function rsd(arr: number[]): number {
  const m = mean(arr);
  if (m === 0) return 0;
  return (std(arr) / m) * 100;
}

export function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function sem(arr: number[]): number {
  if (arr.length < 2) return 0;
  return std(arr) / Math.sqrt(arr.length);
}

export function cv(arr: number[]): number {
  return rsd(arr);
}

// ===== 加标回收率 =====
export interface RecoveryResult {
  recovery: number; // 回收率 %
  rsd: number; // RSD %
  meanRecovery: number;
  details: { spiked: number; measured: number; recovery: number }[];
}

export function calcRecovery(spikedLevels: number[], measured: number[][], background: number[]): RecoveryResult {
  const details = spikedLevels.map((spike, i) => {
    const recovers = measured[i].map((m, j) => ((m - (background[j] ?? 0)) / spike) * 100);
    return {
      spiked: spike,
      measured: mean(measured[i]),
      recovery: mean(recovers),
    };
  });
  const allRecoveries = details.map((d) => d.recovery);
  return {
    recovery: mean(allRecoveries),
    rsd: rsd(allRecoveries),
    meanRecovery: mean(allRecoveries),
    details,
  };
}

// ===== 精密度 =====
export interface PrecisionResult {
  mean: number;
  std: number;
  rsd: number;
  n: number;
}

export function calcPrecision(data: number[]): PrecisionResult {
  return {
    mean: mean(data),
    std: std(data),
    rsd: rsd(data),
    n: data.length,
  };
}

// ===== 检出限 / 定量限 =====
export interface LODLOQResult {
  lod: number;
  loq: number;
  lodConc: number;
  loqConc: number;
  slope: number;
  intercept: number;
  r2: number;
}

// 3倍/10倍信噪比法，输入空白标准偏差、标准曲线斜率
export function calcLODLOQ(blankStd: number, slope: number): { lod: number; loq: number } {
  return {
    lod: (3 * blankStd) / slope,
    loq: (10 * blankStd) / slope,
  };
}

// ===== 基质效应 =====
// 基质匹配标准曲线斜率 vs 溶剂标准曲线斜率
export function calcMatrixEffect(slopeMatrix: number, slopeSolvent: number): number {
  if (slopeSolvent === 0) return 0;
  return ((slopeMatrix - slopeSolvent) / slopeSolvent) * 100;
}

// ===== 标准曲线拟合（线性回归） =====
export interface CalibrationResult {
  slope: number;
  intercept: number;
  r2: number;
  equation: string;
  points: { x: number; y: number }[];
}

export function linearRegression(points: { x: number; y: number }[]): CalibrationResult {
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const sumY2 = points.reduce((s, p) => s + p.y * p.y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const ssTotal = sumY2 - (sumY * sumY) / n;
  const ssResidual = sumY2 - slope * sumXY - intercept * sumY;
  const r2 = 1 - ssResidual / ssTotal;

  return {
    slope,
    intercept,
    r2,
    equation: `y = ${slope.toFixed(4)}x ${intercept >= 0 ? '+' : ''} ${intercept.toFixed(4)}`,
    points,
  };
}

// ===== t 检验（独立样本） =====
export interface TTestResult {
  t: number;
  df: number;
  p: number;
  mean1: number;
  mean2: number;
  std1: number;
  std2: number;
  significant: boolean;
}

export function tTestIndependent(group1: number[], group2: number[]): TTestResult {
  const m1 = mean(group1);
  const m2 = mean(group2);
  const s1 = std(group1);
  const s2 = std(group2);
  const n1 = group1.length;
  const n2 = group2.length;

  const se = Math.sqrt((s1 * s1) / n1 + (s2 * s2) / n2);
  const t = (m1 - m2) / se;
  const df = n1 + n2 - 2;
  const p = tDistributionPValue(Math.abs(t), df);

  return {
    t,
    df,
    p,
    mean1: m1,
    mean2: m2,
    std1: s1,
    std2: s2,
    significant: p < 0.05,
  };
}

// t 分布 p 值近似（双侧）
function tDistributionPValue(t: number, df: number): number {
  // 使用近似公式
  const x = df / (df + t * t);
  const a = df / 2;
  const b = 0.5;
  return 1 - incompleteBeta(x, a, b);
}

// 不完全 Beta 函数近似
function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(x, a, b)) / a;
  }
  return 1 - (bt * betacf(1 - x, b, a)) / b;
}

function betacf(x: number, a: number, b: number): number {
  const MAXIT = 100;
  const EPS = 3e-7;
  let qab = a + b;
  let qap = a + 1;
  let qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

function lgamma(x: number): number {
  // Gamma 函数对数近似 (Lanczos)
  const coef = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j <= 5; j++) ser += coef[j] / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

// ===== 单因素方差分析 ANOVA =====
export interface ANOVAResult {
  ssBetween: number;
  ssWithin: number;
  dfBetween: number;
  dfWithin: number;
  msBetween: number;
  msWithin: number;
  f: number;
  p: number;
  significant: boolean;
  groupMeans: number[];
  groupStds: number[];
}

export function oneWayANOVA(groups: number[][]): ANOVAResult {
  const k = groups.length;
  const allData = groups.flat();
  const grandMean = mean(allData);
  const nTotal = allData.length;

  let ssBetween = 0;
  let ssWithin = 0;
  const groupMeans: number[] = [];
  const groupStds: number[] = [];

  for (const g of groups) {
    const gm = mean(g);
    groupMeans.push(gm);
    groupStds.push(std(g));
    ssBetween += g.length * (gm - grandMean) ** 2;
    ssWithin += g.reduce((s, v) => s + (v - gm) ** 2, 0);
  }

  const dfBetween = k - 1;
  const dfWithin = nTotal - k;
  const msBetween = ssBetween / dfBetween;
  const msWithin = ssWithin / dfWithin;
  const f = msBetween / msWithin;
  const p = fDistributionPValue(f, dfBetween, dfWithin);

  return {
    ssBetween,
    ssWithin,
    dfBetween,
    dfWithin,
    msBetween,
    msWithin,
    f,
    p,
    significant: p < 0.05,
    groupMeans,
    groupStds,
  };
}

// F 分布 p 值近似
function fDistributionPValue(f: number, df1: number, df2: number): number {
  const x = df2 / (df2 + df1 * f);
  return incompleteBeta(x, df2 / 2, df1 / 2);
}

// ===== 相关性分析 =====
export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const mx = mean(x);
  const my = mean(y);
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  return num / Math.sqrt(denX * denY);
}

export function spearmanCorrelation(x: number[], y: number[]): number {
  const rankX = rankData(x);
  const rankY = rankData(y);
  return pearsonCorrelation(rankX, rankY);
}

function rankData(arr: number[]): number[] {
  const sorted = [...arr].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const ranks = new Array(arr.length);
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j < sorted.length && sorted[j].v === sorted[i].v) j++;
    const avgRank = (i + j - 1) / 2 + 1;
    for (let k = i; k < j; k++) ranks[sorted[k].i] = avgRank;
    i = j;
  }
  return ranks;
}

// 相关性矩阵
export function correlationMatrix(data: number[][], method: 'pearson' | 'spearman' = 'pearson'): number[][] {
  const nVars = data.length;
  const matrix: number[][] = [];
  for (let i = 0; i < nVars; i++) {
    matrix[i] = [];
    for (let j = 0; j < nVars; j++) {
      if (i === j) matrix[i][j] = 1;
      else matrix[i][j] = method === 'pearson' ? pearsonCorrelation(data[i], data[j]) : spearmanCorrelation(data[i], data[j]);
    }
  }
  return matrix;
}

// ===== 微生物：菌落计数 =====
export interface ColonyCountResult {
  cfu: number;
  unit: string;
  details: string;
}

export function calcColonyCount(colonies: number, dilution: number, sampleSize: number, unit: 'g' | 'mL' = 'g'): ColonyCountResult {
  const cfu = (colonies * dilution) / sampleSize;
  return {
    cfu,
    unit: `CFU/${unit}`,
    details: `${colonies} 菌落 × ${dilution} 稀释度 / ${sampleSize}${unit} = ${cfu.toExponential(2)} CFU/${unit}`,
  };
}

// ===== 风险评估：膳食暴露量 EDI =====
export interface EDIResult {
  edi: number; // μg/kg bw/day
  consumption: number; // g/day
  concentration: number; // mg/kg 或 μg/kg
  bodyWeight: number; // kg
  unit: string;
}

export function calcEDI(consumption: number, concentration: number, bodyWeight: number, concUnit: 'mg/kg' | 'μg/kg' = 'mg/kg'): EDIResult {
  // consumption: g/day, concentration: mg/kg or μg/kg, bodyWeight: kg
  // EDI (μg/kg bw/day) = consumption(g) * concentration / bodyWeight(kg)
  // 如果 conc 是 mg/kg，乘以 1000 转 μg
  const concMcg = concUnit === 'mg/kg' ? concentration * 1000 : concentration;
  const edi = (consumption * concMcg) / (bodyWeight * 1000); // g * μg/kg / kg = μg/kg bw/day? 需修正
  // 修正: consumption(g/day) * concentration(μg/kg) = consumption/1000 kg/day * μg/kg = consumption*concentration/1000 μg/day
  // EDI = (consumption/1000 * concMcg) / bodyWeight = consumption * concMcg / (1000 * bodyWeight) μg/kg bw/day
  const ediFinal = (consumption * concMcg) / (1000 * bodyWeight);
  return {
    edi: ediFinal,
    consumption,
    concentration,
    bodyWeight,
    unit: 'μg/kg bw/day',
  };
}

// 风险商 HQ = EDI / ADI
export function calcHQ(edi: number, adi: number): { hq: number; risk: string; level: 'safe' | 'warning' | 'danger' } {
  const hq = edi / adi;
  let risk = '安全';
  let level: 'safe' | 'warning' | 'danger' = 'safe';
  if (hq >= 1) {
    risk = '存在健康风险';
    level = 'danger';
  } else if (hq >= 0.5) {
    risk = '需关注';
    level = 'warning';
  }
  return { hq, risk, level };
}

// 暴露边界 MOE = BMDL / EDI
export function calcMOE(bmdl: number, edi: number): { moe: number; concern: string; level: 'safe' | 'warning' | 'danger' } {
  const moe = bmdl / edi;
  let concern = '低健康关切';
  let level: 'safe' | 'warning' | 'danger' = 'safe';
  if (moe < 100) {
    concern = '高健康关切';
    level = 'danger';
  } else if (moe < 10000) {
    concern = '中等健康关切';
    level = 'warning';
  }
  return { moe, concern, level };
}

// ===== 剂量-效应：四参数逻辑斯蒂拟合（近似） =====
export interface FourPLResult {
  a: number; // 最小响应
  b: number; // 斜率因子
  c: number; // 最大响应
  d: number; // EC50
  ec50: number;
  equation: string;
}

// 简化：基于两点估算 EC50（实际需非线性最小二乘，此处提供近似算法）
export function fourPLFit(points: { x: number; y: number }[]): FourPLResult {
  // 按 x 排序
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const yValues = sorted.map((p) => p.y);
  const a = Math.min(...yValues);
  const c = Math.max(...yValues);
  const midY = (a + c) / 2;

  // 找 y 接近 midY 的两点，线性插值求 EC50
  let ec50 = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    if ((sorted[i].y - midY) * (sorted[i + 1].y - midY) <= 0) {
      const t = (midY - sorted[i].y) / (sorted[i + 1].y - sorted[i].y);
      ec50 = sorted[i].x + t * (sorted[i + 1].x - sorted[i].x);
      break;
    }
  }

  // 斜率因子近似
  const b = 1;

  return {
    a,
    b,
    c,
    d: ec50,
    ec50,
    equation: `y = ${a.toFixed(2)} + (${c.toFixed(2)} - ${a.toFixed(2)}) / (1 + (x/${ec50.toFixed(4)})^${b})`,
  };
}

// ===== 正交表生成 =====
export function generateOrthogonalArray(factors: number, levels: number): number[][] {
  // 常用正交表
  const tables: Record<string, number[][]> = {
    '2-3': [
      [1, 1, 1],
      [1, 2, 2],
      [2, 1, 2],
      [2, 2, 1],
    ], // L4(2^3)
    '2-7': [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 2, 2, 2, 2],
      [1, 2, 2, 1, 1, 2, 2],
      [1, 2, 2, 2, 2, 1, 1],
      [2, 1, 2, 1, 2, 1, 2],
      [2, 1, 2, 2, 1, 2, 1],
      [2, 2, 1, 1, 2, 2, 1],
      [2, 2, 1, 2, 1, 1, 2],
    ], // L8(2^7)
    '3-4': [
      [1, 1, 1, 1],
      [1, 2, 2, 2],
      [1, 3, 3, 3],
      [2, 1, 2, 3],
      [2, 2, 3, 1],
      [2, 3, 1, 2],
      [3, 1, 3, 2],
      [3, 2, 1, 3],
      [3, 3, 2, 1],
    ], // L9(3^4)
  };

  const key = `${levels}-${factors}`;
  if (tables[key]) return tables[key];

  // 默认返回 L9(3^4) 的前 factors 列
  const base = tables['3-4'];
  return base.map((row) => row.slice(0, factors));
}

export function getOrthogonalTableName(factors: number, levels: number): string {
  const size = levels === 2 ? (factors <= 3 ? 4 : 8) : 9;
  return `L${size}(${levels}^${factors})`;
}

// ===== Box-Behnken 响应面设计 =====
export function generateBBD(factors: number): number[][] {
  if (factors < 3) factors = 3;
  if (factors > 5) factors = 5;

  // 3因素BBD: 12个因子点 + 3个中心点 = 15
  const bbd3 = [
    [-1, -1, 0], [1, -1, 0], [-1, 1, 0], [1, 1, 0],
    [-1, 0, -1], [1, 0, -1], [-1, 0, 1], [1, 0, 1],
    [0, -1, -1], [0, 1, -1], [0, -1, 1], [0, 1, 1],
    [0, 0, 0], [0, 0, 0], [0, 0, 0],
  ];

  // 4因素BBD: 24个因子点 + 3个中心点 = 27
  const bbd4 = [
    [-1, -1, 0, 0], [1, -1, 0, 0], [-1, 1, 0, 0], [1, 1, 0, 0],
    [-1, 0, -1, 0], [1, 0, -1, 0], [-1, 0, 1, 0], [1, 0, 1, 0],
    [-1, 0, 0, -1], [1, 0, 0, -1], [-1, 0, 0, 1], [1, 0, 0, 1],
    [0, -1, -1, 0], [0, 1, -1, 0], [0, -1, 1, 0], [0, 1, 1, 0],
    [0, -1, 0, -1], [0, 1, 0, -1], [0, -1, 0, 1], [0, 1, 0, 1],
    [0, 0, -1, -1], [0, 0, 1, -1], [0, 0, -1, 1], [0, 0, 1, 1],
    [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0],
  ];

  // 5因素BBD: 40个因子点 + 6个中心点 = 46
  const bbd5 = [
    [-1, -1, 0, 0, 0], [1, -1, 0, 0, 0], [-1, 1, 0, 0, 0], [1, 1, 0, 0, 0],
    [-1, 0, -1, 0, 0], [1, 0, -1, 0, 0], [-1, 0, 1, 0, 0], [1, 0, 1, 0, 0],
    [-1, 0, 0, -1, 0], [1, 0, 0, -1, 0], [-1, 0, 0, 1, 0], [1, 0, 0, 1, 0],
    [-1, 0, 0, 0, -1], [1, 0, 0, 0, -1], [-1, 0, 0, 0, 1], [1, 0, 0, 0, 1],
    [0, -1, -1, 0, 0], [0, 1, -1, 0, 0], [0, -1, 1, 0, 0], [0, 1, 1, 0, 0],
    [0, -1, 0, -1, 0], [0, 1, 0, -1, 0], [0, -1, 0, 1, 0], [0, 1, 0, 1, 0],
    [0, -1, 0, 0, -1], [0, 1, 0, 0, -1], [0, -1, 0, 0, 1], [0, 1, 0, 0, 1],
    [0, 0, -1, -1, 0], [0, 0, 1, -1, 0], [0, 0, -1, 1, 0], [0, 0, 1, 1, 0],
    [0, 0, -1, 0, -1], [0, 0, 1, 0, -1], [0, 0, -1, 0, 1], [0, 0, 1, 0, 1],
    [0, 0, 0, -1, -1], [0, 0, 0, 1, -1], [0, 0, 0, -1, 1], [0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0],
  ];

  if (factors === 3) return bbd3;
  if (factors === 4) return bbd4;
  return bbd5;
}

export function getBBDName(factors: number): string {
  return `BBD (${factors}因素)`;
}

// ===== Plackett-Burman 设计 =====
export function generatePBDesign(factors: number): number[][] {
  // PB设计运行次数必须是4的倍数，且至少比因素数多1
  let runs = Math.ceil((factors + 1) / 4) * 4;
  if (runs < 8) runs = 8;
  if (runs > 20) runs = 20; // 限制范围

  // 生成Hadamard矩阵基础行
  const result: number[][] = [];

  // 8次运行的PB设计 (最多7因素)
  const pb8 = [
    [1, 1, 1, -1, 1, -1, -1],
    [-1, 1, 1, 1, -1, 1, -1],
    [-1, -1, 1, 1, 1, -1, 1],
    [1, -1, -1, 1, 1, 1, -1],
    [-1, 1, -1, -1, 1, 1, 1],
    [1, -1, 1, -1, -1, 1, 1],
    [1, 1, -1, 1, -1, -1, 1],
    [-1, -1, -1, -1, -1, -1, -1],
  ];

  // 12次运行的PB设计 (最多11因素)
  const pb12 = [
    [1, 1, -1, 1, 1, 1, -1, -1, -1, 1, -1],
    [-1, 1, 1, -1, 1, 1, 1, -1, -1, -1, 1],
    [1, -1, 1, 1, -1, 1, 1, 1, -1, -1, -1],
    [-1, 1, -1, 1, 1, -1, 1, 1, 1, -1, -1],
    [-1, -1, 1, -1, 1, 1, -1, 1, 1, 1, -1],
    [-1, -1, -1, 1, -1, 1, 1, -1, 1, 1, 1],
    [1, -1, -1, -1, 1, -1, 1, 1, -1, 1, 1],
    [1, 1, -1, -1, -1, 1, -1, 1, 1, -1, 1],
    [1, 1, 1, -1, -1, -1, 1, -1, 1, 1, -1],
    [-1, 1, 1, 1, -1, -1, -1, 1, -1, 1, 1],
    [1, -1, 1, 1, 1, -1, -1, -1, 1, -1, 1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  ];

  let baseDesign: number[][];
  if (runs <= 8) {
    baseDesign = pb8;
  } else if (runs <= 12) {
    baseDesign = pb12;
  } else {
    baseDesign = pb12; // 简化处理
  }

  // 截取所需因素数
  for (const row of baseDesign) {
    result.push(row.slice(0, factors));
  }

  return result;
}

export function getPBName(factors: number): string {
  const runs = Math.ceil((factors + 1) / 4) * 4;
  const actualRuns = runs < 8 ? 8 : runs > 20 ? 20 : runs;
  return `PB-${actualRuns} (${factors}因素)`;
}

// ===== 2^k 全因子设计 =====
export function generateFullFactorial(factors: number, levels: number = 2): number[][] {
  if (factors < 1) return [];
  if (factors > 6) factors = 6; // 限制范围避免过多

  const result: number[][] = [];
  const total = Math.pow(levels, factors);

  for (let i = 0; i < total; i++) {
    const row: number[] = [];
    let remaining = i;
    for (let f = 0; f < factors; f++) {
      row.push((remaining % levels) + 1); // 1-based水平编号
      remaining = Math.floor(remaining / levels);
    }
    result.push(row);
  }

  return result;
}

export function getFullFactorialName(factors: number, levels: number = 2): string {
  const total = Math.pow(levels, factors);
  return `${levels}^${factors} 全因子 (${total}组)`;
}
