const worksContainer = document.getElementById('works');
let allData = {}; // 存放 projects.json

// 渲染按年份
function renderByYear(data) {
  worksContainer.innerHTML = ""; // 清空

  const years = Object.keys(data).sort((a, b) => b - a);

  years.forEach(year => {
    const projects = data[year];

    const yearSection = document.createElement('div');
    yearSection.className = 'year-section';

    const yearTitle = document.createElement('h2');
    yearTitle.textContent = year;
    yearSection.appendChild(yearTitle);

    projects.forEach(project => {
      const projectItem = document.createElement('a');
      projectItem.className = 'project-item';
      projectItem.textContent = project.title;

      // ✅ 判断是否是 special
      if (project.layout && project.layout.toLowerCase() === "special") {
        projectItem.href = `${project.folder}/project.html`; // 打开该项目自己的 project.html
      } else {
        projectItem.href = `../project/project.html?id=${project.id}`; // 默认模板
      }

      if (project.images && project.images.length > 0) {
        projectItem.dataset.image = project.images[0];
      }

      yearSection.appendChild(projectItem);
      yearSection.appendChild(document.createElement('br'));
    });

    worksContainer.appendChild(yearSection);
  });
}

// 渲染按类型
function renderByType(data) {
  worksContainer.innerHTML = ""; // 清空

  let allProjects = [];
  Object.keys(data).forEach(year => {
    allProjects = allProjects.concat(data[year]);
  });

  const typeGroups = {};

  allProjects.forEach(project => {
    const types = (project.type || "Others").split(",").map(t => t.trim());

    types.forEach(type => {
      if (!typeGroups[type]) {
        typeGroups[type] = [];
      }
      typeGroups[type].push(project);
    });
  });

  // ✅ 按 type 字母顺序遍历
  Object.keys(typeGroups).sort((a, b) => a.localeCompare(b)).forEach(type => {
    const projects = typeGroups[type];

    // ✅ 按标题首字母 A→Z 排序
    projects.sort((a, b) => a.title.localeCompare(b.title));

    const typeSection = document.createElement('div');
    typeSection.className = 'type-section';

    const typeTitle = document.createElement('h2');
    typeTitle.textContent = type;
    typeSection.appendChild(typeTitle);

    projects.forEach(project => {
      const projectItem = document.createElement('a');
      projectItem.className = 'project-item';
      projectItem.textContent = project.title;

      // special layout 判断
      if (project.layout && project.layout.toLowerCase() === "special") {
        projectItem.href = `${project.folder}/project.html`; 
      } else {
        projectItem.href = `../project/project.html?id=${project.id}`;
      }

      if (project.images && project.images.length > 0) {
        projectItem.dataset.image = project.images[0];
      }

      typeSection.appendChild(projectItem);
      typeSection.appendChild(document.createElement('br'));
    });

    worksContainer.appendChild(typeSection);
  });
}


// === 主逻辑 ===
fetch('projects.json')
  .then(res => res.json())
  .then(data => {
    allData = data;
    renderByYear(allData); // 默认先显示按年份
  })
  .catch(err => console.error("Failed to load projects.json:", err));

// === 按钮绑定事件 ===
document.getElementById('sort-year').addEventListener('click', () => {
  renderByYear(allData);
});

document.getElementById('sort-type').addEventListener('click', () => {
  renderByType(allData);
});

// ✅ hover 预览逻辑
const preview = document.getElementById('preview-image');

document.addEventListener('mouseover', function(e) {
  if (e.target.classList.contains('project-item')) {
    let imgSrc = e.target.dataset.image;
    imgSrc = imgSrc.split('/').map(part => encodeURIComponent(part)).join('/');
    preview.style.backgroundImage = `url(${imgSrc})`;
    preview.style.display = 'block';
  }
});

document.addEventListener('mousemove', function(e) {
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

document.addEventListener('mouseout', function(e) {
  if (e.target.classList.contains('project-item')) {
    preview.style.display = 'none';
  }
});

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
