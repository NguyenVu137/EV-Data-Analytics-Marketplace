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
