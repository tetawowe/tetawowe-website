// --- Works Grid ---
const worksContainer = document.getElementById('works-grid');
const preview = document.getElementById('preview-image');

fetch('/homepage/thumbnails.json')
  .then(res => res.json())
  .then(data => {
    data.forEach(project => {
      const projectItem = document.createElement('a');
      projectItem.className = 'project-item';

      // ✅ 链接到项目页面或 special 项目页面
      if (project.id) {
        if (project.special && project.folder) {
          // special 项目直接使用 folder 指向 project.html
          projectItem.href = `${project.folder}/project.html`;
          projectItem.dataset.special = "true";
          projectItem.dataset.folder = project.folder;
          projectItem.dataset.id = project.id;
        } else {
          // 普通项目跳转到 works 页面
          projectItem.href = `../project/project.html?id=${project.id}`;
        }
      } else {
        projectItem.href = "#";
      }

      // 缩略图
      const img = document.createElement('img');
      img.src = project.image;
      img.alt = project.title;
      projectItem.appendChild(img);

      // 标题
      const titleDiv = document.createElement('div');
      titleDiv.textContent = project.title;
      projectItem.appendChild(titleDiv);

      // 悬停显示大图
      if (project.image) {
        projectItem.dataset.image = project.image;
      }

      worksContainer.appendChild(projectItem);
    });
  })
  .catch(err => console.error("Failed to load thumbnails.json:", err));

// --- 预览 hover ---
document.addEventListener('mouseover', function(e) {
  if (e.target.closest('.project-item')) {
    const item = e.target.closest('.project-item');
    if (item.dataset.image) {
      let imgSrc = item.dataset.image;
      imgSrc = imgSrc.split('/').map(encodeURIComponent).join('/');
      preview.style.backgroundImage = `url(${imgSrc})`;
      preview.style.display = 'block';
    }
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
  if (e.target.closest('.project-item')) {
    preview.style.display = 'none';
  }
});

// --- Gallery Slider ---
const slides = document.querySelector(".gallery-slider .slides");
const slideLinks = document.querySelectorAll(".gallery-slider .slides a");
const slideCount = slideLinks.length;
let currentIndex = 1; // 从第1张真实图开始
const caption = document.querySelector(".gallery-caption");

// 获取标题
const titles = Array.from(slideLinks).map(link => {
  const img = link.querySelector("img");
  return img ? img.alt || "Untitled Project" : "Untitled Project";
});

// 克隆第一张和最后一张，实现无缝轮播
const firstClone = slideLinks[0].cloneNode(true);
const lastClone = slideLinks[slideCount - 1].cloneNode(true);
slides.insertBefore(lastClone, slides.firstChild);
slides.appendChild(firstClone);

// 初始化位置
slides.style.transition = "none";
slides.style.transform = `translateX(-${currentIndex * 100}%)`;
setTimeout(() => {
  slides.style.transition = "transform 0.8s ease-in-out";
}, 50);

// 更新 caption
function updateCaption(index) {
  const realIndex = (index - 1 + slideCount) % slideCount;
  caption.textContent = titles[realIndex];

  const projectLink = slideLinks[realIndex];

  // ✅ special 项目使用 folder
  if (projectLink.dataset.special === "true" && projectLink.dataset.folder) {
    caption.onclick = () => {
      window.location.href = `${projectLink.dataset.folder}/project.html`;
    };
  } else {
    caption.onclick = () => {
      window.location.href = projectLink.href;
    };
  }
}

// 过渡动画控制
function showSlide(index) {
  slides.style.transition = "transform 0.8s ease-in-out";
  slides.style.transform = `translateX(-${index * 100}%)`;
  updateCaption(index);
}

// 过渡结束处理无缝跳转
slides.addEventListener("transitionend", () => {
  if (currentIndex === 0) {
    slides.style.transition = "none";
    currentIndex = slideCount;
    slides.style.transform = `translateX(-${currentIndex * 100}%)`;
  } else if (currentIndex === slideCount + 1) {
    slides.style.transition = "none";
    currentIndex = 1;
    slides.style.transform = `translateX(-${currentIndex * 100}%)`;
  }
});

// 下一张、上一张
function nextSlide() {
  if (currentIndex >= slideCount + 1) return;
  currentIndex++;
  showSlide(currentIndex);
}

function prevSlide() {
  if (currentIndex <= 0) return;
  currentIndex--;
  showSlide(currentIndex);
}

// 自动播放
let autoSlide = setInterval(nextSlide, 5000);

// 箭头事件
document.querySelector(".gallery-slider .arrow.right").addEventListener("click", () => {
  nextSlide();
  clearInterval(autoSlide);
});
document.querySelector(".gallery-slider .arrow.left").addEventListener("click", () => {
  prevSlide();
  clearInterval(autoSlide);
});

// 初始化 caption
updateCaption(currentIndex);

