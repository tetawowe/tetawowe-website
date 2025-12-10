import json
import re

input_file = "name_list.txt"
output_file = "name_list.json"

# 读取文件
with open(input_file, "r", encoding="utf-8") as f:
    text = f.read()

# 替换全形逗号与冒号为半形，统一格式
text = text.replace("，", ",").replace("：", ":")

# 用正则拆分两组
pattern = r"Former Colleague:\s*(.*?)\s*Former Internship:\s*(.*)"
match = re.search(pattern, text, re.S)

if not match:
    raise ValueError("❌ 无法找到 'Former Colleague' 和 'Former Internship' 两组数据，请检查格式。")

colleagues_raw = match.group(1)
interns_raw = match.group(2)

def parse_names(raw_text, category):
    # 拆分逗号分隔的名字并清理空格
    names = [n.strip() for n in raw_text.split(",") if n.strip()]
    return [{"name": n, "desc": category} for n in names]

data = {
    "former_colleague": parse_names(colleagues_raw, "Former Colleague"),
    "former_internship": parse_names(interns_raw, "Former Internship")
}

# 输出 JSON 文件
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ 已生成 {output_file}，共 {len(data['former_colleague'])} 位同事，{len(data['former_internship'])} 位实习生。")
