from PIL import Image
import os

# 输入图片所在的文件夹
input_folder = r"C:\Users\User\Desktop\tetawowe-website\homepage\thumbnail"   # 你的图片文件夹路径
output_folder = "output"  # 转换后保存的文件夹

# 如果输出文件夹不存在，就创建
os.makedirs(output_folder, exist_ok=True)

for filename in os.listdir(input_folder):
    file_path = os.path.join(input_folder, filename)
    
    # 跳过非文件
    if not os.path.isfile(file_path):
        continue

    try:
        with Image.open(file_path) as img:
            # 转换为 RGB （避免 PNG/透明图像报错）
            img = img.convert("RGB")
            
            # 调整大小到 165x165
            img_resized = img.resize((165, 165), Image.LANCZOS)
            
            # 输出文件名，强制改为 jpg
            base_name = os.path.splitext(filename)[0]
            output_path = os.path.join(output_folder, base_name + ".jpg")
            
            img_resized.save(output_path, "JPEG", quality=95)
            print(f"已处理: {output_path}")

    except Exception as e:
        print(f"跳过 {filename}, 错误: {e}")

print("全部完成！")
