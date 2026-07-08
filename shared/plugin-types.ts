// ---- plugin:food_safety_literature_search_summary_1 ----
// ============================================================
// 插件 food_safety_literature_search_summary_1 (食品安全学术文献搜索总结) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface FoodSafetyLiteratureSearchSummaryOneInput {
  /** 食品安全相关的搜索关键词，例如：食品添加剂安全性、微生物污染防控等 */
  search_keywords: string;
}

/**
 * capabilityClient.load('food_safety_literature_search_summary_1').call<FoodSafetyLiteratureSearchSummaryOneOutput>('searchSummary', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { summary } = result;
 */
export interface FoodSafetyLiteratureSearchSummaryOneOutput {
  /** [object Object] */
  summary: string;
}
// ---- end:food_safety_literature_search_summary_1 ----

// ---- plugin:food_safety_research_assistant_1 ----
// ============================================================
// 插件 food_safety_research_assistant_1 (食品安全科研助手智能体) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface FoodSafetyResearchAssistantOneInput {
  /** 用户提出的食品安全相关科研问题或需求 */
  user_question: string;
  /** 补充上下文信息，如研究背景、数据参数、具体场景等（可选） */
  additional_context?: string;
}

/**
 * capabilityClient.load('food_safety_research_assistant_1').call<FoodSafetyResearchAssistantOneOutput>('textGenerate', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { content, response } = result;
 */
export interface FoodSafetyResearchAssistantOneOutput {
  /** [object Object] */
  content: string;
  /** [object Object] */
  response?: string;
}
// ---- end:food_safety_research_assistant_1 ----

// ---- plugin:academic_writing_assistant_1 ----
// ============================================================
// 插件 academic_writing_assistant_1 (学术论文写作助手) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface AcademicWritingAssistantOneInput {
  /** 使用场景：可选值为'paper_polishing'(论文润色)、'chapter_generation'(章节生成)、'review_response'(审稿意见回复) */
  scenario: string;
  /** 输入内容：润色场景为原始论文文本，章节生成场景为章节要求/大纲，审稿回复场景为审稿意见 */
  input_content: string;
  /** 额外要求：可选，自定义的特殊要求，如特定学科规范、字数限制等 */
  additional_requirements?: string;
}

/**
 * capabilityClient.load('academic_writing_assistant_1').call<AcademicWritingAssistantOneOutput>('textGenerate', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { content, response } = result;
 */
export interface AcademicWritingAssistantOneOutput {
  /** [object Object] */
  content: string;
  /** [object Object] */
  response?: string;
}
// ---- end:academic_writing_assistant_1 ----