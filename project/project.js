// ===============================
// 取得 URL 中的 folder 名（最後一段）
// ===============================
const pathParts = window.location.pathname.split("/").filter(Boolean);
const urlFolder = decodeURIComponent(pathParts[pathParts.length - 1]);

// 將名稱轉成安全 ID（小寫，去掉 +/@/./' 等字符）
function folderToId(name) {
  return name.toLowerCase().replace(/[@+.'"]/g, "");
}

// URL 的安全 ID
const urlId = folderToId(urlFolder);

// ===============================
// 讀取 JSON 並匹配 project
// ===============================
fetch("/works/projects.json")
  .then(res => res.json())
  .then(data => {
    let project = null;

    // 遍历每个年份
    for (const year in data) {
      project = data[year].find(p => {
        // 对 id 和 folder 最后一段都做 folderToId()
        const idSafe = folderToId(p.id);
        const folderSafe = folderToId(p.folder.split("/").pop());
        return idSafe === urlId || folderSafe === urlId;
      });
      if (project) break;
    }

    if (!project) {
      document.getElementById("project-container").innerHTML =
        "<p>找不到專案 ID 或專案不存在。</p>";
      return;
    }

    console.log("URL ID:", urlId);

    // 調試每個 project 的 folder
    for (const year in data) {
      data[year].forEach(p => {
        const idSafe = folderToId(p.id);
        const folderSafe = folderToId(p.folder.split("/").pop());
        console.log(p.id, p.folder.split("/").pop(), idSafe, folderSafe);
      });
    }

    // ===============================
    // 設定瀏覽器標題
    // ===============================
    document.title = project.title;

    const sortedImages = (project.images || []).slice().sort((a, b) => {
      const getNum = (p) => {
        const file = p.split("/").pop();
        const match = file.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : Number.POSITIVE_INFINITY;
      };
      return getNum(a) - getNum(b);
    });

    // ========= 修改這裡 =========
    // 使用絕對路徑，避免相對路徑錯亂
    const folderPath = '/' + project.folder.replace(/^\/+/, ''); // 從根開始

    // ===============================
    if (sortedImages.length > 0) {
      const firstImg = document.createElement("img");
      firstImg.src = `${folderPath}/${sortedImages[0]}`;
      firstImg.alt = project.title;
      document.getElementById("project-first-image").appendChild(firstImg);

      renderMetaAndText(project, project.description || "");

      const imgContainer = document.getElementById("project-images");

      sortedImages.slice(1, 6).forEach(src => {
        const img = document.createElement("img");
        img.src = `${folderPath}/${src}`;
        img.alt = project.title;
        img.classList.add("project-image");
        imgContainer.appendChild(img);
      });

      if (project["middle-description"]) {
        const middleTextDiv = document.createElement("div");
        middleTextDiv.className = "middle-description";
        middleTextDiv.innerText = project["middle-description"];
        imgContainer.appendChild(middleTextDiv);
      }

      if (sortedImages.length > 6) {
        const galleryImages = sortedImages.slice(6).map(src => `${folderPath}/${src}`);
        const galleryWrapper = document.createElement("div");
        const galleryGroup = "project-gallery";

        galleryWrapper.className = "gallery-wrapper";
        galleryWrapper.dataset.galleryGroup = galleryGroup;

        const galleryMain = document.createElement("div");
        galleryMain.className = "gallery-main";

        const leftArrow = document.createElement("span");
        leftArrow.className = "gallery-arrow left";
        leftArrow.innerHTML = "&#10094;";

        const mainImg = document.createElement("img");
        mainImg.className = "gallery-main-img";
        mainImg.src = galleryImages[0];
        mainImg.alt = project.title;
        mainImg.dataset.lightboxGroup = galleryGroup;

        const rightArrow = document.createElement("span");
        rightArrow.className = "gallery-arrow right";
        rightArrow.innerHTML = "&#10095;";

        galleryMain.appendChild(leftArrow);
        galleryMain.appendChild(mainImg);
        galleryMain.appendChild(rightArrow);
        galleryWrapper.appendChild(galleryMain);

        const thumbs = document.createElement("div");
        thumbs.className = "gallery-thumbs";

        galleryImages.forEach((src, index) => {
          const thumb = document.createElement("img");
          thumb.src = src;
          thumb.alt = `${project.title} thumbnail ${index + 1}`;
          thumb.className = "gallery-thumb";
          thumb.dataset.index = index;
          if (index === 0) {
            thumb.classList.add("active");
          }
          thumbs.appendChild(thumb);
        });

        galleryWrapper.appendChild(thumbs);
        imgContainer.appendChild(galleryWrapper);
      }

      waitForImagesToLoad(document).then(() => {
        adjustProjectImage();
        enableGallerySlider();
        enableLightbox();
      });
    } else {
      renderMetaAndText(project, project.description || "");
    }
  })
  .catch(err => {
    console.error(err);
    document.getElementById("project-container").innerHTML =
      "<p>讀取專案資料錯誤。</p>";
  });

// ===============================
// 渲染 Meta + Text（支持可选字段）
// ===============================
function renderMetaAndText(project, text) {
  const wrapper = document.createElement("div");
  wrapper.id = "meta-text-wrapper";

  const metaDiv = document.getElementById("project-meta");
  const textDiv = document.getElementById("project-text");

  wrapper.appendChild(metaDiv);
  wrapper.appendChild(textDiv);

  const firstImage = document.getElementById("project-first-image");
  firstImage.insertAdjacentElement("afterend", wrapper);

  // 小工具：没有值就不渲染
  function renderMetaRow(label, value) {
    if (!value) return "";
    return `
      <div class="label">${label}</div>
      <div class="value">${value}</div>
    `;
  }

  const types = project.type
    ? project.type.split(",").map(s => s.trim()).join("<br>")
    : "";

  const team = project.team
    ? project.team.split(",").map(s => s.trim()).join("<br>")
    : "";

    const collaboration = project.collaboration
  ? project.collaboration.split(",").map(s => s.trim()).join("<br>")
  : "";

  metaDiv.innerHTML = `
    <h2>${project.title}</h2>

    ${renderMetaRow("Year", project.year)}
    ${renderMetaRow("Type", types)}
    ${renderMetaRow("Team", team)}
    ${renderMetaRow("Location", project.location)}
    ${renderMetaRow("Local Artisan", project["local-artisan"])}
    ${renderMetaRow("Photographer", project.photographer)}
    ${renderMetaRow("Collaboration", collaboration)}
  `;

  textDiv.innerText = text;
}


// ===============================
// Killer Images 調整
// ===============================
function adjustProjectImage() {
  const images = document.querySelectorAll(".project-image"); // 只选 Killer Images
  if (!images.length) return;

  images.forEach(img => {
    // 不要动态增加 margin，或者只在桌面端
    if (window.innerWidth > 768) {
      const topContentHeight = img.offsetTop;
      img.style.marginTop = topContentHeight < 900 ? (940 - topContentHeight) + "px" : "50px";
    } else {
      img.style.marginTop = "20px"; // 手机端固定小 margin
    }
  });
}

// ===============================
// 等待圖片全部 load
// ===============================
function waitForImagesToLoad(container) {
  const imgs = container.querySelectorAll("img");
  return Promise.all(Array.from(imgs).map(img => img.complete ? Promise.resolve() : new Promise(resolve => { img.onload = img.onerror = resolve; })));
}

// ===============================
// Gallery Slider 功能
// ===============================
function enableGallerySlider() {
  const galleryContainers = document.querySelectorAll(".gallery-wrapper[data-gallery-group]");

  galleryContainers.forEach(container => {
    const galleryImages = Array.from(container.querySelectorAll(".gallery-thumb")).map(thumb => thumb.src);
    const mainImg = container.querySelector(".gallery-main-img");
    const thumbs = Array.from(container.querySelectorAll(".gallery-thumb"));
    const leftArrow = container.querySelector(".gallery-arrow.left");
    const rightArrow = container.querySelector(".gallery-arrow.right");

    if (!galleryImages.length || !mainImg || !thumbs.length || !leftArrow || !rightArrow) {
      return;
    }

    let galleryIndex = Math.max(galleryImages.indexOf(mainImg.src), 0);

    function updateGallery(index) {
      mainImg.src = galleryImages[index];
      thumbs.forEach(thumb => thumb.classList.remove("active"));
      thumbs[index].classList.add("active");
      galleryIndex = index;
    }

    thumbs.forEach(thumb => {
      thumb.addEventListener("click", () => {
        const nextIndex = parseInt(thumb.dataset.index, 10);
        if (Number.isNaN(nextIndex)) {
          return;
        }
        updateGallery(nextIndex);
      });
    });

    leftArrow.addEventListener("click", () => {
      const nextIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
      updateGallery(nextIndex);
    });

    rightArrow.addEventListener("click", () => {
      const nextIndex = (galleryIndex + 1) % galleryImages.length;
      updateGallery(nextIndex);
    });

    updateGallery(galleryIndex);
  });
}

// ===============================
// Lightbox 功能
// ===============================
function enableLightbox() {
  if (!document.getElementById("lightbox")) {
    const lightbox = document.createElement("div");
    lightbox.id = "lightbox";
    lightbox.innerHTML = `<span class="lightbox-close">&times;</span><img class="lightbox-img" src="" alt="lightbox">`;
    document.body.appendChild(lightbox);
  }

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox.querySelector(".lightbox-img");
  const lightboxGroups = {};
  let lightboxIndex = -1;
  let activeLightboxGroup = null;

  document.querySelectorAll(".gallery-wrapper[data-gallery-group]").forEach(container => {
    lightboxGroups[container.dataset.galleryGroup] = Array.from(container.querySelectorAll(".gallery-thumb")).map(thumb => thumb.src);
  });

  function normalizeLightboxSrc(src) {
    try {
      return new URL(src, window.location.href).href;
    } catch (error) {
      return src;
    }
  }

  function openLightbox(src, group = null) {
    const normalizedSrc = normalizeLightboxSrc(src);
    activeLightboxGroup = group;
    lightboxIndex = group && lightboxGroups[group]
      ? lightboxGroups[group].findIndex(imageSrc => normalizeLightboxSrc(imageSrc) === normalizedSrc)
      : -1;
    lightboxImg.src = src;
    lightbox.style.display = "flex";
  }

  function closeLightbox() {
    lightbox.style.display = "none";
    lightboxIndex = -1;
    activeLightboxGroup = null;
  }

  function stepLightbox(direction) {
    if (lightbox.style.display !== "flex" || lightboxIndex === -1 || !activeLightboxGroup || !lightboxGroups[activeLightboxGroup]) {
      return;
    }

    const activeImages = lightboxGroups[activeLightboxGroup];
    lightboxIndex = (lightboxIndex + direction + activeImages.length) % activeImages.length;
    lightboxImg.src = activeImages[lightboxIndex];
  }

  document.querySelectorAll("#project-first-image img, .project-image, .gallery-main-img").forEach(img => {
    img.style.cursor = "pointer";
    img.addEventListener("click", () => {
      openLightbox(img.src, img.dataset.lightboxGroup || null);
    });
  });

  lightbox.addEventListener("click", e => {
    if (e.target.id === "lightbox" || e.target.classList.contains("lightbox-close")) {
      closeLightbox();
    }
  });

  if (!document.body.dataset.projectLightboxBound) {
    document.addEventListener("keydown", event => {
      if (lightbox.style.display !== "flex") {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepLightbox(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepLightbox(1);
      }

      if (event.key === "Escape") {
        closeLightbox();
      }
    });

    document.body.dataset.projectLightboxBound = "true";
  }
}

window.addEventListener("resize", adjustProjectImage);

