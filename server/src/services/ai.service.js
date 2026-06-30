const axios = require('axios');
const config = require('../config');

class AiService {
  constructor() {
    this.apiKey = config.deepseek.apiKey;
    this.apiUrl = config.deepseek.apiUrl;
    this.model = config.deepseek.model;
  }

  async callDeepSeek(messages, options = {}) {
    const { temperature = 0.7, maxTokens = 4096, jsonMode = false } = options;
    try {
      const body = {
        model: this.model,
        messages,
        temperature,
        max_tokens: maxTokens
      };
      if (jsonMode) {
        body.response_format = { type: 'json_object' };
      }
      const response = await axios.post(this.apiUrl, body, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('[AI Service] API call failed:', error.message);
      if (error.response) {
        console.error('[AI Service] Response:', JSON.stringify(error.response.data));
      }
      throw new Error(`AI服务调用失败: ${error.message}`);
    }
  }

  async generateQuestions(position, difficulty, count = 5, previousQuestions = []) {
    try {
      const systemPrompt = `你是一位专业的${position}面试官。请根据以下要求生成面试题目。
返回格式必须是严格的JSON数组，每个元素包含：
- title: 题目标题
- content: 题目详细内容
- type: 题目类型(basic/scenario/project/open/behavioral/hr)
- referenceAnswer: 参考答案要点
- tags: 相关标签(逗号分隔)
- score: 建议分值(5-25)

要求：
1. 题目难度为${difficulty}（junior=初级, mid=中级, senior=高级）
2. 生成${count}道不同类型的题目
3. 题目要有深度和区分度
4. 结合${position}岗位的实际工作要求`;

      const previousHint = previousQuestions.length > 0
        ? `\n注意：以下题目已使用过，请避免重复：\n${previousQuestions.join('\n')}`
        : '';

      const messages = [
        { role: 'system', content: systemPrompt + previousHint },
        { role: 'user', content: `请为${position}岗位生成${count}道${difficulty}难度的面试题。` }
      ];

      const response = await this.callDeepSeek(messages, { temperature: 0.8, jsonMode: true, maxTokens: 4096 });
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('[AI Service] generateQuestions failed, using defaults:', e.message);
      return this.getDefaultQuestions(position, difficulty, count);
    }
  }

  async generateFollowUp(question, userAnswer, position) {
    const messages = [
      {
        role: 'system',
        content: `你是一位资深的${position}面试官。根据候选人的回答，提出一个深入的追问。追问要能考察更深层次的理解和技术深度。返回JSON格式：{"question": "追问内容", "type": "题目类型"}`
      },
      {
        role: 'user',
        content: `原问题：${question}\n候选人回答：${userAnswer}\n\n请提出一个深入的追问。`
      }
    ];
    const response = await this.callDeepSeek(messages, { temperature: 0.7, jsonMode: true });
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      return { question: '能否请你详细展开说明一下？', type: 'open' };
    }
  }

  async scoreAnswer(question, userAnswer, position) {
    const messages = [
      {
        role: 'system',
        content: `你是一位专业的${position}面试评分官。请对候选人的回答进行评分和点评。
返回JSON格式：
{
  "score": 数字(0-100),
  "comment": "整体点评",
  "professionalScore": 数字(专业度0-100),
  "expressionScore": 数字(表达0-100),
  "logicScore": 数字(逻辑0-100),
  "understandingScore": 数字(理解0-100),
  "strengths": ["优点1", "优点2"],
  "weaknesses": ["不足1", "不足2"]
}

评分标准：
- 专业度(40%): 技术准确性、深度
- 表达(20%): 语言组织、流畅度
- 逻辑(20%): 思路清晰度、条理性
- 理解(20%): 是否准确理解问题`
      },
      {
        role: 'user',
        content: `面试题：${question}\n候选人回答：${userAnswer}`
      }
    ];
    const response = await this.callDeepSeek(messages, { temperature: 0.3, jsonMode: true });
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      return { score: 60, comment: '评分解析异常', professionalScore: 60, expressionScore: 60, logicScore: 60, understandingScore: 60, strengths: [], weaknesses: [] };
    }
  }

  async generateReport(details, position) {
    try {
      const qaSummary = details.map((d, i) =>
        `第${i + 1}题：${d.question_content}\n回答：${d.user_answer || '未回答'}\nAI评分：${d.ai_score || '未评分'}`
      ).join('\n\n');

      const messages = [
        {
          role: 'system',
          content: `你是一位${position}面试评估专家。请根据面试问答记录生成综合评估报告。
返回JSON格式：
{
  "totalScore": 数字(0-100),
  "professionalScore": 数字,
  "expressionScore": 数字,
  "logicScore": 数字,
  "understandingScore": 数字,
  "strengths": ["优点1", "优点2", "优点3"],
  "weaknesses": ["不足1", "不足2", "不足3"],
  "suggestions": ["建议1", "建议2", "建议3"],
  "radarData": {"专业知识": 数字, "表达能力": 数字, "逻辑思维": 数字, "问题理解": 数字, "项目经验": 数字},
  "detailedFeedback": "详细的面试反馈总结(200字以上)",
  "summary": "一句话总结"
}`
        },
        { role: 'user', content: `以下是${position}岗位面试的全部问答记录：\n\n${qaSummary}\n\n请生成评估报告。` }
      ];
      const response = await this.callDeepSeek(messages, { temperature: 0.3, jsonMode: true, maxTokens: 4096 });
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('[AI Service] generateReport failed, using defaults:', e.message);
      return {
        totalScore: 60, professionalScore: 60, expressionScore: 60, logicScore: 60, understandingScore: 60,
        strengths: ['参与面试'], weaknesses: ['需加强准备'], suggestions: ['多练习面试题'],
        radarData: { '专业知识': 60, '表达能力': 60, '逻辑思维': 60, '问题理解': 60, '项目经验': 60 },
        detailedFeedback: '面试已完成，请查看各题详细评分。',
        summary: '面试完成'
      };
    }
  }

  async analyzeResume(resumeText, targetPosition) {
    const posText = targetPosition || '通用技术岗位';
    try {
      const messages = [
        {
          role: 'system',
          content: `你是一位拥有15年经验的资深HR总监兼简历优化专家，曾帮助数千名求职者成功拿到心仪offer。请以极高的专业标准，对下面的简历进行深入、详细、有针对性的分析。

目标岗位：${posText}

分析维度要求：

1. **综合评分**：基于以下4个维度独立打分，综合加权计算（内容40% + 格式20% + 经验25% + 匹配度15%）

2. **各维度详细评分与点评**（每项0-100分，附带具体点评）：
   - 内容质量：经历的描述深度、量化成果、STAR法则运用、技术细节丰富度
   - 格式规范：排版逻辑、层次结构、关键信息突出度、篇幅控制
   - 经验展示：项目复杂度、技术栈广度深度、成长轨迹、成果量化程度
   - 岗位匹配度：与${posText}岗位的核心技能、经验年限、项目契合度

3. **优势亮点**（至少5条）：具体指出简历中写得好的地方，要指名具体的技能/项目/描述方式，说明为什么好

4. **问题诊断**（至少5条）：具体指出问题，包括：
   - 哪些关键技能缺失或描述不足
   - 哪些项目描述过于笼统，缺少量化数据
   - 格式/排版上的具体问题
   - 与${posText}岗位的差距

5. **分维度优化建议**：按以下分类给出具体可执行的改进建议：
   - 内容优化：具体怎么写、用什么数据、怎么用STAR法则改写
   - 技能补充：应该补充哪些技术栈、哪些要突出
   - 格式调整：排版怎么改
   - 针对性优化：针对${posText}岗位的特定建议

6. **技能评估**：
   - 已具备的核心技能清单（标注掌握程度：精通/熟练/了解）
   - 缺失的关键技能（按重要性排序）
   - 建议补充学习的技术栈

7. **教育背景评估**：学历、专业、学校的竞争力分析

8. **经历亮点提炼**：从简历中提取最有价值的2-3个项目/工作经历，分析其亮点

9. **简历改进计划**：按优先级列出具体的改进步骤（3-5步），每步说明怎么做、预期效果

10. **面试准备建议**：基于简历内容，预测面试官可能的提问方向

返回严格的JSON格式（不要用markdown代码块包裹）：
{
  "overallScore": 数字(0-100),
  "contentScore": 数字(0-100,附点评),
  "contentComment": "内容质量具体点评",
  "formatScore": 数字(0-100),
  "formatComment": "格式规范具体点评",
  "experienceScore": 数字(0-100),
  "experienceComment": "经验展示具体点评",
  "matchScore": 数字(0-100),
  "matchComment": "岗位匹配度具体点评",
  "strengths": ["具体优势1", "具体优势2", "具体优势3", "具体优势4", "具体优势5"],
  "weaknesses": ["具体问题1", "具体问题2", "具体问题3", "具体问题4", "具体问题5"],
  "contentSuggestions": ["内容优化建议1", "内容优化建议2", "内容优化建议3"],
  "skillSuggestions": ["技能补充建议1", "技能补充建议2", "技能补充建议3"],
  "formatSuggestions": ["格式调整建议1", "格式调整建议2"],
  "targetedSuggestions": ["针对${posText}岗位的建议1", "建议2", "建议3"],
  "skillTags": [{"name": "技能名", "level": "精通/熟练/了解", "category": "分类"}],
  "missingSkills": ["缺失技能1", "缺失技能2", "缺失技能3"],
  "education": "教育背景评估（50字以上）",
  "experience": "经历亮点提炼（100字以上）",
  "improvementPlan": [
    {"priority": 1, "title": "改进项", "action": "具体怎么做", "expectedResult": "预期效果"},
    {"priority": 2, "title": "改进项", "action": "具体怎么做", "expectedResult": "预期效果"},
    {"priority": 3, "title": "改进项", "action": "具体怎么做", "expectedResult": "预期效果"}
  ],
  "interviewPrep": ["面试官可能问1", "面试官可能问2", "面试官可能问3"],
  "keywords": "关键技能词(逗号分隔)"
}`
        },
        { role: 'user', content: `请详细分析以下简历，目标岗位：${posText}\n\n简历内容：\n${resumeText}` }
      ];
      const response = await this.callDeepSeek(messages, { temperature: 0.3, jsonMode: true, maxTokens: 6000 });
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('[AI Service] analyzeResume failed:', e.message);
      return {
        overallScore: 70, contentScore: 70, contentComment: '', formatScore: 70, formatComment: '',
        experienceScore: 70, experienceComment: '', matchScore: 70, matchComment: '',
        strengths: ['简历格式规范'], weaknesses: ['缺少量化的项目成果数据'],
        contentSuggestions: ['使用STAR法则改写项目经历'], skillSuggestions: ['补充核心技术栈'], formatSuggestions: [],
        targetedSuggestions: [], skillTags: [], missingSkills: [],
        education: '', experience: '', improvementPlan: [], interviewPrep: [], keywords: ''
      };
    }
  }

  async generateLearningPath(position, weaknesses, currentLevel) {
    try {
      const levelText = currentLevel === 'senior' ? '高级' : currentLevel === 'mid' ? '中级' : '初级';
      const messages = [
        {
          role: 'system',
          content: `你是一位资深技术培训专家，拥有10年以上${position}领域的教学经验。请根据以下面试评估结果，为求职者制定一份非常详细的个性化学习方案。

面试人信息：
- 目标岗位：${position}
- 当前水平：${levelText}
- 薄弱环节：${weaknesses.join('、')}

要求：
1. 方案要非常具体，每阶段给出明确的学习目标、具体知识点清单、推荐学习资源（书名/课程名/网址）
2. 针对薄弱环节重点设计专项训练
3. 包含每日/每周的学习任务建议
4. 阶段之间要有递进关系
5. 至少5个阶段，每个阶段不少于4个知识点

返回严格的JSON格式（不要用markdown代码块包裹）：
{
  "title": "针对性的学习方案标题",
  "description": "200字左右的方案总览，说明该方案的设计思路和预期效果",
  "estimatedWeeks": 数字(总周数),
  "steps": [
    {
      "order": 1,
      "title": "阶段名称（如：Java基础核心深化）",
      "goal": "该阶段要达成的具体目标",
      "description": "为什么要学这个阶段，以及学完后的收获（50字以上）",
      "dailyPlan": "每日学习建议（如：每天2小时，上午学理论下午写代码）",
      "topics": ["具体知识点1", "具体知识点2", "具体知识点3", "具体知识点4"],
      "keyPoints": ["重点掌握1", "重点掌握2"],
      "practiceTask": "本周实战任务描述",
      "resources": [
        {"name": "《Java核心技术》卷1", "type": "book", "url": "", "describe": "为什么推荐这个资源"},
        {"name": "极客时间Java进阶课", "type": "course", "url": "", "describe": "为什么推荐这个资源"}
      ],
      "durationDays": 数字
    }
  ]
}`
        },
        {
          role: 'user',
          content: `目标岗位：${position}，当前${levelText}水平，薄弱环节：${weaknesses.join('、')}。请制定详细学习方案。`
        }
      ];
      const response = await this.callDeepSeek(messages, { temperature: 0.6, jsonMode: true, maxTokens: 8000 });
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('[AI Service] generateLearningPath failed, using defaults:', e.message);
      return {
        title: position + '岗位 · ' + (currentLevel === 'senior' ? '高级' : currentLevel === 'mid' ? '中级' : '初级') + '学习方案',
        description: '根据你的面试评估结果，我们制定了这份针对性学习方案。该方案聚焦你的薄弱环节——' + weaknesses.slice(0, 3).join('、') + '，通过系统化的阶段训练，帮助你全面提升' + position + '岗位所需的核心竞争力。',
        estimatedWeeks: 10,
        steps: [
          { order: 1, title: '第一阶段：核心基础夯实', goal: '补齐基础知识短板，建立扎实的理论体系', description: '针对面试中暴露的基础薄弱点，系统复习' + position + '的核心理论知识，确保基础扎实后再进入进阶学习。', dailyPlan: '每天2小时，1小时理论学习 + 1小时编码练习', topics: weaknesses.slice(0, 4), keyPoints: ['理解核心概念的本质', '能独立写出示例代码', '能用自己的话解释技术原理'], practiceTask: '用所学知识写一个技术博客或笔记，总结本周学习内容', resources: [{ name: '官方技术文档', type: 'course', url: '', describe: '最权威的参考资料' }, { name: '《' + position + '面试宝典》', type: 'book', url: '', describe: '系统化梳理面试高频考点' }], durationDays: 14 },
          { order: 2, title: '第二阶段：进阶技能突破', goal: '掌握' + position + '岗位的中高级技能，提升技术深度', description: '在第一阶段基础上，深入学习' + position + '的高级特性和最佳实践，建立技术深度优势。', dailyPlan: '每天2-3小时，1小时原理学习 + 1-2小时实战项目', topics: ['设计模式与架构', '性能调优方法论', '源码深度阅读', '安全编程实践'], keyPoints: ['能独立完成性能优化', '掌握至少3种设计模式的实际应用'], practiceTask: '选一个开源项目阅读源码，写出源码分析笔记', resources: [{ name: '《设计模式：可复用面向对象软件的基础》', type: 'book', url: '', describe: 'GoF经典设计模式著作' }, { name: '极客时间·' + position + '核心能力提升', type: 'course', url: '', describe: '系统化的进阶课程' }], durationDays: 21 },
          { order: 3, title: '第三阶段：项目实战训练', goal: '通过完整项目实战，将知识转化为实际能力', description: '独立完成一个完整的项目，涵盖需求分析、系统设计、编码实现、测试部署全流程。', dailyPlan: '每天3小时，按项目里程碑推进', topics: ['项目架构设计', '数据库设计与优化', 'API设计与实现', '单元测试与集成测试'], keyPoints: ['能独立设计项目架构', '能写出可维护的高质量代码', '能完成完整的开发流程'], practiceTask: '从零搭建一个完整的' + position + '项目，部署到云端', resources: [{ name: 'GitHub Trending ' + position + ' 项目', type: 'course', url: '', describe: '参考优秀开源项目的架构和代码风格' }, { name: '《整洁架构之道》', type: 'book', url: '', describe: '学习如何设计可维护的系统架构' }], durationDays: 21 },
          { order: 4, title: '第四阶段：面试专项突破', goal: '针对目标岗位进行模拟面试训练', description: '大量刷题和模拟面试，将技术能力转化为面试表现。', dailyPlan: '每天2小时，1小时刷题 + 1小时模拟面试', topics: ['高频面试题精讲', '白板编程训练', '系统设计面试', '行为面试准备'], keyPoints: ['能在压力下清晰表达技术方案', '掌握常见面试题的回答框架'], practiceTask: '每天完成3道算法题 + 1次模拟面试录音复盘', resources: [{ name: 'LeetCode高频题库', type: 'course', url: 'https://leetcode.cn', describe: '在线算法练习平台' }, { name: '《剑指Offer》', type: 'book', url: '', describe: '经典面试题集' }], durationDays: 14 }
        ]
      };
    }
  }

  async generateProjectDrill(projectName, projectDescription) {
    const messages = [
      {
        role: 'system',
        content: `你是一位技术面试官。针对候选人描述的项目进行深度挖掘提问。
返回JSON数组，包含5-10个深度追问：
[{"question": "问题", "type": "类型", "focus": "考察点", "referenceAnswer": "参考答案要点"}]`
      },
      {
        role: 'user',
        content: `项目名称：${projectName}\n项目描述：${projectDescription}\n\n请从架构设计、技术选型、数据库设计、性能优化、安全、测试、部署等角度提出深度追问。`
      }
    ];
    const response = await this.callDeepSeek(messages, { temperature: 0.7, jsonMode: true, maxTokens: 4096 });
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      return [{ question: '请详细描述该项目的数据库设计方案', type: 'project', focus: '数据库设计' }];
    }
  }

  getDefaultQuestions(position, difficulty, count) {
    const defaults = {
      'Java开发工程师': [
        { title: 'Java面向对象特性', content: '请解释封装、继承、多态的概念和实际应用场景', type: 'basic', referenceAnswer: '封装隐藏实现细节，继承复用代码，多态提高灵活性', tags: 'Java,OOP', score: 10 },
        { title: 'Spring框架理解', content: '请说明Spring IoC和AOP的原理', type: 'basic', referenceAnswer: 'IoC通过DI管理对象依赖，AOP实现横切关注点分离', tags: 'Spring,IoC,AOP', score: 15 },
        { title: '数据库优化经验', content: '请分享你在数据库性能优化方面的经验', type: 'scenario', referenceAnswer: '使用索引、优化SQL、读写分离、缓存策略', tags: '数据库,优化', score: 15 },
        { title: '项目经验介绍', content: '请介绍一个你参与过的最有挑战的项目', type: 'project', referenceAnswer: '应包括项目背景、技术栈、个人职责、挑战和成果', tags: '项目', score: 20 },
        { title: '技术问题解决', content: '当系统出现性能瓶颈时，你会如何排查和解决？', type: 'scenario', referenceAnswer: '监控定位、分析日志、性能剖析、逐步优化', tags: '性能,排查', score: 15 }
      ],
      '前端开发工程师': [
        { title: 'Vue/React核心原理', content: '请说明你所使用框架的响应式原理', type: 'basic', referenceAnswer: 'Vue3用Proxy，React用状态管理和虚拟DOM', tags: '前端,框架', score: 10 },
        { title: '前端性能优化', content: '请列举前端性能优化的常用手段', type: 'scenario', referenceAnswer: '代码分割、懒加载、CDN、缓存、图片优化', tags: '性能,优化', score: 15 },
        { title: '跨域问题解决', content: '请说明前端跨域问题的解决方案', type: 'basic', referenceAnswer: 'CORS、代理、JSONP、postMessage', tags: '跨域', score: 10 },
        { title: '组件设计经验', content: '请分享你的组件设计和封装经验', type: 'project', referenceAnswer: '高内聚低耦合、可复用、可测试', tags: '组件', score: 15 },
        { title: '项目架构设计', content: '请描述你在项目中如何设计前端架构', type: 'open', referenceAnswer: '路由设计、状态管理、模块化、构建优化', tags: '架构', score: 20 }
      ]
    };
    const questions = defaults[position] || defaults['Java开发工程师'];
    while (questions.length < count) {
      questions.push({ title: `综合面试题${questions.length + 1}`, content: `请回答关于${position}的第${questions.length + 1}个问题`, type: 'open', referenceAnswer: '参考答案', tags: '综合', score: 10 });
    }
    return questions.slice(0, count);
  }
}

module.exports = new AiService();
