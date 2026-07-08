// EXPORTS: ILiterature, MOCK_LITERATURES
export interface ILiterature {
  id: string
  title: string
  authors: string[]
  journal: string
  year: number
  volume?: string
  pages?: string
  abstract: string
  keywords: string[]
  citedCount: number
  downloadCount: number
  type: 'journal' | 'master' | 'phd' | 'conference'
  doi?: string
  url?: string
  source: 'mock' | 'user'
}

export const MOCK_LITERATURES: ILiterature[] = [
  {
    id: '1',
    title: '高效液相色谱-串联质谱法测定食品中16种真菌毒素残留',
    authors: ['张晓明', '李丽华', '王建国'],
    journal: '食品科学',
    year: 2023,
    volume: '44(12)',
    pages: '234-241',
    abstract: '建立了QuEChERS结合HPLC-MS/MS同时测定谷物、坚果等食品中16种真菌毒素的分析方法，回收率82.3%~108.5%，RSD<10%，检出限0.05~0.5 μg/kg。',
    keywords: ['真菌毒素', 'HPLC-MS/MS', 'QuEChERS', '食品检测'],
    citedCount: 128,
    downloadCount: 3562,
    type: 'journal',
    doi: '10.7506/spkx1002-6630-20220915-180',
    source: 'mock'
  },
  {
    id: '2',
    title: '膳食暴露评估模型在食品安全风险评估中的应用进展',
    authors: ['陈雨婷', '刘志强'],
    journal: '中国食品学报',
    year: 2024,
    volume: '24(3)',
    pages: '412-425',
    abstract: '综述了确定性模型与概率模型在膳食暴露评估中的应用，比较了点估计法、简单分布法、蒙特卡洛模拟的优缺点，结合案例分析了MOE法在遗传毒性物质评估中的应用。',
    keywords: ['膳食暴露', '风险评估', '蒙特卡洛模拟', 'MOE'],
    citedCount: 89,
    downloadCount: 2145,
    type: 'journal',
    doi: '10.16429/j.1009-7848.2024.03.045',
    source: 'mock'
  },
  {
    id: '3',
    title: '植物乳杆菌对赭曲霉毒素A的解毒作用及机制研究',
    authors: ['王子轩'],
    journal: '江南大学',
    year: 2023,
    abstract: '从传统发酵食品中筛选获得一株高效降解OTA的植物乳杆菌，降解率达87.2%，通过全基因组测序与酶学实验揭示了其解毒机制为羧肽酶催化OTA水解为OTα。',
    keywords: ['植物乳杆菌', '赭曲霉毒素A', '生物解毒', '羧肽酶'],
    citedCount: 45,
    downloadCount: 1876,
    type: 'phd',
    source: 'mock'
  },
  {
    id: '4',
    title: 'GC-MS/MS测定植物油中16种多环芳烃的方法优化',
    authors: ['赵雅琴', '孙伟', '周晓燕'],
    journal: '分析试验室',
    year: 2023,
    volume: '42(8)',
    pages: '912-917',
    abstract: '优化了凝胶渗透色谱净化结合GC-MS/MS测定植物油中16种PAHs的方法，LOD为0.03~0.15 μg/kg，回收率75.6%~96.8%，适用于植物油中PAHs的日常检测。',
    keywords: ['多环芳烃', 'GC-MS/MS', '凝胶渗透色谱', '植物油'],
    citedCount: 67,
    downloadCount: 1543,
    type: 'journal',
    doi: '10.13595/j.cnki.issn1000-0720.2023.08.012',
    source: 'mock'
  },
  {
    id: '5',
    title: '响应面法优化超声辅助提取紫薯花青素工艺研究',
    authors: ['黄丽丽', '马晓东'],
    journal: '食品工业科技',
    year: 2022,
    volume: '43(20)',
    pages: '189-196',
    abstract: '采用Box-Behnken响应面设计优化紫薯花青素超声辅助提取工艺，最佳条件下提取率达2.85 mg/g，DPPH自由基清除率为89.3%，具有良好的抗氧化活性。',
    keywords: ['紫薯', '花青素', '响应面法', '超声提取'],
    citedCount: 156,
    downloadCount: 4231,
    type: 'journal',
    doi: '10.13386/j.issn1002-0306.2022.20.028',
    source: 'mock'
  },
  {
    id: '6',
    title: '单增李斯特菌在即食食品中的生长预测模型构建',
    authors: ['吴佳怡', '陈向前'],
    journal: '微生物学报',
    year: 2024,
    volume: '64(5)',
    pages: '1678-1692',
    abstract: '建立了单增李斯特菌在4~37℃下的生长曲线，采用Baranyi-Roberts模型拟合得到最大比生长速率和迟滞期，构建了温度依赖的二级预测模型，偏差因子和准确因子均在可接受范围内。',
    keywords: ['单增李斯特菌', '生长预测', 'Baranyi-Roberts模型', '即食食品'],
    citedCount: 72,
    downloadCount: 1987,
    type: 'journal',
    doi: '10.13343/j.cnki.wsxb.20230567',
    source: 'mock'
  },
  {
    id: '7',
    title: '我国居民膳食中重金属镉的暴露评估及健康风险',
    authors: ['郑海涛', '林芳', '高志远'],
    journal: '卫生研究',
    year: 2023,
    volume: '52(6)',
    pages: '945-951',
    abstract: '基于第六次总膳食研究数据，采用概率评估法计算我国居民膳食镉暴露量，P95为0.28 μg/kg bw/d，低于JECFA暂定每月耐受摄入量，大米和蔬菜是主要贡献来源。',
    keywords: ['镉', '膳食暴露', '风险评估', '总膳食研究'],
    citedCount: 201,
    downloadCount: 5632,
    type: 'journal',
    doi: '10.19813/j.cnki.weishengyanjiu.2023.06.012',
    source: 'mock'
  },
  {
    id: '8',
    title: '基于近红外光谱的奶粉蛋白质快速检测方法研究',
    authors: ['周明杰'],
    journal: '中国农业大学',
    year: 2022,
    abstract: '建立了近红外漫反射光谱结合偏最小二乘法快速测定奶粉中蛋白质含量的方法，相关系数达0.987，RMSEP为0.12%，可用于奶粉蛋白质的现场快速筛查。',
    keywords: ['近红外光谱', '奶粉', '蛋白质', '偏最小二乘'],
    citedCount: 34,
    downloadCount: 1256,
    type: 'master',
    source: 'mock'
  },
  {
    id: '9',
    title: '金黄色葡萄球菌生物被膜形成机制及控制策略',
    authors: ['杨帆', '赵立平', '陈秀兰'],
    journal: '食品与发酵工业',
    year: 2024,
    volume: '50(2)',
    pages: '298-306',
    abstract: '综述了金黄色葡萄球菌生物被膜的形成过程、调控机制及检测方法，重点讨论了植物源天然产物、噬菌体、益生菌等新型控制策略的研究进展与应用前景。',
    keywords: ['金黄色葡萄球菌', '生物被膜', '群体感应', '天然产物'],
    citedCount: 112,
    downloadCount: 2876,
    type: 'journal',
    doi: '10.13995/j.cnki.11-1802/ts.034567',
    source: 'mock'
  },
  {
    id: '10',
    title: '超高效液相色谱-四极杆-静电场轨道阱高分辨质谱筛查食品中非法添加物',
    authors: ['钱伟', '孙丽娜', '吴鹏'],
    journal: '色谱',
    year: 2023,
    volume: '41(11)',
    pages: '1123-1132',
    abstract: '建立了UPLC-Q-Orbitrap HRMS同时筛查食品中200余种非法添加物的分析方法，质量偏差<5 ppm，回收率65.2%~118.7%，适用于减肥类、降糖类保健食品的非法添加筛查。',
    keywords: ['高分辨质谱', '非法添加物', '筛查', '保健食品'],
    citedCount: 95,
    downloadCount: 2341,
    type: 'journal',
    doi: '10.3724/SP.J.1123.2023.04023',
    source: 'mock'
  },
  {
    id: '11',
    title: '益生菌缓解食物过敏的作用机制研究进展',
    authors: ['韩雪', '刘宁'],
    journal: '中国乳品工业',
    year: 2024,
    volume: '52(1)',
    pages: '45-51',
    abstract: '从肠道屏障调节、免疫平衡调控、肠道菌群干预三个方面综述了益生菌缓解食物过敏的作用机制，介绍了鼠李糖乳杆菌、双歧杆菌等代表性菌株的临床研究进展。',
    keywords: ['益生菌', '食物过敏', '肠道菌群', '免疫调节'],
    citedCount: 78,
    downloadCount: 1765,
    type: 'journal',
    doi: '10.19827/j.issn1001-2230.2024.01.009',
    source: 'mock'
  },
  {
    id: '12',
    title: '微波消解-ICP-MS测定水产品中12种重金属元素',
    authors: ['马文龙', '徐静', '黄志强'],
    journal: '分析测试学报',
    year: 2022,
    volume: '41(9)',
    pages: '1287-1293',
    abstract: '采用HNO3-H2O2体系微波消解样品，ICP-MS同时测定水产品中铅、镉、汞、砷等12种重金属元素，方法检出限0.003~0.05 mg/kg，加标回收率82.5%~105.6%。',
    keywords: ['ICP-MS', '微波消解', '重金属', '水产品'],
    citedCount: 143,
    downloadCount: 3876,
    type: 'journal',
    doi: '10.3969/j.issn.1004-4957.2022.09.009',
    source: 'mock'
  }
]