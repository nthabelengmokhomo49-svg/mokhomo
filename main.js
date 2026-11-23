

document.addEventListener('DOMContentLoaded', () => {

  const themeToggle = document.getElementById('themeToggle');
  const htmlEl = document.documentElement;

  const savedTheme = localStorage.getItem('lesothoTheme') || 'light';
  htmlEl.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      htmlEl.setAttribute('data-theme', next);
      localStorage.setItem('lesothoTheme', next);
      updateThemeIcon(next);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    themeToggle.innerHTML = theme === 'dark'
      ? '<i class="bi bi-sun-fill"></i>'
      : '<i class="bi bi-moon-fill"></i>';
    themeToggle.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const name = document.getElementById('contactName');
      const email = document.getElementById('contactEmail');
      const subject = document.getElementById('contactSubject');
      const message = document.getElementById('contactMessage');

      [name, email, subject, message].forEach(el => {
        el.classList.remove('is-invalid');
      });

      if (!name.value.trim() || name.value.trim().length < 2) {
        name.classList.add('is-invalid');
        valid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
        email.classList.add('is-invalid');
        valid = false;
      }

      if (!subject.value.trim()) {
        subject.classList.add('is-invalid');
        valid = false;
      }

      if (!message.value.trim() || message.value.trim().length < 10) {
        message.classList.add('is-invalid');
        valid = false;
      }

      if (valid) {
        const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
        submissions.push({
          name: name.value.trim(),
          email: email.value.trim(),
          subject: subject.value.trim(),
          message: message.value.trim(),
          date: new Date().toISOString()
        });
        localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
        const successBox = document.getElementById('contactSuccess');
        if (successBox) {
          successBox.classList.remove('d-none');
          successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        contactForm.reset();
        setTimeout(() => successBox?.classList.add('d-none'), 5000);
      }
    });
  }
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const fullName = document.getElementById('bookName');
      const email = document.getElementById('bookEmail');
      const phone = document.getElementById('bookPhone');
      const date = document.getElementById('bookDate');
      const service = document.getElementById('bookService');
      const people = document.getElementById('bookPeople');

      [fullName, email, phone, date, service, people].forEach(el => {
        if (el) el.classList.remove('is-invalid');
      });

      if (!fullName.value.trim() || fullName.value.trim().length < 2) {
        fullName.classList.add('is-invalid');
        valid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
        email.classList.add('is-invalid');
        valid = false;
      }

      const phoneRegex = /^[\+]?[0-9\s\-]{8,15}$/;
      if (!phone.value.trim() || !phoneRegex.test(phone.value.trim())) {
        phone.classList.add('is-invalid');
        valid = false;
      }

      if (!date.value) {
        date.classList.add('is-invalid');
        valid = false;
      } else {
        const selected = new Date(date.value);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (selected < today) {
          date.classList.add('is-invalid');
          valid = false;
        }
      }

      if (!service.value) {
        service.classList.add('is-invalid');
        valid = false;
      }

      const ppl = parseInt(people.value, 10);
      if (!people.value || isNaN(ppl) || ppl < 1 || ppl > 20) {
        people.classList.add('is-invalid');
        valid = false;
      }

      if (valid) {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const total = calculateBookingTotal();
        bookings.push({
          name: fullName.value.trim(),
          email: email.value.trim(),
          phone: phone.value.trim(),
          date: date.value,
          service: service.value,
          people: ppl,
          total: total,
          dateSubmitted: new Date().toISOString()
        });
        localStorage.setItem('bookings', JSON.stringify(bookings));

        const successBox = document.getElementById('bookingSuccess');
        if (successBox) {
          successBox.innerHTML = `<strong>Booking confirmed!</strong> Estimated total: <strong>LSL ${total.toLocaleString()}</strong>. We will contact you shortly.`;
          successBox.classList.remove('d-none');
          successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        bookingForm.reset();
        updateCalculator();
        setTimeout(() => successBox?.classList.add('d-none'), 7000);
      }
    });
  }

  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');

  if (galleryItems.length && lightboxModal) {
    const bsModal = new bootstrap.Modal(lightboxModal);

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const caption = item.querySelector('.overlay span')?.textContent || '';
        if (lightboxImg) {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt;
        }
        if (lightboxCaption) lightboxCaption.textContent = caption;
        bsModal.show();
      });
    });
  }

  const searchInput = document.getElementById('destSearch');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const destCards = document.querySelectorAll('[data-category]');

  let currentFilter = 'all';

  function filterDestinations() {
    const query = (searchInput?.value || '').toLowerCase().trim();

    destCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
      const text = card.querySelector('.card-text')?.textContent.toLowerCase() || '';

      const matchesFilter = currentFilter === 'all' || category === currentFilter;
      const matchesSearch = !query || title.includes(query) || text.includes(query);

      if (matchesFilter && matchesSearch) {
        card.style.display = '';
        card.classList.add('fade-in');
      } else {
        card.style.display = 'none';
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterDestinations);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      filterDestinations();
    });
  });

  const serviceSelect = document.getElementById('bookService');
  const peopleInput = document.getElementById('bookPeople');
  const calcResult = document.getElementById('calcResult');

  const prices = {
    'sani-pass': 850,
    'katse-dam': 450,
    'maletsunyane': 600,
    'thaba-bosiu': 350,
    'pony-trekking': 700,
    'cultural-tour': 400,
    'hiking-package': 950
  };

  function calculateBookingTotal() {
    const service = serviceSelect?.value;
    const people = parseInt(peopleInput?.value, 10) || 0;
    if (!service || !prices[service] || people < 1) return 0;
    return prices[service] * people;
  }

  function updateCalculator() {
    if (!calcResult) return;
    const total = calculateBookingTotal();
    calcResult.textContent = total > 0 ? `LSL ${total.toLocaleString()}` : 'LSL 0';
  }

  if (serviceSelect) serviceSelect.addEventListener('change', updateCalculator);
  if (peopleInput) peopleInput.addEventListener('input', updateCalculator);

  const welcomeEl = document.getElementById('dynamicWelcome');
  if (welcomeEl) {
    const hour = new Date().getHours();
    let greeting = 'Welcome';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    welcomeEl.textContent = `${greeting}, explorer! Discover the Kingdom in the Sky.`;
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

});
