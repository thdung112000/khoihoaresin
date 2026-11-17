(() => {
  const picker = document.querySelector('#chon-hoa');
  if (!picker) return;

  // Mỗi hoa có thể bổ sung image với đường dẫn như ./assets/hoa-hong-phan.webp.
  const flowerCatalog = [
    {
      id: 'hong-phan', label: 'Hồng phấn', swatch: '#dda9b6', tint: '#f5e4e9',
      flowers: [{ name: 'Hoa hồng phấn' }, { name: 'Cẩm chướng hồng' }],
    },
    {
      id: 'trang-kem', label: 'Trắng kem', swatch: '#e9ddc3', tint: '#f7f0df',
      flowers: [{ name: 'Cát tường trắng' }, { name: 'Hoa hồng kem' }],
    },
    {
      id: 'cam-dao', label: 'Cam đào', swatch: '#e7a680', tint: '#f5e6da',
      flowers: [{ name: 'Hoa hồng cam đào' }, { name: 'Đồng tiền cam' }],
    },
    {
      id: 'vang-bo', label: 'Vàng bơ', swatch: '#e6ce83', tint: '#f7edcc',
      flowers: [{ name: 'Hoa cúc vàng' }, { name: 'Hoa hồng vàng' }],
    },
    {
      id: 'tim-lavender', label: 'Tím lavender', swatch: '#bcafd4', tint: '#ebe5f5',
      flowers: [{ name: 'Oải hương' }, { name: 'Cát tường tím' }],
    },
    {
      id: 'do-ruou', label: 'Đỏ rượu', swatch: '#934f62', tint: '#eddde4',
      flowers: [{ name: 'Hoa hồng đỏ' }, { name: 'Cẩm chướng đỏ' }],
    },
  ];

  const controls = picker.querySelector('.flower-controls');
  const options = controls.querySelector('.flower-options');
  const clear = picker.querySelector('.flower-clear');
  const optionTemplate = picker.querySelector('#flower-option-template');
  const cardTemplate = picker.querySelector('#flower-card-template');
  const panel = picker.querySelector('.flower-panel');
  const results = panel.querySelector('.flower-results');
  const status = panel.querySelector('.flower-status');
  const emptyMessage = panel.querySelector('.flower-empty');
  const inquiry = picker.querySelector('.flower-inquiry');
  const inquiryLabel = inquiry.querySelector('.flower-inquiry-label');
  const email = document.querySelector('#lien-he a[href^="mailto:"]').getAttribute('href').split('?')[0];

  const toneControls = flowerCatalog.map(tone => {
    const option = optionTemplate.content.firstElementChild.cloneNode(true);
    const input = option.querySelector('input');
    input.value = tone.id;
    option.querySelector('.flower-option-name').textContent = tone.label;
    option.style.setProperty('--flower-swatch', tone.swatch);
    option.style.setProperty('--flower-tint', tone.tint);
    options.append(option);
    return { tone, input };
  });

  function updateSuggestions() {
    const selected = toneControls.filter(({ input }) => input.checked).map(({ tone }) => tone);
    const hasSelection = selected.length > 0;
    const displayTones = hasSelection ? selected : flowerCatalog.slice(0, 2);
    const matches = displayTones.flatMap(tone => {
      const flowers = hasSelection ? tone.flowers : tone.flowers.slice(0, 1);
      return flowers.map(flower => ({ flower, tone }));
    });

    const cards = matches.map(({ flower, tone }, index) => {
      const card = cardTemplate.content.firstElementChild.cloneNode(true);
      const image = card.querySelector('img');
      if (flower.image) {
        image.src = flower.image;
        card.querySelector('.flower-image-placeholder').remove();
      } else {
        image.remove();
      }
      card.querySelector('.flower-card-name').textContent = flower.name;
      card.querySelector('.flower-card-tone').textContent = tone.label;
      card.style.setProperty('--flower-tint', tone.tint);
      card.style.setProperty('--flower-swatch', tone.swatch);
      card.style.setProperty('--flower-delay', `${Math.min(index, 5) * 45}ms`);
      return card;
    });

    results.replaceChildren(...cards);
    emptyMessage.hidden = matches.length > 0;
    status.textContent = `${matches.length} ${hasSelection ? 'gợi ý minh họa' : 'mẫu xem trước'}`;
    clear.disabled = !hasSelection;
    panel.style.setProperty('--flower-panel-tint', selected[0]?.tint ?? '#eeeef7');

    const tones = selected.map(tone => tone.label).join(', ');
    const message = hasSelection ? `Chào Ines, mình muốn làm khối resin và đang thích các tông màu ${tones}. Tiệm có thể gợi ý hoa có sẵn giúp mình được không?` :
      'Chào Ines, mình chưa có sẵn hoa và muốn được tư vấn chọn hoa cho khối resin.';
    inquiry.href = `${email}?subject=${encodeURIComponent('Tư vấn chọn hoa cho khối resin')}&body=${encodeURIComponent(message)}`;
    inquiryLabel.textContent = hasSelection ? 'Gửi tông màu qua email' : 'Hỏi Ines qua email';
  }

  controls.addEventListener('change', updateSuggestions);
  clear.addEventListener('click', () => {
    for (const { input } of toneControls) input.checked = false;
    updateSuggestions();
    toneControls[0].input.focus();
  });

  updateSuggestions();
  controls.hidden = false;
})();
