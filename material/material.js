fetch("materials.json")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("material-list");
    const detailContainer = document.getElementById("material-detail"); // ✅ 右侧展示区

    // --- 从对象中取出所有材料名称 ---
    const materialNames = Object.keys(data);

    // --- 按首字母分组 ---
    const grouped = {};
    materialNames.forEach(name => {
      const letter = name[0].toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(name);
    });

    // --- 生成 HTML ---
    Object.keys(grouped).sort().forEach(letter => {
      grouped[letter].sort((a, b) => a.localeCompare(b));

      const section = document.createElement("div");
      section.className = "section";

      const title = document.createElement("div");
      title.className = "section-title";
      title.textContent = letter;
      section.appendChild(title);

      grouped[letter].forEach(name => {
        const div = document.createElement("div");
        div.className = "material-item";
        div.textContent = name;

        // --- 点击显示该材料的内容 ---
        div.addEventListener("click", () => {
          activateItem(name);
          scrollToMaterial(name);
          showMaterialDetails(name);
        });

        section.appendChild(div);
      });

      container.appendChild(section);
    });

    // --- 搜索与交互 ---
    const searchBox = document.getElementById("search-box");
    const suggestionBox = document.getElementById("suggestion-box");
    const materialItems = Array.from(document.querySelectorAll(".material-item"));

    let activeElement = null;
    let activeSuggestionIndex = -1;

    // --- 搜索输入 ---
    searchBox.addEventListener("input", () => {
      const query = searchBox.value.trim().toLowerCase();
      suggestionBox.innerHTML = "";
      activeSuggestionIndex = -1;

      if (!query) {
        suggestionBox.style.display = "none";
        searchBox.classList.remove("active");
        return;
      }

      searchBox.classList.add("active");

      const matches = materialItems
        .map(item => item.textContent)
        .filter(name => name.toLowerCase().includes(query))
        .sort((a, b) => {
          const aIndex = a.toLowerCase().indexOf(query);
          const bIndex = b.toLowerCase().indexOf(query);
          if (aIndex !== bIndex) return aIndex - bIndex;
          return a.length - b.length;
        });

      matches.slice(0, 8).forEach(name => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.textContent = name;
        div.addEventListener("click", () => {
          activateItem(name);
          scrollToMaterial(name);
          showMaterialDetails(name);
          hideSuggestions();
        });
        suggestionBox.appendChild(div);
      });

      suggestionBox.style.display = matches.length ? "block" : "none";
    });

    // --- 键盘选择 ---
    searchBox.addEventListener("keydown", (e) => {
      const suggestions = Array.from(suggestionBox.querySelectorAll(".suggestion-item"));

      if (e.key === "ArrowDown" && suggestions.length > 0) {
        e.preventDefault();
        activeSuggestionIndex = (activeSuggestionIndex + 1) % suggestions.length;
        updateSuggestionHighlight(suggestions);
      } else if (e.key === "ArrowUp" && suggestions.length > 0) {
        e.preventDefault();
        activeSuggestionIndex =
          (activeSuggestionIndex - 1 + suggestions.length) % suggestions.length;
        updateSuggestionHighlight(suggestions);
      }

      if (e.key === "Enter") {
        const highlighted = suggestions[activeSuggestionIndex];
        if (highlighted) {
          const name = highlighted.textContent;
          activateItem(name);
          scrollToMaterial(name);
          showMaterialDetails(name);
          hideSuggestions();
        } else {
          const query = searchBox.value.trim().toLowerCase();
          const match = materialItems.find(
            item => item.textContent.toLowerCase() === query
          );
          if (match) {
            activateItem(match.textContent);
            scrollToMaterial(match.textContent);
            showMaterialDetails(match.textContent);
            hideSuggestions();
          }
        }
      }

      if (e.key === "Escape") hideSuggestions();
    });

    function updateSuggestionHighlight(suggestions) {
      suggestions.forEach((item, i) => {
        item.classList.toggle("highlighted", i === activeSuggestionIndex);
      });
    }

    function hideSuggestions() {
      suggestionBox.style.display = "none";
      searchBox.value = "";
      searchBox.classList.remove("active");
      activeSuggestionIndex = -1;
    }

    function activateItem(name) {
      if (activeElement) activeElement.classList.remove("active");

      const target = materialItems.find(
        item => item.textContent.toLowerCase() === name.toLowerCase()
      );

      if (target) {
        target.classList.add("active");
        activeElement = target;
      }
    }

    function scrollToMaterial(name) {
      const target = materialItems.find(item => item.textContent === name);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    // --- ✅ 显示右侧材料详情（同高度 + gallery） ---
    function showMaterialDetails(name) {
  const materialData = data[name];
  const activeItem = document.querySelector(".material-item.active");
  if (!activeItem) return;

  // --- 移除旧的 detail ---
  const oldDetail = document.querySelector(".material-inline-detail");
  if (oldDetail) oldDetail.remove();

  // --- 延迟执行，等待浏览器完成重排后再插入新 detail ---
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // ✅ 创建新的 detail 容器（此版本会参与文档流）
      const inlineDetail = document.createElement("div");
      inlineDetail.className = "material-inline-detail";
      inlineDetail.style.marginLeft = "365px"; // 与主列表区隔开（可调整）
      inlineDetail.style.maxWidth = "600px";
      inlineDetail.style.marginBottom = "50px";
      inlineDetail.style.marginTop = "20px";
      inlineDetail.style.opacity = "0";
      inlineDetail.style.transition = "opacity 0.3s ease";

      // --- 内容部分 ---

      if (!materialData || materialData.length === 0) {
        const p = document.createElement("p");
        p.innerHTML = `<i>No project data available.</i>`;
        inlineDetail.appendChild(p);
      } else {
        materialData.forEach(p => {
          const block = document.createElement("div");
          block.className = "project-block";

          // ✅ Gallery
          const galleryContainer = document.createElement("div");
          galleryContainer.className = "gallery-container";

          let currentIndex = 0;
          const imgEl = document.createElement("img");
          imgEl.src = `A-Z Sorting/${name}/${p.project}/${p.images[0]}`;
          galleryContainer.appendChild(imgEl);

          const prevBtn = document.createElement("button");
          prevBtn.className = "gallery-nav prev";
          prevBtn.textContent = "‹";
          const nextBtn = document.createElement("button");
          nextBtn.className = "gallery-nav next";
          nextBtn.textContent = "›";

          prevBtn.addEventListener("click", () => {
            currentIndex = (currentIndex - 1 + p.images.length) % p.images.length;
            imgEl.src = `A-Z Sorting/${name}/${p.project}/${p.images[currentIndex]}`;
          });
          nextBtn.addEventListener("click", () => {
            currentIndex = (currentIndex + 1) % p.images.length;
            imgEl.src = `A-Z Sorting/${name}/${p.project}/${p.images[currentIndex]}`;
          });

          galleryContainer.appendChild(prevBtn);
          galleryContainer.appendChild(nextBtn);
          block.appendChild(galleryContainer);

          // --- Info ---
          const info = document.createElement("div");
          info.className = "project-info";
          info.innerHTML = `
            <h4>${p.project}</h4>
            <p><b>Year:</b> ${p.year}</p>
            <p><b>Apply on:</b> ${p.apply_on}</p>
            <p><b>Supplier:</b> ${p.supplier}</p>
          `;
          block.appendChild(info);

          // --- Note ---
          const note = document.createElement("div");
          note.className = "project-note";
          note.innerHTML = `<b>Note:</b> ${p.note}`;
          block.appendChild(note);

          inlineDetail.appendChild(block);
        });
      }

      // ✅ 插入在被点击的 material 下方（正常文档流）
      activeItem.insertAdjacentElement("afterend", inlineDetail);

      // ✅ 淡入动画
      requestAnimationFrame(() => {
        inlineDetail.style.opacity = "1";
      });
    });
  });
}


  })
  .catch(err => console.error("❌ Failed to load materials.json:", err));
