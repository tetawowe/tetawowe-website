/* =========================
   Grid Builder (Works / Furniture)
========================= */

const preview = document.getElementById('preview-image');

function buildGrid(containerId, jsonPath, isFurniture = false) {
  const container = document.getElementById(containerId);
  if (!container) return;

  fetch(jsonPath)
    .then(res => res.json())
    .then(data => {
      data.forEach(project => {
        const projectItem = document.createElement('a');
        projectItem.className = 'project-item';

        if (project.folder) {
          // ⭐ 核心：直接进 folder/，浏览器会自动读 index.html
          projectItem.href = project.folder + '/';
          projectItem.dataset.folder = project.folder;
          projectItem.dataset.id = project.id;
        } else {
          projectItem.href = "#";
        }

        const img = document.createElement('img');
        img.src = project.image;
        img.alt = project.title;
        projectItem.appendChild(img);

        const titleDiv = document.createElement('div');
        titleDiv.textContent = project.title;
        projectItem.appendChild(titleDiv);

        if (project.image) {
          projectItem.dataset.image = project.image;
        }

        container.appendChild(projectItem);
      });
    })
    .catch(err => console.error(`Failed to load ${jsonPath}:`, err));
}



// 初始化 grids
buildGrid('works-grid', '/homepage/thumbnails.json');
buildGrid('furniture-grid', '/homepage/furniture-thumbnails.json', true);


/* =========================
   Hover Preview
========================= */

document.addEventListener('mouseover', function (e) {
  const item = e.target.closest('.project-item');
  if (item && item.dataset.image && preview) {
    let imgSrc = item.dataset.image;
    imgSrc = imgSrc.split('/').map(encodeURIComponent).join('/');
    preview.style.backgroundImage = `url(${imgSrc})`;
    preview.style.display = 'block';
  }
});

document.addEventListener('mousemove', function (e) {
  if (!preview || preview.style.display !== 'block') return;

  const xOffset = 20;
  const yOffset = 20;
  let left = e.clientX + xOffset;
  let top = e.clientY - preview.offsetHeight - yOffset;

  if (top < 75) {
    top = e.clientY + yOffset;
  }

  preview.style.left = left + 'px';
  preview.style.top = top + 'px';
});

document.addEventListener('mouseout', function (e) {
  if (e.target.closest('.project-item') && preview) {
    preview.style.display = 'none';
  }
});


/* =========================
   Gallery Slider
========================= */

const slides = document.querySelector(".gallery-slider .slides");
const slideLinks = document.querySelectorAll(".gallery-slider .slides a");
if (slides && slideLinks.length) {
  const slideCount = slideLinks.length;
  let currentIndex = 1;
  const caption = document.querySelector(".gallery-caption");

  // 获取标题
  const titles = Array.from(slideLinks).map(link => {
    const img = link.querySelector("img");
    return img ? img.alt || "Untitled Project" : "Untitled Project";
  });

  // 克隆首尾，实现无缝轮播
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

    if (projectLink.dataset.folder) {
      caption.onclick = () => {
        window.location.href = `${projectLink.dataset.folder}/`;
      };
    } else {
      caption.onclick = () => {
        window.location.href = projectLink.href;
      };
    }
  }

  // 切换 slide
  function showSlide(index) {
    slides.style.transition = "transform 0.8s ease-in-out";
    slides.style.transform = `translateX(-${index * 100}%)`;
    updateCaption(index);
  }

  // 无缝回跳
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

  // 控制函数
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
  document.querySelector(".gallery-slider .arrow.right")
    .addEventListener("click", () => {
      nextSlide();
      clearInterval(autoSlide);
    });

  document.querySelector(".gallery-slider .arrow.left")
    .addEventListener("click", () => {
      prevSlide();
      clearInterval(autoSlide);
    });

  // 初始化 caption
  updateCaption(currentIndex);
}
