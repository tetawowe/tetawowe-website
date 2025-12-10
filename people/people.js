fetch('name_list.json')
  .then(res => res.json())
  .then(data => {
    const colContainer = document.querySelector('.friends-colleague');
    const internContainer = document.querySelector('.friends-internship');

    function renderGroup(container, members, position) {
      container.innerHTML = '';

      // 新增一个中间容器 friends-group
      const groupDiv = document.createElement('div');
      groupDiv.classList.add('friends-group', position); // left 或 right

      members.forEach((m, i) => {
        const memberDiv = document.createElement('div');
        memberDiv.classList.add('member');

        const nameP = document.createElement('p');
        nameP.classList.add('member-name');
        nameP.textContent = m.name;

        memberDiv.appendChild(nameP);
        groupDiv.appendChild(memberDiv);

        if (i < members.length - 1) {
          const dot = document.createElement('span');
          dot.classList.add('dot');
          dot.textContent = '·';
          groupDiv.appendChild(dot);
        }
      });

      container.appendChild(groupDiv);
    }

    renderGroup(colContainer, data.former_colleague, 'left');
    renderGroup(internContainer, data.former_internship, 'right');
  })
  .catch(err => console.error('Error loading name_list.json:', err));
