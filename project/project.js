// ===============================
// 讀取 URL 參數 (id)
// ===============================
const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");

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
    // 只取檔名開頭的連續數字，例如：
    // 007.jpg → 7
    // 010-something.jpg → 10
    // 012-final-1.jpg → 12
    // 如果沒有數字 → 排最後
    const getNum = (p) => {
      const file = p.split("/").pop();     // "010-something.jpg"
      const match = file.match(/^(\d+)/);  // 開頭的數字
      return match ? parseInt(match[1], 10) : Number.POSITIVE_INFINITY;
    };

    return getNum(a) - getNum(b);
  });


      if (sortedImages.length > 0) {
        // 第一張圖片放在 #project-first-image
        const firstImg = document.createElement("img");
        firstImg.src = sortedImages[0];
        firstImg.alt = project.title;
        document.getElementById("project-first-image").appendChild(firstImg);

        // 顯示 Meta + Text
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

        // 在 killer images 之後插入 middle-description
        if (project["middle-description"]) {
          const middleTextDiv = document.createElement("div");
          middleTextDiv.className = "middle-description";
          middleTextDiv.innerText = project["middle-description"];
          imgContainer.appendChild(middleTextDiv);
        }

        // 005+ → gallery 模式
        if (sortedImages.length > 6) {
          const galleryWrapper = document.createElement("div");
          galleryWrapper.className = "gallery-wrapper";

          // 大圖容器
          const mainImg = document.createElement("img");
          mainImg.className = "gallery-main";
          mainImg.src = sortedImages[6]; // 預設 007
          galleryWrapper.appendChild(mainImg);

          // 縮略圖容器
          const thumbs = document.createElement("div");
          thumbs.className = "gallery-thumbs";

          sortedImages.slice(6).forEach((src, index) => {
            const thumb = document.createElement("img");
            thumb.src = src;
            thumb.alt = project.title;
            thumb.className = "gallery-thumb";
            thumb.addEventListener("click", () => {
              mainImg.src = src;
              document
                .querySelectorAll(".gallery-thumb")
                .forEach(t => t.classList.remove("active"));
              thumb.classList.add("active");
            });
            thumbs.appendChild(thumb);

            // 預設第一張縮略圖高亮
            if (index === 0) thumb.classList.add("active");
          });

          galleryWrapper.appendChild(thumbs);
          imgContainer.appendChild(galleryWrapper);
        }

        // ⚡️ 所有圖片插入 DOM 後，等 load 完成再調整位置
        waitForImagesToLoad(document).then(() => {
          adjustProjectImage();
          enableLightbox(); // 啟用 lightbox
        });

      } else {
        // 如果沒有圖片，仍然要顯示 Meta + Text
        renderMetaAndText(project, project.description || "");
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById("project-container").innerHTML =
        "<p>讀取專案資料錯誤。</p>";
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

  // 插入到第一張圖後面
  const firstImage = document.getElementById("project-first-image");
  firstImage.insertAdjacentElement("afterend", wrapper);

  // 拆分 Type & Team
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
// Killer Images 定位調整
// ===============================
function adjustProjectImage() {
  const images = document.querySelectorAll(".project-image");
  if (!images.length) return;

  images.forEach(img => {
    const topContentHeight = img.offsetTop;

    if (topContentHeight < 900) {
      // 如果不足 900px，就强制讓圖片從 950px 開始
      img.style.marginTop = (940 - topContentHeight) + "px";
    } else {
      // 如果超過 900px，就保持與上方內容 50px 間隔
      img.style.marginTop = "50px";
    }
  });
}

// ===============================
// 等待圖片全部 load 完成
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
// Lightbox 功能
// ===============================
function enableLightbox() {
  // 建立 lightbox 容器
  if (!document.getElementById("lightbox")) {
    const lightbox = document.createElement("div");
    lightbox.id = "lightbox";
    lightbox.innerHTML = `
      <span class="lightbox-close">&times;</span>
      <img class="lightbox-img" src="" alt="lightbox">
    `;
    document.body.appendChild(lightbox);

    // 關閉 lightbox
    lightbox.addEventListener("click", e => {
      if (e.target.id === "lightbox" || e.target.classList.contains("lightbox-close")) {
        lightbox.style.display = "none";
      }
    });
  }

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox.querySelector(".lightbox-img");

  // 綁定所有大圖
  document.querySelectorAll("#project-first-image img, .project-image, .gallery-main").forEach(img => {
    img.style.cursor = "pointer";
    img.addEventListener("click", () => {
      lightboxImg.src = img.src;
      lightbox.style.display = "flex";
    });
  });
}

// 窗口大小變動時也重算
window.addEventListener("resize", adjustProjectImage);
