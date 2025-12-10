import os
import json
import re

# works-by-year 根目录
works_root = r"C:\Users\User\Desktop\tetawowe-website\works\works-by-year"

# 存放结果
projects_data = {}

# 定义自然排序函数（处理数字 + 字母混合）
def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower() for text in re.split('(\d+)', s)]

# 清理隐藏字符与多余空格
def clean_name(name):
    return name.strip().replace("\u200b", "").replace("\u202f", "")

# 用于记录重复项目报告
duplicate_reports = []

# 遍历年份资料夹（自然排序，例如 2023, 2024...）
for year_folder in sorted(os.listdir(works_root), key=natural_sort_key):
    year_path = os.path.join(works_root, year_folder)
    if not os.path.isdir(year_path):
        continue

    print(f"\n📂 年份: {year_folder}")
    projects_data[year_folder] = []  # 每年一个 list

    # 遍历该年份的项目资料夹（自然排序）
    for raw_folder in sorted(os.listdir(year_path), key=natural_sort_key):
        project_folder = clean_name(raw_folder)
        project_path = os.path.join(year_path, raw_folder)
        if not os.path.isdir(project_path):
            continue

        print(f"   ├─ {repr(project_folder)}")  # 调试输出项目文件夹名

        text_file = os.path.join(project_path, "text.txt")

        # 默认字段
        title = project_folder
        project_type = ""
        team = ""
        location = ""
        project_year = year_folder
        description = ""
        middle_description = ""
        layout = ""  # 新增字段

        # 尝试读取 text.txt
        if os.path.exists(text_file):
            with open(text_file, "r", encoding="utf-8") as f:
                lines = f.readlines()

            i = 0
            collecting_description = False
            collecting_middle = False
            desc_lines = []
            mid_lines = []

            while i < len(lines):
                line = lines[i].rstrip("\n")

                if line.lower().startswith("title:"):
                    title = line.split(":", 1)[1].strip()
                    collecting_description = collecting_middle = False

                elif line.lower().startswith("project-type:"):
                    project_type = line.split(":", 1)[1].strip()
                    collecting_description = collecting_middle = False

                elif line.lower().startswith("team:"):
                    team = line.split(":", 1)[1].strip()
                    collecting_description = collecting_middle = False

                elif line.lower().startswith("location:"):
                    location = line.split(":", 1)[1].strip()
                    collecting_description = collecting_middle = False

                elif line.lower().startswith("project-year:"):
                    project_year = line.split(":", 1)[1].strip()
                    collecting_description = collecting_middle = False

                elif line.lower().startswith("layout:"):
                    layout = line.split(":", 1)[1].strip()
                    collecting_description = collecting_middle = False

                elif line.lower().startswith("description:"):
                    collecting_description = True
                    collecting_middle = False
                    desc_lines.append(line.split(":", 1)[1])

                elif line.lower().startswith("middle description:"):
                    collecting_middle = True
                    collecting_description = False
                    mid_lines.append(line.split(":", 1)[1])

                else:
                    if collecting_description:
                        desc_lines.append(line)
                    elif collecting_middle:
                        mid_lines.append(line)

                i += 1

            description = "\n".join(desc_lines).strip()
            middle_description = "\n".join(mid_lines).strip()

        # 收集图片
        images_list = []
        for img_file in sorted(os.listdir(project_path), key=natural_sort_key):
            if img_file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                images_list.append(
                    f"../works/works-by-year/{year_folder}/{project_folder}/{img_file}"
                )

        # 组合 JSON 格式
        project_info = {
            "id": project_folder.lower().replace(" ", "-"),
            "title": title,
            "year": project_year,
            "folder": f"../works/works-by-year/{year_folder}/{project_folder}",
            "images": images_list,
            "text": "text.txt",
            "type": project_type,
            "team": team,
            "location": location,
            "description": description,
            "middle-description": middle_description,
            "layout": layout
        }

        # 检测重复项目（同一年份内）
        existing_titles = [p["title"] for p in projects_data[year_folder]]
        if title in existing_titles:
            duplicate_reports.append({
                "year": year_folder,
                "duplicate_title": title,
                "folders": [
                    p["folder"] for p in projects_data[year_folder] if p["title"] == title
                ] + [project_info["folder"]]
            })

        projects_data[year_folder].append(project_info)

# 输出 JSON 文件
output_file = os.path.join(os.path.dirname(__file__), "projects.json")
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(projects_data, f, ensure_ascii=False, indent=2)

print(f"\n✅ JSON 文件已生成: {output_file}")

# 输出重复报告
if duplicate_reports:
    print("\n⚠️ 检测到以下重复项目：")
    for dup in duplicate_reports:
        print(f"   🔁 年份 {dup['year']} -> 标题: {dup['duplicate_title']}")
        for folder in dup["folders"]:
            print(f"      - {folder}")
else:
    print("\n✅ 未发现重复项目。")
