// EXPORTS: IStandard, MOCK_STANDARDS
export interface IStandard {
  id: string
  category: 'pollutant' | 'additive' | 'microbe' | 'method'
  name: string
  standardNo: string
  foodCategory: string
  limit: string
  unit: string
  gbValue?: number
  euValue?: number
  fdaValue?: number
  codexValue?: number
  source: 'mock' | 'user'
}

export const MOCK_STANDARDS: IStandard[] = [
  {
    id: '1',
    category: 'pollutant',
    name: '铅（Pb）',
    standardNo: 'GB 2762-2022',
    foodCategory: '谷物及其制品',
    limit: '≤0.2',
    unit: 'mg/kg',
    gbValue: 0.2,
    euValue: 0.2,
    fdaValue: 0.1,
    codexValue: 0.2,
    source: 'mock'
  },
  {
    id: '2',
    category: 'pollutant',
    name: '镉（Cd）',
    standardNo: 'GB 2762-2022',
    foodCategory: '大米',
    limit: '≤0.2',
    unit: 'mg/kg',
    gbValue: 0.2,
    euValue: 0.2,
    fdaValue: 0.1,
    codexValue: 0.4,
    source: 'mock'
  },
  {
    id: '3',
    category: 'additive',
    name: '苯甲酸',
    standardNo: 'GB 2760-2014',
    foodCategory: '碳酸饮料',
    limit: '≤0.2',
    unit: 'g/kg',
    gbValue: 0.2,
    euValue: 0.15,
    fdaValue: 0.1,
    codexValue: 0.25,
    source: 'mock'
  },
  {
    id: '4',
    category: 'additive',
    name: '山梨酸钾',
    standardNo: 'GB 2760-2014',
    foodCategory: '糕点',
    limit: '≤1.0',
    unit: 'g/kg',
    gbValue: 1.0,
    euValue: 1.0,
    fdaValue: 0.5,
    codexValue: 1.0,
    source: 'mock'
  },
  {
    id: '5',
    category: 'microbe',
    name: '菌落总数',
    standardNo: 'GB 4789.2-2022',
    foodCategory: '巴氏杀菌乳',
    limit: '≤30000',
    unit: 'CFU/mL',
    gbValue: 30000,
    euValue: 50000,
    fdaValue: 20000,
    codexValue: 50000,
    source: 'mock'
  },
  {
    id: '6',
    category: 'microbe',
    name: '大肠菌群',
    standardNo: 'GB 4789.3-2022',
    foodCategory: '熟肉制品',
    limit: '≤100',
    unit: 'CFU/g',
    gbValue: 100,
    euValue: 100,
    fdaValue: 50,
    codexValue: 100,
    source: 'mock'
  },
  {
    id: '7',
    category: 'pollutant',
    name: '黄曲霉毒素B1',
    standardNo: 'GB 2761-2017',
    foodCategory: '花生及其制品',
    limit: '≤20',
    unit: 'μg/kg',
    gbValue: 20,
    euValue: 2,
    fdaValue: 15,
    codexValue: 15,
    source: 'mock'
  },
  {
    id: '8',
    category: 'method',
    name: '食品中铅的测定',
    standardNo: 'GB 5009.12-2017',
    foodCategory: '通用方法',
    limit: '石墨炉原子吸收光谱法',
    unit: '',
    source: 'mock'
  }
]