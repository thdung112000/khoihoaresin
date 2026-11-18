(() => {
  const dialog = document.querySelector('.lamp-dialog');
  const title = dialog.querySelector('#lamp-dialog-title');
  const photo = dialog.querySelector('.lamp-real-photo');
  const sizes = {
    'Dáng vuông': ['15 × 15', '20 × 20', '25 × 25'],
    'Dáng vòm': ['15 × 13', '20 × 18', '25 × 20'],
    'Dáng lục giác': ['16 × 14', '23 × 20', '28 × 25'],
    'Dáng chữ nhật': ['18 × 15', '24 × 18', '30 × 24']
  };
  document.querySelectorAll('.lamp-detail-trigger').forEach(button => {
    button.addEventListener('click', () => {
      title.textContent = button.dataset.lamp;
      dialog.querySelectorAll('.lamp-sizes span').forEach((item, index) => {
        item.textContent = sizes[button.dataset.lamp][index];
      });
      photo.replaceChildren();
      const image = button.querySelector('img');
      if (image) {
        const copy = image.cloneNode();
        copy.className = '';
        photo.append(copy);
      } else {
        photo.textContent = 'Ảnh thực tế đang được cập nhật.';
      }
      dialog.showModal();
    });
  });
  dialog.querySelector('.lamp-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
})();
