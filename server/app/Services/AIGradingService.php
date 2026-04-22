<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIGradingService extends BaseService
{
    protected string $apiKey;
    protected string $apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

    public function __construct()
    {
        // Vẫn lấy từ gemini.key theo cấu hình cũ để không bắt người dùng sửa nhiều file
        // nhưng chúng ta hiểu đây là key của Groq
        $this->apiKey = config('services.gemini.key');
    }

    /**
     * Call AI API to grade student answer (Groq / OpenAI format)
     *
     * @param string $questionContent The essay question
     * @param string|null $studentAnswer The student's answer
     * @param float $maxScore The maximum possible score
     * @return array|null Returns ['score' => float, 'feedback' => string] or null on failure
     */
    public function gradeEssay(string $questionContent, ?string $studentAnswer, float $maxScore): ?array
    {
        if (empty($this->apiKey)) {
            Log::error('AI API key is missing.');
            return null;
        }

        if (empty($studentAnswer)) {
            return [
                'score' => 0,
                'feedback' => 'Học sinh không có câu trả lời.'
            ];
        }

        $prompt = "Bạn là một giáo viên chấm thi tự luận khách quan và công bằng.
Nhiệm vụ: Chấm điểm bài làm của học sinh dựa trên câu hỏi và thang điểm tối đa. Trả về kết quả dưới định dạng JSON với các trường:
- 'score': Điểm số đánh giá (số thực, nhỏ hơn hoặc bằng {$maxScore}).
- 'feedback': Nhận xét chi tiết về bài làm, chỉ ra chỗ đúng, chỗ sai hoặc thiếu sót bằng tiếng Việt.

Yêu cầu định dạng feedback:
- Viết ngắn gọn, súc tích.
- Chia thành các ý rõ ràng (xuống dòng và bắt đầu bằng dấu gạch đầu dòng '-').

Câu hỏi: {$questionContent}
Thang điểm tối đa: {$maxScore} điểm.
Bài làm của học sinh: {$studentAnswer}

Đảm bảo chỉ trả về chuỗi JSON chứa 'score' và 'feedback', không có văn bản nào khác ngoài JSON định dạng chuẩn.";

        try {
            $response = Http::timeout(60)->withoutVerifying()->withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . trim($this->apiKey),
            ])->post($this->apiUrl, [
                'model' => 'llama-3.3-70b-versatile',
                'messages' => [
                    ['role' => 'system', 'content' => 'Bạn là một trợ lý chấm thi chuyên nghiệp. Luôn trả về kết quả dưới dạng JSON.'],
                    ['role' => 'user', 'content' => $prompt]
                ],
                'response_format' => [
                    'type' => 'json_object'
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['choices'][0]['message']['content'])) {
                    $jsonString = $data['choices'][0]['message']['content'];
                    $result = json_decode($jsonString, true);
                    
                    if (isset($result['score']) && isset($result['feedback'])) {
                        $score = min(max(floatval($result['score']), 0), $maxScore);
                        return [
                            'score' => $score,
                            'feedback' => $result['feedback']
                        ];
                    }
                }
            }
            
            Log::error('Groq API returned invalid response', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            
            return null;

        } catch (\Exception $e) {
            Log::error('Error calling Groq API: ' . $e->getMessage());
            return null;
        }
    }
}
