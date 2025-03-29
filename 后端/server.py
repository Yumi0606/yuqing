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


def load_keyword_groups():
    if os.path.exists(KEYWORD_GROUP_FILE):
        with open(KEYWORD_GROUP_FILE, "r") as file:
            try:
                return json.load(file)
            except Exception as e:
                print(f'Error loading keyword groups: {e}')
                return []
    return []


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
    keyword_groups.append(group.dict())
    with open(KEYWORD_GROUP_FILE, "w") as file:
        json.dump(keyword_groups, file, indent=4, default=str)
    return {"message": "Keyword group created successfully", "group": group, 'code': 200}


@app.post("/update_keyword_group/")
async def update_keyword_group(updated_group: dict):
    keyword_groups = load_keyword_groups()
    if updated_group['group_name'] not in [group["group_name"] for group in keyword_groups]:
        raise HTTPException(status_code=404, detail="Keyword group not found")
    for group in keyword_groups:
        if group["group_name"] == updated_group['group_name']:
            group.update(updated_group)
    with open(KEYWORD_GROUP_FILE, "w") as file:
        json.dump(keyword_groups, file, indent=4, default=str)
    return {"message": "Keyword group updated successfully", "group": updated_group, 'code': 200}


@app.post("/delete_keyword_group/")
async def delete_keyword_group(group_name: DeleteKeywordGroup):
    group_name = group_name.group_name
    keyword_groups = load_keyword_groups()
    keyword_groups = [group for group in keyword_groups if group["group_name"] != group_name]
    with open(KEYWORD_GROUP_FILE, "w") as file:
        json.dump(keyword_groups, file, indent=4, default=str)
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
    for group in keyword_groups:
        for file in load_exist_res_file(group["group_name"]):
            _, data_count = read_xlex(file)
            group["data_count"] += data_count
    total_data_count = sum(group["data_count"] for group in keyword_groups)
    total_warning_count = sum(group["warning_count"] for group in keyword_groups)
    return {"keyword_groups": keyword_groups, 'code': 200, "total_data_count": total_data_count, "total_warning_count": total_warning_count}


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

if __name__ == "__main__":
    # r = read_xlex('./res_file/emotion_data/游戏/2025032712/游戏_刺客信条/BV1ua411o7hy_一口气看完刺客信条全系列8万字爽看15年刺客故事_2025032712.xlsx')
    # r = load_keyword_groups()
    # print(r)
    uvicorn.run(app, host="0.0.0.0", port=8000)
