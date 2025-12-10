import os
import json
import re

# thumbnail 文件夹路径
thumb_root = r"C:\Users\User\Desktop\tetawowe-website\homepage\thumbnail"

# 读取 ID.txt
id_mapping = {}
with open(os.path.join(os.path.dirname(thumb_root), "ID.txt"), "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line or ":" not in line:
            continue
        order_str, project_id = line.split(":", 1)
        id_mapping[int(order_str)] = project_id.strip()

projects = []

for file_name in os.listdir(thumb_root):
    if not file_name.lower().endswith(('.jpg', '.jpeg', '.png')):
        continue
    
    # 解析编号和标题
    match = re.match(r"(\d+)-(.+)\.(jpg|jpeg|png)", file_name, re.IGNORECASE)
    if match:
        order = int(match.group(1))
        title = match.group(2).strip()
    else:
        order = 9999
        title = file_name.rsplit('.', 1)[0]

    project_entry = {
        "title": title,
        "image": f"thumbnail/{file_name}",
        "order": order
    }

    # ✅ 如果 ID.txt 有对应 order，就加上 id
    if order in id_mapping:
        project_entry["id"] = id_mapping[order]
    else:
        print(f"⚠ 找不到 order {order} 对应的 id")

    projects.append(project_entry)

# 按 order 排序
projects.sort(key=lambda x: x["order"])

# 输出 JSON 文件，保存到 homepage 文件夹
output_file = os.path.join(os.path.dirname(thumb_root), "thumbnails.json")
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(projects, f, ensure_ascii=False, indent=2)

print(f"✅ thumbnails.json 已生成: {output_file}")
