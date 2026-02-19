# ProdMind 2.0 — 决策结构操作系统

## 一、产品定位

### 1.1 核心定位
ProdMind 2.0 是一个**多智能体 + 人在环路 + 状态驱动**的决策压力测试系统。

不是：对话机器人 / 思考工具箱 / 头脑风暴助手
而是：决策结构操作系统

### 1.2 与 ProdMind 1.0 的关系
| 版本 | 本质 |
|------|------|
| ProdMind 1.0 | 产品问题定义 + 认知对抗（4角色） |
| ProdMind 2.0 | 多层决策压力测试操作系统（6角色） |

ProdMind 1.0 的核心能力（问题定义、对抗辩论、假设证伪）成为 2.0 的第一层模块。

### 1.3 核心哲学
1. 所有重大问题，必须经过结构过滤（不允许情绪/直觉/群体共识立项）
2. 所有判断，都必须暴露假设（隐含假设 = 最大风险源）
3. 所有方案，都必须承受对抗推演
4. 决策的价值，在于长期资产积累（判断力/复利/抗风险）
5. 思考轨迹本身是资产（决策日志 > 决策结果）

### 1.4 目标用户
- 创业者
- 技术负责人
- 产品负责人
- 小团队管理者

### 1.5 核心目标
- 提高重大决策胜率
- 降低方向性错误成本
- 形成个人认知进化轨迹

## 二、系统总体架构

### 2.1 五层结构

```
决策会话（Decision Session）
├── Layer 1：问题建模层（ProdMind 核心进化）
├── Layer 2：结构扫描层
├── Layer 3：对抗推演层
├── Layer 4：长期资产层
└── Layer 5：认知记录层
```

### 2.2 会话状态树

```
Decision Session
├── 状态树（Decision State Tree）
├── 假设库（Assumption Registry）
├── 风险库（Risk Registry）
├── 推演路径图（Simulation Graph）
├── 多智能体发言记录
└── 决策版本历史（Snapshots）
```

## 三、六大智能体角色

### 3.1 问题澄清官（Problem Architect）
- 继承 ProdMind 1.0 架构师核心能力
- 职责：识别问题类型、强制显性化假设、识别偷换问题
- 触发时机：会话开始、用户修改目标时
- 输出：问题定义版本（Problem_vN）

### 3.2 批判官（Critical Examiner）
- 职责：找逻辑漏洞、查证数据来源、识别认知偏见
- 触发时机：假设未验证比例 > 50% 时自动触发
- 输出：逻辑漏洞清单、偏见标记

### 3.3 系统分析官（System Mapper）
- 职责：识别因果回路、延迟效应、反馈结构
- 触发时机：问题涉及多变量或长期影响时
- 输出：因果关系图、系统动态分析

### 3.4 反对者代理（Devil's Advocate）
- 继承 ProdMind 1.0 刺客核心能力，升级为结构化反对
- 职责：生成最强反对论证、构造失败路径、推演最坏情境
- 触发时机：每轮必触发（压力测试核心）
- 输出：反对论证、失败路径图

### 3.5 风险与杠铃策略官（Risk Architect）
- 职责：识别风险集中度、拆分"核心+小试验"、判断可逆性
- 触发时机：风险集中度高时自动触发
- 输出：风险评估、杠铃策略建议

### 3.6 长期价值官（Strategic Capital Evaluator）
- 职责：评估是否积累资产、是否形成复利、是否增强抗风险能力
- 触发时机：进入长期评估阶段
- 输出：长期价值评分、复利潜力指数

## 四、状态驱动多轮演化

### 4.1 核心原则
每一轮不是简单回复，而是：输入变化 → 结构更新 → 角色再推演 → 状态重算。

### 4.2 会话状态模型
每次决策会话包含以下可版本化状态：

| 状态项 | 说明 |
|--------|------|
| Problem_vN | 问题定义版本，用户每次修改目标时递增 |
| Assumption[] | 假设列表，每条标记 validated / unvalidated |
| Risk[] | 风险列表，每条含 probability + severity |
| SimulationPath[] | 推演路径（保守/激进/分阶段） |
| ConfidenceIndex | 决策信心指数（假设验证比例 × 风险暴露程度 × 对抗强度） |

### 4.3 多轮流程
```
Step 1: 输入问题 → 生成 Problem_v1
Step 2: 结构扫描 → 生成 Assumption_v1[]
Step 3: 对抗推演 → 生成 Risk_v1[]
Step 4: 人修改目标 → Problem_v2（触发重新推演）
Step 5: 系统重新推演 → 更新所有状态
Step 6: 生成 DecisionSnapshot
Step 7: 进入长期评估 → 输出决策报告
```

## 五、人在环路机制

人不是回答问题的角色，而是决策负责人。拥有三种权限：

### 5.1 修改结构
- 删除/新增假设
- 增加/修改约束条件
- 修改决策目标（触发 Problem 版本递增 + 全局重新推演）

### 5.2 驳回智能体结论
- 可驳回任意智能体的某条结论
- 系统必须基于驳回理由重新推演受影响的状态

### 5.3 强制推进
- 可跳过当前阶段进入下一层
- 系统记录为"高风险强制决策"，标记未完成的检查项

## 六、决策版本控制

### 6.1 快照机制
每次重大修改（问题定义变更、假设增删、风险重评）自动生成 DecisionSnapshot，记录：
- 问题定义版本
- 假设清单及验证状态
- 风险清单及评级
- 推演结论
- 人的最终判断

### 6.2 版本对比
支持任意两个快照之间的差异对比：
- 假设变化轨迹
- 风险变化趋势
- 决策信心指数变化

## 七、智能体调度引擎

不再固定轮流发言，而是根据当前状态决定哪个角色优先：

| 条件 | 触发角色 |
|------|----------|
| 会话开始 / 目标变更 | 问题澄清官 |
| 假设未验证比例 > 50% | 批判官 |
| 问题涉及多变量 / 长周期 | 系统分析官 |
| 每轮必触发 | 反对者代理 |
| 风险集中度高 | 风险官 |
| 进入收敛阶段 | 长期价值官 |

调度优先级：问题澄清官 > 批判官 > 系统分析官 > 反对者代理 > 风险官 > 长期价值官

## 八、数据结构

### 8.1 核心实体

```typescript
interface DecisionSession {
  id: string;
  title: string;
  createdAt: string;
  stateTree: DecisionStateTree;
  snapshots: DecisionSnapshot[];
  agentComments: AgentComment[];
}

interface DecisionStateTree {
  problem: ProblemDefinition;
  assumptions: Assumption[];
  risks: Risk[];
  simulationPaths: SimulationPath[];
  confidenceIndex: number;
}

interface ProblemDefinition {
  version: number;
  description: string;
  expectedOutcome: string;
  constraints: string[];
  irreversibleCosts: string[];
}

interface Assumption {
  id: string;
  content: string;
  status: 'validated' | 'unvalidated' | 'rejected';
  source: string; // 哪个角色提出
}

interface Risk {
  id: string;
  content: string;
  probability: 'high' | 'medium' | 'low';
  severity: 'high' | 'medium' | 'low';
}

interface SimulationPath {
  id: string;
  label: string; // 保守 / 激进 / 分阶段
  steps: string[];
  outcome: string;
}

interface AgentComment {
  round: number;
  agent: string;
  content: string;
  timestamp: string;
}

interface DecisionSnapshot {
  version: number;
  timestamp: string;
  stateTree: DecisionStateTree;
  humanJudgment: string;
  trigger: string; // 什么操作触发了快照
}
```

## 九、五层详细需求

### Layer 1：问题建模层（ProdMind 核心进化）
- 问题类型识别：决策 / 创新 / 风险 / 战略 / 执行优化
- 强制问题定义模板：当前描述、期望结果、约束条件、不可逆成本、隐含假设
- 假设显性化检查器：自动生成"你的结论依赖哪些前提？哪些未经验证？"

### Layer 2：结构扫描层
- 批判性检查：数据是否充分？是否有反例？是否混淆相关与因果？
- 系统思考扫描：是否存在反馈回路？延迟效应？局部最优？
- 第一性原理检查：当前方案基于什么类比？是否可拆解到底层约束？

### Layer 3：对抗推演层
- 最强反对者模式：自动生成最强反对论证、最坏情境推演、失败路径图
- 杠铃策略检测：是否风险集中？是否可拆为"保守核心 + 小比例试验"？

### Layer 4：长期资产层
- 强制回答：是否积累组织能力？是否形成可复用资产？是否提高判断力？
- 输出：长期价值评分、复利潜力指数

### Layer 5：认知记录层
- 决策日志：时间、判断、预测结果、实际结果
- 偏差分析：常见认知偏差、过度自信倾向、时间估计偏差
- 个人认知画像：决策风格类型、风险倾向指数、长期性评分

## 十、MVP 范围

### 10.1 CLI 版 MVP（必须包含）
- 6角色调度（按条件触发，非固定轮流）
- 状态持久化（假设库、风险库写入本地 JSON）
- 决策快照（每次重大修改自动生成）
- 假设显性化 + 验证状态标记
- 风险列表生成 + 严重度评级
- 人在环路：修改结构、驳回结论、强制推进
- Markdown 导出

### 10.2 CLI 版不做
- 因果循环图可视化
- 决策分叉图
- 偏差统计仪表盘
- 团队协作
- 认知画像（需要足够多历史数据）

### 10.3 Web 版进阶（后续）
- 结构面板 + 对话区混合界面
- 因果循环图可视化
- 决策历史时间线
- 快照对比视图
- 认知统计仪表盘
- 团队版多人决策对抗

## 十一、CLI 文件结构

```
prodmind2-cli/
├── src/
│   ├── index.ts              # 入口，CLI 命令路由
│   ├── session.ts            # 决策会话主循环
│   ├── state.ts              # 状态树管理（假设/风险/快照）
│   ├── scheduler.ts          # 智能体调度引擎
│   ├── roles/
│   │   ├── index.ts          # 统一调用接口
│   │   ├── problem-architect.ts
│   │   ├── critical-examiner.ts
│   │   ├── system-mapper.ts
│   │   ├── devils-advocate.ts
│   │   ├── risk-architect.ts
│   │   └── strategic-evaluator.ts
│   ├── storage.ts            # 本地 JSON 读写
│   └── export.ts             # Markdown 导出
├── prompts/
│   ├── problem-architect.md
│   ├── critical-examiner.md
│   ├── system-mapper.md
│   ├── devils-advocate.md
│   ├── risk-architect.md
│   └── strategic-evaluator.md
├── package.json
├── tsconfig.json
└── README.md
```

## 十二、成功指标

- 决策复盘完成率
- 日志记录频率
- 重大决策后满意度
- 方向性错误减少率
- 假设验证比例提升
