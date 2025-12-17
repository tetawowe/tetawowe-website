import os

# 根目录，根据你的本地路径修改
ROOT_DIR = r"C:\Users\User\Desktop\github\tetawowe-website\works\works-by-year"

# 遍历所有年份文件夹
for year_folder in os.listdir(ROOT_DIR):
    year_path = os.path.join(ROOT_DIR, year_folder)
    if os.path.isdir(year_path):
        # 遍历该年份下的所有项目文件夹
        for project_folder in os.listdir(year_path):
            project_path = os.path.join(year_path, project_folder)
            if os.path.isdir(project_path):
                new_name = project_folder.lower()
                new_path = os.path.join(year_path, new_name)
                if project_path != new_path:
                    # 重命名文件夹
                    os.rename(project_path, new_path)
                    print(f"Renamed: {project_path} -> {new_path}")
