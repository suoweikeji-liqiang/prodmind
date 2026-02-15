/**
 * 冲突闭环规则检测模块
 *
 * 规则1：替代假设阻断 — 检测刺客/用户鬼是否提出了替代假设
 * 规则2：共识警报 — 检测角色观点趋同（升级版，跨轮次）
 * 规则5：强制证伪语句 — 检测落地者输出是否包含证伪检查块
 */

import type { Round } from './storage.js';

// ── 规则1：替代假设阻断 ──

export interface AlternativeHypothesis {
  source: string;
  content: string;
}

// ── v2 结构化标签检测 ──

const STRUCTURED_TAGS = ['流程瓶颈', '管理问题', '需求真实性', '现有方案足够', '成本不可承受'];
const STRUCTURED_TAG_PATTERN = /\[(?:流程瓶颈|管理问题|需求真实性|现有方案足够|成本不可承受|其他[：:](.+?))\]/;

const ALT_PATTERNS_ZH = [
  /可能不是(.+?)[，,]而是(.+?)(?:[。.！!？?\n]|$)/,
  /更底层的问题是[：:]?\s*(.+?)(?:[。.！!？?\n]|$)/,
  /也许根本不需要(.+?)(?:[。.！!？?\n]|$)/,
  /真正的问题可能是[：:]?\s*(.+?)(?:[。.！!？?\n]|$)/,
  /本质上是(.+?)而不是(.+?)(?:[。.！!？?\n]|$)/,
  /与其说是(.+?)[，,]不如说是(.+?)(?:[。.！!？?\n]|$)/,
  /也许问题不是(.+?)[，,]而是(.+?)(?:[。.！!？?\n]|$)/,
];

const ALT_PATTERNS_EN = [
  /not about (.+?), but (?:about )?(.+?)(?:[.\n]|$)/i,
  /the real problem is (.+?)(?:[.\n]|$)/i,
  /maybe (?:you |we )?don'?t (?:even )?need (.+?)(?:[.\n]|$)/i,
  /the underlying issue is (.+?)(?:[.\n]|$)/i,
];

export function detectAlternativeHypothesis(response: string, source: string): AlternativeHypothesis | null {
  // 优先检测 v2 结构化标签
  const tagMatch = response.match(STRUCTURED_TAG_PATTERN);
  if (tagMatch) {
    // 提取替代解释部分作为内容
    const altSection = response.match(/##\s*替代解释\s*\n([\s\S]*?)(?=\n##|$)/);
    const content = altSection
      ? altSection[1].replace(/^[-\s]*/gm, '').trim().split('\n')[0]
      : tagMatch[1]?.trim() || tagMatch[0].replace(/[\[\]]/g, '');
    if (content.length > 2) {
      return { source, content };
    }
  }

  // 回退到正则匹配
  for (const pattern of [...ALT_PATTERNS_ZH, ...ALT_PATTERNS_EN]) {
    const match = response.match(pattern);
    if (match) {
      const content = match[2]?.trim() || match[1]?.trim() || '';
      if (content.length > 2) {
        return { source, content };
      }
    }
  }
  return null;
}

// ── 规则2：共识警报 ──

const AGREE_KEYWORDS = ['同意', '没问题', '合理', '正确', '确实如此', '说得对', '赞同', 'agree', 'looks good', 'no problem', 'makes sense', 'correct', 'valid point'];
const ATTACK_KEYWORDS = ['但是', '然而', '问题在于', '不对', '错', '伪需求', '反对', '质疑', 'however', 'but', 'wrong', 'false', 'disagree', 'problem'];

function isWeakResponse(response: string): boolean {
  const lower = response.toLowerCase();
  const hasAgree = AGREE_KEYWORDS.some(kw => lower.includes(kw));
  const hasAttack = ATTACK_KEYWORDS.some(kw => lower.includes(kw));
  return hasAgree && !hasAttack;
}

export function detectConsensusAlert(
  assassinResponse: string,
  userGhostResponse: string,
  previousRounds: Round[]
): boolean {
  const assassinWeak = isWeakResponse(assassinResponse);
  const ghostWeak = isWeakResponse(userGhostResponse);

  // 单轮内双方均无实质攻击
  if (assassinWeak && ghostWeak) return true;

  // 连续2轮刺客趋同
  if (previousRounds.length >= 1 && assassinWeak) {
    const lastRound = previousRounds[previousRounds.length - 1];
    if (isWeakResponse(lastRound.assassin)) return true;
  }

  return false;
}

// ── 规则3：技术逃逸拦截 ──

const TECH_ESCAPE_ZH = [
  /AI.{0,10}(?:缩短|加速|提升|降低).{0,10}(?:周期|效率|质量|成本)/,
  /大模型.{0,10}(?:辅助|加速|赋能|提效)/,
  /不能.{0,10}传统.{0,10}(?:方式|方法).{0,10}评估/,
  /开发.{0,10}(?:很快|非常快|极快|成本.{0,5}(?:低|零|趋近))/,
  /(?:成本|开发).{0,10}趋近于零/,
  /技术.{0,10}(?:不是问题|已经成熟|可以解决)/,
];

const TECH_ESCAPE_EN = [
  /AI.{0,10}(?:accelerat|speed|reduc|lower).{0,10}(?:cost|cycle|time)/i,
  /(?:development|dev).{0,10}(?:is fast|very fast|cost.{0,5}zero)/i,
  /(?:LLM|large model|GPT).{0,10}(?:assist|boost|empower)/i,
];

export function detectTechEscape(userResponse: string): boolean {
  const allPatterns = [...TECH_ESCAPE_ZH, ...TECH_ESCAPE_EN];
  const matchCount = allPatterns.filter(p => p.test(userResponse)).length;
  // 命中2个及以上模式才触发，避免误判
  return matchCount >= 2;
}

// ── 规则5：强制证伪语句 ──

export function validateFalsificationBlock(grounderOutput: string): boolean {
  const required = [
    /当前最重要假设/,
    /如果我是错的/,
    /最小动作/,
  ];
  return required.every(p => p.test(grounderOutput));
}
