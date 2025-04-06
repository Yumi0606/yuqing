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
            # 添加调试信息
            print(f"正在请求搜索 '{keyword}' 第 {page} 页...")
            
            # 增加超时设置和重试机制
            retry_count = 0
            max_retries = 3
            response_text = None
            
            while retry_count < max_retries:
                try:
                    response = requests.get(url, headers=headers, timeout=10, params=params)
                    
                    # 打印状态码和响应内容的前100个字符(用于调试)
                    print(f"搜索请求状态码: {response.status_code}")
                    response_text = response.text
                    print(f"响应内容预览: {response_text[:100] if response_text else 'Empty response'}")
                    
                    # 检查状态码
                    if response.status_code != 200:
                        print(f"请求返回非200状态码: {response.status_code}")
                        retry_count += 1
                        time.sleep(2)  # 等待2秒后重试
                        continue
                        
                    # 尝试解析JSON
                    response_json = response.json()
                    
                    if response_json["code"] != 0:
                        print(f"B站API返回错误码: {response_json['code']}, 消息: {response_json.get('message', 'No message')}")
                        # 如果是限流或IP封禁错误
                        if response_json["code"] in [-412, -403]:
                            print("IP可能被临时限制，等待时间更长后重试")
                            time.sleep(10)  # 等待10秒
                        retry_count += 1
                        continue
                        
                    # 成功获取数据
                    videos = response_json["data"]["result"]
                    print(f"成功获取 {len(videos)} 个视频结果")
                    
                    for video in videos:
                        if video['type'] != 'video':
                            continue
                        video_data.append({
                            "title": re.sub('<.*?>', '', video["title"]),  # 去掉 HTML 标签
                            "link": f"https://www.bilibili.com/video/{video['bvid']}",
                            "play_count": video["play"],  # 播放量
                            "comment_count": video["review"],  # 评论数
                            "bvid": video["bvid"],  # 用于后续爬取评论
                            "aid": video["id"]  # 视频 aid
                        })
                        if len(video_data) >= num_results:
                            break  # 获取足够数量的视频后退出
                    
                    break  # 成功获取数据，跳出重试循环
                        
                except json.JSONDecodeError as e:
                    print(f"JSON解析错误: {e}")
                    print(f"响应内容: {response_text}")
                    retry_count += 1
                    time.sleep(3)  # 等待时间略微增加
                    
                except requests.RequestException as e:
                    print(f"请求异常: {e}")
                    retry_count += 1
                    time.sleep(3)
            
            # 如果所有重试都失败
            if retry_count >= max_retries:
                print(f"在 {max_retries} 次尝试后仍无法获取数据，跳过当前页")
                break
                
            page += 1
            time.sleep(0.2)  # 正常请求间隔

        except Exception as e:
            print(f"未预期异常: {e}")
            time.sleep(.3)
            break

    print(f"共获取 {len(video_data)} 个视频数据")
    return video_data


def get_video_comments(headers, aid, bvid, max_pages=3):
    """获取指定 BVID 视频的评论数据, 并增加用户性别、IP 属地、B 站等级和用户 ID"""
    all_comments = []
    page = 1
    pagination_str = json.dumps({'offset':''})
    
    try:
        print(f"开始获取视频 {bvid} (aid: {aid}) 的评论，计划获取 {max_pages} 页")
        
        while page <= max_pages:
            try:
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
                
                print(f"请求视频 {bvid} 的第 {page} 页评论...")
                
                response = requests.get(
                    'https://api.bilibili.com/x/v2/reply/wbi/main?',
                    headers=headers,
                    params=params,
                    timeout=10  # 添加超时设置
                )
                
                # 检查响应状态码
                if response.status_code != 200:
                    print(f"评论请求返回非200状态码: {response.status_code}, 响应内容: {response.text[:100]}")
                    break
                
                # 解析JSON响应
                response_json = response.json()
                
                # 检查错误代码
                if response_json.get("code", 0) != 0:
                    print(f"B站API返回错误码: {response_json.get('code')}, 消息: {response_json.get('message', '未知错误')}")
                    break
                
                replies = response_json.get('data', {}).get('replies', [])
                print(f"成功获取 {len(replies)} 条评论")
                
                if not replies:
                    print(f"第 {page} 页没有评论，结束获取")
                    break
                
                for reply in replies:
                    try:
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
                    except KeyError as e:
                        print(f"处理评论时遇到键错误: {e}, 跳过此评论")
                    except Exception as e:
                        print(f"处理评论时遇到未知错误: {e}, 跳过此评论")
                
                page += 1
                next_offset = response_json.get('data', {}).get('cursor', {}).get('pagination_reply', {}).get('next_offset')
                
                if not next_offset:
                    print(f"没有下一页评论，共获取 {len(all_comments)} 条评论")
                    break
                    
                pagination_str = json.dumps({'offset': next_offset})
                time.sleep(.2)  # 减少延迟时间
                
            except requests.exceptions.RequestException as e:
                print(f"请求评论时发生网络错误: {e}")
                break
                
            except json.JSONDecodeError as e:
                print(f"JSON解析错误: {e}, 响应内容: {response.text[:100] if 'response' in locals() else '无响应'}")
                break
                
            except Exception as e:
                print(f"获取评论时发生未知错误: {e}")
                break
        
        print(f"视频 {bvid} 评论获取完成，共 {len(all_comments)} 条")
        return all_comments
        
    except Exception as e:
        print(f"获取视频 {bvid} 评论过程中发生严重错误: {e}")
        print(f"错误类型: {type(e).__name__}")
        import traceback
        traceback.print_exc()  # 打印完整堆栈跟踪
        return all_comments  # 返回已获取的评论（可能为空）
