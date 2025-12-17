const worksContainer = document.getElementById('works');
let allData = {}; // 存放 projects.json

// ===============================
// 工具：生成干净的 project URL
// ===============================
function getProjectUrl(project, yearKey) {
  if (project.layout && project.layout.toLowerCase() === "special") {
    return `${project.folder}/`;
  }

  // 如果 yearKey 为空或不存在，退回到 project.year 或 'unknown'
  if (!yearKey || yearKey === "") {
    yearKey = project.year || "unknown";
  }

  return `./works-by-year/${yearKey}/${project.id}/`;
}

// ===============================
// 辅助：根据 allData 推断项目所属年份
// ===============================
function inferYear(project) {
  for (const y in allData) {
    if (allData[y].includes(project)) return y;
  }
  return "unknown";
}

// ===============================
// 渲染按年份
// ===============================
function renderByYear(data) {
  worksContainer.innerHTML = ""; // 清空

  const years = Object.keys(data).sort((a, b) => b - a);

  years.forEach(year => {
    const projects = data[year];
    if (!projects || projects.length === 0) return;

    const yearSection = document.createElement('div');
    yearSection.className = 'year-section';

    const yearTitle = document.createElement('h2');
    yearTitle.textContent = year;
    yearSection.appendChild(yearTitle);

    projects.forEach(project => {
      let projectItem;

      if (project.skip && project.skip.toLowerCase() === "yes") {
        projectItem = document.createElement('span');
        projectItem.className = 'project-item disabled';
        projectItem.textContent = project.title;
      } else {
        projectItem = document.createElement('a');
        projectItem.className = 'project-item';
        projectItem.textContent = project.title;

        // 使用年份 key 生成 URL
        projectItem.href = getProjectUrl(project, year);

        // hover 图片路径完整
        if (project.images && project.images.length > 0) {
          projectItem.dataset.image = `${project.folder}/${project.images[0]}`;
        }
      }

      yearSection.appendChild(projectItem);
      yearSection.appendChild(document.createElement('br'));
    });

    worksContainer.appendChild(yearSection);
  });
}

// ===============================
// 渲染按类型
// ===============================
function renderByType(data) {
  worksContainer.innerHTML = ""; // 清空

  // 收集所有项目，同时附带所属年份
  let allProjects = [];
  Object.keys(data).forEach(year => {
    const projects = data[year];
    projects.forEach(project => {
      allProjects.push({ project, year }); // year 取外层 key
    });
  });

  // 按类型分组
  const typeGroups = {};
  allProjects.forEach(({ project, year }) => {
    const types = (project.type || "Others").split(",").map(t => t.trim());
    types.forEach(type => {
      if (!typeGroups[type]) typeGroups[type] = [];
      typeGroups[type].push({ project, year });
    });
  });

  // 渲染每个类型
  Object.keys(typeGroups).sort((a, b) => a.localeCompare(b)).forEach(type => {
    const projects = typeGroups[type].sort((a, b) =>
      a.project.title.localeCompare(b.project.title)
    );

    const typeSection = document.createElement('div');
    typeSection.className = 'type-section';

    const typeTitle = document.createElement('h2');
    typeTitle.textContent = type;
    typeSection.appendChild(typeTitle);

    projects.forEach(({ project, year }) => {
      let projectItem;

      if (project.skip && project.skip.toLowerCase() === "yes") {
        projectItem = document.createElement('span');
        projectItem.className = 'project-item disabled';
        projectItem.textContent = project.title;
      } else {
        projectItem = document.createElement('a');
        projectItem.className = 'project-item';
        projectItem.textContent = project.title;

        // ⭐ 这里使用外层年份 key
        projectItem.href = getProjectUrl(project, year);

        if (project.images && project.images.length > 0) {
          projectItem.dataset.image = `${project.folder}/${project.images[0]}`;
        }
      }

      typeSection.appendChild(projectItem);
      typeSection.appendChild(document.createElement('br'));
    });

    worksContainer.appendChild(typeSection);
  });
}


// ===============================
// 主逻辑
// ===============================
fetch('projects.json')
  .then(res => res.json())
  .then(data => {
    allData = data;
    renderByYear(allData); // 默认显示按年份
  })
  .catch(err => console.error("Failed to load projects.json:", err));

// ===============================
// 排序按钮
// ===============================
const sortYearSpan = document.getElementById('sort-year');
const sortTypeSpan = document.getElementById('sort-type');

sortYearSpan.addEventListener('click', () => {
  renderByYear(allData);
  sortYearSpan.classList.add('active');
  sortTypeSpan.classList.remove('active');
});

sortTypeSpan.addEventListener('click', () => {
  renderByType(allData);
  sortTypeSpan.classList.add('active');
  sortYearSpan.classList.remove('active');
});

// ===============================
// Hover 预览
// ===============================
const preview = document.getElementById('preview-image');

document.addEventListener('mouseover', e => {
  if (e.target.classList.contains('project-item') &&
      !e.target.classList.contains('disabled')) {

    let imgSrc = e.target.dataset.image;
    if (!imgSrc) return;

    imgSrc = imgSrc.split('/').map(part => encodeURIComponent(part)).join('/');
    preview.style.backgroundImage = `url(${imgSrc})`;
    preview.style.display = 'block';
  }
});

document.addEventListener('mousemove', e => {
  if (preview.style.display === 'block') {
    const xOffset = 20;
    const yOffset = 20;
    let left = e.clientX + xOffset;
    let top = e.clientY - preview.offsetHeight - yOffset;
    if (top < 75) top = e.clientY + yOffset;
    preview.style.left = left + 'px';
    preview.style.top = top + 'px';
  }
});

document.addEventListener('mouseout', e => {
  if (e.target.classList.contains('project-item')) {
    preview.style.display = 'none';
  }
});
