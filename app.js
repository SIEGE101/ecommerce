/**
 * =====================================================
 * STUDENT MARKETPLACE — app.js
 * All frontend logic: listings, forms, filters, toasts
 * =====================================================
 */

'use strict';

const SM = (() => {

  /* ─────────────────────────────────────────────────
     SAMPLE DATA — Simulated marketplace listings
  ───────────────────────────────────────────────── */
  const SAMPLE_LISTINGS = [
    {
      id: 1, title: 'Calculus & Analytical Geometry', price: 18000,
      category: 'books', condition: 'Good', seller: 'Amina K.',
      emoji: '📚', views: 43, daysAgo: 2,
    },
    {
      id: 2, title: 'MacBook Pro Charger 65W', price: 25000,
      category: 'tech', condition: 'Like New', seller: 'Brian M.',
      emoji: '💻', views: 91, daysAgo: 1,
    },
    {
      id: 3, title: 'Study Desk with Lamp', price: 55000,
      category: 'furniture', condition: 'Good', seller: 'Chidi O.',
      emoji: '🪑', views: 28, daysAgo: 5,
    },
    {
      id: 4, title: 'Organic Chemistry (9th Ed.)', price: 22000,
      category: 'books', condition: 'Fair', seller: 'Diana P.',
      emoji: '🧪', views: 67, daysAgo: 3,
    },
    {
      id: 5, title: 'Sony WH-1000XM4 Headphones', price: 120000,
      category: 'tech', condition: 'Like New', seller: 'Elias T.',
      emoji: '🎧', views: 185, daysAgo: 0,
    },
    {
      id: 6, title: 'PS5 DualSense Controller', price: 40000,
      category: 'tech', condition: 'Good', seller: 'Felix R.',
      emoji: '🎮', views: 134, daysAgo: 1,
    },
    {
      id: 7, title: 'Nike Air Max Sneakers (43)', price: 35000,
      category: 'fashion', condition: 'Good', seller: 'Grace L.',
      emoji: '👟', views: 52, daysAgo: 4,
    },
    {
      id: 8, title: 'Yoga Mat + Resistance Bands', price: 15000,
      category: 'sports', condition: 'Like New', seller: 'Hassan A.',
      emoji: '🧘', views: 39, daysAgo: 6,
    },
    {
      id: 9, title: 'Ikea LACK Shelf Unit', price: 0,
      category: 'furniture', condition: 'Good', seller: 'Iris W.',
      emoji: '🗄️', views: 21, daysAgo: 7,
    },
    {
      id: 10, title: 'Python Crash Course Book', price: 12000,
      category: 'books', condition: 'Like New', seller: 'Jake N.',
      emoji: '🐍', views: 88, daysAgo: 2,
    },
    {
      id: 11, title: 'Football (Adidas, size 5)', price: 20000,
      category: 'sports', condition: 'Good', seller: 'Kemi B.',
      emoji: '⚽', views: 30, daysAgo: 3,
    },
    {
      id: 12, title: 'Arduino Starter Kit', price: 45000,
      category: 'tech', condition: 'Brand New', seller: 'Leo S.',
      emoji: '⚡', views: 72, daysAgo: 0,
    },
  ];

  /* My Listings — persisted in memory (demo data) */
  let myListings = [
    {
      id: 101, title: 'Microeconomics Textbook', price: 14000,
      category: 'books', condition: 'Good', seller: 'You',
      emoji: '📗', views: 18, daysAgo: 3,
    },
    {
      id: 102, title: 'Wireless Mouse Logitech M185', price: 16000,
      category: 'tech', condition: 'Like New', seller: 'You',
      emoji: '🖱️', views: 41, daysAgo: 1,
    },
  ];

  let nextId = 200;

  /* Wishlist state */
  let wishlist = new Set(JSON.parse(localStorage.getItem('sm_wishlist') || '[]'));

  const saveWishlist = () => localStorage.setItem('sm_wishlist', JSON.stringify([...wishlist]));

  /* ─────────────────────────────────────────────────
     UTILITY HELPERS
  ───────────────────────────────────────────────── */
  const $ = (selector, ctx = document) => ctx.querySelector(selector);
  const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];

  const formatPrice = (p) =>
    p === 0 ? 'FREE' : 'TZS ' + Number(p).toLocaleString();

  const timeAgo = (days) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const initials = (name) =>
    name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  /* ─────────────────────────────────────────────────
     TOAST NOTIFICATIONS
  ───────────────────────────────────────────────── */
  let toastTimer = null;

  const showToast = (msg, icon = '✅', type = 'success') => {
    const toast   = $('#toast');
    const msgEl   = $('#toastMsg');
    const iconEl  = $('#toastIcon');
    if (!toast) return;

    clearTimeout(toastTimer);
    msgEl.textContent  = msg;
    iconEl.textContent = icon;
    toast.className    = `toast ${type}`;
    toast.classList.remove('hidden');

    toastTimer = setTimeout(() => toast.classList.add('hidden'), 3500);
  };

  document.addEventListener('click', (e) => {
    if (e.target.closest('#toastClose')) {
      $('#toast')?.classList.add('hidden');
    }
  });

  /* ─────────────────────────────────────────────────
     NAVIGATION — hamburger menu
  ───────────────────────────────────────────────── */
  const initNav = () => {
    const btn  = $('#hamburgerBtn');
    const menu = $('#mobileMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav') && !e.target.closest('.mobile-menu')) {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  };

  /* ─────────────────────────────────────────────────
     CARD BUILDER
  ───────────────────────────────────────────────── */
  const buildCard = (item, isMyListing = false) => {
    const isWished  = wishlist.has(item.id);
    const isFree    = item.price === 0;
    const priceStr  = formatPrice(item.price);

    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('data-id', item.id);
    card.setAttribute('data-category', item.category);
    card.setAttribute('aria-label', `${item.title}, ${priceStr}`);

    card.innerHTML = `
      <div class="card-img-wrap">
        <div class="card-img-placeholder" aria-hidden="true">${item.emoji}</div>
        <div class="card-badge">${item.category}</div>
        ${!isMyListing ? `
          <button
            class="card-wishlist ${isWished ? 'active' : ''}"
            data-id="${item.id}"
            aria-label="${isWished ? 'Remove from wishlist' : 'Add to wishlist'}"
            aria-pressed="${isWished}"
            title="${isWished ? 'Remove from wishlist' : 'Save item'}"
          >${isWished ? '❤️' : '🤍'}</button>
        ` : ''}
      </div>
      <div class="card-body">
        <h3 class="card-title" title="${item.title}">${item.title}</h3>
        <div class="card-seller">
          <span class="card-seller-avatar" aria-hidden="true">${initials(item.seller)}</span>
          ${item.seller} · ${timeAgo(item.daysAgo)}
        </div>
        <div class="card-footer">
          <span class="card-price ${isFree ? 'free' : ''}">${priceStr}</span>
          <span class="card-condition">${item.condition}</span>
        </div>
      </div>
      ${isMyListing ? `
        <div class="my-card-actions">
          <button class="btn btn-ghost btn-sm" data-action="edit" data-id="${item.id}" aria-label="Edit listing">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" data-action="delete" data-id="${item.id}" aria-label="Delete listing">🗑 Delete</button>
          <span style="margin-left:auto; font-size:.75rem; color:var(--text-muted)">👁 ${item.views}</span>
        </div>
      ` : `
        <div style="padding: 0 16px 14px;">
          <button class="btn btn-primary btn-sm btn-full" onclick="SM.showToast('Message sent to ${item.seller}! 📩', '💬')">
            Contact Seller
          </button>
        </div>
      `}
    `;

    // Wishlist toggle
    const wishBtn = card.querySelector('.card-wishlist');
    if (wishBtn) {
      wishBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = item.id;
        if (wishlist.has(id)) {
          wishlist.delete(id);
          wishBtn.innerHTML = '🤍';
          wishBtn.classList.remove('active');
          wishBtn.setAttribute('aria-pressed', 'false');
          wishBtn.setAttribute('aria-label', 'Add to wishlist');
          showToast('Removed from wishlist', '🤍', 'error');
        } else {
          wishlist.add(id);
          wishBtn.innerHTML = '❤️';
          wishBtn.classList.add('active');
          wishBtn.setAttribute('aria-pressed', 'true');
          wishBtn.setAttribute('aria-label', 'Remove from wishlist');
          showToast('Added to wishlist!', '❤️');
        }
        saveWishlist();
      });
    }

    // My listing actions
    if (isMyListing) {
      card.querySelector('[data-action="edit"]')?.addEventListener('click', () => {
        showToast('Edit feature coming soon!', '✏️');
      });
      card.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
        deleteListing(item.id);
      });
    }

    return card;
  };

  /* ─────────────────────────────────────────────────
     MARKETPLACE LISTINGS — index.html
  ───────────────────────────────────────────────── */
  const renderListings = (category = 'all', searchTerm = '') => {
    const container = $('#listingsContainer');
    if (!container) return;

    // Show spinner
    container.innerHTML = `
      <div class="spinner-wrap" style="grid-column: 1/-1;">
        <div class="spinner" aria-label="Loading listings"></div>
        <p class="spinner-text">Fetching listings…</p>
      </div>
    `;

    // Simulate async load
    setTimeout(() => {
      let filtered = SAMPLE_LISTINGS.filter((item) => {
        const matchCat    = category === 'all' || item.category === category;
        const matchSearch = !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCat && matchSearch;
      });

      container.innerHTML = '';

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1;">
            <div class="empty-state-icon">${searchTerm ? '🔍' : '📭'}</div>
            <h3>${searchTerm ? 'No results found' : 'Nothing here yet'}</h3>
            <p>${searchTerm
              ? `No listings match "<strong>${searchTerm}</strong>". Try a different search.`
              : 'Be the first to post an item in this category!'}</p>
            <a href="my-listings.html" class="btn btn-primary" style="margin-top:8px">+ Post an Item</a>
          </div>
        `;
        return;
      }

      filtered.forEach((item, i) => {
        const card = buildCard(item);
        card.style.animationDelay = `${i * 0.06}s`;
        container.appendChild(card);
      });
    }, 600);
  };

  /* ─────────────────────────────────────────────────
     FILTER TABS
  ───────────────────────────────────────────────── */
  let activeCategory = 'all';
  let activeSearch   = '';

  const initFilters = () => {
    const tabs = $$('.filter-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-pressed', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-pressed', 'true');
        activeCategory = tab.dataset.category;
        renderListings(activeCategory, activeSearch);
      });
    });
  };

  /* ─────────────────────────────────────────────────
     SEARCH
  ───────────────────────────────────────────────── */
  const initSearch = () => {
    const input = $('#searchInput');
    if (!input) return;

    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        activeSearch = input.value.trim();
        renderListings(activeCategory, activeSearch);
      }, 350);
    });
  };

  /* ─────────────────────────────────────────────────
     HERO STAT COUNTER ANIMATION
  ───────────────────────────────────────────────── */
  const animateStats = () => {
    const counters = [
      { el: $('#statListings'), target: 1240, suffix: '' },
      { el: $('#statStudents'), target: 840,  suffix: '' },
    ];
    counters.forEach(({ el, target, suffix }) => {
      if (!el) return;
      let current = 0;
      const step = Math.ceil(target / 60);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Number(current).toLocaleString() + suffix;
        if (current >= target) clearInterval(timer);
      }, 20);
    });
  };

  /* ─────────────────────────────────────────────────
     MY LISTINGS PAGE
  ───────────────────────────────────────────────── */
  const initMyListings = () => {
    renderMyListings();
    updateMyStats();
  };

  const renderMyListings = () => {
    const container = $('#myListingsContainer');
    if (!container) return;

    container.innerHTML = '';

    if (myListings.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-state-icon">📭</div>
          <h3>No listings yet</h3>
          <p>You haven't posted anything. Share something with your fellow students!</p>
          <button class="btn btn-primary" id="emptyPostBtn" style="margin-top:8px">+ Post Your First Item</button>
        </div>
      `;
      $('#emptyPostBtn')?.addEventListener('click', openPostModal);
      return;
    }

    myListings.forEach((item, i) => {
      const card = buildCard(item, true);
      card.style.animationDelay = `${i * 0.08}s`;
      container.appendChild(card);
    });
  };

  const updateMyStats = () => {
    const activeEl = $('#myActiveCount');
    const viewsEl  = $('#myViewsCount');
    const soldEl   = $('#mySoldCount');

    if (activeEl) activeEl.textContent = myListings.length;
    if (viewsEl)  viewsEl.textContent  = myListings.reduce((s, l) => s + l.views, 0);
    if (soldEl)   soldEl.textContent   = 3; // Demo static value
  };

  const deleteListing = (id) => {
    myListings = myListings.filter(l => l.id !== id);
    renderMyListings();
    updateMyStats();
    showToast('Listing deleted.', '🗑', 'error');
  };

  /* ─────────────────────────────────────────────────
     POST ITEM MODAL
  ───────────────────────────────────────────────── */
  const openPostModal = () => {
    const overlay = $('#postModal');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    $('#itemTitle')?.focus();
  };

  const closePostModal = () => {
    const overlay = $('#postModal');
    if (!overlay) return;
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
    resetPostForm();
  };

  const resetPostForm = () => {
    $('#postItemForm')?.reset();
    $('#titleCount') && ($('#titleCount').textContent = '0 / 80 characters');
    $('#descCount')  && ($('#descCount').textContent  = '0 / 400 characters');
    // Reset image preview
    const preview = $('#uploadPreview');
    const area    = $('#uploadArea');
    if (preview) preview.style.display = 'none';
    if (area)    area.style.display    = '';
  };

  const initPostModal = () => {
    // Open buttons
    $$('#openPostBtn, #openPostBtn2').forEach(btn => btn?.addEventListener('click', openPostModal));

    // Close buttons
    $('#closeModal')?.addEventListener('click', closePostModal);
    $('#cancelPost')?.addEventListener('click', closePostModal);

    // Close on overlay click
    $('#postModal')?.addEventListener('click', (e) => {
      if (e.target === $('#postModal')) closePostModal();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePostModal();
    });

    // Character counters
    const titleInput = $('#itemTitle');
    const descInput  = $('#itemDesc');

    titleInput?.addEventListener('input', () => {
      $('#titleCount').textContent = `${titleInput.value.length} / 80 characters`;
    });
    descInput?.addEventListener('input', () => {
      $('#descCount').textContent = `${descInput.value.length} / 400 characters`;
    });

    // Image upload preview
    const fileInput   = $('#imageUpload');
    const uploadArea  = $('#uploadArea');
    const preview     = $('#uploadPreview');
    const previewImg  = $('#uploadPreviewImg');
    const removeBtn   = $('#removeImage');

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be under 5MB', '⚠️', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        previewImg.src        = ev.target.result;
        preview.style.display = 'block';
        uploadArea.style.display = 'none';
      };
      reader.readAsDataURL(file);
    });

    removeBtn?.addEventListener('click', () => {
      fileInput.value           = '';
      previewImg.src            = '';
      preview.style.display     = 'none';
      uploadArea.style.display  = '';
    });

    // Drag-and-drop
    uploadArea?.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });
    uploadArea?.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea?.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event('change'));
      }
    });

    // Submit
    $('#submitPost')?.addEventListener('click', handlePostSubmit);
    $('#postItemForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      handlePostSubmit();
    });
  };

  const handlePostSubmit = () => {
    const titleEl    = $('#itemTitle');
    const priceEl    = $('#itemPrice');
    const categoryEl = $('#itemCategory');

    let valid = true;

    // Title validation
    const hideError = id => document.getElementById(id)?.classList.add('hidden');
    const showError = id => document.getElementById(id)?.classList.remove('hidden');

    hideError('titleError');
    hideError('priceError');
    hideError('categoryError');
    titleEl?.classList.remove('error');
    priceEl?.classList.remove('error');
    categoryEl?.classList.remove('error');

    if (!titleEl?.value.trim()) {
      showError('titleError');
      titleEl?.classList.add('error');
      valid = false;
    }
    if (priceEl?.value === '' || Number(priceEl?.value) < 0) {
      showError('priceError');
      priceEl?.classList.add('error');
      valid = false;
    }
    if (!categoryEl?.value) {
      showError('categoryError');
      categoryEl?.classList.add('error');
      valid = false;
    }
    if (!valid) return;

    // Fake loading
    const submitBtn  = $('#submitPost');
    const btnText    = $('#submitPostText');
    const spinner    = $('#submitSpinner');
    submitBtn.disabled = true;
    btnText.textContent = 'Publishing…';
    spinner.style.display = 'inline-block';

    const CATEGORY_EMOJIS = {
      books: '📚', tech: '💻', furniture: '🪑',
      fashion: '👕', sports: '⚽', other: '🎲',
    };

    setTimeout(() => {
      const newItem = {
        id: nextId++,
        title:     titleEl.value.trim(),
        price:     Number(priceEl.value),
        category:  categoryEl.value,
        condition: $('#itemCondition')?.value || 'Good',
        seller:    'You',
        emoji:     CATEGORY_EMOJIS[categoryEl.value] || '📦',
        views:     0,
        daysAgo:   0,
      };

      myListings.unshift(newItem);
      closePostModal();
      renderMyListings();
      updateMyStats();

      // Reset button
      submitBtn.disabled = false;
      btnText.textContent = '🚀 Publish Listing';
      spinner.style.display = 'none';

      showToast('Listing published successfully! 🎉', '✅');
    }, 1400);
  };

  /* ─────────────────────────────────────────────────
     LOGIN FORM
  ───────────────────────────────────────────────── */
  const initLoginForm = () => {
    const form     = $('#loginForm');
    const emailEl  = $('#loginEmail');
    const passEl   = $('#loginPassword');
    const btn      = $('#loginBtn');
    const btnText  = $('#loginBtnText');
    const spinner  = $('#loginSpinner');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let valid = true;

      // Validate email
      document.getElementById('emailError')?.classList.add('hidden');
      document.getElementById('passwordError')?.classList.add('hidden');
      emailEl?.classList.remove('error');
      passEl?.classList.remove('error');

      if (!emailEl?.value || !/^\S+@\S+\.\S+$/.test(emailEl.value)) {
        document.getElementById('emailError')?.classList.remove('hidden');
        emailEl?.classList.add('error');
        valid = false;
      }
      if (!passEl?.value || passEl.value.length < 6) {
        document.getElementById('passwordError')?.classList.remove('hidden');
        passEl?.classList.add('error');
        valid = false;
      }
      if (!valid) return;

      // Fake login
      btn.disabled = true;
      btnText.textContent = 'Logging in…';
      spinner.style.display = 'inline-block';

      setTimeout(() => {
        btn.disabled = false;
        btnText.textContent = 'Log in to my account';
        spinner.style.display = 'none';
        showToast('Welcome back! Redirecting…', '🎉');
        setTimeout(() => (window.location.href = 'index.html'), 1500);
      }, 1600);
    });
  };

  /* ─────────────────────────────────────────────────
     REGISTER FORM
  ───────────────────────────────────────────────── */
  const initRegisterForm = () => {
    const form     = $('#registerForm');
    const btn      = $('#registerBtn');
    const btnText  = $('#registerBtnText');
    const spinner  = $('#registerSpinner');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const fields = [
        { el: $('#firstName'),       errId: 'firstNameError',    test: v => v.trim().length > 0 },
        { el: $('#lastName'),        errId: 'lastNameError',     test: v => v.trim().length > 0 },
        { el: $('#regEmail'),        errId: 'regEmailError',     test: v => /^\S+@\S+\.\S+$/.test(v) },
        { el: $('#university'),      errId: 'universityError',   test: v => v !== '' },
        { el: $('#regPassword'),     errId: 'regPasswordError',  test: v => v.length >= 8 },
        { el: $('#confirmPassword'), errId: 'confirmPasswordError', test: v => v === $('#regPassword')?.value },
      ];

      let valid = true;

      fields.forEach(({ el, errId, test }) => {
        const errEl = document.getElementById(errId);
        el?.classList.remove('error');
        errEl?.classList.add('hidden');
        if (!el || !test(el.value)) {
          el?.classList.add('error');
          errEl?.classList.remove('hidden');
          valid = false;
        }
      });

      // Terms check
      const termsEl = $('#agreeTerms');
      const termsErrEl = document.getElementById('termsError');
      termsErrEl?.classList.add('hidden');
      if (!termsEl?.checked) {
        termsErrEl?.classList.remove('hidden');
        valid = false;
      }

      if (!valid) return;

      btn.disabled = true;
      btnText.textContent = 'Creating account…';
      spinner.style.display = 'inline-block';

      setTimeout(() => {
        btn.disabled = false;
        btnText.textContent = 'Create my account';
        spinner.style.display = 'none';
        showToast('Account created! Welcome 🎉', '✅');
        setTimeout(() => (window.location.href = 'index.html'), 1500);
      }, 1800);
    });
  };

  /* ─────────────────────────────────────────────────
     PASSWORD TOGGLE (show/hide)
  ───────────────────────────────────────────────── */
  const initPasswordToggle = (inputId, toggleId) => {
    const input  = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    if (!input || !toggle) return;

    const doToggle = () => {
      const isPassword = input.type === 'password';
      input.type        = isPassword ? 'text' : 'password';
      toggle.textContent = isPassword ? '🙈' : '👁';
    };

    toggle.addEventListener('click', doToggle);
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doToggle(); }
    });
  };

  /* ─────────────────────────────────────────────────
     PASSWORD STRENGTH METER
  ───────────────────────────────────────────────── */
  const initPasswordStrength = (inputId, fillId, labelId) => {
    const input = document.getElementById(inputId);
    const fill  = document.getElementById(fillId);
    const label = document.getElementById(labelId);
    if (!input || !fill || !label) return;

    input.addEventListener('input', () => {
      const val = input.value;
      let score = 0;
      if (val.length >= 8)  score++;
      if (val.length >= 12) score++;
      if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
      if (/\d/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      const levels = [
        { pct: '0%',   color: 'transparent',       text: '' },
        { pct: '25%',  color: 'var(--danger)',      text: 'Weak' },
        { pct: '50%',  color: 'var(--warning)',     text: 'Fair' },
        { pct: '75%',  color: 'var(--accent)',      text: 'Good' },
        { pct: '100%', color: 'var(--success)',     text: 'Strong 💪' },
      ];

      const capped = Math.min(score, 4);
      const level  = val.length === 0 ? levels[0] : levels[capped] || levels[1];

      fill.style.width      = val.length === 0 ? '0%' : levels[Math.max(capped, 1)].pct;
      fill.style.background = level.color;
      label.textContent     = val.length === 0 ? '' : level.text;
    });
  };

  /* ─────────────────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────────────────── */
  return {
    showToast,
    initNav,
    renderListings,
    initFilters,
    initSearch,
    animateStats,
    initMyListings,
    initPostModal,
    initLoginForm,
    initRegisterForm,
    initPasswordToggle,
    initPasswordStrength,
  };

})();
