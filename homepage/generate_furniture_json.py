import os
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.join(SCRIPT_DIR, "furniture")
OUTPUT_JSON = os.path.join(SCRIPT_DIR, "furniture-thumbnails.json")

IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".webp")

data = []

def format_title(folder_name: str) -> str:
    """
    pinewood-tea-set -> Pinewood Tea Set
    """
    return folder_name.replace("-", " ").title()

for folder_name in sorted(os.listdir(BASE_DIR)):
    folder_path = os.path.join(BASE_DIR, folder_name)

    if not os.path.isdir(folder_path):
        continue

    # 读取并排序图片
    images = [
        f for f in os.listdir(folder_path)
        if f.lower().endswith(IMAGE_EXTS)
    ]

    if not images:
        print(f"⚠️ Skipped {folder_name}: no images found")
        continue

    images.sort()

    image_paths = [
        f"/homepage/furniture/{folder_name}/{img}"
        for img in images
    ]

    item = {
        "id": folder_name,                     # 机器用（不动）
        "title": format_title(folder_name),    # 人看的
        "image": image_paths[0],
        "images": image_paths,
        "folder": f"/homepage/furniture/{folder_name}"
    }

    data.append(item)

with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"✅ Generated {OUTPUT_JSON} with {len(data)} items")
