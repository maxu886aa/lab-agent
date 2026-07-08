# 食品安全科研助手 - 需求拆解文档

## 产品概述

- **产品类型**: 科研工具类 Web 应用
- **场景类型**: <scene_type>prototype-app</scene_type>
- **目标用户**: 食品安全专业研究生及科研人员
- **核心价值**: 集文献检索、智能对话、实验数据处理、国标查询、实验设计、论文辅助于一体，提供食品科研全流程专业支持
- **界面语言**: 中文
- **主题偏好**: user_specified（默认浅色，支持深色/浅色切换）
- **导航模式**: 路径导航
- **导航布局**: Sidebar（左侧功能导航 + 对话历史列表）

---

## 页面结构总览

| 页面名称 | 文件名 | 路由 | 页面类型 | 入口来源 |
|---------|-------|------|---------|---------|
| 对话中心（首页） | `ChatPage.tsx` | `/` | 一级 | 导航 |
| 文献检索 | `LiteraturePage.tsx` | `/literature` | 一级 | 导航 |
| 文献详情 | `LiteratureDetailPage.tsx` | `/literature/:id` | 二级 | 文献检索页 → 文献卡片点击 |
| 数据处理中心 | `DataCenterPage.tsx` | `/data` | 一级 | 导航 |
| 国标查询 | `StandardPage.tsx` | `/standard` | 一级 | 导航 |
| 实验设计 | `ExperimentPage.tsx` | `/experiment` | 一级 | 导航 |
| 论文辅助 | `PaperPage.tsx` | `/paper` | 一级 | 导航 |
| 实验SOP库 | `SopPage.tsx` | `/sop` | 一级 | 导航 |

> **说明**: 共 8 个页面，其中 7 个一级页面 + 1 个二级页面（文献详情）。三大核心功能（对话中心、文献检索、数据处理）为重点实现页面。

---

## 页面布局建议

### 对话中心（首页）
- **布局模式**: 左右分栏（左侧对话列表 + 右侧聊天主区）
- **视觉重心**: 聊天主区域
- **结果承载区**: 聊天消息流（气泡形式，支持文本/表格/图片/代码块/工具调用卡片）；初始态为欢迎语 + 快捷功能卡片

### 文献检索页
- **布局模式**: 左右分栏（左侧筛选面板 + 右侧结果列表）
- **视觉重心**: 检索结果列表
- **结果承载区**: 文献卡片列表；初始态为搜索引导 + 热门关键词

### 文献详情页
- **布局模式**: 左右分栏（左侧目录/关键信息 + 右侧全文预览）
- **视觉重心**: 文献精读内容
- **结果承载区**: 关键数据提取面板 + PDF 预览区

### 数据处理中心
- **布局模式**: 三栏布局（左侧功能菜单树 + 中间数据输入区 + 右侧结果展示区）
- **视觉重心**: 计算结果与图表
- **结果承载区**: 数值结果面板 + 图表预览区；初始态为功能选择引导 + 示例数据

### 国标查询页
- **布局模式**: 上下分区（顶部搜索 + 下方结果表格）
- **视觉重心**: 标准限值表格
- **结果承载区**: 数据表格 + 中外对比切换；初始态为分类浏览 + 搜索引导

### 实验设计页
- **布局模式**: 三栏布局（左侧设计类型 + 中间参数配置 + 右侧方案预览）
- **视觉重心**: 实验方案预览
- **结果承载区**: 实验表 + 设计说明；初始态为设计类型选择

### 论文辅助页
- **布局模式**: 左右分栏（左侧功能菜单 + 右侧输入输出双栏）
- **视觉重心**: 输出结果区
- **结果承载区**: 润色/生成结果面板；初始态为功能选择 + 示例输入

### 实验SOP库
- **布局模式**: 左右分栏（左侧分类目录 + 右侧内容展示）
- **视觉重心**: SOP 内容详情
- **结果承载区**: SOP 文档阅读区；初始态为分类导航

---

## 插件规划

| 插件实例名称 | 基于官方插件 | 业务用途 | 输出模式 | 所属页面 |
|------------|-----------|---------|---------|---------|
| 智能体对话 | `ai-text-generate` | 食品安全科研对话、工具调用调度、学术问答 | stream | 对话中心 |
| 文献精读提取 | `ai-doc-parser` + `ai-text-to-json` | 上传文献 PDF，提取 LD50/NOAEL/ADI/实验参数等量化数据及摘要结论 | unary | 文献详情页 |
| 论文润色 | `ai-text-generate` | 优化学术表达、修正专业术语错误 | stream | 论文辅助页 |
| 讨论分析生成 | `ai-text-generate` | 结合实验数据、文献、国标生成讨论章节框架 | stream | 论文辅助页 |
| 审稿意见回复 | `ai-text-generate` | 根据审稿意见生成专业回复框架 | stream | 论文辅助页 |
| 文献搜索总结 | `ai-search-summary` | 基于关键词检索并总结食品安全相关文献 | stream | 文献检索页 / 对话中心 |

> **说明**: 文献精读提取为链式调用（`ai-doc-parser` 解析文档 → `ai-text-to-json` 结构化提取量化指标）。

---

## 导航配置

- **导航布局**: Sidebar（左侧固定侧边栏）
- **导航结构**: 上半部分为功能模块导航，下半部分为对话历史列表（仅对话中心页展示对话历史，其他页展示功能导航）
- **导航项**（仅一级页面）:

| 导航文字 | 路由 | 图标 |
|---------|------|------|
| 对话中心 | `/` | MessageSquare |
| 文献检索 | `/literature` | BookOpen |
| 数据处理 | `/data` | Calculator |
| 国标查询 | `/standard` | FileText |
| 实验设计 | `/experiment` | FlaskConical |
| 论文辅助 | `/paper` | PenTool |
| 实验SOP | `/sop` | BookMarked |

---

## 数据来源声明

| 数据/操作 | 来源类型 | 实现要求 | mock 兜底 |
|---|---|---|---|
| 智能体对话 | `real-plugin` | capabilityClient.callStream 调 ai-text-generate 实例，传入用户消息 + 上下文历史 + 食品安全系统提示词，流式输出回复 | 失败提示 (toast "智能体暂不可用") |
| 文献检索结果 | `demo-mock` | src/data/literature.ts 模拟知网文献元数据（标题/作者/期刊/摘要/被引等） | ✅ 本身就是 mock，内置 20+ 条食品安全领域示例文献 |
| 文献PDF上传解析 | `real-plugin` | capabilityClient 调 ai-doc-parser 实例，传入用户上传的文献 PDF，提取文本后再调 ai-text-to-json 实例结构化提取 LD50/NOAEL/ADI 等量化数据 | 无 (插件能力不可 mock) |
| 文献收藏与分类 | `local-persist` | localStorage key=__app_fsra_literature_favorites | 无 |
| 对话历史 | `local-persist` | localStorage key=__app_fsra_chat_history | 无 |
| 实验数据计算 | `demo-mock` | 前端纯函数实现所有计算公式（回收率/精密度/LOD/LOQ/基质效应/标准曲线/t检验/ANOVA/PCA/生长曲线/风险评估等） | ✅ 计算逻辑真实实现，非 mock 数据 |
| 数据文件导入 | `real-file` | File API 读取 Excel/CSV，解析后 setState | 初始示例数据 source='mock' |
| 分析结果导出 | `import-export` | Blob + a.click 触发 Excel/PDF/PNG/SVG 下载 | 无 |
| 国标数据 | `demo-mock` | src/data/standards.ts 内置 GB2762/GB2760/GB4789 常见限值示例数据 | ✅ 本身就是 mock，内置常见污染物/添加剂/微生物限量 |
| 国标收藏 | `local-persist` | localStorage key=__app_fsra_standard_favorites | 无 |
| 实验设计生成 | `demo-mock` | 前端算法实现正交表/响应面/PB/全因子设计生成逻辑 | ✅ 算法真实实现，非静态 mock |
| 论文润色/生成 | `real-plugin` | capabilityClient.callStream 调 ai-text-generate 实例，传入用户输入文本 + 对应场景提示词，流式输出结果 | 失败提示 (toast "服务暂不可用") |
| SOP 库内容 | `demo-mock` | src/data/sops.ts 内置常用检测方法/前处理/仪器操作 SOP 文档 | ✅ 本身就是 mock |
| 主题偏好 | `local-persist` | localStorage key=__app_fsra_theme | 默认浅色 |

> **说明**: 数据处理中心的所有计算功能（基础计算、统计分析、微生物、风险评估）均为前端真实算法实现，不属于 mock 数据范畴。

---

## 功能列表

### 页面: 对话中心（首页）
- **页面目标**: 提供对话式智能科研助手入口，支持多轮对话与工具调用
- **功能点**:
  - **多轮对话交互**: 左侧对话列表（新建/切换/删除对话），右侧气泡式聊天区，支持上下文记忆
  - **快捷指令卡片**: 输入框上方展示文献检索、数据处理、国标查询、实验设计、论文润色 5 个快捷入口，点击快速发起对应任务
  - **工具调用展示**: 智能体调用工具时展示调用过程卡片（加载态 → 结果卡片嵌入对话），支持文献检索结果、计算结果、国标查询结果等富文本卡片
  - **附件上传**: 支持上传文献 PDF、数据文件等作为对话上下文
  - **对话历史管理**: 新建对话、重命名、删除、搜索历史对话，数据本地存储

### 页面: 文献检索
- **页面目标**: 检索并管理食品安全领域文献
- **功能点**:
  - **文献搜索**: 关键词/作者/期刊多维度搜索，支持高级筛选（时间范围、期刊、文献类型）
  - **结果展示与筛选**: 卡片式展示文献元数据，左侧筛选面板（时间、期刊、被引、类型），支持排序
  - **文献收藏与分类**: 收藏文献、添加分类标签、管理收藏夹
  - **参考文献生成**: 勾选文献一键生成 GB/T 7714 或 BibTeX 格式引用，支持复制

### 页面: 文献详情
- **页面目标**: 精读文献并自动提取关键科研数据
- **功能点**:
  - **文献上传/链接解析**: 上传 PDF 或输入文献链接，触发智能解析
  - **关键数据自动提取**: 提取 LD50、NOAEL、ADI、检出限、回收率、实验参数等量化指标，结构化展示
  - **文献摘要生成**: 自动生成研究方法、核心结论、创新点摘要
  - **PDF 预览**: 右侧全文预览区，支持页码跳转、缩放

### 页面: 数据处理中心
- **页面目标**: 提供食品安全实验全场景数据计算与可视化
- **功能点**:
  - **基础数据计算**: 加标回收率、精密度、LOD/LOQ、基质效应、标准曲线拟合，输入数据实时计算
  - **统计分析**: 描述性统计、t检验、单因素ANOVA + 多重比较、Pearson/Spearman 相关性、PCA 主成分分析、剂量-效应拟合（IC50/EC50）
  - **微生物数据处理**: 菌落计数换算、抑菌圈测量统计、生长曲线拟合（Baranyi-Roberts/Gompertz）
  - **风险评估计算**: EDI 膳食暴露量、风险商 HQ、暴露边界 MOE、四步法风险评估报告生成
  - **数据可视化**: 柱状图（误差棒+显著性标记）、折线图、散点图（PCA）、热力图、饼图/环形图，支持导出 PNG/SVG
  - **数据导入导出**: Excel/CSV 上传、手动表格输入、结果导出 Excel/PDF 报告

### 页面: 国标查询
- **页面目标**: 快速查询食品安全国家标准与中外对比
- **功能点**:
  - **分类浏览与搜索**: 污染物（GB2762）、添加剂（GB2760）、微生物（GB4789）、检测方法 四大分类，关键词搜索
  - **限值表格展示**: 表格形式展示限值、食品类别、标准号，斑马纹、悬停高亮、排序筛选
  - **中外标准对比**: 切换对比模式，GB vs EC vs FDA vs Codex 多列并排横向对比
  - **标准收藏**: 收藏常用标准条目，快速访问

### 页面: 实验设计
- **页面目标**: 辅助生成各类实验设计方案
- **功能点**:
  - **正交试验设计**: 选择因素数/水平数，自动生成 L4/L8/L9/L16/L25 正交表
  - **响应面设计**: Box-Behnken、Central Composite 设计，自动生成实验组
  - **Plackett-Burman 筛选设计**: 多因素筛选实验自动生成
  - **全因子实验设计**: 2^k 全因子与部分因子设计
  - **方案预览与导出**: 实验表实时预览 + 设计说明，支持导出 Word 报告

### 页面: 论文辅助
- **页面目标**: 提供论文写作全流程辅助工具
- **功能点**:
  - **论文润色**: 输入段落，优化学术表达、修正专业术语，流式输出润色结果
  - **讨论分析生成**: 结合实验数据要点 + 文献结论 + 国标依据，生成讨论章节框架
  - **参考文献格式化**: 批量输入文献信息，自动排版 GB/T 7714-2015 格式
  - **审稿意见回复**: 输入审稿意见，生成专业回复框架与要点
  - **专业术语库**: 食品毒理/检测技术/风险评估术语中英对照查询

### 页面: 实验SOP库
- **页面目标**: 查阅常用实验方法与仪器操作 SOP
- **功能点**:
  - **分类浏览**: 检测方法、前处理方法、仪器操作、微生物实验 四大分类
  - **SOP 详情阅读**: 步骤化展示实验流程、试剂配制、注意事项
  - **搜索与收藏**: 关键词搜索 SOP，收藏常用方法

---

## 数据共享配置

| 存储键名 | 数据说明 | 使用页面 |
|---------|---------|---------|
| `__global_fsra_chat_history` | 对话历史列表，类型 `IChatSession[]` | 对话中心 |
| `__global_fsra_literature_favorites` | 收藏的文献列表，类型 `ILiterature[]` | 文献检索页、文献详情页 |
| `__global_fsra_standard_favorites` | 收藏的国标条目，类型 `IStandard[]` | 国标查询页 |
| `__global_fsra_theme` | 主题偏好，类型 `'light' \| 'dark'` | 全部页面 |
| `__global_fsra_sop_favorites` | 收藏的 SOP，类型 `ISop[]` | SOP库页 |

```ts
// 对话消息
interface IChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: IToolCall[];
  timestamp: number;
}

// 对话会话
interface IChatSession {
  id: string;
  title: string;
  messages: IChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// 工具调用
interface IToolCall {
  id: string;
  name: 'literature_search' | 'data_calculation' | 'standard_query' | 'experiment_design' | 'paper_polish';
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: Record<string, any>;
  output?: Record<string, any>;
}

// 文献
interface ILiterature {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  volume?: string;
  pages?: string;
  abstract: string;
  keywords: string[];
  citedCount: number;
  downloadCount: number;
  type: 'journal' | 'master' | 'phd' | 'conference';
  doi?: string;
  url?: string;
  source: 'mock' | 'user';
}

// 国标条目
interface IStandard {
  id: string;
  category: 'pollutant' | 'additive' | 'microbe' | 'method';
  name: string;
  standardNo: string;
  foodCategory: string;
  limit: string;
  unit: string;
  gbValue?: number;
  euValue?: number;
  fdaValue?: number;
  codexValue?: number;
  source: 'mock' | 'user';
}

// SOP
interface ISop {
  id: string;
  category: 'detection' | 'pretreatment' | 'instrument' | 'microbe';
  title: string;
  overview: string;
  reagents: string[];
  instruments: string[];
  steps: string[];
  notes: string[];
  source: 'mock';
}

-------

<scene_type>prototype-app</scene_type>

# UI 设计指南

## 1. 设计推导依据

- **参考意图**: Free Direction —— 无参考图，按产品语义与用户需求自主建立设计方向
- **核心情绪 / 应用类型**: 面向食品安全研究生的科研工作台，情绪关键词：严谨、精准、可信赖、学术化
- **独特记忆点**: 以"实验记录纸 + 培养皿刻度"为视觉母题，工具调用结果以"实验报告卡片"形式嵌入对话，强化食品科研场景感

## 2. Art Direction

- **方向名**: 学术科研工作台
- **Design Style**: Swiss Minimalist 瑞士极简 + Editorial 学术排版 —— 高密度信息、清晰网格、克制色彩，符合科研人员阅读习惯
- **DNA 参数**: 圆角 subtle（rounded-md）/ 阴影 subtle（shadow-sm）/ 间距 standard（gap-4 / p-6）/ 字体方向 无衬线清晰易读 / 装饰手法 细线分隔、数据刻度线、微点阵背景
- **应用类型**: Tool + Workflow —— 左右分栏、多面板并行、工具驱动

## 3. Color System

**色彩关系**: 深蓝主色 + 科技蓝辅助 + 安全绿状态色 + 冷白科研背景，整体低饱和高对比
**配色设计理由**: 深蓝传递学术权威与可信度，科技蓝用于交互反馈与数据高亮，绿色表达食品安全与合格状态；冷白底降低长时间科研阅读疲劳
**主色推导**: 从用户指定的深蓝 #1e40af 出发，向明度两端衍生深浅层级；辅助色取同色系科技蓝与低饱和安全绿，保持科研专业感
**使用比例**: 65% 中性 / 25% 辅助蓝绿 / 10% primary；primary 仅用于主按钮、激活态、品牌锚点；accent 承担 hover、选中、图表系列

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|---|---|---|---|---|
| bg | `--background` | `bg-background` | hsl(210 40% 98%) | 冷调浅灰白，模拟实验记录纸底色 |
| card | `--card` | `bg-card` | hsl(0 0% 100%) | 纯白卡片，承载表单、结果、对话气泡 |
| text | `--foreground` | `text-foreground` | hsl(222 47% 11%) | 深蓝黑正文，高对比适合长文阅读 |
| textMuted | `--muted-foreground` | `text-muted-foreground` | hsl(215 16% 47%) | 次级说明、元数据、占位符 |
| primary | `--primary` | `bg-primary` / `text-primary` | hsl(221 83% 33%) | 深蓝主色，主交互与品牌识别 |
| primaryForeground | `--primary-foreground` | `text-primary-foreground` | hsl(0 0% 100%) | 主色上的纯白文字 |
| accent | `--accent` | `bg-accent` | hsl(210 40% 96%) | 极浅蓝灰，hover/选中浅底 |
| accentForeground | `--accent-foreground` | `text-accent-foreground` | hsl(221 83% 33%) | accent 上的主色文字 |
| border | `--border` | `border-border` | hsl(214 32% 91%) | 浅灰蓝边界，卡片与主色同色系 |

**语义色提示**:
- 成功/安全（合格）：hsl(142 76% 36%) —— bg: hsl(142 76% 96%) / border: hsl(142 76% 80%) / text: hsl(142 76% 30%)；用于风险商<1、实验合格、数据正常
- 警告/风险关注：hsl(38 92% 50%) —— bg: hsl(38 92% 96%) / border: hsl(38 92% 80%) / text: hsl(38 92% 40%)；用于风险商接近限值、数据异常
- 错误/超标：hsl(0 84% 60%) —— bg: hsl(0 84% 96%) / border: hsl(0 84% 80%) / text: hsl(0 84% 45%)；用于风险商>1、计算错误
- 图表系列色：primary 蓝、teal 青、emerald 绿、amber 琥珀、rose 玫红、violet 紫；饱和度均控制在 50-70%，明度 45-55%，符合 SCI 期刊配色规范

## 4. 字体与节奏

- **font-display**: Noto Sans SC —— 中文科研界面首选，笔画清晰，粗细层级丰富，标题加粗有学术感
- **font-body**: Noto Sans SC —— 正文清晰易读，长时间文献与数据阅读不疲劳
- **字号**: H1 text-2xl；H2 text-xl；H3 text-lg；body text-sm ~ text-base；muted text-xs ~ text-sm。科研工具偏紧凑密度
- **圆角**: 中（rounded-md）—— 卡片与按钮统一 6px 圆角，表格与输入框 4px，平衡专业感与现代感

## 5. 全局布局契约

- **Reference Layout Use**: 按需求结构推导，严格遵循需求文档的 6 大页面与左右分栏结构
- **Page / Section Order**: 对话中心 → 文献检索 → 数据处理 → 国标查询 → 实验设计 → 论文辅助，与需求 1:1 对齐
- **Standard Content Zone**: 后台 max-w-[1400px] + `mx-auto`；数据处理页三栏布局需更宽
- **Shell / Frame Alignment**: 左侧固定导航 + 内容区独立滚动，左右分栏页面左右面板可独立滚动
- **Padding & Rhythm**: `px-4 md:px-6 py-6`，垂直间距以 4px 为基础单位，组件内 8/12/16px 三级
- **Full-bleed Zones**: 无全宽 Hero；所有内容受导航框架约束
- **Local Narrowing**: 论文辅助页输入输出区可收窄至 max-w-3xl；对话气泡最大宽度 720px 居中
- **Overflow Strategy**: 数据表格、国标对比表、实验设计矩阵使用 `overflow-x-auto`；图表容器固定高度内部滚动
- **Flexibility Boundary**: 允许移动端折叠左侧导航、调整卡片列数；不允许改变主色、圆角、阴影、字号系统

## 6. 视觉与动效

- **装饰**: 细线刻度分隔、微点阵底纹（对话区背景）、实验报告式卡片头（顶部细色条标识工具类型）
- **阴影/边界**: 轻 —— 卡片 shadow-sm + 1px border，hover 时阴影加深 + border 色变深
- **动效**: 克制 —— 150ms ease 过渡用于 hover、active、展开收起；工具调用有进度条动画；无入场动画

## 7. 组件原则

- 按钮、输入、表格、卡片必须有 Default / Hover / Active / Focus-visible / Disabled 五态
- Primary 按钮用于发送、计算、生成等主行动；Outline 按钮用于次要操作；Ghost 用于导航与工具菜单
- 对话气泡：用户消息右对齐浅蓝底，AI 消息左对齐白底带工具调用卡片
- 数据表格：斑马纹（accent 色）、悬停高亮、列排序箭头、筛选图标
- 工具调用卡片：顶部彩色条标识类型（文献=蓝、数据=青、国标=绿、实验=琥珀），含工具名 + 状态徽章 + 结果摘要

## 8. Image Direction

- **Image Role**: 品牌 logo、空状态插画、功能图标系统
- **Image Art Direction**: 极简线性图标风格，融入培养皿、试管、色谱峰、分子结构等食品科研元素；空状态插画采用细线 + 低饱和色块填充，白底为主，蓝绿主色点缀；构图简洁居中，留大量呼吸空间
- **Image Prompt Keywords**: 食品科研图标、培养皿俯视图、色谱峰曲线、分子结构线稿、极简线性风格、蓝绿配色、白底、学术插图、科研仪器线描、干净简洁
- **Image Avoidance**: 避免卡通3D插画、商务人物握手图、炫光科技蓝渐变、廉价素材图库感、过度拟人化形象、高饱和撞色

## 9. Anti-patterns

- **Split personality**: 各功能页各自为政，对话页一套风格数据页另一套；全站统一卡片、边框、间距、色板
- **Chat bubble overload**: 对话里塞满大段文字无结构；工具结果必须用结构化卡片、表格、图表呈现
- **Default SaaS drift**: 回到通用蓝紫渐变、玻璃拟态、大圆角卡片；坚持学术科研的克制与秩序
- **Invisible interaction**: 只做 hover 不做 focus-visible；所有输入、按钮、表格行都要有键盘焦点环
- **Mono-hue tyranny**: 主色铺满按钮、tab、图标、边框、链接；primary 只留给出 CTA 与品牌，其余交 accent / 中性色
- **Chart carnival**: 图表配色花哨不符合学术规范；图表必须坐标轴标注清晰、配色低饱和、导出可直接用于论文
- **Status color scream**: 成功警告错误色饱和度过高刺眼；语义色饱和度与 primary 对齐 ±15%