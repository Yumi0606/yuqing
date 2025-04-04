from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import openpyxl
import collections
from typing import List
import json
import os
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import time
import threading
from bilibili_api import search_bilibili_videos, get_video_comments
from data_handler import save_comments_to_excel, create_videos_folder
import random
from emotion_recognition import add_emotion

app = FastAPI()

origins = [
    "*",  # Allow all origins. Replace with specific domains for better security.
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CreateKeywordGroup(BaseModel):
    group_name: str
    keywords: List[str]
    is_collecting: bool
    created_at: datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data_count: int = 0
    warning_count: int = 0
    immediate_collect: bool = False
    collection_frequency: int = 4  # 默认4小时
    collection_count: int = 100    # 默认爬取100条评论
    last_collected_at: str = None  # 上次爬取时间


class UpdateKeywordGroup(BaseModel):
    group_name: str
    new_group_info: dict


class DeleteKeywordGroup(BaseModel):
    group_name: str


class FilterSentimentData(BaseModel):
    group_name: str = None
    emotion_type: str = "全部"
    platform: str = "全部"
    start_time: str = None
    end_time: str = None


KEYWORD_GROUP_FILE = "./keyword_groups.json"
scheduler = BackgroundScheduler()
scheduler.start()

# 存储当前运行的任务ID
running_jobs = {}

# 请求头，防止被识别为爬虫
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Referer': 'https://www.bilibili.com/'
}


def load_keyword_groups():
    if os.path.exists(KEYWORD_GROUP_FILE):
        with open(KEYWORD_GROUP_FILE, "r") as file:
            try:
                return json.load(file)
            except Exception as e:
                print(f'Error loading keyword groups: {e}')
                return []
    return []


def save_keyword_groups(keyword_groups):
    with open(KEYWORD_GROUP_FILE, "w") as file:
        json.dump(keyword_groups, file, indent=4, default=str)


def crawl_data(group_name, keywords, collection_count):
    """
    根据关键词爬取B站数据
    
    :param group_name: 关键词组名称
    :param keywords: 关键词列表
    :param collection_count: 需要爬取的评论数量
    """
    print(f"开始爬取 {group_name} 的数据，关键词: {keywords}, 目标评论量: {collection_count}")
    
    # 确保每个视频最多爬取的评论数量不超过1000
    max_comments_per_video = 1000
    
    # 获取当前时间作为记录
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    total_comments_collected = 0
    warning_count = 0  # 记录预警次数
    
    # API密钥 - 用于情感分析
    api_key = "roOebLVfNNu2PDWp8sI57ZAT"  # 这里应该从配置文件或环境变量获取
    
    # 如果有多个关键词，平均分配要爬取的评论数量
    if len(keywords) > 0:
        comments_per_keyword = collection_count // len(keywords)
        # 确保至少每个关键词爬取1条评论
        comments_per_keyword = max(1, comments_per_keyword)
    else:
        # 如果没有关键词，直接返回
        print(f"关键词组 {group_name} 没有关键词，无法爬取")
        return
    
    # 为每个关键词爬取数据
    for idx, keyword in enumerate(keywords):
        # 计算当前关键词需要爬取的评论数
        # 最后一个关键词可能需要爬取更多以达到总目标
        if idx == len(keywords) - 1:
            remaining = collection_count - total_comments_collected
            keyword_target = max(remaining, comments_per_keyword)
        else:
            keyword_target = comments_per_keyword
            
        keyword_collected = 0  # 当前关键词已收集的评论数
        retry_count = 0  # 重试计数器
        max_retries = 3  # 最大重试次数
        
        try:
            print(f"为关键词 '{keyword}' 爬取约 {keyword_target} 条评论")
            
            # 创建存储目录
            output_dir = f"./res_file/emotion_data/{group_name}"
            if not os.path.exists(output_dir):
                os.makedirs(output_dir)
            
            # 搜索相关视频
            try:
                videos = search_bilibili_videos(HEADERS, keyword, num_results=10)
                if not videos:
                    print(f"关键词 '{keyword}' 未找到相关视频")
                    continue
            except Exception as e:
                print(f"搜索关键词 '{keyword}' 视频时出错: {e}")
                continue
            
            # 按评论数排序，优先爬取评论多的视频
            videos.sort(key=lambda x: int(x.get('comment_count', 0) or 0), reverse=True)
            
            # 遍历每个视频，爬取评论直到达到目标
            for video_idx, video in enumerate(videos):
                # 如果已经达到当前关键词的目标评论量，停止爬取
                if keyword_collected >= keyword_target:
                    break
                
                # 如果尝试了太多视频还是无法达到目标，也停止
                if video_idx >= 50:  # 限制每个关键词最多尝试50个视频
                    print(f"关键词 '{keyword}' 已尝试了50个视频，但未达到目标评论量")
                    break
                
                # 计算还需要爬取的评论数量
                comments_needed = min(max_comments_per_video, keyword_target - keyword_collected)
                
                # 如果这个视频的评论数太少，可能不值得爬取
                try:
                    comment_count = int(video.get('comment_count', 0) or 0)
                    if comment_count < 5:
                        print(f"视频 {video['bvid']} 评论数过少 ({comment_count})，跳过")
                        continue
                except (ValueError, TypeError):
                    # 如果评论数不是有效数字，设为0
                    comment_count = 0
                    
                try:
                    # 估算需要爬取的页数，每页约20条评论，但最少1页
                    max_pages = max(1, min(50, (comments_needed + 19) // 20))
                    
                    # 设置超时，避免无限等待
                    retry_attempts = 0
                    max_retry_attempts = 2
                    comments = []
                    
                    while retry_attempts < max_retry_attempts and not comments:
                        try:
                            print(f"爬取视频 {video['bvid']} 的评论，目标: {comments_needed}条")
                            comments = get_video_comments(HEADERS, video['aid'], video['bvid'], max_pages=max_pages)
                            
                            # 如果没有评论但应该有，可能是临时错误，重试
                            if not comments and comment_count > 0:
                                retry_attempts += 1
                                print(f"未找到评论，重试 ({retry_attempts}/{max_retry_attempts})...")
                                time.sleep(2)  # 等待一下再重试
                            elif not comments:
                                # 确实没有评论，跳过
                                print(f"视频 {video['bvid']} 没有评论")
                                break
                        except Exception as e:
                            retry_attempts += 1
                            print(f"爬取评论时出错: {e}，重试 ({retry_attempts}/{max_retry_attempts})...")
                            time.sleep(2)  # 等待一下再重试
                            
                    if not comments:
                        print(f"无法从视频 {video['bvid']} 获取评论，跳过")
                        continue
                    
                    # 限制评论数量
                    if len(comments) > comments_needed:
                        comments = comments[:comments_needed]
                    
                    # 保存评论数据
                    try:
                        # 保存原始评论数据到spide_data文件夹
                        spide_data_dir = f"./res_file/spide_data/{group_name}"
                        if not os.path.exists(spide_data_dir):
                            os.makedirs(spide_data_dir)
                            
                        # 保存评论数据
                        excel_file_path = save_comments_to_excel(comments, video, output_dir, group_name, keyword)
                        
                        # 调用情绪识别处理保存的文件
                        print(f"开始进行情绪识别: {excel_file_path}")
                        # 保存原始数据
                        save_comments_to_excel(comments, video, spide_data_dir, group_name, keyword)
                        spide_excel_path = os.path.join(spide_data_dir, os.path.basename(excel_file_path))
                        
                        # 进行情绪分析
                        try:
                            add_emotion(spide_excel_path, api_key)
                            print(f"情绪识别完成: {excel_file_path}")
                        except Exception as e:
                            print(f"情绪识别失败: {e}")
                        
                        # 更新已收集的评论数量
                        keyword_collected += len(comments)
                        total_comments_collected += len(comments)
                        print(f"已从视频 {video['bvid']} 爬取 {len(comments)} 条评论，"
                              f"当前关键词已爬取: {keyword_collected}/{keyword_target}，"
                              f"总计: {total_comments_collected}/{collection_count}")
                    except Exception as e:
                        print(f"保存评论数据时出错: {e}")
                        continue
                        
                except Exception as e:
                    print(f"处理视频 {video['bvid']} 时出错: {e}")
                    continue
        
        except Exception as e:
            print(f"爬取关键词 '{keyword}' 相关数据时出错: {e}")
            continue
    
    # 更新关键词组的统计信息
    keyword_groups = load_keyword_groups()
    for group in keyword_groups:
        if group["group_name"] == group_name:
            group["last_collected_at"] = current_time
            group["data_count"] = group.get("data_count", 0) + total_comments_collected
            group["warning_count"] = group.get("warning_count", 0) + warning_count
            break
    
    save_keyword_groups(keyword_groups)
    print(f"完成爬取 {group_name} 的数据，共爬取 {total_comments_collected}/{collection_count} 条评论，产生 {warning_count} 次预警")


def schedule_crawling_task(group):
    """为关键词组安排爬取任务"""
    group_name = group["group_name"]
    
    # 如果已有任务，先移除
    if group_name in running_jobs:
        scheduler.remove_job(running_jobs[group_name])
        del running_jobs[group_name]
    
    if group.get("is_collecting", False):
        # 设置定时任务
        frequency_hours = group.get("collection_frequency", 4)
        job = scheduler.add_job(
            crawl_data,
            IntervalTrigger(hours=frequency_hours),
            args=[group_name, group["keywords"], group.get("collection_count", 100)],
            id=f"crawl_{group_name}"
        )
        running_jobs[group_name] = f"crawl_{group_name}"
        
        # 如果需要立即开始爬取
        if group.get("immediate_collect", False):
            # 使用线程执行爬取，避免阻塞API响应
            thread = threading.Thread(
                target=crawl_data,
                args=(group_name, group["keywords"], group.get("collection_count", 100))
            )
            thread.daemon = True
            thread.start()
            
            # 重置immediate_collect，避免重复爬取
            group["immediate_collect"] = False
            keyword_groups = load_keyword_groups()
            for kg in keyword_groups:
                if kg["group_name"] == group_name:
                    kg["immediate_collect"] = False
                    break
            save_keyword_groups(keyword_groups)


def load_exist_res_file(group_name):
    if group_name is None:
        root_path = f"./res_file/emotion_data"
    else:
        root_path = f"./res_file/emotion_data/{group_name}"
    res = list()
    for root, dirs, files in os.walk(root_path):
        for file in files:
            if file.endswith('.xlsx'):
                file_path = os.path.join(root, file)
                res.append(file_path)
    return res


def read_xlex(file_path, need_row_data=False):
    wb = openpyxl.load_workbook(file_path)
    ws = wb.active
    data = list()
    res_row_data = list()
    for row in ws.iter_rows(min_row=2, max_row=ws.max_row, min_col=1, max_col=ws.max_column):
        row_data = {ws.cell(row=1, column=col_idx).value: cell.value for col_idx, cell in enumerate(row, start=1)}
        time = row_data.get("time")
        emotion = row_data.get("emotion")
        platform = row_data.get("platform", "bilibili")
        # 标题	来源	情感类型	发布时间	热度	操作
        res_row_data.append({
            'id': row_data.get('comment_id'),
            'title': row_data.get('content'),
            'platform': platform,
            'emotion': emotion,
            'time': time,
            'hot': row_data.get('likes'),
        })
        data.append({"time": time, "emotion": emotion, "platform": platform})
    if not need_row_data:
        return data, ws.max_row - 1
    return data, ws.max_row - 1, res_row_data


@app.post("/create_keyword_group/")
async def create_keyword_group(group: CreateKeywordGroup):
    keyword_groups = load_keyword_groups()
    if any(existing_group["group_name"] == group.group_name for existing_group in keyword_groups):
        raise HTTPException(status_code=400, detail="Group name already exists")
    
    group_dict = group.dict()
    keyword_groups.append(group_dict)
    save_keyword_groups(keyword_groups)
    
    # 安排爬取任务
    schedule_crawling_task(group_dict)
    
    return {"message": "Keyword group created successfully", "group": group, 'code': 200}


@app.post("/update_keyword_group/")
async def update_keyword_group(updated_group: dict):
    keyword_groups = load_keyword_groups()
    if updated_group['group_name'] not in [group["group_name"] for group in keyword_groups]:
        raise HTTPException(status_code=404, detail="Keyword group not found")
    
    for group in keyword_groups:
        if group["group_name"] == updated_group['group_name']:
            # 检查是否改变了收集状态或频率
            old_is_collecting = group.get("is_collecting", False)
            old_frequency = group.get("collection_frequency", 4)
            
            group.update(updated_group)
            
            # 如果收集状态或频率改变，需要重新安排爬取任务
            if (old_is_collecting != group.get("is_collecting", False) or 
                old_frequency != group.get("collection_frequency", 4)):
                schedule_crawling_task(group)
            
            break
    
    save_keyword_groups(keyword_groups)
    return {"message": "Keyword group updated successfully", "group": updated_group, 'code': 200}


@app.post("/delete_keyword_group/")
async def delete_keyword_group(group_name: DeleteKeywordGroup):
    group_name = group_name.group_name
    
    # 停止相关的爬取任务
    if group_name in running_jobs:
        scheduler.remove_job(running_jobs[group_name])
        del running_jobs[group_name]
    
    keyword_groups = load_keyword_groups()
    keyword_groups = [group for group in keyword_groups if group["group_name"] != group_name]
    save_keyword_groups(keyword_groups)
    return {"message": f"{group_name} deleted successfully", "code": 200}


@app.get("/keyword_groups/")
async def get_keyword_groups(group_name: str = None):
    keyword_groups = load_keyword_groups()
    if group_name:
        keyword_groups = [
            group for group in keyword_groups if group_name.lower() in group["group_name"].lower()
        ]
        if not keyword_groups:
            raise HTTPException(status_code=404, detail="No matching keyword groups found")
    
    # 清零数据计数，从文件重新计算
    for group in keyword_groups:
        group["data_count"] = 0
        for file in load_exist_res_file(group["group_name"]):
            _, data_count = read_xlex(file)
            group["data_count"] += data_count
    
    total_data_count = sum(group["data_count"] for group in keyword_groups)
    total_warning_count = sum(group["warning_count"] for group in keyword_groups)
    return {"keyword_groups": keyword_groups, 'code': 200, "total_data_count": total_data_count, "total_warning_count": total_warning_count}


# 手动触发爬取
@app.post("/trigger_collection/")
async def trigger_collection(group_name: str, collection_count: int = None):
    keyword_groups = load_keyword_groups()
    target_group = None
    
    for group in keyword_groups:
        if group["group_name"] == group_name:
            target_group = group
            break
    
    if not target_group:
        raise HTTPException(status_code=404, detail="Keyword group not found")
    
    # 如果前端传入了爬取数量，使用传入的值，否则使用关键词组中的默认值
    actual_count = collection_count if collection_count is not None else target_group.get("collection_count", 100)
    
    # 使用线程执行爬取，避免阻塞API响应
    thread = threading.Thread(
        target=crawl_data,
        args=(group_name, target_group["keywords"], actual_count)
    )
    thread.daemon = True
    thread.start()
    
    return {"message": f"Collection triggered for {group_name} with count {actual_count}", "code": 200}


# 舆情分析
@app.get('/sentiment_analysis/')
async def sentiment_analysis(group_name: str = None):
    file_list = load_exist_res_file(group_name)
    platform_res = collections.defaultdict(int)
    emotion_res = collections.defaultdict(int)
    date_res = collections.defaultdict(int)
    for file in file_list:
        now_res, _ = read_xlex(file)
        for item in now_res:
            platform_res[item['platform']] += 1
            emotion_res[item['emotion']] += 1
            date_res[item['time'].split()[0]] += 1
    # platform_res_list的value处理成百分比的形式
    total = sum(platform_res.values())
    for key in platform_res:
        platform_res[key] = round(platform_res[key] / total * 100, 2)
    platform_res_list = [{"name": key, "value": value} for key, value in platform_res.items()]
    # emotion_res_list的value处理成百分比的形式
    total = sum(emotion_res.values())
    emotion_res_count = [{"name": key, "value": value} for key, value in emotion_res.items()]
    for key in emotion_res:
        emotion_res[key] = round(emotion_res[key] / total * 100, 2)
    emotion_res_list = [{"name": key, "value": value} for key, value in emotion_res.items()]
    today = datetime.now()
    seven_days_ago = today - timedelta(days=7)
    fourteen_days_ago = today - timedelta(days=14)
    thirty_days_ago = today - timedelta(days=30)

    date_res_list = {
        "last_7_days": [{"name": key, "value": value} for key, value in date_res.items() if datetime.strptime(key, "%Y-%m-%d") >= seven_days_ago],
        "last_14_days": [{"name": key, "value": value} for key, value in date_res.items() if datetime.strptime(key, "%Y-%m-%d") >= fourteen_days_ago],
        "last_30_days": [{"name": key, "value": value} for key, value in date_res.items() if datetime.strptime(key, "%Y-%m-%d") >= thirty_days_ago],
    }
    return {'platform_res': platform_res_list, 'emotion_res': emotion_res_list, 'date_res': date_res_list, 'code': 200, 'emotion_res_count': emotion_res_count}


@app.post("/filter_sentiment_data/")
async def filter_sentiment_data(info: FilterSentimentData):
    group_name = info.group_name
    emotion_type = info.emotion_type
    platform = info.platform
    start_time = info.start_time
    end_time = info.end_time
    print(info)
    file_list = load_exist_res_file(group_name)
    filtered_data = []
    total_data_count = 0
    positive_count = 0
    negative_count = 0
    today = datetime.now().strftime("%Y-%m-%d")
    today_new_count = 0

    for file in file_list:
        now_res, _, row_data = read_xlex(file, need_row_data=True)
        for index, item in enumerate(now_res):
            item_time = datetime.strptime(item["time"].split()[0], "%Y-%m-%d")
            if start_time and item_time < datetime.strptime(start_time, "%Y-%m-%d"):
                continue
            if end_time and item_time > datetime.strptime(end_time, "%Y-%m-%d"):
                continue
            if platform != "全部" and item["platform"] != platform:
                continue
            if emotion_type != "全部" and item["emotion"] != emotion_type:
                continue

            filtered_data.append(row_data[index])
            total_data_count += 1
            if item["emotion"] == "积极":
                positive_count += 1
            elif item["emotion"] == "消极":
                negative_count += 1
            if item["time"].split()[0] == today:
                today_new_count += 1

    return {
        "total_data_count": total_data_count,
        "today_new_count": today_new_count,
        "positive_count": positive_count,
        "negative_count": negative_count,
        "filtered_data": filtered_data,
        "code": 200,
    }


# 在应用启动时，为现有的方案安排任务
@app.on_event("startup")
async def startup_event():
    keyword_groups = load_keyword_groups()
    for group in keyword_groups:
        schedule_crawling_task(group)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
