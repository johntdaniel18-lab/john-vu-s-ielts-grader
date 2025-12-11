import { Type } from '@google/genai';

const improvementSchema = {
  type: Type.OBJECT,
  properties: {
    originalText: {
      type: Type.STRING,
      description: 'Đoạn văn bản hoặc câu chính xác từ bài làm của học sinh cần được cải thiện.',
    },
    category: {
      type: Type.STRING,
      description: 'Tiêu chí chấm điểm chính mà vấn đề này thuộc về. Phải là một trong các giá trị: "Đáp ứng yêu cầu đề bài", "Tính mạch lạc và liên kết", "Vốn từ vựng", "Độ đa dạng và chính xác của ngữ pháp".'
    },
    issue: {
      type: Type.STRING,
      description: 'Một nhãn ngắn gọn, cụ thể cho lỗi (ví dụ: "Lựa chọn từ vựng sai", "Lỗi chấm câu").',
    },
    description: {
      type: Type.STRING,
      description: 'Một lời giải thích ngắn gọn về lý do tại sao đây là một vấn đề.',
    },
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: 'Một danh sách gồm một hoặc nhiều phiên bản đã được sửa lỗi hoặc các phương án thay thế tốt hơn cho đoạn văn bản.',
    },
  },
  required: ['originalText', 'category', 'issue', 'description', 'suggestions'],
};

const feedbackCriterionSchema = {
  type: Type.OBJECT,
  properties: {
    band: {
      type: Type.NUMBER,
      description: 'Điểm cho tiêu chí này, từ 0.0 đến 9.0 theo bước điểm 0.5.',
    },
    comment: {
      type: Type.STRING,
      description: 'Một bản tóm tắt ngắn gọn về hiệu suất cho tiêu chí này.',
    },
    details: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: 'Một danh sách các điểm cụ thể chi tiết về điểm mạnh và điểm yếu, được cấu trúc theo các điểm phụ được cung cấp trong chỉ thị hệ thống cho tiêu chí này.',
    },
  },
  required: ['band', 'comment', 'details'],
};

export const ieltsFeedbackSchema = {
  type: Type.OBJECT,
  properties: {
    overallBand: {
      type: Type.NUMBER,
      description: 'Điểm tổng quan, từ 0.0 đến 9.0 theo bước điểm 0.5. Đây là trung bình của bốn điểm tiêu chí, được làm tròn đến 0.5 gần nhất.',
    },
    feedback: {
      type: Type.OBJECT,
      properties: {
        taskResponse: feedbackCriterionSchema,
        coherenceCohesion: feedbackCriterionSchema,
        lexicalResource: feedbackCriterionSchema,
        grammaticalRangeAccuracy: feedbackCriterionSchema,
      },
      required: ['taskResponse', 'coherenceCohesion', 'lexicalResource', 'grammaticalRangeAccuracy'],
    },
    improvements: {
      type: Type.ARRAY,
      description: 'Một danh sách các cải tiến cụ thể, có thể hành động được xác định trong câu trả lời của học sinh.',
      items: improvementSchema,
    },
  },
  required: ['overallBand', 'feedback', 'improvements'],
};