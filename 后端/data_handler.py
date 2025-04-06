import os
from datetime import datetime
import xlsxwriter
import re

def clean_title(title):
    """
    清理标题，去掉高亮标签和特殊符号
    """
    # 去掉高亮标签 <em class="keyword"> 和 </em>
    title = re.sub(r'<em class="keyword">|</em>', '', title)

    # 去掉其他 HTML 标签
    title = re.sub(r'<[^>]+>', '', title)

    # 去掉表情符号和其他非文字字符
    title = re.sub(r'[^\w\s\u4e00-\u9fff]', '', title)  # 保留中文、英文、数字和空格

    return title.strip()  # 去掉前后空格

def create_videos_folder(dir_name):
    """
    创建存储评论的目录
    """
    # 获取当前北京时间，精确到小时
    current_time = datetime.now().strftime("%Y%m%d%H")  # 格式：年月日小时
    # 创建文件夹名称
    folder_name = f"./res_file/spide_data/{dir_name}/{current_time}"
    # 创建文件夹
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)
    return folder_name

def save_comments_to_excel(comments, video, output_dir, keyid, keyword):
    """
    将评论数据保存为 Excel 文件
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    # 获取当前北京时间，精确到小时
    current_time = datetime.now().strftime("%Y%m%d%H")  # 格式：年月日小时
    # 清理标题
    title = clean_title(video["title"])
    # 创建完整的保存路径
    folder_name = os.path.join(output_dir, f"{keyid}_{keyword}")
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)
    # 创建 Excel 文件路径
    bvid = video['bvid']
    excel_file_path = os.path.join(folder_name, f"{bvid}_{title}_{current_time}.xlsx")
    print(excel_file_path)
    # 创建 Excel 工作簿和工作表
    workbook = xlsxwriter.Workbook(excel_file_path)
    worksheet = workbook.add_worksheet()
    # 写入表头
    headers = ["bvid", "comment_id", "user_id", "user_name", "user_gender", "user_level", "user_ip_location", "content", "likes", "time","platform"]
    for col, header in enumerate(headers):
        worksheet.write(0, col, header)
    # 写入评论数据
    for row, comment in enumerate(comments, start=1):
        worksheet.write(row, 0, comment["bvid"])
        worksheet.write(row, 1, comment["comment_id"])
        worksheet.write(row, 2, comment["user_id"])
        worksheet.write(row, 3, comment["user_name"])
        worksheet.write(row, 4, comment["user_gender"])
        worksheet.write(row, 5, comment["user_level"])
        worksheet.write(row, 6, comment["user_ip_location"])
        worksheet.write(row, 7, comment["content"])
        worksheet.write(row, 8, comment["likes"])
        worksheet.write(row, 9, comment["time"])
        worksheet.write(row, 10, comment["platform"])
    # 关闭工作簿
    workbook.close()
    return excel_file_path


def save_videos_to_excel(video_list, output_file):
    """
    将视频数据保存为 Excel 文件
    """
    # 创建 Excel 工作簿和工作表
    workbook = xlsxwriter.Workbook(output_file)
    worksheet = workbook.add_worksheet()

    # 写入表头
    headers = ["title", "link", "play_count", "comment_count", "bvid", "aid", "comment_csv"]
    for col, header in enumerate(headers):
        worksheet.write(0, col, header)

    # 写入视频数据
    for row, video in enumerate(video_list, start=1):
        worksheet.write(row, 0, video["title"])
        worksheet.write(row, 1, video["link"])
        worksheet.write(row, 2, video["play_count"])
        worksheet.write(row, 3, video["comment_count"])
        worksheet.write(row, 4, video["bvid"])
        worksheet.write(row, 5, video["aid"])
        worksheet.write(row, 6, video.get("comment_csv", ""))

    # 关闭工作簿
    workbook.close()
