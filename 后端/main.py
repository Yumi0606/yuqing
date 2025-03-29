import os
import json

from tqdm import tqdm

from bilibili_api import search_bilibili_videos, get_video_comments
from data_handler import create_videos_folder, save_comments_to_excel, save_videos_to_excel


class Main:

    def __init__(self):
        self._headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://www.bilibili.com/",
            "Origin": "https://www.bilibili.com",
            "cookie": "bili_ticket_expires=1713062992; b_nut=1712803665"
        }
        self.KEYWORD_GROUP_FILE = "./keyword_groups.json"

    def search(self, keyword_list, group_id):
        # 获取前 10 条视频数据
        folder_name = create_videos_folder(group_id)
        print(f"创建的文件夹名称: {folder_name}")
        for keyword in keyword_list:
            video_list = search_bilibili_videos(self._headers, keyword, num_results=5)
            if not video_list:
                print(f"{group_id} - {keyword} 未获取到视频数据，程序终止。")
                continue
            # 爬取每个视频的评论并保存
            for video in tqdm(video_list, desc="爬取评论"):
                comments = get_video_comments(self._headers, video["aid"], video["bvid"], max_pages=3)
                if comments:
                    comment_excel_path = save_comments_to_excel(comments, video, folder_name, group_id, keyword)
                    video["comment_csv"] = comment_excel_path
            # 保存视频数据
            save_videos_to_excel(video_list, os.path.join(folder_name, f"{group_id}_{keyword}_video_info.xlsx"))
            print(f"{keyword} - 所有评论已保存到文件夹: {folder_name}")

    def load_keyword_groups(self):
        if os.path.exists(self.KEYWORD_GROUP_FILE):
            with open(self.KEYWORD_GROUP_FILE, "r") as file:
                return json.load(file)
        return []

    def run(self):
        all_keyword_group = self.load_keyword_groups()
        for k_group in all_keyword_group:
            if k_group['is_collecting']:
                self.search(k_group["keywords"], k_group["group_name"])
        print("所有关键字组的数据已爬取完成")


if __name__ == "__main__":
    t = Main()
    t.run()
