# ProdMind 产品需求定义文档 (PRD)

**版本**: v1.0
**日期**: 2026-02-13
**状态**: 需求定义
**产品形态**: Web应用
**技术栈**: Next.js 全栈

---

## Part 1：产品概述

### 1.1 产品定义

**ProdMind** 是一台**认知对抗机器**——用结构化的强制冲突，替代人脑无法自发执行的证伪纪律，把"想清楚"从个人天赋变成系统能力。

在24小时内，将模糊的产品想法转化为：
- 可验证的假设清单
- 完整的冲突对抗记录
- 明确的MVP边界定义
- 具体的下一步验证行动

### 1.2 核心问题定义

ProdMind 解决的不是"产品怎么做"，而是：

> **人在面对模糊想法时，为什么总是跳过定义问题就冲向方案，并在虚假共识中浪费时间？**

这是一个**认知纪律问题**，不是工具效率问题。

#### 问题本质
1. **确认偏误**：人类天然倾向于寻找支持自己观点的证据，而非证伪
2. **虚假共识**：缺乏真正的冲突对抗，团队/个人陷入自我确认
3. **思考即焚**：对话结束后无结构化沉淀，思考过程丢失
4. **纪律依赖**：依赖个人自律"想清楚再说"，但这是不可靠的

### 1.3 目标用户

**主要用户群体**（不做体验区分）：

#### 用户类型1：独立开发者/创业者
- **特征**：一个人从0到1想产品，没有团队讨论对象
- **痛点**：缺乏对手来挑战自己的想法，容易陷入自嗨
- **诉求**：需要AI充当"魔鬼代言人"，强制自己面对盲点

#### 用户类型2：初级产品经理
- **特征**：有基本PM知识，但缺乏结构化思维训练
- **痛点**：知道要"想清楚问题"，但不知道怎么系统化地做
- **诉求**：需要系统帮助建立证伪纪律，形成思维框架

#### 共同特征
- 都需要**被强迫着变强**，而非自愿自律
- 都需要**结构化的对抗机制**来暴露盲点
- 都需要**强制沉淀**的思考资产，而非聊完即焚

### 1.4 产品哲学（三条铁律）

#### 铁律1：反共识即默认态
```
人类天然趋向确认偏误。
ProdMind 的存在前提是：共识是廉价的，冲突才产生信息增量。
系统的默认姿态不是帮你，是反对你。
```

**体现方式**：
- AI角色的默认立场是"你错了"
- 系统在检测到"全员同意"时，自动触发刺客角色强制反对
- 产出物中必须包含"如何证明这个假设是错的"

#### 铁律2：结构强制先于意志自律
```
不依赖用户"想清楚再说"，而是用机制把思维纪律外化为系统约束。
纪律不靠自觉，靠结构。
```

**体现方式**：
- 强制引用机制：角色必须用 `@角色名 针对[观点]` 格式发言，否则系统拒绝
- 强制参与：每轮辩论后，用户必须回应质疑才能进入下一步
- 强制产出：每轮必须生成假设清单、冲突记录、下一步行动，不可关闭

#### 铁律3：思考必须留下残骸
```
对话即焚是认知最大的敌人。
每一轮冲突、每一个被推翻的假设、每一次收敛，都必须沉淀为可追溯的资产。
思考过程本身就是产品。
```

**体现方式**：
- 完整持久化：所有辩论记录、冲突、假设、决策完整保存
- 可追溯：每个假设都可以追溯到是谁提出、谁攻击、如何演化
- 可导出：Markdown + JSON 格式导出，可对接其他工具

### 1.5 产品定位句

ProdMind 不是产品经理的效率工具，是一台**认知对抗机器**——它用结构化的强制冲突，替代人脑无法自发执行的证伪纪律，把"想清楚"从个人天赋变成系统能力。

---

## Part 2：系统架构

### 2.1 三层架构总览

ProdMind 采用三层架构设计，每层负责不同的职责：

```
┌─────────────────────────────────────────────┐
│          角色层 (Role Layer)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │架构师    │ │刺客      │ │用户鬼    │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│       ┌──────────┐                          │
│       │落地者    │                          │
│       └──────────┘                          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│        冲突引擎 (Conflict Engine)            │
│  • 强制引用检测                              │
│  • 驳斥关系追踪                              │
│  • 盲点自动触发                              │
│  • 并行攻击调度                              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          资产层 (Asset Layer)                │
│  • 假设清单 (Hypothesis List)                │
│  • 冲突记录 (Conflict Log)                   │
│  • 下一步行动 (Next Actions)                 │
│  • MVP边界定义 (MVP Boundary)                │
└─────────────────────────────────────────────┘
```

#### 层级职责

**角色层**：
- 管理4个固定AI角色的行为逻辑
- 路由不同角色到不同的AI模型（多模型混合路由）
- 控制角色发言顺序和触发时机

**冲突引擎**：
- 检测角色发言是否符合严格引用格式
- 追踪观点之间的攻击、防御、推翻关系
- 自动触发盲点爆破规则（固定规则）
- 调度并行攻击（刺客+用户鬼同时发言）

**资产层**：
- 实时生成和更新4类产出物
- 提供导出功能（Markdown + JSON）
- 持久化存储所有辩论记录和产出物

### 2.2 四角色定义

ProdMind 固定使用4个AI角色，每个角色有明确的职责、发言规则和触发时机。

#### 角色1：架构师 (Architect)
**核心职责**：定义问题，拒绝方案先行

**行为模式**：
- 用户输入想法后，第一个发言
- 强制将用户的模糊想法拆解为"问题定义"
- 如果用户直接说方案，拒绝讨论，要求先定义问题
- 输出格式：
  ```
  核心问题：[一句话问题定义]
  问题边界：[这个问题不包括什么]
  验证标准：[如何验证问题真实存在]
  ```

**触发时机**：每次会话开始，或用户重新输入新想法

**Prompt核心指令**：
```
你是架构师。你的任务是强制用户定义清楚问题。
如果用户说"我想做一个XX功能"，你必须回答：
"你先别说方案。你要解决的问题是什么？什么人在什么场景下遇到了什么困难？"
```

---

#### 角色2：刺客 / 魔鬼代言人 (Assassin / Devil's Advocate)
**核心职责**：攻击假设，证明你错了

**行为模式**：
- 架构师定义问题后，第一个攻击
- 必须用 `@架构师 针对[观点]` 格式引用
- 从以下角度攻击：
  1. 问题可能是伪需求
  2. 问题边界定义过窄/过宽
  3. 验证标准无法证伪
  4. 存在更本质的问题

**触发时机**：
- 架构师发言后自动触发
- 检测到"全员同意"时自动触发（盲点规则）
- 讨论技术超过5轮时强制打断（盲点规则）

**Prompt核心指令**：
```
你是刺客。你的任务是证明对方错了。
你必须以 "@架构师 针对[具体观点]" 开头。
你要攻击的不是方案，而是问题定义本身。
找出逻辑漏洞、边界模糊、无法证伪的部分。
```

---

#### 角色3：用户鬼 / 用户代言人 (User Ghost / Naive User)
**核心职责**：从真实用户视角质疑

**行为模式**：
- 与刺客并行攻击（同时发言）
- 必须用 `@架构师 针对[观点]` 或 `@刺客 针对[观点]` 格式引用
- 质疑角度：
  1. "用户真的会这样想吗？"
  2. "这个场景我从未遇到过"
  3. "你描述的痛点对我来说不是问题"
  4. "我有更简单的替代方案"

**触发时机**：
- 架构师发言后自动触发（与刺客并行）
- 连续3轮无用户视角时自动插入（盲点规则）

**Prompt核心指令**：
```
你是用户鬼。你代表真实用户，而非产品思维。
你要质疑的是：这个问题对用户来说真的存在吗？
用用户的语言说话，不要用产品术语。
```

**输出约束**（CLI验证后补充）：
- 每个 section（我为什么不会用 / 替代方案 / 如果这是错的）最多 5 条 bullet，超出必须合并
- 总输出不超过 500 中文字（英文等比例）
- 禁止语义重复：同一段内不得出现意思相同的句子，必须合并或删减
- 至少包含一条"责任归属"或"出错代价"维度的质疑

---

#### 角色4：落地者 / MVP经理 (Grounding Manager / MVP Driver)
**核心职责**：强制收敛，暴力切割

**行为模式**：
- 刺客+用户鬼攻击后，用户回应后触发
- 将辩论结果收敛为4类产出物：
  1. 假设清单（可证伪的假设列表）
  2. 冲突记录（哪些观点被推翻）
  3. 下一步行动（验证实验设计）
  4. MVP边界定义（做什么/不做什么）

**触发时机**：
- 用户回应完质疑后
- 假设稳定时（连续2轮无新攻击点）
- 超时时（单轮辩论超过约定时间）

**Prompt核心指令**：
```
你是落地者。你的任务是强制收敛。
基于以上辩论，生成4类产出物：
1. 假设清单：每条必须可证伪，附带"如何证明我错了"
2. 冲突记录：记录哪些观点被推翻，被谁推翻
3. 下一步行动：具体的验证实验（不是泛泛的"调研用户"）
4. MVP边界：明确做3件事，不做5件事
```

### 2.3 多模型混合路由策略

**设计原则**：利用不同AI模型的性格差异，增强角色对抗效果。

#### 模型分配策略（可配置）

| 角色 | 推荐模型 | 原因 |
|------|----------|------|
| 架构师 | GPT-4 / Claude Opus | 结构化能力强，擅长问题拆解 |
| 刺客 | Claude Opus / Gemini | 批判性思维强，擅长找漏洞 |
| 用户鬼 | GPT-4 / DeepSeek | 语言自然，贴近真实用户 |
| 落地者 | GPT-4 / Claude Sonnet | 收敛能力强，输出结构化 |

#### 技术实现要求

```typescript
interface RoleModelConfig {
  architect: {
    provider: 'openai' | 'anthropic' | 'google';
    model: string;
    temperature: number;
  };
  assassin: {
    provider: 'openai' | 'anthropic' | 'google';
    model: string;
    temperature: number;
  };
  userGhost: {
    provider: 'openai' | 'anthropic' | 'google';
    model: string;
    temperature: number;
  };
  grounder: {
    provider: 'openai' | 'anthropic' | 'google';
    model: string;
    temperature: number;
  };
}
```

**MVP阶段默认配置**：
- 所有角色可以使用同一个模型（如 GPT-4）
- 但架构上必须支持独立配置，为后续优化预留空间
- Temperature建议：刺客设置0.8（更激进），落地者设置0.3（更保守）

---

## Part 3：核心流程

### 3.1 完整辩论流程（教练模式）

ProdMind 采用**教练模式**：强制不可跳过，用户必须参与每个环节。

#### 流程总览

```
┌─────────────────────────────────────────────────────┐
│ 阶段0：用户输入                                        │
│ 用户提交产品想法                                       │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 阶段1：问题定义                                        │
│ [架构师] 强制将想法拆解为问题定义                       │
│ • 核心问题                                            │
│ • 问题边界                                            │
│ • 验证标准                                            │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 阶段2：并行攻击（刺客 + 用户鬼同时发言）                │
│ [刺客] @架构师 针对问题定义进行攻击                     │
│ [用户鬼] @架构师 从用户视角质疑                         │
│ （两个角色并行生成，同时展示）                          │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 阶段3：强制用户参与（阻塞点）                          │
│ 系统提示：你必须回应以下质疑才能继续                    │
│ 用户必须输入回应，否则流程阻塞                          │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 阶段4：收敛与产出                                      │
│ [落地者] 基于辩论生成4类产出物                          │
│ • 假设清单                                            │
│ • 冲突记录                                            │
│ • 下一步行动                                          │
│ • MVP边界定义                                         │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 判断：是否需要下一轮辩论？                             │
│ • 假设稳定？（连续2轮无新攻击点）→ 结束               │
│ • 假设仍有疑问？→ 返回阶段2，刺客+用户鬼继续攻击       │
└─────────────────────────────────────────────────────┘
```

### 3.2 用户参与机制（教练模式）

#### 3.2.1 强制参与点

用户在整个辩论过程中有**3个强制参与点**，不回应则流程阻塞：

**参与点1：架构师定义问题后**
- **时机**：架构师完成问题定义
- **系统提示**：
  ```
  架构师已将你的想法拆解为问题定义。
  在进入下一步之前，请确认或修正：
  1. 核心问题是否准确？
  2. 问题边界是否合理？
  3. 验证标准是否可行？

  [输入框：必须回应]
  ```
- **阻塞行为**：用户不回应，则无法触发刺客+用户鬼的并行攻击

**参与点2：并行攻击后**（核心强制点）
- **时机**：刺客+用户鬼同时完成攻击
- **系统提示**：
  ```
  刺客和用户鬼提出了以下质疑：

  [刺客的攻击]
  [用户鬼的质疑]

  你必须回应这些质疑才能继续：
  • 承认哪些质疑是对的？
  • 反驳哪些质疑，理由是什么？
  • 你打算修正哪些假设？

  [输入框：必须回应，字数不少于50字]
  ```
- **阻塞行为**：用户不回应或回应少于50字，系统拒绝进入收敛阶段
- **教练模式体现**：这是最核心的强制点，用户必须认真面对质疑

**参与点3：收敛后的确认**
- **时机**：落地者完成4类产出物生成
- **系统提示**：
  ```
  落地者已生成本轮产出物。请选择下一步：
  1. 确认结束本轮，进入下一个想法
  2. 继续挑战某个假设（触发新一轮辩论）
  3. 导出当前产出物

  [按钮组：必须选择一个]
  ```
- **阻塞行为**：用户不选择，会话处于待决状态

#### 3.2.2 用户输入规则

**教练模式下的约束**：
- 用户不能跳过任何角色的发言
- 用户不能强制结束辩论（只能在收敛后选择）
- 用户不能修改系统生成的产出物（只能导出后修改）

**允许的用户操作**：
- 随时查看历史辩论记录
- 随时导出当前产出物
- 在强制参与点输入文字回应
- 在收敛后选择下一步行动

### 3.3 冲突闭环规则（固定规则自动触发）

冲突闭环是 ProdMind 的核心防御机制，通过固定规则自动触发，防止用户和AI陷入虚假共识或在兴奋时滑过关键分歧。

> 规则的作用不是"更聪明"，而是：不允许你在兴奋时滑过去。

#### 规则1：替代假设阻断（P0 — 核心规则）

**触发条件**：
- 刺客或用户鬼的输出中包含替代假设模式：
  - "可能不是X，而是Y"
  - "更底层的问题是…"
  - "也许根本不需要…"
  - "真正的问题可能是…"

**触发行为**：
```
⚠ 替代假设检测：
刺客/用户鬼提出了替代假设：
【Y：{替代假设内容}】

在继续之前，你必须选择：
1. 承认（将原假设降级，替代假设升级）
2. 提供反证（给出具体证据反驳替代假设）
3. 标记为待验证（生成验证实验）
```

**阻塞行为**：用户未选择，不允许进入落地者收敛阶段。

**实现逻辑**：
```typescript
interface AlternativeHypothesis {
  source: 'assassin' | 'userGhost';
  original: string;
  alternative: string;
}

function detectAlternativeHypothesis(response: string): AlternativeHypothesis | null {
  const patterns = [
    /可能不是(.+)[，,]而是(.+)/,
    /更底层的问题是(.+)/,
    /也许根本不需要(.+)/,
    /真正的问题可能是(.+)/,
    /not about (.+), but (.+)/i,
    /the real problem is (.+)/i,
  ];

  for (const pattern of patterns) {
    const match = response.match(pattern);
    if (match) {
      return {
        source: 'assassin',
        original: match[1]?.trim() ?? '',
        alternative: match[2]?.trim() ?? match[1]?.trim() ?? '',
      };
    }
  }
  return null;
}
```

---

#### 规则2：共识警报（P0 — 核心规则）

**触发条件**（比简单关键词检测更严格）：
- 连续2轮角色观点趋同（刺客和用户鬼的攻击强度持续下降）
- 或单轮内刺客和用户鬼均无实质性反对
- 或冲突记录字段为空

**触发行为**：
```
⚠ 共识警报：
当前所有角色趋于一致，违反证伪原则。

在继续之前，请回答：
- 如果这个结论是错的，最可能错在哪里？
- 谁会强烈反对这个决策？
```

**阻塞行为**：用户必须回答以上两个问题，否则不进入下一阶段。

**实现逻辑**：
```typescript
function detectConsensusAlert(
  assassinResponse: string,
  userGhostResponse: string,
  previousRounds: Round[]
): boolean {
  const agreeKeywords = ['同意', '没问题', '合理', '正确', '确实', '说得对', 'agree', 'looks good', 'makes sense'];
  const attackKeywords = ['但是', '然而', '问题在于', '不对', '错', '伪需求', '反对', 'however', 'but', 'wrong'];

  const assassinAgrees = agreeKeywords.some(kw => assassinResponse.includes(kw));
  const assassinAttacks = attackKeywords.some(kw => assassinResponse.includes(kw));
  const ghostAgrees = agreeKeywords.some(kw => userGhostResponse.includes(kw));
  const ghostAttacks = attackKeywords.some(kw => userGhostResponse.includes(kw));

  // 单轮内双方均无实质攻击
  if ((assassinAgrees && !assassinAttacks) && (ghostAgrees && !ghostAttacks)) {
    return true;
  }

  // 连续2轮趋同检测
  if (previousRounds.length >= 1) {
    const lastRound = previousRounds[previousRounds.length - 1];
    const lastAssassinWeak = agreeKeywords.some(kw => lastRound.assassin.includes(kw))
      && !attackKeywords.some(kw => lastRound.assassin.includes(kw));
    const currentAssassinWeak = assassinAgrees && !assassinAttacks;
    if (lastAssassinWeak && currentAssassinWeak) return true;
  }

  return false;
}
```

---

#### 规则3：强制证伪语句（P0 — 核心规则）

**触发条件**：每轮辩论结束时自动触发，无条件执行。

**触发行为**：
落地者的输出末尾必须包含以下结构，否则系统拒绝该输出并要求重新生成：

```
## 本轮证伪检查

当前最重要假设：{假设内容}
如果我是错的，最可能因为什么？{原因}
验证这个假设的最小动作是什么？{具体动作}
```

**实现逻辑**：
```typescript
function validateFalsificationBlock(grounderOutput: string): boolean {
  const requiredPatterns = [
    /当前最重要假设/,
    /如果我是错的/,
    /最小动作/,
  ];
  return requiredPatterns.every(p => p.test(grounderOutput));
}
```

---

#### 规则4：连续3轮无用户视角强制插入用户鬼（P1）

**触发条件**：
- 连续3轮辩论中，用户鬼的发言中没有包含用户视角关键词

**触发行为**：
```
[系统提示] 检测到连续3轮缺乏用户视角，强制插入用户鬼。

[用户鬼自动触发]
@所有人 我被系统强制插入，因为你们的讨论已经脱离用户现实。
```

---

#### 规则5：技术逃逸阻断（P0 — 核心规则）

**触发条件**：
- 用户在"回应质疑"阶段的文本中，命中以下模式中的2个及以上：
  - 强调"AI/大模型能显著缩短周期/提升质量/成本趋近于零"
  - 强调"不能用传统方式评估开发时间/我们开发很快"
  - 回答重点明显转移到"实现能力/开发速度"，而非"需求真实性/价值/风险/迁移"

**触发行为**：
```
⚠ 技术逃逸检测：
你的回应主要在强调技术能力/开发速度，而非需求真实性。
即使开发成本为零，以下问题仍然存在：

请回答（每条≥50字）：
1. 即使开发成本≈0，用户是否真的会买单/迁移？为什么？
2. 如果出了问题，风险归属如何转移？谁背锅？
3. 验证用户真的需要这个东西的最小动作是什么？
```

用户必须回答全部3个追问才能继续进入落地者阶段。

**CLI验证结论**：用户实测中以"大模型辅助开发非常强大，可以明显缩短开发周期"绕过了刺客和用户鬼的核心质疑，导致落地者直接收敛。此规则从P1升级为P0。

### 3.4 收敛条件（假设稳定时收敛）

辩论不会无限进行，系统通过"假设稳定检测"判断何时收敛。

#### 假设稳定的定义

**稳定条件**：连续2轮辩论中，假设清单没有新增或修改

**检测逻辑**：
```typescript
interface Hypothesis {
  id: string;
  content: string;
  falsifiability: string; // "如何证明我错了"
  lastModifiedRound: number;
}

function isHypothesisStable(
  currentHypotheses: Hypothesis[],
  previousHypotheses: Hypothesis[],
  currentRound: number
): boolean {
  // 检查数量是否相同
  if (currentHypotheses.length !== previousHypotheses.length) {
    return false;
  }

  // 检查内容是否相同
  for (let i = 0; i < currentHypotheses.length; i++) {
    if (currentHypotheses[i].content !== previousHypotheses[i].content) {
      return false;
    }
  }

  // 检查是否有假设在最近2轮内被修改
  const recentlyModified = currentHypotheses.some(
    h => currentRound - h.lastModifiedRound < 2
  );

  return !recentlyModified;
}
```

#### 收敛时的行为

**当假设稳定时**：
```
[系统提示]
检测到假设清单已连续2轮未变化，满足收敛条件。
落地者将进行最终收敛。

[落地者触发]
基于以上辩论，假设已稳定。生成最终产出物：
[4类产出物]
```

**如果假设一直不稳定**：
- 系统允许最多进行 8 轮辩论
- 第8轮后强制收敛，即使假设仍有争议
- 落地者在产出物中标注"未完全收敛，仍存在争议"

**落地者API失败降级机制**（CLI验证后补充）：
- 第一级：自动重试（同provider，最多3次，间隔2秒）
- 第二级：若重试全部失败，系统从本轮已有的架构师/刺客/用户鬼输出中提取关键信息，本地生成结构完整但信息密度较低的"残骸资产"，包含：
  - 当前最强假设（从架构师核心问题提取）
  - MVP边界（保留结构，标注"待人工补充"）
  - 未决冲突（从刺客隐含假设提取）
  - 本轮证伪检查（保留结构）
- 降级输出必须标注"⚠ API失败降级生成"，确保可读、可复制、可作为下一轮输入继续对话
- Web版额外要求：降级输出在UI上以警告样式展示，提示用户可手动触发重新生成

### 3.5 48小时归档规则

**规则说明**：
- 会话创建后48小时内可随时继续
- 超过48小时未操作，会话自动归档
- 归档后的会话变为只读，可查看但不可继续辩论
- 用户可以基于归档会话创建新会话（复制产出物作为起点）

**归档行为**：
```typescript
interface Session {
  id: string;
  createdAt: Date;
  lastActiveAt: Date;
  status: 'active' | 'archived';
  outputs: {
    hypotheses: Hypothesis[];
    conflicts: Conflict[];
    nextActions: Action[];
    mvpBoundary: MVPBoundary;
  };
}

function checkAndArchive(session: Session): void {
  const now = new Date();
  const hoursSinceLastActive = (now.getTime() - session.lastActiveAt.getTime()) / 1000 / 60 / 60;

  if (hoursSinceLastActive >= 48 && session.status === 'active') {
    session.status = 'archived';
    // 发送归档通知给用户（邮件/站内信）
    notifyUser(session.userId, 'session_archived', session.id);
  }
}
```

**归档后的操作**：
- 查看完整辩论记录
- 导出产出物（Markdown / JSON）
- 基于此会话创建新会话（"继续这个想法"）

---

## Part 4：冲突引擎详细设计

冲突引擎是 ProdMind 的核心，负责强制角色间的对抗、检测引用格式、追踪冲突关系、调度并行攻击。

### 4.1 严格格式化引用规则

**规则定义**：所有AI角色的发言必须以 `@角色名 针对[观点]` 格式开头，否则系统拒绝该发言。

#### 4.1.1 引用格式规范

**标准格式**：
```
@{角色名} 针对{观点摘要}，{我的攻击/质疑/回应}
```

**示例**：
```
✅ 正确：
@架构师 针对"核心问题是用户找不到合适的产品"，我认为这是伪需求。
用户真正的问题可能是不知道自己要什么，而不是找不到产品。

❌ 错误：
我认为架构师的问题定义有问题。(缺少@引用)

❌ 错误：
@架构师 你说的不对。(缺少"针对[观点]")
```

#### 4.1.2 引用检测逻辑

**检测流程**：
```typescript
interface RoleResponse {
  role: 'architect' | 'assassin' | 'userGhost' | 'grounder';
  content: string;
  timestamp: Date;
}

function validateReferenceFormat(response: RoleResponse): {
  isValid: boolean;
  error?: string;
  extractedReference?: {
    targetRole: string;
    targetOpinion: string;
    responseContent: string;
  };
} {
  // 正则匹配：@角色名 针对{观点}
  const regex = /@(\S+)\s+针对(.*?)[，。,](.+)/s;
  const match = response.content.match(regex);

  if (!match) {
    return {
      isValid: false,
      error: '格式错误：发言必须以 "@角色名 针对[观点]" 开头'
    };
  }

  const [_, targetRole, targetOpinion, responseContent] = match;

  // 验证被引用角色是否存在
  const validRoles = ['架构师', '刺客', '用户鬼', '落地者', 'Architect', 'Assassin', 'UserGhost', 'Grounder'];
  if (!validRoles.includes(targetRole)) {
    return {
      isValid: false,
      error: `角色名错误：'${targetRole}' 不是有效的角色`
    };
  }

  // 验证观点摘要长度
  if (targetOpinion.trim().length < 5) {
    return {
      isValid: false,
      error: '观点摘要过短：必须明确引用对方的具体观点（不少于5个字）'
    };
  }

  return {
    isValid: true,
    extractedReference: {
      targetRole,
      targetOpinion: targetOpinion.trim(),
      responseContent: responseContent.trim()
    }
  };
}
```

#### 4.1.3 违规处理

**当检测到格式违规时**：

**处理策略1：自动重试（优先）**
```typescript
async function enforceReferenceFormat(
  role: RoleAgent,
  maxRetries: number = 3
): Promise<RoleResponse> {
  let attempts = 0;
  let response: RoleResponse;

  while (attempts < maxRetries) {
    response = await role.generate();
    const validation = validateReferenceFormat(response);

    if (validation.isValid) {
      return response;
    }

    // 在prompt中追加错误提示，要求重新生成
    role.appendSystemMessage(`
      格式错误：${validation.error}
      请重新生成回复，必须以 "@角色名 针对[具体观点]" 开头。
    `);

    attempts++;
  }

  // 3次重试后仍失败，抛出错误
  throw new Error(`角色 ${role.name} 连续${maxRetries}次违反引用格式规则`);
}
```

**处理策略2：用户提示（备选）**
```
[系统提示]
刺客的发言违反了引用格式规则，系统已要求其重新生成。
请稍候...
```

### 4.2 驳斥检测机制

**目标**：自动检测角色发言中是否包含真正的驳斥，防止"表面引用，实质附和"。

#### 4.2.1 驳斥强度判断

**判断维度**：
1. **语义对立度**：发言是否与被引用观点相反
2. **论据充分度**：是否提供了具体反驳论据
3. **可证伪性**：是否提出了可验证的反例

**检测逻辑**：
```typescript
interface RefutationAnalysis {
  hasOpposition: boolean;      // 是否包含反对立场
  hasEvidence: boolean;         // 是否有论据支持
  hasFalsifiability: boolean;   // 是否可证伪
  refutationStrength: 'weak' | 'medium' | 'strong';
}

async function analyzeRefutation(
  targetOpinion: string,
  responseContent: string
): Promise<RefutationAnalysis> {
  // 使用AI进行语义分析（调用小模型，如GPT-3.5）
  const prompt = `
    分析以下回应是否对目标观点进行了有效反驳：

    目标观点：${targetOpinion}
    回应内容：${responseContent}

    请判断：
    1. 回应是否与目标观点立场相反？(yes/no)
    2. 回应是否提供了具体论据？(yes/no)
    3. 回应是否可以被验证或证伪？(yes/no)
    4. 整体驳斥强度？(weak/medium/strong)

    以JSON格式返回：{"hasOpposition": boolean, "hasEvidence": boolean, "hasFalsifiability": boolean, "refutationStrength": string}
  `;

  const analysis = await callSmallModel(prompt);
  return JSON.parse(analysis);
}
```

#### 4.2.2 弱驳斥处理

**当检测到驳斥强度为 'weak' 时**：

```typescript
if (refutation.refutationStrength === 'weak') {
  // 追加系统提示，要求强化驳斥
  role.appendSystemMessage(`
    你的驳斥强度过弱。请提供：
    1. 明确的反对立场
    2. 至少2个具体论据
    3. 可验证的反例或证据
    请重新生成。
  `);

  // 重新生成
  response = await role.generate();
}
```

### 4.3 冲突高亮与追踪

**目标**：在UI中高亮显示冲突关系，追踪观点的攻击链。

#### 4.3.1 冲突关系数据结构

```typescript
interface ConflictRelation {
  id: string;
  round: number;                 // 第几轮辩论
  attacker: RoleType;             // 攻击者
  target: RoleType;               // 被攻击者
  targetOpinion: string;          // 被攻击的观点
  attackContent: string;          // 攻击内容
  attackStrength: 'weak' | 'medium' | 'strong';
  isRefuted: boolean;             // 该观点是否被推翻
  userResponse?: string;          // 用户对该冲突的回应
  createdAt: Date;
}

interface ConflictChain {
  opinionId: string;              // 观点ID
  originalOpinion: string;        // 原始观点
  evolution: {
    round: number;
    content: string;              // 演化后的观点
    reason: string;               // 演化原因（被谁攻击）
  }[];
  finalStatus: 'accepted' | 'refuted' | 'modified';
}
```

#### 4.3.2 冲突追踪逻辑

```typescript
class ConflictTracker {
  private conflicts: ConflictRelation[] = [];
  private chains: Map<string, ConflictChain> = new Map();

  // 记录一次冲突
  recordConflict(conflict: ConflictRelation): void {
    this.conflicts.push(conflict);

    // 更新冲突链
    this.updateConflictChain(conflict);
  }

  // 更新冲突链
  private updateConflictChain(conflict: ConflictRelation): void {
    const opinionId = this.hashOpinion(conflict.targetOpinion);

    if (!this.chains.has(opinionId)) {
      // 创建新链
      this.chains.set(opinionId, {
        opinionId,
        originalOpinion: conflict.targetOpinion,
        evolution: [],
        finalStatus: 'accepted'
      });
    }

    const chain = this.chains.get(opinionId)!;

    // 记录演化
    if (conflict.isRefuted) {
      chain.evolution.push({
        round: conflict.round,
        content: conflict.attackContent,
        reason: `被${conflict.attacker}推翻`
      });
      chain.finalStatus = 'refuted';
    }
  }

  // 获取某个观点的完整攻击链
  getAttackChain(opinionId: string): ConflictRelation[] {
    return this.conflicts.filter(c =>
      this.hashOpinion(c.targetOpinion) === opinionId
    );
  }

  // 生成冲突记录文档
  generateConflictLog(): string {
    let log = '## 冲突记录\n\n';

    for (const [opinionId, chain] of this.chains) {
      log += `### ${chain.originalOpinion}\n\n`;
      log += `**最终状态**: ${chain.finalStatus}\n\n`;

      if (chain.evolution.length > 0) {
        log += `**演化过程**:\n`;
        chain.evolution.forEach((ev, idx) => {
          log += `${idx + 1}. 第${ev.round}轮: ${ev.reason}\n`;
          log += `   ${ev.content}\n\n`;
        });
      }

      log += '---\n\n';
    }

    return log;
  }

  private hashOpinion(opinion: string): string {
    // 简单哈希，实际可用更复杂的算法
    return opinion.substring(0, 50).replace(/\s/g, '');
  }
}
```

#### 4.3.3 UI中的冲突高亮

**视觉设计要求**：
- 被攻击的观点：高亮显示（黄色背景）
- 攻击发言：红色左边框
- 引用关系：虚线箭头连接
- 推翻状态：删除线 + 灰色

**交互要求**：
- 点击观点，展开该观点的完整攻击链
- 鼠标悬停在引用上，高亮被引用的原文
- 点击"查看冲突记录"，展开完整冲突追踪树

### 4.4 并行攻击的调度逻辑

**设计原则**：刺客和用户鬼在架构师定义问题后**同时**生成攻击，而非串行。

#### 4.4.1 并行调度流程

```typescript
async function scheduleParallelAttack(
  architectResponse: RoleResponse,
  assassin: RoleAgent,
  userGhost: RoleAgent
): Promise<{
  assassinAttack: RoleResponse;
  userGhostAttack: RoleResponse;
}> {
  // 构建上下文
  const context = {
    architectOpinion: architectResponse.content,
    round: currentRound,
    previousConflicts: conflictTracker.conflicts
  };

  // 并行调用两个AI（Promise.all）
  const [assassinAttack, userGhostAttack] = await Promise.all([
    assassin.generateAttack(context),
    userGhost.generateAttack(context)
  ]);

  // 验证格式
  const assassinValidation = validateReferenceFormat(assassinAttack);
  const userGhostValidation = validateReferenceFormat(userGhostAttack);

  if (!assassinValidation.isValid) {
    throw new Error(`刺客格式错误: ${assassinValidation.error}`);
  }

  if (!userGhostValidation.isValid) {
    throw new Error(`用户鬼格式错误: ${userGhostValidation.error}`);
  }

  // 检测驳斥强度
  const [assassinRefutation, userGhostRefutation] = await Promise.all([
    analyzeRefutation(architectResponse.content, assassinAttack.content),
    analyzeRefutation(architectResponse.content, userGhostAttack.content)
  ]);

  // 如果驳斥过弱，触发盲点规则（全员同意自动反对）
  if (
    assassinRefutation.refutationStrength === 'weak' &&
    userGhostRefutation.refutationStrength === 'weak'
  ) {
    // 触发盲点爆破规则1
    console.log('[盲点触发] 全员同意，强制刺客提出反对');
    assassinAttack = await assassin.generateForcedOpposition(context);
  }

  return {
    assassinAttack,
    userGhostAttack
  };
}
```

#### 4.4.2 并行展示策略

**UI展示方式**：
```
┌─────────────────────────────────────────┐
│ 架构师的问题定义                          │
│ [内容]                                   │
└─────────────────────────────────────────┘
              ↓  ↓  (同时触发)
     ┌────────┴────┴────────┐
     ↓                       ↓
┌─────────────┐      ┌─────────────┐
│ 刺客的攻击   │      │ 用户鬼的质疑 │
│ [内容]      │      │ [内容]      │
└─────────────┘      └─────────────┘
```

**展示时序**：
1. 两个攻击同时生成（后端并行）
2. 前端同时显示两个攻击卡片（淡入动画）
3. 用户可以分别展开查看详情
4. 用户必须对两个攻击都进行回应（强制参与点）

---

## Part 5：产出物定义

每次辩论必须强制生成4类产出物，这是 ProdMind 的核心价值——思考必须留下残骸。

### 5.1 假设清单（Hypothesis List）

**定义**：基于辩论过程提炼出的可证伪假设，每条假设必须附带验证方法。

#### 5.1.1 数据结构

```typescript
interface Hypothesis {
  id: string;                    // 唯一ID
  content: string;                // 假设内容（一句话）
  category: 'problem' | 'solution' | 'user' | 'market';  // 假设类型
  confidence: 'low' | 'medium' | 'high';  // 置信度
  falsifiability: {
    statement: string;            // 如何证明我错了（必填）
    method: string;               // 验证方法
    timeframe: string;            // 验证时间框架
    successCriteria: string;      // 成功标准
  };
  source: {
    proposedBy: RoleType;         // 谁提出的
    round: number;                // 第几轮提出
    relatedConflicts: string[];   // 相关的冲突ID
  };
  status: 'active' | 'verified' | 'falsified' | 'modified';
  createdAt: Date;
  updatedAt: Date;
}
```

#### 5.1.2 可证伪性要求

**强制规则**：每条假设必须包含"如何证明我错了"，否则系统拒绝该假设。

**示例**：

✅ **合格的假设**：
```json
{
  "content": "用户在选择产品时，最大的痛点是信息过载导致决策困难",
  "category": "problem",
  "confidence": "medium",
  "falsifiability": {
    "statement": "如果用户访谈中，少于30%的人提到'信息太多难以选择'，则该假设被证伪",
    "method": "对20个目标用户进行深度访谈，询问'你在选择XX产品时最大的困难是什么'",
    "timeframe": "1周内完成",
    "successCriteria": "至少6个用户(30%)主动提到信息过载问题"
  }
}
```

❌ **不合格的假设**：
```json
{
  "content": "我们的产品很好用",  // 过于主观，无法证伪
  "falsifiability": {
    "statement": "如果用户不喜欢就证伪了",  // 标准模糊
    "method": "问问用户",  // 方法不具体
    "timeframe": "很快",  // 时间框架不明确
    "successCriteria": "大家都说好"  // 成功标准不可量化
  }
}
```

#### 5.1.3 假设清单生成逻辑

```typescript
class HypothesisGenerator {
  async generateFromDebate(
    debateHistory: RoleResponse[],
    conflicts: ConflictRelation[]
  ): Promise<Hypothesis[]> {
    const hypotheses: Hypothesis[] = [];

    // 提取架构师的问题定义作为假设
    const architectResponses = debateHistory.filter(r => r.role === 'architect');
    for (const response of architectResponses) {
      const hypothesis = await this.extractHypothesis(response, 'problem');
      if (this.validateFalsifiability(hypothesis)) {
        hypotheses.push(hypothesis);
      }
    }

    // 提取用户鬼的观点作为用户假设
    const userGhostResponses = debateHistory.filter(r => r.role === 'userGhost');
    for (const response of userGhostResponses) {
      const hypothesis = await this.extractHypothesis(response, 'user');
      if (this.validateFalsifiability(hypothesis)) {
        hypotheses.push(hypothesis);
      }
    }

    return hypotheses;
  }

  private validateFalsifiability(hypothesis: Hypothesis): boolean {
    const f = hypothesis.falsifiability;

    // 检查必填字段
    if (!f.statement || !f.method || !f.timeframe || !f.successCriteria) {
      return false;
    }

    // 检查成功标准是否可量化
    const hasNumber = /\d+/.test(f.successCriteria);
    if (!hasNumber) {
      console.warn('成功标准缺少数字指标');
      return false;
    }

    return true;
  }
}
```

### 5.2 冲突记录（Conflict Log）

**定义**：完整记录辩论过程中的所有攻击、反驳、推翻关系。

#### 5.2.1 数据结构

```typescript
interface ConflictLog {
  sessionId: string;
  totalRounds: number;
  conflicts: ConflictRelation[];  // 所有冲突关系
  chains: ConflictChain[];        // 观点演化链
  summary: {
    totalConflicts: number;
    refutedOpinions: number;
    modifiedOpinions: number;
    survivedOpinions: number;
    mostAttackedOpinion: string;
    mostAggressiveRole: RoleType;
  };
  generatedAt: Date;
}
```

#### 5.2.2 冲突记录生成示例

**Markdown格式**：
```markdown
## 冲突记录

### 总览
- 总轮数：3轮
- 总冲突数：8次
- 被推翻观点：2个
- 被修正观点：3个
- 存活观点：3个
- 最受攻击观点："用户需要一个推荐系统"（被攻击4次）
- 最激进角色：刺客（发起6次攻击）

---

### 观点1："用户需要一个推荐系统"
**提出者**：用户（第1轮）
**最终状态**：❌ 被推翻

**演化过程**：

**第1轮攻击** - 刺客
> @用户 针对"用户需要推荐系统"，我认为这是方案先行。
> 你还没证明用户真的需要"被推荐"，也许用户要的是"自己快速找到"。

用户回应：确实，我没想清楚问题。

**第2轮攻击** - 用户鬼
> @架构师 针对修正后的问题"用户需要快速找到合适产品"，我作为用户从未觉得"找"是问题。
> 我的问题是不知道自己要什么，而不是找不到。

用户回应：对，这个观点更本质。

**结论**：该观点被推翻，演化为"用户在不清楚自己需求时，需要帮助明确需求"。

---

### 观点2："问题的核心是信息过载"
**提出者**：架构师（第2轮）
**最终状态**：✅ 存活

**演化过程**：

**第2轮攻击** - 刺客
> @架构师 针对"信息过载是核心问题"，如何证明？
> 你需要提供可验证的证据。

用户回应：我会通过用户访谈验证，如果少于30%的人提到信息过载，则该假设错误。

**第3轮** - 无新攻击
刺客和用户鬼均未提出新的攻击点，该观点进入假设清单。

---
```

### 5.3 下一步行动（Next Actions）

**定义**：基于辩论结论和假设清单，生成具体的验证实验设计。

#### 5.3.1 数据结构

```typescript
interface NextAction {
  id: string;
  title: string;                  // 行动标题
  type: 'interview' | 'prototype' | 'data_analysis' | 'experiment' | 'research';
  priority: 'P0' | 'P1' | 'P2';
  relatedHypotheses: string[];    // 关联的假设ID
  description: string;            // 详细描述
  expectedOutcome: string;        // 预期结果
  timeEstimate: string;           // 时间估计
  resources: string[];            // 所需资源
  successCriteria: string;        // 成功标准
  owner?: string;                 // 负责人
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  createdAt: Date;
}
```

#### 5.3.2 行动生成规则

**规则**：每条假设至少对应1个下一步行动。

**示例**：

```json
{
  "id": "action-001",
  "title": "用户访谈：验证信息过载假设",
  "type": "interview",
  "priority": "P0",
  "relatedHypotheses": ["hyp-001"],
  "description": "对20个目标用户进行30分钟深度访谈，询问他们在选择产品时遇到的最大困难。重点观察他们是否主动提到'信息太多'、'不知道怎么选'等关键词。",
  "expectedOutcome": "如果至少6个用户(30%)提到信息过载，则假设通过第一轮验证；如果少于6个，则该假设被证伪，需要重新定义问题。",
  "timeEstimate": "1周（每天访谈3人）",
  "resources": [
    "访谈提纲模板",
    "20个目标用户联系方式",
    "录音设备",
    "笔记工具"
  ],
  "successCriteria": "完成20个有效访谈，记录完整，至少30%的用户提到关键问题",
  "status": "pending"
}
```

### 5.4 MVP边界定义（MVP Boundary）

**定义**：明确界定第一个版本"做什么"和"不做什么"，暴力切割。

#### 5.4.1 数据结构

```typescript
interface MVPBoundary {
  sessionId: string;
  coreProblem: string;            // 核心问题（一句话）
  targetUser: string;             // 目标用户
  mustHave: Feature[];            // 必须做（不超过3个）
  shouldNotHave: Feature[];       // 明确不做（至少5个）
  reasoning: {
    whyTheseFeatures: string;     // 为什么选这3个
    whyNotOthers: string;         // 为什么不做其他的
  };
  timeframe: string;              // MVP交付时间
  successMetric: string;          // 成功指标
  generatedAt: Date;
}

interface Feature {
  name: string;
  description: string;
  reason: string;                 // 做/不做的理由
  relatedHypotheses: string[];
}
```

#### 5.4.2 MVP边界生成规则

**强制约束**：
- `mustHave` 不超过3个功能
- `shouldNotHave` 至少5个功能
- 每个功能必须关联至少1个假设

**示例**：

```json
{
  "coreProblem": "用户在不清楚自己需求时，难以快速明确想要什么产品",
  "targetUser": "25-35岁一线城市白领，有购买力但选择困难",
  "mustHave": [
    {
      "name": "需求澄清对话",
      "description": "通过3-5个问题帮助用户澄清自己的真实需求",
      "reason": "直接验证假设'用户需要帮助明确需求'",
      "relatedHypotheses": ["hyp-001", "hyp-003"]
    },
    {
      "name": "需求-产品匹配",
      "description": "基于澄清后的需求，推荐最多3个产品",
      "reason": "验证假设'明确需求后，少量精准推荐比海量选择更有效'",
      "relatedHypotheses": ["hyp-002"]
    },
    {
      "name": "决策记录",
      "description": "记录用户的决策过程和最终选择，用于迭代优化",
      "reason": "收集数据以验证后续假设",
      "relatedHypotheses": ["hyp-004"]
    }
  ],
  "shouldNotHave": [
    {
      "name": "用户评论社区",
      "reason": "增加信息过载，与核心问题相悖"
    },
    {
      "name": "比价功能",
      "reason": "问题还没验证，不做方案扩展"
    },
    {
      "name": "产品详情页",
      "reason": "MVP阶段跳转到第三方即可，不自建"
    },
    {
      "name": "用户画像分析",
      "reason": "数据量不足，过早优化"
    },
    {
      "name": "AI智能推荐算法",
      "reason": "MVP阶段用规则引擎即可，不需要AI"
    }
  ],
  "reasoning": {
    "whyTheseFeatures": "这3个功能直接验证核心假设：用户是否需要帮助澄清需求？澄清后是否能更快做决策？整个流程在24小时内可以跑通。",
    "whyNotOthers": "其他功能要么增加复杂度（评论、比价），要么是过早优化（画像、AI），要么与核心问题无关（详情页）。MVP的唯一目标是验证假设，不是做完整产品。"
  },
  "timeframe": "2周开发 + 1周测试 = 3周交付MVP",
  "successMetric": "20个用户中，至少12个(60%)在使用需求澄清对话后，能在5分钟内完成决策（vs 未使用时平均15分钟）"
}
```

### 5.5 导出格式

#### 5.5.1 Markdown 导出

**文件结构**：
```
session-{id}-export.md
├── 1. 会话概览
├── 2. 辩论记录（完整对话）
├── 3. 假设清单
├── 4. 冲突记录
├── 5. 下一步行动
└── 6. MVP边界定义
```

**模板示例**：
```markdown
# ProdMind 会话导出

**会话ID**: {sessionId}
**创建时间**: {createdAt}
**状态**: {status}

---

## 1. 会话概览

- 总轮数：{totalRounds}
- 总冲突数：{totalConflicts}
- 生成假设：{hypothesesCount} 条
- 下一步行动：{actionsCount} 项

---

## 2. 辩论记录

### 第1轮

**[架构师]**
{content}

**[刺客]**
{content}

**[用户鬼]**
{content}

**[用户回应]**
{content}

**[落地者]**
{content}

---

## 3. 假设清单

### 假设1：{content}
- **类型**: {category}
- **置信度**: {confidence}
- **如何证明我错了**: {falsifiability.statement}
- **验证方法**: {falsifiability.method}
- **时间框架**: {falsifiability.timeframe}
- **成功标准**: {falsifiability.successCriteria}

---

## 4. 冲突记录

{conflictLog的markdown格式}

---

## 5. 下一步行动

### P0 行动

#### {title}
- **类型**: {type}
- **关联假设**: {relatedHypotheses}
- **描述**: {description}
- **预期结果**: {expectedOutcome}
- **时间估计**: {timeEstimate}
- **成功标准**: {successCriteria}

---

## 6. MVP边界定义

### 核心问题
{coreProblem}

### 目标用户
{targetUser}

### 必须做（Must Have）
1. **{name}**: {description}
   - 理由：{reason}

### 明确不做（Should NOT Have）
1. **{name}**: {reason}

### 设计理由
**为什么选这些功能**：
{reasoning.whyTheseFeatures}

**为什么不做其他的**：
{reasoning.whyNotOthers}

### 时间框架
{timeframe}

### 成功指标
{successMetric}
```

#### 5.5.2 JSON Schema 导出

```typescript
interface SessionExport {
  meta: {
    sessionId: string;
    exportedAt: Date;
    version: string;  // export schema version
  };
  session: {
    id: string;
    createdAt: Date;
    status: string;
    totalRounds: number;
  };
  debate: {
    rounds: {
      roundNumber: number;
      messages: RoleResponse[];
      userResponse: string;
    }[];
  };
  outputs: {
    hypotheses: Hypothesis[];
    conflicts: ConflictLog;
    nextActions: NextAction[];
    mvpBoundary: MVPBoundary;
  };
}
```

**导出文件名**：`prodmind-session-{id}-{timestamp}.json`

---

## Part 6：界面与交互

### 6.1 整体布局（对话流 + 右侧产出面板）

**布局结构**：

```
┌─────────────────────────────────────────────────────────┐
│  Header                                                  │
│  ProdMind | [当前会话标题] | [语言切换 中/EN]           │
└─────────────────────────────────────────────────────────┘
┌──────────────────────────┬──────────────────────────────┐
│                          │                              │
│   对话流区域（左）        │   产出面板（右，30%宽度）      │
│   (70%宽度)              │                              │
│                          │  ┌─────────────────────┐    │
│  ┌────────────────┐      │  │ Tab: 假设清单        │    │
│  │ [用户输入]     │      │  ├─────────────────────┤    │
│  └────────────────┘      │  │ • 假设1             │    │
│         ↓                │  │ • 假设2             │    │
│  ┌────────────────┐      │  │ • 假设3             │    │
│  │ [架构师]       │      │  └─────────────────────┘    │
│  └────────────────┘      │                              │
│         ↓                │  ┌─────────────────────┐    │
│  ┌──────┬─────────┐      │  │ Tab: 冲突记录        │    │
│  │[刺客]│[用户鬼] │      │  ├─────────────────────┤    │
│  └──────┴─────────┘      │  │ 观点演化链...        │    │
│         ↓                │  └─────────────────────┘    │
│  ┌────────────────┐      │                              │
│  │ [用户回应输入] │      │  ┌─────────────────────┐    │
│  └────────────────┘      │  │ Tab: 下一步行动      │    │
│         ↓                │  └─────────────────────┘    │
│  ┌────────────────┐      │                              │
│  │ [落地者]       │      │  ┌─────────────────────┐    │
│  └────────────────┘      │  │ Tab: MVP边界         │    │
│                          │  └─────────────────────┘    │
│                          │                              │
│                          │  [导出] [继续辩论]           │
└──────────────────────────┴──────────────────────────────┘
```

### 6.2 辩论对话流设计

#### 6.2.1 消息卡片样式

**架构师消息**：
- 头像图标：蓝色 🏗️
- 背景色：浅蓝色 (#E3F2FD)
- 左边框：蓝色粗线（4px）
- 标签："架构师 | Architect"

**刺客消息**：
- 头像图标：红色 ⚔️
- 背景色：浅红色 (#FFEBEE)
- 左边框：红色粗线（4px）
- 标签："刺客 | Assassin"
- 引用部分：黄色高亮

**用户鬼消息**：
- 头像图标：绿色 👤
- 背景色：浅绿色 (#E8F5E9)
- 左边框：绿色粗线（4px）
- 标签："用户鬼 | User Ghost"
- 引用部分：黄色高亮

**落地者消息**：
- 头像图标：灰色 📋
- 背景色：浅灰色 (#F5F5F5)
- 左边框：灰色粗线（4px）
- 标签："落地者 | Grounder"

**用户消息**：
- 头像图标：紫色 💬
- 背景色：白色
- 右对齐（类似聊天应用）
- 标签："你 | You"

#### 6.2.2 引用高亮

**当鼠标悬停在 `@角色名 针对[观点]` 时**：
- 被引用的原消息自动滚动到可视区域
- 被引用部分添加黄色高亮（持续2秒）
- 虚线箭头连接引用和被引用消息

**点击引用时**：
- 展开完整的冲突链（该观点的所有攻击记录）

#### 6.2.3 强制参与点UI

**当用户需要回应时**：

```
┌────────────────────────────────────────────────┐
│  ⚠️ 你必须回应以下质疑才能继续                  │
├────────────────────────────────────────────────┤
│  刺客和用户鬼提出了以下质疑：                    │
│  [刺客的攻击内容]                               │
│  [用户鬼的质疑内容]                             │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 在此输入你的回应...                       │ │
│  │ （至少50字）                              │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  [回应并继续] （灰色禁用，直到输入50字）        │
└────────────────────────────────────────────────┘
```

**字数实时统计**：
- 输入框下方显示："已输入 {count}/50 字"
- 未满50字时，按钮禁用且显示灰色
- 满50字后，按钮启用且显示蓝色

### 6.3 产出面板实时更新

**Tab切换**：
- 假设清单 | Hypotheses
- 冲突记录 | Conflicts
- 下一步行动 | Actions
- MVP边界 | MVP Boundary

**实时更新行为**：
- 每轮辩论结束后，对应Tab的红点提示"+1"
- 新增内容淡入动画（300ms）
- 点击Tab后红点消失

**假设清单Tab示例**：

```
┌──────────────────────────────────────┐
│ 假设清单 (3)                         │
├──────────────────────────────────────┤
│ ✅ 假设1：用户需要帮助明确需求        │
│    置信度：Medium                     │
│    如何证伪：如果用户访谈中...        │
│    [展开详情]                         │
├──────────────────────────────────────┤
│ ✅ 假设2：信息过载是核心问题          │
│    置信度：High                       │
│    [展开详情]                         │
├──────────────────────────────────────┤
│ ❌ 假设3：用户需要推荐系统（已推翻）   │
│    [查看推翻过程]                     │
└──────────────────────────────────────┘
```

### 6.4 角色视觉区分

**配色方案**：

| 角色 | 主色 | 图标 | 边框 | 背景 |
|------|------|------|------|------|
| 架构师 | #2196F3 (蓝) | 🏗️ | 4px实线 | #E3F2FD |
| 刺客 | #F44336 (红) | ⚔️ | 4px实线 | #FFEBEE |
| 用户鬼 | #4CAF50 (绿) | 👤 | 4px实线 | #E8F5E9 |
| 落地者 | #9E9E9E (灰) | 📋 | 4px实线 | #F5F5F5 |
| 用户 | #9C27B0 (紫) | 💬 | 无 | #FFFFFF |

**排版规范**：
- 消息内边距（padding）：16px
- 消息间距（margin-bottom）：12px
- 字体大小：正文14px，角色标签12px
- 行高：1.6

### 6.5 中英双语切换

**切换位置**：Header右上角

**切换按钮**：
```
[中文 | EN]   ← 点击切换
```

**切换范围**：
- UI界面文字（按钮、标签、提示）
- 角色标签（"架构师" ↔ "Architect"）
- Tab标题（"假设清单" ↔ "Hypotheses"）
- 系统提示语

**不切换的内容**：
- AI生成的对话内容（跟随用户输入语言）
- 用户输入内容
- 导出的产出物内容

**语言自动适配**：
- 用户输入中文 → AI回复中文
- 用户输入英文 → AI回复英文
- 在AI prompt中添加语言指令：
  ```
  You must respond in the same language as the user's input.
  If user writes in Chinese, respond in Chinese.
  If user writes in English, respond in English.
  ```

---

## Part 7：用户系统与数据

### 7.1 邮箱密码注册/登录

**注册流程**：

```
1. 用户输入：
   - 邮箱
   - 密码（最少8位，包含字母+数字）
   - 确认密码

2. 系统验证：
   - 邮箱格式正确
   - 邮箱未被注册
   - 密码强度符合要求
   - 两次密码一致

3. 发送验证邮件：
   - 包含6位数验证码
   - 有效期10分钟

4. 用户输入验证码

5. 注册成功，自动登录
```

**登录流程**：

```
1. 用户输入：
   - 邮箱
   - 密码

2. 系统验证：
   - 邮箱存在
   - 密码正确

3. 登录成功，跳转到会话列表
```

**技术实现**：

```typescript
// Next.js API Route: /api/auth/register
export async function POST(req: Request) {
  const { email, password } = await req.json();

  // 验证邮箱格式
  if (!isValidEmail(email)) {
    return Response.json({ error: 'Invalid email' }, { status: 400 });
  }

  // 检查邮箱是否已注册
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return Response.json({ error: 'Email already registered' }, { status: 409 });
  }

  // 哈希密码
  const hashedPassword = await bcrypt.hash(password, 10);

  // 创建用户
  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      emailVerified: false
    }
  });

  // 发送验证邮件
  await sendVerificationEmail(email);

  return Response.json({ userId: user.id, message: 'Verification email sent' });
}
```

### 7.2 会话完整持久化

**数据库Schema（Prisma）**：

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  sessions      Session[]
}

model Session {
  id           String    @id @default(cuid())
  userId       String
  user         User      @relation(fields: [userId], references: [id])
  title        String    @default("未命名想法")
  status       String    @default("active")  // active | archived
  createdAt    DateTime  @default(now())
  lastActiveAt DateTime  @default(now())
  totalRounds  Int       @default(0)

  // 辩论记录
  debates      Debate[]

  // 产出物
  hypotheses   Hypothesis[]
  conflicts    Conflict[]
  actions      NextAction[]
  mvpBoundary  MVPBoundary?
}

model Debate {
  id         String   @id @default(cuid())
  sessionId  String
  session    Session  @relation(fields: [sessionId], references: [id])
  round      Int
  role       String   // architect | assassin | userGhost | grounder | user
  content    String   @db.Text
  createdAt  DateTime @default(now())
}

model Hypothesis {
  id              String   @id @default(cuid())
  sessionId       String
  session         Session  @relation(fields: [sessionId], references: [id])
  content         String   @db.Text
  category        String
  confidence      String
  falsifiabilityStatement String @db.Text
  falsifiabilityMethod    String @db.Text
  falsifiabilityTimeframe String
  falsifiabilitySuccessCriteria String @db.Text
  proposedBy      String
  proposedRound   Int
  status          String   @default("active")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Conflict {
  id             String   @id @default(cuid())
  sessionId      String
  session        Session  @relation(fields: [sessionId], references: [id])
  round          Int
  attacker       String
  target         String
  targetOpinion  String   @db.Text
  attackContent  String   @db.Text
  attackStrength String
  isRefuted      Boolean  @default(false)
  userResponse   String?  @db.Text
  createdAt      DateTime @default(now())
}

model NextAction {
  id               String   @id @default(cuid())
  sessionId        String
  session          Session  @relation(fields: [sessionId], references: [id])
  title            String
  type             String
  priority         String
  description      String   @db.Text
  expectedOutcome  String   @db.Text
  timeEstimate     String
  successCriteria  String   @db.Text
  status           String   @default("pending")
  createdAt        DateTime @default(now())
}

model MVPBoundary {
  id            String   @id @default(cuid())
  sessionId     String   @unique
  session       Session  @relation(fields: [sessionId], references: [id])
  coreProblem   String   @db.Text
  targetUser    String   @db.Text
  mustHave      Json     // Feature[]
  shouldNotHave Json     // Feature[]
  reasoning     Json     // {whyTheseFeatures, whyNotOthers}
  timeframe     String
  successMetric String   @db.Text
  createdAt     DateTime @default(now())
}
```

### 7.3 历史会话管理

**会话列表页面**：

```
┌────────────────────────────────────────────────┐
│  我的会话                          [+ 新建会话] │
├────────────────────────────────────────────────┤
│  🟢 活跃会话 (2)                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 📝 "用户需求澄清产品"                     │ │
│  │ 创建：2天前 | 最后活跃：1小时前 | 3轮辩论  │ │
│  │ [继续] [归档] [导出]                      │ │
│  └──────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────┐ │
│  │ 📝 "AI代码审查工具"                       │ │
│  │ 创建：5天前 | 最后活跃：3天前 | 5轮辩论   │ │
│  │ [继续] [归档] [导出]                      │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  📦 已归档会话 (5)                             │
│  [展开查看]                                    │
└────────────────────────────────────────────────┘
```

**48小时自动归档**：

```typescript
// Next.js API Route (Cron): /api/cron/archive-sessions
export async function GET(req: Request) {
  // 验证Cron密钥（安全性）
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const cutoffTime = new Date(now.getTime() - 48 * 60 * 60 * 1000);  // 48小时前

  // 查找需要归档的会话
  const sessionsToArchive = await db.session.findMany({
    where: {
      status: 'active',
      lastActiveAt: {
        lt: cutoffTime
      }
    },
    include: {
      user: true
    }
  });

  // 归档
  for (const session of sessionsToArchive) {
    await db.session.update({
      where: { id: session.id },
      data: { status: 'archived' }
    });

    // 发送通知邮件
    await sendEmail({
      to: session.user.email,
      subject: 'ProdMind 会话已归档',
      body: `你的会话"${session.title}"已超过48小时未活动，已自动归档。你仍可查看记录或基于此创建新会话。`
    });
  }

  return Response.json({ archivedCount: sessionsToArchive.length });
}
```

**Vercel Cron配置（vercel.json）**：

```json
{
  "crons": [
    {
      "path": "/api/cron/archive-sessions",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### 7.4 数据存储方案

**技术栈**：
- 数据库：PostgreSQL（Vercel Postgres）
- ORM：Prisma
- 部署：Vercel
- 文件存储（导出文件）：Vercel Blob Storage

**数据备份**：
- 每日自动备份到Vercel Postgres备份
- 用户可随时导出Markdown/JSON

---

## Part 8：技术约束

### 8.1 Next.js 全栈架构

**技术选型**：

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| UI库 | React 18 |
| 样式 | Tailwind CSS + shadcn/ui |
| 状态管理 | Zustand (轻量级) |
| 数据库 | PostgreSQL (Vercel Postgres) |
| ORM | Prisma |
| 认证 | NextAuth.js (可选) 或 自建 |
| AI调用 | Vercel AI SDK |
| 部署 | Vercel |

**目录结构**：

```
prodmind/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── sessions/
│   │   └── session/[id]/
│   ├── api/
│   │   ├── auth/
│   │   ├── sessions/
│   │   ├── debate/
│   │   └── cron/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── debate/
│   │   ├── RoleMessage.tsx
│   │   ├── UserInput.tsx
│   │   └── ConflictHighlight.tsx
│   ├── outputs/
│   │   ├── HypothesisList.tsx
│   │   ├── ConflictLog.tsx
│   │   ├── NextActions.tsx
│   │   └── MVPBoundary.tsx
│   └── ui/  (shadcn/ui components)
├── lib/
│   ├── ai/
│   │   ├── role-agents.ts
│   │   ├── conflict-engine.ts
│   │   └── model-router.ts
│   ├── db/
│   │   └── prisma.ts
│   └── utils/
├── prisma/
│   └── schema.prisma
├── public/
└── package.json
```

### 8.2 多模型API对接

**使用 Vercel AI SDK**：

```typescript
// lib/ai/model-router.ts
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

export const modelRouter = {
  architect: openai('gpt-4-turbo'),          // 或 anthropic('claude-opus-4')
  assassin: anthropic('claude-opus-4'),
  userGhost: openai('gpt-4-turbo'),
  grounder: openai('gpt-4-turbo'),
};

// 根据配置动态切换
export function getModelForRole(role: RoleType, config?: RoleModelConfig) {
  if (config) {
    const roleConfig = config[role];
    if (roleConfig.provider === 'anthropic') {
      return anthropic(roleConfig.model);
    } else if (roleConfig.provider === 'google') {
      return google(roleConfig.model);
    } else {
      return openai(roleConfig.model);
    }
  }
  return modelRouter[role];  // 默认配置
}
```

**API密钥管理（环境变量）**：

```env
# .env.local
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

### 8.3 实时流式输出

**使用 Vercel AI SDK 的 streamText**：

```typescript
// app/api/debate/route.ts
import { streamText } from 'ai';
import { getModelForRole } from '@/lib/ai/model-router';

export async function POST(req: Request) {
  const { sessionId, role, context } = await req.json();

  const model = getModelForRole(role);
  const systemPrompt = getRoleSystemPrompt(role);

  const result = await streamText({
    model,
    system: systemPrompt,
    prompt: context.userInput,
    temperature: role === 'assassin' ? 0.8 : 0.3,
  });

  // 返回流式响应
  return result.toAIStreamResponse();
}
```

**前端接收流式响应**：

```typescript
// components/debate/DebateSession.tsx
import { useChat } from 'ai/react';

export function DebateSession({ sessionId }: { sessionId: string }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/debate',
    body: { sessionId },
  });

  return (
    <div>
      {messages.map(msg => (
        <RoleMessage key={msg.id} message={msg} />
      ))}

      {isLoading && <LoadingIndicator />}

      <UserInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
```

### 8.4 MVP免费（无付费模块）

**MVP阶段**：
- 所有功能完全免费
- 无需集成支付系统
- 无使用次数限制

**成本控制**：
- 限制每个用户最多创建10个活跃会话
- 每个会话最多8轮辩论
- 使用Vercel免费额度（Hobby Plan）
- AI调用成本由开发者承担（预算内测试）

**后续商业化预留**：
- 数据库Schema中预留 `User.plan` 字段（free | pro）
- 预留 `/api/billing` 路由目录
- 但MVP不实现任何付费逻辑

---

## Part 9：MVP边界

### 9.1 P0（必须做）清单

**核心功能**（3周内交付）：

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 1. 用户注册/登录 | 邮箱密码，邮箱验证 | P0 |
| 2. 创建会话 | 用户输入产品想法，启动新会话 | P0 |
| 3. 四角色辩论流程 | 架构师→并行攻击(刺客+用户鬼)→用户回应→落地者收敛 | P0 |
| 4. 强制引用机制 | 严格格式化引用，自动检测和重试 | P0 |
| 5. 盲点爆破（3条规则） | 全员同意、无用户视角、技术过载自动触发 | P0 |
| 6. 强制用户参与 | 每轮必须回应质疑（50字限制） | P0 |
| 7. 假设稳定收敛 | 连续2轮无变化自动收敛 | P0 |
| 8. 4类产出物生成 | 假设清单、冲突记录、下一步行动、MVP边界 | P0 |
| 9. 对话流+产出面板UI | 左右布局，实时更新 | P0 |
| 10. 冲突高亮追踪 | 引用关系高亮，冲突链可视化 | P0 |
| 11. Markdown导出 | 完整会话导出为Markdown | P0 |
| 12. JSON导出 | 结构化数据导出 | P0 |
| 13. 会话持久化 | 完整存储所有辩论记录和产出物 | P0 |
| 14. 48小时归档 | 自动归档超时会话 | P0 |
| 15. 中英双语UI | 界面支持中英切换 | P0 |

### 9.2 P1（下一版）清单

**扩展功能**（MVP后4-6周）：

| 功能 | 描述 | 为什么不是P0 |
|------|------|-------------|
| 1. OAuth登录 | Google/GitHub第三方登录 | MVP用邮箱足够，OAuth降低优先级 |
| 2. 实时联网搜索 | 自动搜索竞品、市场数据 | 成本高、可能幻觉，MVP不做 |
| 3. 动态画布预览 | 侧边栏可视化画布 | 开发量大，MVP用表格替代 |
| 4. 会话分享 | 生成分享链接，其他人可查看 | 协作功能，MVP不需要 |
| 5. 评论与批注 | 对产出物添加评论 | 单人使用场景下不必要 |
| 6. 假设验证追踪 | 记录假设验证进度和结果 | 需要长期跟踪，MVP只生成假设 |
| 7. 模型配置界面 | 用户自选不同AI模型组合 | 技术用户功能，MVP用默认配置 |
| 8. PDF导出 | 导出为PDF格式 | Markdown已足够，PDF是锦上添花 |

### 9.3 P2（远期）清单

**探索功能**（3个月后考虑）：

| 功能 | 描述 | 为什么延后 |
|------|------|-----------|
| 1. 角色市场 | 用户自定义角色、分享角色 | 需要成熟的社区生态 |
| 2. 团队协作 | 多人同时参与一个会话 | 复杂度高，需求不明确 |
| 3. 知识库集成 | 连接Notion/Confluence等 | 需要大量集成工作 |
| 4. 移动端App | iOS/Android原生应用 | Web端验证后再考虑 |
| 5. Chrome插件 | 在任何网页上启动辩论 | 需要清晰的使用场景 |

### 9.4 明确的"不做"清单

**永远不做**（与产品哲学冲突）：

| 功能 | 理由 |
|------|------|
| 1. 完整PRD生成 | 违反"假设优于文档"原则 |
| 2. 方案自动生成 | 违反"问题先于方案"原则 |
| 3. 一键通过 | 违反"强制对抗"原则 |
| 4. 无冲突模式 | 违反"反共识即默认态"原则 |
| 5. AI总结替代阅读 | 违反"思考必须留下残骸"原则 |
| 6. 跳过用户参与 | 违反"结构强制先于自律"原则 |

**短期内不做**（成本/收益不匹配）：

| 功能 | 理由 |
|------|------|
| 1. 语音输入/输出 | 文字输入已足够，语音增加复杂度 |
| 2. 视频通话集成 | 不符合异步思考场景 |
| 3. AI生成PPT | 产出物已有Markdown，不需要PPT |
| 4. 思维导图生成 | Markdown + JSON导出后可用第三方工具 |
| 5. 竞品自动分析 | 需要爬虫+数据源，成本高 |

---

## 附录：关键决策记录

**本PRD基于以下18项关键决策**：

| # | 决策项 | 选择 |
|---|--------|------|
| 1 | 约束强度 | 教练模式（强制不可跳过） |
| 2 | 目标用户 | 独立开发者+初级PM，不区分体验 |
| 3 | 产品形态 | Web应用 |
| 4 | 辩论流程 | 定义→并行攻击→收敛 |
| 5 | 用户参与 | 强制参与每轮 |
| 6 | 会话范围 | 单想法完整流程 |
| 7 | 产出物 | 假设清单+冲突记录+下一步行动+MVP边界定义（全选） |
| 8 | 模型策略 | 多模型混合路由 |
| 9 | 会话持久化 | 完整持久化 |
| 10 | 盲点触发 | 固定规则自动触发 |
| 11 | 引用机制 | 严格格式化引用 |
| 12 | 收敛条件 | 假设稳定时收敛 |
| 13 | 用户认证 | 邮箱密码 |
| 14 | 商业模式 | MVP免费 |
| 15 | 导出格式 | Markdown + JSON |
| 16 | 技术栈 | Next.js全栈 |
| 17 | 界面布局 | 对话流+右侧产出面板 |
| 18 | 产品语言 | 中英双语 |

**参考文档**：
- [产品结构提炼-ProdMind.md](产品结构提炼-ProdMind.md)
- [ai-sidekick-chat-1770953412659.md](ai-sidekick-chat-1770953412659.md)

---

**文档版本**: v1.0
**最后更新**: 2026-02-13
**下一步**: 基于本PRD开始技术选型和原型开发


