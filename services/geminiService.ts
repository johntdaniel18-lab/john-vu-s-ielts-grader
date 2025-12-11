import { GoogleGenAI } from "@google/genai";
import type { Feedback, TaskType } from '../types';
import { ieltsFeedbackSchema } from "./ieltsCriteria";

// Singleton instance to hold the authenticated client
let genAI: GoogleGenAI | null = null;

export const setApiKey = (apiKey: string) => {
    genAI = new GoogleGenAI({ apiKey });
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    try {
        const tempAI = new GoogleGenAI({ apiKey });
        // Perform a lightweight operation to verify the key works
        await tempAI.models.countTokens({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: 'validation_test' }] } 
        });
        return true;
    } catch (error) {
        console.error("API Key validation failed:", error);
        return false;
    }
};

const getAiClient = () => {
    if (!genAI) {
        throw new Error("API Key has not been set. Please log in again.");
    }
    return genAI;
};

const getSystemInstruction = (taskType: TaskType, question: string): string => {
    const commonInstructions = `
Bạn là một chuyên gia chấm thi viết IELTS cực kỳ nghiêm khắc và chi tiết. Nhiệm vụ của bạn là cung cấp một bài đánh giá chi tiết, chính xác và mang tính xây dựng sâu sắc cho một bài viết IELTS. Hãy cực kỳ kỹ lưỡng và xác định mọi lĩnh vực có thể cải thiện, dù là nhỏ nhất. Mục tiêu của bạn là tạo ra một danh sách toàn diện các gợi ý cải thiện, lý tưởng là từ 15-25 gợi ý cho một bài luận tiêu chuẩn. Đừng ngần ngại chỉ ra ngay cả những lỗi nhỏ nhất hoặc những điểm có thể cải thiện tinh tế.
Phân tích câu trả lời của học sinh dựa trên câu hỏi được cung cấp và hình ảnh đi kèm (nếu có).

Toàn bộ phản hồi của bạn BẮT BUỘC phải ở định dạng JSON, tuân thủ theo schema đã cung cấp. Không bao gồm bất kỳ văn bản nào bên ngoài cấu trúc JSON.

### Quy trình Phân tích
Để đảm bảo sự kỹ lưỡng tối đa, hãy tuân thủ quy trình sau đây:
1.  **Phân tích từng đoạn văn**: Đọc và phân tích kỹ lưỡng từng đoạn văn của bài luận một cách độc lập.
2.  **Xác định các vấn đề trong mỗi đoạn văn**: Trong mỗi đoạn văn, xác định tất cả các lỗi và các điểm có thể cải thiện. Ghi chú lại các điểm này trên cả bốn tiêu chí chấm điểm.
3.  **Tổng hợp và Hoàn thiện**: Sau khi đã phân tích tất cả các đoạn văn, hãy tổng hợp tất cả các ghi chú của bạn để tạo ra phản hồi JSON cuối cùng. Đảm bảo điểm số và nhận xét tổng thể phản ánh chính xác các vấn đề đã được xác định trong toàn bộ bài viết.

### Cấu trúc chấm điểm và phản hồi:
1.  **Điểm tổng quan (Overall Band Score)**: Tính điểm tổng quan bằng cách lấy trung bình cộng điểm của bốn tiêu chí, làm tròn đến 0.5 gần nhất.
2.  **Phân tích chi tiết theo tiêu chí (Criteria Breakdown)**: Cung cấp điểm (từ 0.0-9.0, bước điểm 0.5), một nhận xét tóm tắt ngắn gọn, và phản hồi chi tiết cho mỗi trong bốn tiêu chí chính thức của IELTS. Phần 'details' (chi tiết) cho mỗi tiêu chí PHẢI được cấu trúc theo các điểm phụ dưới đây:

    *   **Task Response**:
        *   **Trả lời câu hỏi**: Tất cả các phần của câu hỏi có được đề cập đầy đủ không?
        *   **Quan điểm (Rõ ràng & Nhất quán)**: Có quan điểm hoặc tổng quan rõ ràng và nhất quán không?
        *   **Phát triển & Hỗ trợ ý**: Các ý chính có được phát triển tốt và hỗ trợ bằng các chi tiết/ví dụ liên quan không?
        *   **Mức độ liên quan**: Tất cả thông tin có liên quan trực tiếp đến câu hỏi không?

    *   **Coherence and Cohesion**:
        *   **Mạch lạc tổng thể**: Bài luận có dòng chảy logic và dễ theo dõi không?
        *   **Phương tiện liên kết**: Việc sử dụng từ nối, đại từ, và các tham chiếu khác hiệu quả như thế nào?
        *   **Phân đoạn**: Cấu trúc đoạn văn có logic không, mỗi đoạn có chủ đề trung tâm rõ ràng không?
        *   **Sự phát triển ý**: Các ý tưởng có theo một trình tự logic từ ý này sang ý khác không?

    *   **Lexical Resource**:
        *   **Phạm vi từ vựng**: Có một phạm vi từ vựng rộng và phù hợp không?
        *   **Linh hoạt & Chính xác**: Từ vựng có được sử dụng linh hoạt và chính xác để truyền đạt ý nghĩa chính xác không?
        *   **Lựa chọn từ & Kết hợp từ (Collocation)**: Việc lựa chọn từ và kết hợp từ có tự nhiên và chính xác không?
        *   **Chính tả & Cấu tạo từ**: Mức độ chính xác trong chính tả và cấu tạo từ như thế nào?

    *   **Grammatical Range and Accuracy**:
        *   **Sự đa dạng cấu trúc câu**: Có sự kết hợp tốt giữa các cấu trúc câu đơn và câu phức không?
        *   **Sử dụng câu phức**: Câu phức được sử dụng hiệu quả như thế nào?
        *   **Độ chính xác ngữ pháp**: Mức độ chính xác về ngữ pháp và chấm câu như thế nào?

3.  **Gợi ý cải thiện có chú thích (Annotated Improvements)**: Xác định các cụm từ hoặc câu cụ thể trong bài viết của học sinh có thể được cải thiện. Đối với mỗi điểm cần cải thiện, cung cấp:
    *   'originalText': **Đoạn văn bản ngắn nhất có thể** từ bài làm của học sinh chứa lỗi. Hãy ưu tiên các từ hoặc cụm từ cụ thể thay vì cả câu dài. Điều này rất quan trọng để việc đánh dấu được chính xác.
    *   'category': Tiêu chí chấm điểm chính mà vấn đề này thuộc về. BẮT BUỘC là một trong các giá trị sau: "Task Response", "Coherence and Cohesion", "Lexical Resource", "Grammatical Range and Accuracy".
    *   'issue': Một nhãn ngắn gọn, cụ thể cho lỗi (ví dụ: "Lựa chọn từ vựng", "Lỗi chấm câu", "Thiếu rõ ràng").
    *   'description': Một lời giải thích ngắn gọn tại sao đây là một vấn đề.
    *   'suggestions': Một danh sách gồm một hoặc nhiều phiên bản đã sửa lỗi hoặc các phương án thay thế tốt hơn.
    
    **QUY TẮC ĐỊNH DẠNG QUAN TRỌNG CHO TẤT CẢ CÁC DANH MỤC GỢI Ý:**
    Để đảm bảo phản hồi trực quan nhất quán, bạn BẮT BUỘC phải áp dụng định dạng Markdown so sánh cho TẤT CẢ các gợi ý ('suggestions') thuộc mọi danh mục (Lexical Resource, Grammatical Range and Accuracy, Coherence and Cohesion, Task Response), KHÔNG CHỈ LÀ TỪ VỰNG. Điều này cực kỳ quan trọng để hiển thị các thay đổi một cách trực quan (dạng 'pill').
    *   Sử dụng \`~~\` bao quanh phần văn bản gốc bị xóa hoặc thay thế.
    *   Sử dụng \`**\` bao quanh phần văn bản mới được thêm vào hoặc sửa đổi.
    *   Nếu chỉ thêm từ mới mà không xóa, chỉ sử dụng \`**\`.
    *   Nếu chỉ xóa mà không thêm, chỉ sử dụng \`~~\`.
    *   Ví dụ (Từ vựng): "...There ~~is~~ **remains** a significant debate..."
    *   Ví dụ (Ngữ pháp): "...she ~~go~~ **goes** to school..."
    *   Ví dụ (Viết lại câu): "~~People says that~~ **It is commonly argued that**..."
    *   Ví dụ (Thêm từ): "...students should **carefully** consider..."
    *   Ví dụ (Task Response - thêm chi tiết/làm rõ): "...pollution ~~which is bad~~ **which poses a severe threat to public health**..."
    
    Hãy tuân thủ nghiêm ngặt quy tắc này cho mọi gợi ý.

    **HƯỚNG DẪN CỤ THỂ CHO TỪNG LOẠI:**
    *   **Lexical Resource**: Tích cực tìm kiếm mọi cơ hội để thay thế các từ đơn giản (is, get, good, bad, very, important) bằng các từ học thuật, chính xác hơn.
    *   **Grammatical Range and Accuracy**: Cực kỳ cảnh giác với lỗi chấm câu (comma splices), sự hòa hợp chủ ngữ-động từ, và mạo từ. Đề xuất các cấu trúc câu ghép/phức tạp hơn.
    *   **Coherence and Cohesion**: Đề xuất các từ nối tốt hơn hoặc sắp xếp lại trật tự từ để dòng chảy ý tưởng mượt mà hơn.
`;

    const taskSpecificInstructions = taskType === 1
        ? `Đây là bài luận Task 1. Học sinh phải mô tả thông tin được trình bày trong hình ảnh (biểu đồ, đồ thị, v.v.). Bài đánh giá nên tập trung vào khả năng tóm tắt các đặc điểm chính và đưa ra so sánh khi cần thiết. Giọng văn phải trang trọng và học thuật.`
        : `Đây là bài luận Task 2. Học sinh phải trình bày một lập luận được phát triển tốt để phản hồi một quan điểm hoặc vấn đề. Bài đánh giá nên tập trung vào sự rõ ràng của quan điểm, sự phát triển của các ý tưởng, và chất lượng của lập luận.`;
    
    return `${commonInstructions}\n${taskSpecificInstructions}\n\nCâu hỏi là: "${question}"`;
};


export const getIeltsFeedback = async (
    taskType: TaskType,
    question: string,
    studentAnswer: string,
    imageBase64: string | null,
    imageMimeType: string | undefined
): Promise<Feedback> => {
    
    // Use gemini-3-pro-preview for complex reasoning and marking
    const model = 'gemini-3-pro-preview';
    const ai = getAiClient(); // Ensure we have a client

    const systemInstruction = getSystemInstruction(taskType, question);
    
    const textPart = {
        text: `Vui lòng đánh giá bài luận sau của học sinh:\n\n---\n\n${studentAnswer}`
    };

    const contents: any = { parts: [textPart] };

    if (taskType === 1 && imageBase64 && imageMimeType) {
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: imageMimeType,
            },
        };
        contents.parts.unshift(imagePart);
    }
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: ieltsFeedbackSchema,
                temperature: 0.2, 
            }
        });

        // Robust cleanup to avoid "SyntaxError: Unexpected token"
        let responseText = response.text || '';
        responseText = responseText.trim();
        
        // Find JSON object start and end to extract pure JSON
        const firstBrace = responseText.indexOf('{');
        const lastBrace = responseText.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
            responseText = responseText.substring(firstBrace, lastBrace + 1);
        } else {
             // Fallback cleanup
            if (responseText.startsWith('```')) {
                responseText = responseText.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
            }
        }

        if (!responseText) {
            throw new Error("Received empty response from AI model.");
        }

        const feedback = JSON.parse(responseText) as Feedback;

        if (!feedback.feedback || !feedback.improvements) {
            throw new Error("Invalid response format from API.");
        }

        // Add source and a unique ID to AI improvements
        feedback.improvements = feedback.improvements.map((imp, index) => ({ 
            ...imp, 
            id: Date.now() + index, // Add unique ID
            source: 'AI' 
        }));

        return feedback;

    } catch (error) {
        console.error("Error fetching feedback from Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get feedback from AI service: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI service.");
    }
};

export const transcribeEssayImage = async (
    imageBase64: string,
    imageMimeType: string
): Promise<string> => {
    // Use gemini-2.5-flash for faster transcription
    const model = 'gemini-2.5-flash';
    const ai = getAiClient(); // Ensure we have a client

    const imagePart = {
        inlineData: {
            data: imageBase64,
            mimeType: imageMimeType,
        },
    };

    const textPart = {
        text: `Please transcribe the handwritten or typed text from this image. The text is an IELTS essay. 
        Transcribe the text into continuous paragraphs. Do not preserve line breaks from the image unless they indicate a new paragraph. 
        Join lines that are separated by a line break in the image into a single continuous sentence with a space.
        Preserve the original spelling as accurately as possible. 
        Only return the transcribed text, with no additional commentary, headings, or explanations. Do not add markdown formatting.`
    };

    const contents = { parts: [imagePart, textPart] };
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
        });

        let text = response.text;
        
        if (text) {
             text = text.trim();
             // Remove potential markdown code blocks
             if (text.startsWith('```')) {
                text = text.replace(/^```(txt|text)?/i, '').replace(/```$/, '').trim();
             }
        }

        if (!text) {
            throw new Error("The AI returned an empty transcription.");
        }
        return text;
    } catch (error) {
        console.error("Error transcribing image with Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to transcribe image using AI service: ${error.message}`);
        }
        throw new Error("An unknown error occurred while transcribing the image.");
    }
};