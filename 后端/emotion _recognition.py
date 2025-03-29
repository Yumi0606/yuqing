import pandas as pd
from aip import AipNlp
import time
import os


def add_emotion(file_path, api_key):
    # 初始化百度AI NLP客户端
    APP_ID = "6335828"  # 你的APP_ID
    SECRET_KEY = "hZuLZY3gotc0qscU4Rp5TFFcGlA0mN0z"  # 你的SECRET_KEY
    client = AipNlp(APP_ID, api_key, SECRET_KEY)
    # 读取Excel文件
    df = pd.read_excel(file_path)
    res_file_path = file_path.replace('spide_data', 'emotion_data')

    def get_emotion(text):
        if not text or len(text.strip()) == 0:  # 检查文本是否为空
            return "未知"
        result = client.sentimentClassify(text)
        print(result)  # 打印API返回结果
        time.sleep(0.5)  # 添加延时，避免调用频率超限
        if "items" in result and len(result["items"]) > 0:
            sentiment = result["items"][0]["sentiment"]
            if sentiment == 0:
                return "消极"
            elif sentiment == 1:
                return "中性"
            else:
                return "积极"

    # 为每一行评论添加情绪字段
    df['emotion'] = df['content'].apply(get_emotion)

    res_path = res_file_path[:res_file_path.rfind('/')]
    if not os.path.exists(res_path):
        os.makedirs(res_path)
    # 将结果保存回原文件
    df.to_excel(res_file_path, index=False)

    print(f"情绪字段已成功添加到文件：{res_file_path}")


def load_exist_res_file():
    root_path = f"./res_file/emotion_data"
    for root, dirs, files in os.walk(root_path):
        for file in files:
            if file.endswith('.xlsx'):
                print(file)


def main():
    group_name = '游戏'
    api_key = "roOebLVfNNu2PDWp8sI57ZAT"
    # 多层遍历文件夹内的文件
    root_path = f"./res_file/spide_data/{group_name}"
    for root, dirs, files in os.walk(root_path):
        for file in files:
            if file.endswith('.xlsx'):
                file_path = os.path.join(root, file)
                if '_video_info' in file_path:
                    continue
                add_emotion(file_path, api_key)


if __name__ == "__main__":
    main()
