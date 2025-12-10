import os
import json

# 设置路径（改成你的实际路径）
root_dir = r"C:\Users\User\Desktop\tetawowe-website\material\A-Z Sorting"

materials_data = {}

# 遍历所有材料文件夹（A-Z Sorting 下的一级目录）
for material_name in sorted(os.listdir(root_dir)):
    material_path = os.path.join(root_dir, material_name)
    if not os.path.isdir(material_path):
        continue

    projects = []
    for project_name in sorted(os.listdir(material_path)):
        project_path = os.path.join(material_path, project_name)
        if not os.path.isdir(project_path):
            continue

        # 初始化项目信息
        project_info = {
            "project": project_name,
            "year": "",
            "apply_on": "",
            "supplier": "",
            "note": "",
            "images": []
        }

        # 读取 note.txt（如果存在）
        note_path = os.path.join(project_path, "note.txt")
        if os.path.exists(note_path):
            with open(note_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("Project:"):
                        project_info["project"] = line.split("Project:")[1].strip()
                    elif line.startswith("Year:"):
                        project_info["year"] = line.split("Year:")[1].strip()
                    elif line.startswith("Apply on:"):
                        project_info["apply_on"] = line.split("Apply on:")[1].strip()
                    elif line.startswith("Supplier:"):
                        project_info["supplier"] = line.split("Supplier:")[1].strip()
                    elif line.startswith("Note:"):
                        note_text = line.split("Note:")[1].strip()
                        remaining = f.read().strip()
                        if remaining:
                            note_text += "\n" + remaining
                        project_info["note"] = note_text

        # 获取所有图片
        images = [
            img for img in sorted(os.listdir(project_path))
            if img.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
        ]
        project_info["images"] = images

        projects.append(project_info)

    # ✅ 即使没有 project 也保留
    materials_data[material_name] = projects

# 输出 JSON 文件到上一级目录
output_path = os.path.join(os.path.dirname(root_dir), "materials.json")

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(materials_data, f, ensure_ascii=False, indent=2)

print(f"✅ 已生成 materials.json，共 {len(materials_data)} 个材料（包含空文件夹）。")
