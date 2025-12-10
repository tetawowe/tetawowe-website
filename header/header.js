const headerContainer = document.getElementById('header-placeholder');

fetch('../header/header.html')
  .then(response => response.text())
  .then(data => {
    headerContainer.innerHTML = data;
  })
  .catch(err => console.error('Failed to load header.html:', err));


