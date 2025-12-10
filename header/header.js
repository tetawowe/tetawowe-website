const headerContainer = document.getElementById('header-placeholder');

fetch('/tetawowe-website/header/header.html', { cache: "no-cache" })
  .then(response => response.text())
  .then(data => {
    headerContainer.innerHTML = data;
  })
  .catch(err => console.error('Failed to load header.html:', err));



