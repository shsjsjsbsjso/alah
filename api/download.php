<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $url = $input['url'] ?? '';
    
    if (empty($url)) {
        echo json_encode(['error' => 'URL is required']);
        exit;
    }
    
    // Validate TikTok URL
    if (!preg_match('/https?:\/\/(www\.)?tiktok\.com\/.+|https?:\/\/vm\.tiktok\.com\/.+|https?:\/\/vt\.tiktok\.com\/.+/', $url)) {
        echo json_encode(['error' => 'Invalid TikTok URL']);
        exit;
    }
    
    try {
        $videoData = $this->getTikTokVideo($url);
        
        if ($videoData) {
            echo json_encode([
                'success' => true,
                'videoUrl' => $videoData['video_url'],
                'title' => $videoData['title'] ?? 'TikTok Video',
                'author' => $videoData['author'] ?? '@user',
                'duration' => $videoData['duration'] ?? '0:00'
            ]);
        } else {
            echo json_encode(['error' => 'Failed to download video']);
        }
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function getTikTokVideo($url) {
    // Using multiple API endpoints for better success rate
    $apis = [
        'https://tikwm.com/api/?url=' . urlencode($url) . '&hd=1',
        'https://www.tikwm.com/api/?url=' . urlencode($url)
    ];
    
    foreach ($apis as $apiUrl) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        curl_setopt($ch, CURLOPT_REFERER, 'https://xdimsdev.com');
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            
            if (isset($data['data']['play'])) {
                return [
                    'video_url' => $data['data']['play'],
                    'title' => $data['data']['title'] ?? '',
                    'author' => $data['data']['author']['unique_id'] ?? '@user',
                    'duration' => $data['data']['duration'] ?? '0:00'
                ];
            }
        }
    }
    
    return null;
}
?>
