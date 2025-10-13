const express = require('express');
const router = express.Router();

// Danh sách câu hỏi gợi ý
const suggestedQuestions = [
  'EV là gì?',
  'Pin xe điện có đặc điểm gì?',
  'Làm sao để sạc xe điện?',
  'SOH là gì?',
  'SOC là gì?',
  'Xe điện giúp giảm CO₂ như thế nào?',
  'Quãng đường xe điện đi được là bao nhiêu?',
];

// Rule-based trả lời miễn phí
function ruleBasedReply(message) {
  const msg = message.toLowerCase();
  if (msg.includes('ev') || msg.includes('xe điện')) {
    return { message: 'Xe điện (EV) là phương tiện sử dụng động cơ điện và pin để vận hành, thân thiện với môi trường.', matched: true };
  }
  if (msg.includes('pin') || msg.includes('battery')) {
    return { message: 'Pin xe điện thường là loại lithium-ion, dung lượng lớn, có thể sạc lại nhiều lần.', matched: true };
  }
  if (msg.includes('sạc') || msg.includes('charge')) {
    return { message: 'Bạn có thể sạc xe điện tại nhà hoặc các trạm sạc nhanh công cộng. Thời gian sạc tùy loại pin và công suất.', matched: true };
  }
  if (msg.includes('soh')) {
    return { message: 'SOH (State of Health) là chỉ số thể hiện tình trạng sức khỏe của pin xe điện.', matched: true };
  }
  if (msg.includes('soc')) {
    return { message: 'SOC (State of Charge) là phần trăm dung lượng pin còn lại so với mức đầy.', matched: true };
  }
  if (msg.includes('co2')) {
    return { message: 'Xe điện giúp giảm lượng CO₂ thải ra môi trường so với xe động cơ đốt trong.', matched: true };
  }
  if (msg.includes('quãng đường') || msg.includes('distance')) {
    return { message: 'Quãng đường di chuyển của xe điện phụ thuộc vào dung lượng pin và điều kiện vận hành.', matched: true };
  }
  return {
    message: 'Xin lỗi, tôi chỉ hỗ trợ các chủ đề sau: EV, pin, sạc, SOH, SOC, CO₂, quãng đường. Vui lòng chọn một trong các câu hỏi gợi ý bên dưới.',
    matched: false,
    suggestions: suggestedQuestions
  };
}

// POST /api/ai/chat (rule-based)
router.post('/chat', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Missing message' });
  }
  const reply = ruleBasedReply(message);
  res.json(reply);
});

// GET /api/ai/suggestions - trả về danh sách câu hỏi gợi ý
router.get('/suggestions', (req, res) => {
  res.json({ suggestions: suggestedQuestions });
});

module.exports = router;

// --- Insight endpoint: rule-based -> retrieval -> LLM fallback ---
const { retrieveTopK } = require('../services/vectorStore');
const AIUsage = require('../models/AIUsage');
const Subscription = require('../models/Subscription');
const authenticateToken = require('../middleware/auth');

async function callLLM(prompt) {
  // Optional: call OpenAI if key present
  if (!process.env.OPENAI_API_KEY) return null;
  const OpenAI = require('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const r = await client.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 500 });
    return r.choices && r.choices[0] && r.choices[0].message.content;
  } catch (e) {
    console.error('LLM error', e);
    return null;
  }
}

router.post('/insight', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { query, range, region, vehicleType } = req.body;

    // Quota check
    const sub = await Subscription.findOne({ where: { userId, status: 'active' } });
    if (sub && sub.quotaAI && sub.usedAI >= sub.quotaAI) {
      return res.status(403).json({ status: 'error', message: 'AI quota exceeded' });
    }

    // 1) rule-based quick answer
    const rule = ruleBasedReply(query);
    if (rule.matched) {
      // log usage
      await AIUsage.create({ userId, prompt: query, response: rule.message });
      if (sub) { sub.usedAI = (sub.usedAI || 0) + 1; await sub.save(); }
      return res.json({ source: 'rule', answer: rule.message });
    }

    // 2) retrieval
    const retrieved = await retrieveTopK(query, 5);

    // 3) attempt LLM if available
    let llmAnswer = null;
    if (process.env.OPENAI_API_KEY) {
      const prompt = `User query: ${query}\nRelevant datasets: ${retrieved.map(r => `${r.id}:${r.meta.title}`).join(', ')}`;
      llmAnswer = await callLLM(prompt);
    }

    const response = llmAnswer || `Related datasets: ${retrieved.map(r => r.meta.title).join(', ')}`;

    // log
    await AIUsage.create({ userId, prompt: query, response });
    if (sub) { sub.usedAI = (sub.usedAI || 0) + 1; await sub.save(); }

    res.json({ source: llmAnswer ? 'llm' : 'retrieval', answer: response, suggestions: retrieved });
  } catch (err) {
    console.error('Insight error', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;

