import time
import json
from urllib.parse import quote
import random
import re

import requests
import hashlib


def md5_encode(text):
    md5 = hashlib.md5()
    text_bytes = text.encode('utf-8')
    md5.update(text_bytes)
    encrypted_text = md5.hexdigest()
    return encrypted_text


def search_bilibili_videos(headers, keyword, num_results=10, max_pages=5):
    """
    根据关键词爬取 B 站相关热搜视频
    """
    video_data = []
    page = 1

    while len(video_data) < num_results and page <= max_pages:
        # 使用关键词搜索视频
        url = 'https://api.bilibili.com/x/web-interface/wbi/search/type'
        params = {
            'search_type': 'video',
            'page': page,
            'page_size': '50',
            'keyword': keyword,
            'source_tag': '3',
        }
        try:
            response = requests.get(url, headers=headers, timeout=10, params=params).json()
            if response["code"] != 0:
                print(f"第 {page} 页搜索 API 请求失败")
                break
            videos = response["data"]["result"]
            for video in videos:
                if video['type'] != 'video':
                    continue
                video_data.append({
                    # "title": video["title"].replace("<em class=\"keyword\">", "").replace("</em>", ""),  # 去掉高亮
                    "title": re.sub('<.*?>', '', video["title"]),  # 去掉 HTML 标签
                    "link": f"https://www.bilibili.com/video/{video['bvid']}",
                    "play_count": video["play"],  # 播放量
                    "comment_count": video["review"],  # 评论数
                    "bvid": video["bvid"],  # 用于后续爬取评论
                    "aid": video["id"]  # 视频 aid
                })
                if len(video_data) >= num_results:
                    break  # 获取足够数量的视频后退出
            page += 1
            time.sleep(1)  # 避免 API 访问过快

        except requests.RequestException as e:
            print(f"请求出错: {e}")
            break

    return video_data


def get_video_comments(headers, aid, bvid, max_pages=3):
    """获取指定 BVID 视频的评论数据, 并增加用户性别、IP 属地、B 站等级和用户 ID

    :param headers: 请求头
    :param aid: 视频aid
    :param bvid: 视频bvid
    :param max_pages: 最大页, defaults to 3
    :return: 评论数据
    """
    all_comments = []
    page = 1
    pagination_str = json.dumps({'offset':''})
    while page <= max_pages:
        wts = str(int(time.time()))
        key_pagination_str = quote(pagination_str)
        web_location = ''.join(random.choices('0123456789', k=7))
        key = f'mode=2&oid={aid}&pagination_str={key_pagination_str}&plat=1&seek_rpid=&type=1&web_location={web_location}&wts={wts}ea1db124af3c7062474693fa704f4ff8'
        params = {
            "oid": aid,
            "type": "1",
            "mode": "2",
            "pagination_str": pagination_str,
            "plat": "1",
            "seek_rpid": "",
            "web_location": web_location,
            "w_rid": md5_encode(key),
            "wts": wts
        }
        response = requests.get(
            'https://api.bilibili.com/x/v2/reply/wbi/main?',
            headers=headers,
            params=params
        )
        replies = response.json().get('data', {}).get('replies', [])
        for reply in replies:
            # 提取用户信息
            user_info = reply["member"]
            all_comments.append({
                "bvid": bvid,
                "comment_id": reply["rpid"],
                "user_id": user_info["mid"],  # 用户 ID
                "user_name": user_info["uname"],  # 用户名
                "user_gender": user_info.get("sex", "未知"),  # 用户性别
                "user_level": user_info.get("level_info", {}).get("current_level", 0),  # 用户 B 站等级
                "user_ip_location": reply.get("reply_control", {}).get("location", "未知"),  # 用户 IP 属地
                "content": reply["content"]["message"],  # 评论内容
                "likes": reply["like"],  # 评论点赞数
                "time": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(reply["ctime"]))  # 评论时间
            })
        page += 1
        next_offset = response.json().get('data', {}).get('cursor', {}).get('pagination_reply', {}).get('next_offset')
        if not next_offset or not replies:
            break
        pagination_str = json.dumps({'offset': next_offset})
        time.sleep(2)
    return all_comments
