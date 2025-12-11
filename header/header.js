const headerContainer = document.getElementById('header-placeholder');

// 使用 no-cache 确保加载最新的 header.html
fetch('/header/header.html', { cache: 'no-cache' })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  })
  .then(data => {
    headerContainer.innerHTML = data;

    const header = headerContainer.querySelector('header');
    if (!header) return;

    const hamburger = header.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobile-menu-lightbox');
    if (!hamburger || !mobileMenu) return;

    // 阻止 touchmove 函数
    const preventScroll = (e) => e.preventDefault();

    // 打开 lightbox
    hamburger.addEventListener('click', () => {
      mobileMenu.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // 禁用滚动
      document.body.addEventListener('touchmove', preventScroll, { passive: false });
    });

    // 点击 lightbox 任意处关闭
    mobileMenu.addEventListener('click', () => {
      mobileMenu.style.display = 'none';
      document.body.style.overflow = 'auto'; // 恢复滚动
      document.body.removeEventListener('touchmove', preventScroll);
    });
  })
  .catch(err => console.error('Failed to load header.html:', err));
