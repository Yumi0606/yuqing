# 创建一个测试脚本来验证爬取功能
import json
import threading
from bilibili_api import search_bilibili_videos, get_video_comments
from data_handler import save_comments_to_excel
from emotion_recognition import add_emotion

# 使用与server.py相同的headers
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.bilibili.com/",
    "Origin": "https://www.bilibili.com", 
    "Cookie": "..." # 插入你的cookie
}

def test_crawl():
    print("开始测试爬取功能...")
    keyword = "原神"
    group_name = "test"
    
    # 测试搜索视频
    videos = search_bilibili_videos(HEADERS, keyword, num_results=2)
    print(f"搜索结果: {len(videos)} 个视频")
    
    if videos:
        video = videos[0]
        print(f"测试爬取第一个视频: {video['title']}")
        
        # 测试获取评论
        comments = get_video_comments(HEADERS, video['aid'], video['bvid'], max_pages=1)
        print(f"获取到 {len(comments)} 条评论")
        
        if comments:
            # 测试保存评论
            output_dir = f"./test_data"
            file_path = save_comments_to_excel(comments, video, output_dir, "test", keyword)
            print(f"评论已保存到: {file_path}")
            
            # 测试情感分析
            api_key = "hZuLZY3gotc0qscU4Rp5TFFcGlA0mN0z"
            emotion_result = add_emotion(file_path, api_key)
            print(f"情感分析结果: {emotion_result}")

if __name__ == "__main__":
    test_crawl() 