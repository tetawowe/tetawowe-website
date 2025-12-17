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
        const galleryWrapper = document.createElement("div");
        galleryWrapper.className = "gallery-wrapper";

        const mainImg = document.createElement("img");
        mainImg.className = "gallery-main";
        mainImg.src = `${folderPath}/${sortedImages[6]}`;
        galleryWrapper.appendChild(mainImg);

        const thumbs = document.createElement("div");
        thumbs.className = "gallery-thumbs";

        sortedImages.slice(6).forEach((src, index) => {
          const thumb = document.createElement("img");
          thumb.src = `${folderPath}/${src}`;
          thumb.alt = project.title;
          thumb.className = "gallery-thumb";
          thumb.addEventListener("click", () => {
            mainImg.src = `${folderPath}/${src}`;
            document.querySelectorAll(".gallery-thumb").forEach(t => t.classList.remove("active"));
            thumb.classList.add("active");
          });
          thumbs.appendChild(thumb);
          if (index === 0) thumb.classList.add("active");
        });

        galleryWrapper.appendChild(thumbs);
        imgContainer.appendChild(galleryWrapper);
      }

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
    document.getElementById("project-container").innerHTML =
      "<p>讀取專案資料錯誤。</p>";
  });

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
    img.style.marginTop = topContentHeight < 900 ? (940 - topContentHeight) + "px" : "50px";
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
// Lightbox 功能
// ===============================
function enableLightbox() {
  if (!document.getElementById("lightbox")) {
    const lightbox = document.createElement("div");
    lightbox.id = "lightbox";
    lightbox.innerHTML = `<span class="lightbox-close">&times;</span><img class="lightbox-img" src="" alt="lightbox">`;
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
      document.querySelectorAll(".gallery-thumb").forEach(t => t.classList.remove("active"));
      lightbox.style.display = "flex";
    });
  });
}

window.addEventListener("resize", adjustProjectImage);
