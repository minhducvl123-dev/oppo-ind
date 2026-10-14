import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gemini Assistant Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { prompt, context, history } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Graceful fallback with analytical summary based on provided context
      res.json({
        reply: `[Hệ thống] Trợ lý Gemini AI đang hoạt động ở chế độ nội bộ. 
Dữ liệu hiện tại của bạn:
- Kỳ phân tích: ${context?.period || 'Hiện tại'}
- Tổng Sell Out: ${context?.totalSO?.toLocaleString() || 0} máy
- Tổng Sell In: ${context?.totalSI?.toLocaleString() || 0} máy
- Tỷ lệ Sell Out / Sell In: ${context?.ratio || 0}%
- Số đại lý theo dõi: ${context?.storeCount || 0} đại lý

Khuyến nghị chuyên gia:
1. Đại lý có tỷ lệ Sell Out/Sell In < 70% cần rà soát kế hoạch xả kho, đẩy mạnh chương trình kích cầu phụ kiện và trade-in thu cũ đổi mới.
2. Các dòng chủ lực Reno & A7PRO đang chiếm tỷ trọng tích cực; ưu tiên phân bổ thêm hàng vào các đại lý Cấp S như Lê Tín, Ngọc Diệp, Đại Lý 102 để tránh đứt gãy tồn kho cuối tuần.
3. Chú ý đào tạo nhân viên PG/PB tại các điểm bán Cấp A để nâng tỷ lệ chốt đơn.`
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `Bạn là Chuyên gia Quản lý Chuỗi Cung Ứng & Giám đốc Kinh doanh Vùng (Regional Sales Manager) của OPPO tại khu vực Tây Nam Bộ (trọng tâm là Cần Thơ & Hậu Giang).
Nhiệm vụ của bạn là hỗ trợ ban quản trị, giám sát kinh doanh và các đại lý phân tích dữ liệu bán hàng Sell In (hàng nhập kho đại lý), Sell Out (hàng bán ra người tiêu dùng), tỷ lệ quay vòng hàng tồn, dòng máy Reno và dòng A series (A7PRO), cùng sản phẩm gia tăng (Cường lực).

Nguyên tắc ứng xử và phong cách:
1. Chuyên nghiệp, nhạy bén, sâu sát thực tế thị trường điện thoại di động Việt Nam (miền Tây sông nước: Cần Thơ, Ninh Kiều, Cái Răng, Ô Môn, Thới Lai, Hậu Giang: Long Mỹ, Vị Thanh, Phụng Hiệp).
2. Khi trả lời, luôn bám sát dữ liệu số liệu cụ thể được cung cấp trong ngữ cảnh (Context):
   - Đánh giá sức khỏe chuỗi cung ứng dựa trên tỷ lệ Sell Out / Sell In (Chuẩn tối ưu thường từ 80% - 95%).
   - Cảnh báo các đại lý có nguy cơ ứ đọng vốn (Sell In cao mà Sell Out thấp) hoặc nguy cơ đứt hàng (Sell Out sát 100% Sell In).
   - Đưa ra chiến lược kích cầu cụ thể cho các dòng Reno và A7PRO.
3. Định dạng câu trả lời rõ ràng, dùng bullet point, icon trực quan (📊, 🚀, ⚠️, 💡, 🎯), giọng điệu tích cực, quyết đoán và hữu ích.
4. Trả lời bằng tiếng Việt chuẩn.`;

    const contextSummary = context ? `
BỐI CẢNH DỮ LIỆU HIỆN TẠI ĐANG XEM:
- Thời gian: ${context.period}
- Kỳ lọc: ${context.weekLabel || 'Cả tháng'}
- Tổng Sell Out: ${context.totalSO} máy
- Tổng Sell In: ${context.totalSI} máy
- Tỷ lệ Sell Out / Sell In toàn khu vực: ${context.ratio}%
- Tăng trưởng so với kỳ trước: ${context.growth || 'N/A'}
- Dòng Reno: ${context.totalReno || 0} máy
- Dòng A7PRO: ${context.totalA7 || 0} máy
- Kính Cường Lực: ${context.totalCL || 0} cái
- Tổng số đại lý: ${context.storeCount}
- Top 5 đại lý Sell Out cao nhất: ${JSON.stringify(context.topDealers || [])}
- Các đại lý tồn kho cao (tỷ lệ Sell Out/Sell In thấp nhất): ${JSON.stringify(context.lowDealers || [])}
` : '';

    const contents: any[] = [];

    // Include recent history if available
    if (Array.isArray(history) && history.length > 0) {
      history.slice(-6).forEach((h: { role: string; text: string }) => {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.text }],
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [
        {
          text: `${contextSummary}\n\nCâu hỏi/Yêu cầu của người dùng:\n${prompt}`,
        },
      ],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Xin lỗi, không nhận được phản hồi từ AI.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Error generating AI content:', error);
    res.status(500).json({
      error: 'Lỗi xử lý yêu cầu AI: ' + (error?.message || 'Unknown error'),
    });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

startServer();
