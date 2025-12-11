// ===============================
// 取得 projectId 从 URL 路径
// ===============================
const pathParts = window.location.pathname.split('/');
// 取最后一段作为 projectId，如果为空，则可能访问 /project/，提示错误
let projectId = pathParts[pathParts.length - 1];

// 兼容访问 /project.html?xxx 的老方式（可选）
if (!projectId || projectId === 'project.html' || projectId === '') {
  const params = new URLSearchParams(window.location.search);
  projectId = params.get("id");
}

if (!projectId) {
  document.getElementById("project-container").innerHTML = "<p>找不到專案 ID。</p>";
} else {
  fetch("../works/projects.json")
    .then(res => res.json())
    .then(data => {
      let project = null;

      // 找到對應的 project
      for (const year in data) {
        const found = data[year].find(p => p.id === projectId);
        if (found) {
          project = found;
          break;
        }
      }

      if (!project) {
        document.getElementById("project-container").innerHTML = "<p>專案不存在。</p>";
        return;
      }

      // ✅ 設定瀏覽器標題
      document.title = project.title;

      // ===============================
      // 圖片排序（只抓檔名開頭的數字）
      // ===============================
      const sortedImages = (project.images || [])
        .slice()
        .sort((a, b) => {
          const getNum = (p) => {
            const file = p.split("/").pop();
            const match = file.match(/^(\d+)/);
            return match ? parseInt(match[1], 10) : Number.POSITIVE_INFINITY;
          };
          return getNum(a) - getNum(b);
        });

      if (sortedImages.length > 0) {
        const firstImg = document.createElement("img");
        firstImg.src = sortedImages[0];
        firstImg.alt = project.title;
        document.getElementById("project-first-image").appendChild(firstImg);

        renderMetaAndText(project, project.description || "");

        const imgContainer = document.getElementById("project-images");

        // 002–004 → killer images
        sortedImages.slice(1, 6).forEach(src => {
          const img = document.createElement("img");
          img.src = src;
          img.alt = project.title;
          img.classList.add("project-image");
          imgContainer.appendChild(img);
        });

        // middle-description
        if (project["middle-description"]) {
          const middleTextDiv = document.createElement("div");
          middleTextDiv.className = "middle-description";
          middleTextDiv.innerText = project["middle-description"];
          imgContainer.appendChild(middleTextDiv);
        }

        // 005+ → gallery
        if (sortedImages.length > 6) {
          const galleryWrapper = document.createElement("div");
          galleryWrapper.className = "gallery-wrapper";

          const mainImg = document.createElement("img");
          mainImg.className = "gallery-main";
          mainImg.src = sortedImages[6];
          galleryWrapper.appendChild(mainImg);

          const thumbs = document.createElement("div");
          thumbs.className = "gallery-thumbs";

          sortedImages.slice(6).forEach((src, index) => {
            const thumb = document.createElement("img");
            thumb.src = src;
            thumb.alt = project.title;
            thumb.className = "gallery-thumb";
            thumb.addEventListener("click", () => {
              mainImg.src = src;
              document.querySelectorAll(".gallery-thumb").forEach(t => t.classList.remove("active"));
              thumb.classList.add("active");
            });
            thumbs.appendChild(thumb);

            if (index === 0) thumb.classList.add("active");
          });

          galleryWrapper.appendChild(thumbs);
          imgContainer.appendChild(galleryWrapper);
        }

        // 等待所有圖片 load 完成後調整
        waitForImagesToLoad(document).then(() => {
          adjustProjectImage();
          enableLightbox();
        });

      } else {
        renderMetaAndText(project, project.description || "");
      }

    })
    .catch(err => {
      console.error(err);
      document.getElementById("project-container").innerHTML = "<p>讀取專案資料錯誤。</p>";
    });
}

// ===============================
// 渲染 Meta + Text
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

  const types = project.type ? project.type.split(",").map(s => s.trim()) : [];
  const team = project.team ? project.team.split(",").map(s => s.trim()) : [];

  metaDiv.innerHTML = `
    <h2>${project.title}</h2>
    <div class="label">Year</div><div class="value">${project.year}</div>
    <div class="label">Type</div><div class="value">${types.join("<br>")}</div>
    <div class="label">Team</div><div class="value">${team.join("<br>")}</div>
    <div class="label">Location</div><div class="value">${project.location}</div>
  `;

  textDiv.innerText = text;
}

// ===============================
// Killer Images 調整
// ===============================
function adjustProjectImage() {
  const images = document.querySelectorAll(".project-image");
  if (!images.length) return;

  images.forEach(img => {
    const topContentHeight = img.offsetTop;

    if (topContentHeight < 900) {
      img.style.marginTop = (940 - topContentHeight) + "px";
    } else {
      img.style.marginTop = "50px";
    }
  });
}

// ===============================
// 等待圖片 load
// ===============================
function waitForImagesToLoad(container) {
  const imgs = container.querySelectorAll("img");
  const promises = Array.from(imgs).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => {
      img.onload = img.onerror = resolve;
    });
  });
  return Promise.all(promises);
}

// ===============================
// Lightbox
// ===============================
function enableLightbox() {
  if (!document.getElementById("lightbox")) {
    const lightbox = document.createElement("div");
    lightbox.id = "lightbox";
    lightbox.innerHTML = `
      <span class="lightbox-close">&times;</span>
      <img class="lightbox-img" src="" alt="lightbox">
    `;
    document.body.appendChild(lightbox);

    lightbox.addEventListener("click", e => {
      if (e.target.id === "lightbox" || e.target.classList.contains("lightbox-close")) {
        lightbox.style.display = "none";
      }
    });
  }

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox.querySelector(".lightbox-img");

  document.querySelectorAll("#project-first-image img, .project-image, .gallery-main").forEach(img => {
    img.style.cursor = "pointer";
    img.addEventListener("click", () => {
      lightboxImg.src = img.src;
      lightbox.style.display = "flex";
    });
  });
}

window.addEventListener("resize", adjustProjectImage);
