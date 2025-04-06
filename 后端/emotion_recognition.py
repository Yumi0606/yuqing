from aip import AipNlp
import time
import os
import openpyxl
import threading
from datetime import datetime

# 添加情绪分析处理锁
emotion_lock = threading.Lock()

def add_emotion(file_path, api_key, analyze_only=False, timeout=60):
    """为评论数据添加情感分析结果，添加了超时保护和详细日志输出
    
    参数:
        file_path: 文件路径
        api_key: 百度AI的API密钥
        analyze_only: 如果为True，只返回统计结果不修改文件
        timeout: API调用超时时间(秒)
        
    返回:
        result_stats: 包含统计信息的字典
    """
    # 创建结果统计字典
    result_stats = {
        "total_comments": 0,
        "processed_comments": 0,
        "positive_count": 0, 
        "negative_count": 0,
        "neutral_count": 0,
        "unknown_count": 0,
        "errors": [],
        "file_path": file_path,
        "success": False,
        "platform_stats": {},  # 平台统计
        "date_stats": {},      # 日期统计
        "needs_processing": False  # 是否需要处理
    }
    
    # 检查文件是否存在
    file_path = os.path.normpath(file_path)
    if not os.path.exists(file_path):
        result_stats["errors"].append(f"文件不存在: {file_path}")
        print(f"文件不存在: {file_path}")
        return result_stats
    
    try:
        # 初始化百度AI NLP客户端 - 提前创建以便在需要时立即使用
        APP_ID = "6335828"
        SECRET_KEY = "hZuLZY3gotc0qscU4Rp5TFFcGlA0mN0z"
        client = AipNlp(APP_ID, api_key, SECRET_KEY)
        
        # 使用 openpyxl 读取文件
        wb = openpyxl.load_workbook(file_path)
        ws = wb.active
        
        # 获取标题行和必要的列索引
        headers = [cell.value for cell in ws[1]]
        columns = {
            'content': None,
            'platform': None,
            'emotion': None,
            'time': None
        }
        
        # 查找各列索引
        for idx, header in enumerate(headers, 1):
            if header in columns:
                columns[header] = idx
        
        # 检查是否有内容列
        if columns['content'] is None:
            result_stats["errors"].append("找不到评论内容列，文件不合法")
            print("找不到评论内容列，文件不合法")
            return result_stats
        
        # 获取总评论数
        total_rows = ws.max_row - 1  # 减去标题行
        result_stats["total_comments"] = total_rows
        
        # 检查是否需要添加情感列
        if columns['emotion'] is None and not analyze_only:
            result_stats["needs_processing"] = True
            columns['emotion'] = len(headers) + 1
            ws.cell(row=1, column=columns['emotion'], value="emotion")
            print(f"为文件 {file_path} 添加emotion列")
        
        # 如果是只分析模式且已有情感列，直接统计不修改
        if analyze_only and columns['emotion'] is not None:
            # 统计已有情感数据
            for row in range(2, ws.max_row + 1):
                # 处理平台信息
                platform = "B站"  # 默认平台
                if columns['platform']:
                    platform_val = ws.cell(row=row, column=columns['platform']).value
                    if platform_val:
                        platform = platform_val
                
                if platform not in result_stats["platform_stats"]:
                    result_stats["platform_stats"][platform] = 0
                result_stats["platform_stats"][platform] += 1
                
                # 处理情感统计
                if columns['emotion']:
                    emotion = ws.cell(row=row, column=columns['emotion']).value or "未知"
                    if emotion == "积极":
                        result_stats["positive_count"] += 1
                    elif emotion == "消极":
                        result_stats["negative_count"] += 1
                    elif emotion == "中性":
                        result_stats["neutral_count"] += 1
                    else:
                        result_stats["unknown_count"] += 1
                
                # 处理日期统计
                _process_date_stats(result_stats, row, columns['time'], ws)
            
            result_stats["success"] = True
            result_stats["processed_comments"] = total_rows
            return result_stats
        
        # 使用锁保护情感分析过程
        if result_stats["needs_processing"] and not analyze_only:
            with emotion_lock:
                print(f"开始处理文件: {file_path}，共 {total_rows} 条评论")
                processed = 0
                start_time = time.time()
                
                # 处理每一行数据
                for row in range(2, ws.max_row + 1):
                    # 检查是否已超时
                    if time.time() - start_time > timeout:
                        print(f"处理超时，已完成 {processed}/{total_rows} 条评论")
                        result_stats["errors"].append(f"情感分析超时，已处理 {processed} 条评论")
                        break
                    
                    # 获取评论内容
                    content = ws.cell(row=row, column=columns['content']).value
                    
                    # 处理平台信息
                    platform = "B站"  # 默认平台
                    if columns['platform']:
                        platform_val = ws.cell(row=row, column=columns['platform']).value
                        if platform_val:
                            platform = platform_val
                    
                    if platform not in result_stats["platform_stats"]:
                        result_stats["platform_stats"][platform] = 0
                    result_stats["platform_stats"][platform] += 1
                    
                    # 处理日期信息
                    _process_date_stats(result_stats, row, columns['time'], ws)
                    
                    # 检查是否已有情感分析结果
                    if columns['emotion']:
                        existing_emotion = ws.cell(row=row, column=columns['emotion']).value
                        if existing_emotion and existing_emotion != "未知":
                            # 计入统计
                            update_emotion_stats(result_stats, existing_emotion)
                            result_stats["processed_comments"] += 1
                            continue
                    
                    # 进行情感分析
                    if content and isinstance(content, str) and content.strip():
                        try:
                            # 打印发送到API的评论内容（截断长评论以避免日志过长）
                            display_content = content[:100] + "..." if len(content) > 100 else content
                            print(f"API调用 (行 {row}): {display_content}")
                            
                            # 调用情感分析API
                            result = client.sentimentClassify(content)
                            # 打印API返回结果
                            print(f"API返回: {result}")
                            
                            time.sleep(0.5)  # 避免API调用频率限制
                            
                            # 处理结果
                            emotion = "未知"
                            if "items" in result and len(result["items"]) > 0:
                                sentiment = result["items"][0]["sentiment"]
                                confidence = result["items"][0].get("confidence", 0)
                                print(f"情感值: {sentiment}, 置信度: {confidence}")
                                
                                if sentiment == 0:
                                    emotion = "消极"
                                    result_stats["negative_count"] += 1
                                elif sentiment == 1:
                                    emotion = "中性"
                                    result_stats["neutral_count"] += 1
                                else:
                                    emotion = "积极"
                                    result_stats["positive_count"] += 1
                            else:
                                result_stats["unknown_count"] += 1
                                print(f"无法获取情感结果，API返回: {result}")
                            
                            # 写入情感结果
                            if columns['emotion']:
                                ws.cell(row=row, column=columns['emotion'], value=emotion)
                            result_stats["processed_comments"] += 1
                            
                        except Exception as e:
                            error_msg = f"情感分析出错 (行 {row}): {str(e)}"
                            print(error_msg)
                            result_stats["errors"].append(error_msg)
                            if columns['emotion']:
                                ws.cell(row=row, column=columns['emotion'], value="未知")
                            result_stats["unknown_count"] += 1
                    else:
                        if columns['emotion']:
                            ws.cell(row=row, column=columns['emotion'], value="未知")
                        result_stats["unknown_count"] += 1
                    
                    # 更新进度
                    processed += 1
                    if processed % 50 == 0:
                        print(f"已处理 {processed}/{total_rows} 条评论 ({processed/total_rows*100:.1f}%)")
                
                # 保存到原文件 (如果不是只分析模式且需要处理)
                if not analyze_only and result_stats["needs_processing"]:
                    wb.save(file_path)
                    print(f"情绪字段已成功添加到原文件：{file_path}")
                
                # 设置成功标志
                result_stats["success"] = True
                
                return result_stats
    
    except Exception as e:
        error_msg = f"处理文件时出错: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        result_stats["errors"].append(error_msg)
        return result_stats

# 辅助函数: 处理日期统计
def _process_date_stats(result_stats, row, time_idx, ws):
    if time_idx:
        time_val = ws.cell(row=row, column=time_idx).value
        if time_val:
            # 如果时间格式是datetime对象，转换为字符串
            if isinstance(time_val, datetime):
                time_val = time_val.strftime("%Y-%m-%d %H:%M:%S")
            try:
                date = time_val.split()[0]  # 只取日期部分
                if date not in result_stats["date_stats"]:
                    result_stats["date_stats"][date] = 0
                result_stats["date_stats"][date] += 1
            except (AttributeError, IndexError):
                # 忽略错误格式的日期
                pass

# 辅助函数: 更新情感统计
def update_emotion_stats(result_stats, emotion):
    if emotion == "积极":
        result_stats["positive_count"] += 1
    elif emotion == "消极":
        result_stats["negative_count"] += 1
    elif emotion == "中性":
        result_stats["neutral_count"] += 1
    else:
        result_stats["unknown_count"] += 1

# 修改读取文件函数，直接从spide_data目录读取
def load_exist_res_file(group_name=None):
    # 确保使用spide_data目录
    root_path = "./res_file/spide_data"
    if group_name:
        root_path = os.path.join(root_path, group_name)
    
    print(f"搜索路径: {root_path}")
    result_files = []
    for root, dirs, files in os.walk(root_path):
        for file in files:
            if file.endswith('.xlsx') and not '_video_info' in file:
                result_files.append(os.path.join(root, file))
    print(f"找到 {len(result_files)} 个文件")
    return result_files

def main():
    group_name = '游戏'
    api_key = "hZuLZY3gotc0qscU4Rp5TFFcGlA0mN0z"
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
