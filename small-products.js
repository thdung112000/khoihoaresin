document.querySelectorAll('.small-collection .product-card').forEach(card => {
  const buttons = card.querySelectorAll('[data-shape]');
  const preview = card.querySelector('.small-preview');
  const image = preview.querySelector('img');
  const placeholder = preview.querySelector('.small-preview-placeholder');
  const status = card.querySelector('[role="status"]');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(option => option.setAttribute('aria-pressed', String(option === button)));
      const label = button.textContent.trim();
      const source = button.dataset.src;
      preview.dataset.shape = button.dataset.shape;
      image.hidden = !source;
      placeholder.hidden = Boolean(source);
      if (source) {
        image.alt = card.querySelector('h4').textContent + ' dáng ' + label.toLowerCase();
        image.src = source;
      }
      status.textContent = source ? 'Đang xem dáng ' + label : 'Dáng ' + label + ': ảnh đang cập nhật';
    });
  });
});
