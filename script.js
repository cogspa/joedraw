/* ==========================================================================
   JOEDRAW // High-Performance Endless Parallax Scroller Engine
   ========================================================================== */

// Pool of 40 images available in the local media folder
const IMAGE_POOL = [
  'media/joe_1.jpeg', 'media/joe_3.png', 'media/joe_4.jpeg', 'media/joe_5.jpeg',
  'media/joe_6.jpeg', 'media/joe_7.jpeg', 'media/joe_8.jpeg', 'media/joe_9.jpeg',
  'media/joe_10.jpeg', 'media/joe_11.jpeg', 'media/joe_12.jpeg', 'media/joe_13.jpeg',
  'media/joe_14.jpeg', 'media/joe_15.jpeg', 'media/joe_16.jpeg', 'media/joe_17.jpeg',
  'media/joe_18.jpeg', 'media/joe_19.jpeg', 'media/joe_20.jpeg', 'media/joe_21.jpeg',
  'media/joe_22.jpeg', 'media/joe_23.jpeg', 'media/joe_24.jpeg', 'media/joe_25.jpeg',
  'media/joe_26.jpeg', 'media/joe_27.jpeg', 'media/joe_28.jpeg', 'media/joe_29.jpeg',
  'media/joe_30.jpeg', 'media/joe_31.jpeg', 'media/joe_32.jpeg', 'media/joe_33.jpeg',
  'media/joe_34.jpeg', 'media/joe_35.jpeg', 'media/joe_36.jpeg', 'media/joe_37.jpeg',
  'media/joe_38.jpeg', 'media/joe_39.jpeg', 'media/joe_40.jpeg', 'media/joe_41.jpeg'
];

// Aesthetic tags and titles for gallery cards
const ART_TAGS = [
  'JOEDRAW // SKETCH', 'JOEDRAW // CONCEPT', 'JOEDRAW // STUDY',
  'JOEDRAW // LINEART', 'JOEDRAW // DIGITAL', 'JOEDRAW // DRAFT',
  'JOEDRAW // INK', 'JOEDRAW // GRAPHIC', 'JOEDRAW // ABSTRACT'
];

const ART_TITLES = [
  'Visual Entropy', 'Digital Fluidity', 'Scribbled Drift', 'Line & Shader',
  'Cyber Gestalt', 'Monochrome Shift', 'Grid Topology', 'Organic Matrix',
  'Vector Synthesis', 'Coded Gesture', 'Chaotic Trace', 'Static Reverie'
];

// Configuration parameters
const CARD_HEIGHT = 380;
const CARD_SPACING = 60;
const SLOT_HEIGHT = CARD_HEIGHT + CARD_SPACING; // 440px
const NUM_CARDS_PER_COLUMN = 6;
const COL_HEIGHT = NUM_CARDS_PER_COLUMN * SLOT_HEIGHT; // 2640px

// State management
let targetScroll = 10000; // Start in the middle of our large scroll spacer
let currentScroll = 10000;
let lastScroll = 10000;
let scrollLerp = 0.08;
let totalDepth = 0;
let totalShuffles = 0;
let activeLayout = 'classic';
let displaySpeed = 0;

// Slider parameters
let entropyRate = 0.5; // From slider (0 to 1)
let parallaxIntensity = 1.2; // Speed multiplier for parallax offsets

// All constructed cards list
const allCards = [];

// Column definitions
const COLUMNS_CONFIG = [
  { id: 'colLeft', dom: null, speed: 0.7, initialOffset: -120, cards: [] },
  { id: 'colCenter', dom: null, speed: 1.1, initialOffset: 0, cards: [] },
  { id: 'colRight', dom: null, speed: 1.5, initialOffset: 120, cards: [] }
];

// DOM references
const scrollSpacer = document.getElementById('scrollSpacer');
const columnsWrapper = document.getElementById('columnsWrapper');
const valDepth = document.getElementById('valDepth');
const valSpeed = document.getElementById('valSpeed');
const valShuffles = document.getElementById('valShuffles');
const valLayout = document.getElementById('valLayout');
const statusMsg = document.getElementById('statusMsg');

const entropySlider = document.getElementById('entropySlider');
const entropyValueText = document.getElementById('entropyValue');
const parallaxSlider = document.getElementById('parallaxSlider');
const parallaxValueText = document.getElementById('parallaxValue');

const btnBurst = document.getElementById('btnBurst');
const btnReset = document.getElementById('btnReset');
const layoutButtons = document.querySelectorAll('.btn-layout');

// Helper: Get random item from array
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: Pick a random image from pool that is not currently visible on the specific card
function getRandomImage(excludeImages = []) {
  const available = IMAGE_POOL.filter(img => !excludeImages.includes(img));
  return getRandomItem(available.length > 0 ? available : IMAGE_POOL);
}

// Helper: Extract human-readable ID from filename (e.g. joe_15.jpeg -> #15)
function getImageId(imgSrc) {
  const match = imgSrc.match(/joe_(\d+)/);
  return match ? `#${match[1]}` : '#00';
}

// Initialize the infinite page
function init() {
  // Lock browser scrollbar to initial start
  window.scrollTo(0, targetScroll);
  currentScroll = targetScroll;
  lastScroll = targetScroll;

  // Initialize columns and programmatic cards
  COLUMNS_CONFIG.forEach(col => {
    col.dom = document.getElementById(col.id);
    col.dom.innerHTML = ''; // Clear fallback

    for (let i = 0; i < NUM_CARDS_PER_COLUMN; i++) {
      createCard(col, i);
    }
  });

  setupEventListeners();
  animate();
}

// Create card element and inject into column DOM
function createCard(column, index) {
  const cardDom = document.createElement('div');
  cardDom.className = 'card';
  cardDom.style.height = `${CARD_HEIGHT}px`;

  // Select two random images (front and back must be different)
  const frontImgSrc = getRandomImage();
  const backImgSrc = getRandomImage([frontImgSrc]);

  const frontTag = getRandomItem(ART_TAGS);
  const backTag = getRandomItem(ART_TAGS);
  const frontTitle = `${getRandomItem(ART_TITLES)} ${getImageId(frontImgSrc)}`;
  const backTitle = `${getRandomItem(ART_TITLES)} ${getImageId(backImgSrc)}`;

  cardDom.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-front">
        <img class="card-image" src="${frontImgSrc}" alt="Artwork" />
        <div class="card-overlay">
          <div class="card-tag">${frontTag}</div>
          <h4 class="card-title">${frontTitle}</h4>
        </div>
        <div class="card-index">${getImageId(frontImgSrc)}</div>
      </div>
      <div class="card-face card-back">
        <img class="card-image" src="${backImgSrc}" alt="Artwork" />
        <div class="card-overlay">
          <div class="card-tag">${backTag}</div>
          <h4 class="card-title">${backTitle}</h4>
        </div>
        <div class="card-index">${getImageId(backImgSrc)}</div>
      </div>
    </div>
  `;

  column.dom.appendChild(cardDom);

  // Card record object
  const cardRecord = {
    dom: cardDom,
    innerDom: cardDom.querySelector('.card-inner'),
    frontImg: cardDom.querySelector('.card-front .card-image'),
    backImg: cardDom.querySelector('.card-back .card-image'),
    frontTagDom: cardDom.querySelector('.card-front .card-tag'),
    backTagDom: cardDom.querySelector('.card-back .card-tag'),
    frontTitleDom: cardDom.querySelector('.card-front .card-title'),
    backTitleDom: cardDom.querySelector('.card-back .card-title'),
    
    // Position parameters
    initialY: index * SLOT_HEIGHT + column.initialOffset,
    column: column,
    index: index,
    
    // Animation states
    isFlipped: false,
    isFlipping: false,
    currentImg: frontImgSrc,
    lastRelativeY: 0
  };

  allCards.push(cardRecord);
  column.cards.push(cardRecord);
}

// Trigger a 3D flip on a card and load a new random image onto the background face
function triggerCardFlip(card, force = false) {
  if (card.isFlipping && !force) return;

  card.isFlipping = true;
  totalShuffles++;
  valShuffles.textContent = totalShuffles;

  // Determine active and inactive face
  const willShowBack = !card.isFlipped;
  const currentImagesInUse = [card.currentImg];
  
  const newImgSrc = getRandomImage(currentImagesInUse);
  const newTag = getRandomItem(ART_TAGS);
  const newTitle = `${getRandomItem(ART_TITLES)} ${getImageId(newImgSrc)}`;

  if (willShowBack) {
    // Front is currently visible, update BACK face before turning
    card.backImg.src = newImgSrc;
    card.backTagDom.textContent = newTag;
    card.backTitleDom.textContent = newTitle;
    card.dom.querySelector('.card-back .card-index').textContent = getImageId(newImgSrc);
    
    // Trigger CSS transform rotateY(180deg)
    card.innerDom.classList.add('is-flipped');
    card.isFlipped = true;
    card.currentImg = newImgSrc;
  } else {
    // Back is currently visible, update FRONT face before turning
    card.frontImg.src = newImgSrc;
    card.frontTagDom.textContent = newTag;
    card.frontTitleDom.textContent = newTitle;
    card.dom.querySelector('.card-front .card-index').textContent = getImageId(newImgSrc);
    
    // Remove CSS class to rotate back to 0deg
    card.innerDom.classList.remove('is-flipped');
    card.isFlipped = false;
    card.currentImg = newImgSrc;
  }

  // Visual status ripple on shuffle
  statusMsg.textContent = `SHUFFLED CARD ${getImageId(newImgSrc)} // SPEED: ${Math.round(displaySpeed)} px/s`;
  statusMsg.classList.add('highlight');
  setTimeout(() => statusMsg.classList.remove('highlight'), 300);

  // Flip cooling down
  setTimeout(() => {
    card.isFlipping = false;
  }, 800);
}

// Event Listeners Binding
function setupEventListeners() {
  // Sync page scroll
  window.addEventListener('scroll', () => {
    targetScroll = window.scrollY;
  });

  // Track global touch/trackpad velocity to output visual updates
  window.addEventListener('wheel', (e) => {
    // Dynamic message on heavy scrolling
    if (Math.abs(e.deltaY) > 50) {
      statusMsg.textContent = 'NAVIGATING CANVAS // PARALLAX ACTIVE';
    }
  }, { passive: true });

  // Grid style selection
  layoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      layoutButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const layout = btn.getAttribute('data-layout');
      activeLayout = layout;
      
      // Update HUD text
      valLayout.textContent = layout.toUpperCase().replace('-', ' ');

      // Modify wrapper class to trigger transitions
      columnsWrapper.className = `columns-wrapper layout-${layout}`;

      statusMsg.textContent = `LAYOUT SHIFTED // ${layout.toUpperCase()}`;
    });
  });

  // Entropy (Shuffle Frequency) Slider
  entropySlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    entropyRate = val / 100;
    
    if (val === 0) entropyValueText.textContent = 'MUTED';
    else if (val < 30) entropyValueText.textContent = 'LOW';
    else if (val < 70) entropyValueText.textContent = 'MEDIUM';
    else if (val < 95) entropyValueText.textContent = 'HIGH';
    else entropyValueText.textContent = 'MAX ENTROPY';
  });

  // Parallax Intensity Slider
  parallaxSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    parallaxIntensity = val / 100;
    parallaxValueText.textContent = `${parallaxIntensity.toFixed(1)}x`;
  });

  // Trigger global cascading shuffle burst
  btnBurst.addEventListener('click', () => {
    statusMsg.textContent = 'INITIATING CASCADE SHUFFLE BURST...';
    
    // Sort cards slightly to stagger from top to bottom
    const sortedCards = [...allCards].sort((a, b) => a.lastRelativeY - b.lastRelativeY);
    
    sortedCards.forEach((card, idx) => {
      setTimeout(() => {
        triggerCardFlip(card, true);
      }, idx * 75); // 75ms stagger Y-wave
    });
  });

  // Reset visual canvas
  btnReset.addEventListener('click', () => {
    statusMsg.textContent = 'RESETTING CANVAS AND TELEMETRY...';
    
    // Jump scroll position back smoothly
    targetScroll = 10000;
    currentScroll = 10000;
    window.scrollTo(0, 10000);
    
    totalShuffles = 0;
    totalDepth = 0;
    valShuffles.textContent = '0';
    valDepth.textContent = '0.00 m';

    // Staggered reset-shuffle on all cards back to front
    allCards.forEach((card, idx) => {
      setTimeout(() => {
        if (card.isFlipped) {
          card.innerDom.classList.remove('is-flipped');
          card.isFlipped = false;
        }
        const img = getRandomImage();
        card.frontImg.src = img;
        card.currentImg = img;
        card.frontTagDom.textContent = getRandomItem(ART_TAGS);
        card.frontTitleDom.textContent = `${getRandomItem(ART_TITLES)} ${getImageId(img)}`;
        card.dom.querySelector('.card-front .card-index').textContent = getImageId(img);
      }, idx * 40);
    });
  });

  // 1. Delegate card clicks to open Lightbox
  columnsWrapper.addEventListener('click', (e) => {
    const cardDom = e.target.closest('.card');
    if (!cardDom) return;

    // Retrieve active record
    const cardRecord = allCards.find(c => c.dom === cardDom);
    if (!cardRecord) return;

    // Prevent trigger during transition
    if (cardRecord.isFlipping) return;

    openLightbox(cardRecord);
  });

  // 2. Bind close button click
  const lightboxModal = document.getElementById('lightboxModal');
  const btnCloseLightbox = document.getElementById('btnCloseLightbox');
  btnCloseLightbox.addEventListener('click', () => {
    lightboxModal.close();
  });

  // 3. Fallback for browsers without native `closedby` attribute support (like Safari)
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    lightboxModal.addEventListener('click', (event) => {
      if (event.target !== lightboxModal) return;

      const rect = lightboxModal.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );

      if (!isDialogContent) {
        lightboxModal.close();
      }
    });
  }
}

// Primary Render Animation Loop (60fps)
function animate() {
  requestAnimationFrame(animate);

  // 1. Browser Level Endless Scroll wrapping logic
  let maxScroll = scrollSpacer.offsetHeight - window.innerHeight;
  let scrollDelta = targetScroll - currentScroll;
  
  // Wrap when approaching boundaries to remain truly infinite
  if (targetScroll > maxScroll - 2000) {
    let overshoot = targetScroll - (maxScroll - 2000);
    let wrappedScroll = 4000 + overshoot;
    window.scrollTo(0, wrappedScroll);
    targetScroll = wrappedScroll;
    currentScroll = wrappedScroll;
  } else if (targetScroll < 2000) {
    let undershoot = 2000 - targetScroll;
    let wrappedScroll = (maxScroll - 4000) - undershoot;
    window.scrollTo(0, wrappedScroll);
    targetScroll = wrappedScroll;
    currentScroll = wrappedScroll;
  }

  // Interpolate scrolling target for inertia ease
  currentScroll += scrollDelta * scrollLerp;

  // Track absolute scrolled depth
  let depthDiff = currentScroll - lastScroll;
  totalDepth += Math.abs(depthDiff);
  valDepth.textContent = `${(totalDepth * 0.005).toFixed(2)} m`;

  // Track velocity
  let speedPxS = Math.abs(depthDiff) * 60;
  displaySpeed += (speedPxS - displaySpeed) * 0.08;
  valSpeed.textContent = `${Math.round(displaySpeed)} px/s`;

  lastScroll = currentScroll;

  // Viewport borders
  let viewportHeight = window.innerHeight;

  // 2. Compute parallax position and off-screen recycling loop
  COLUMNS_CONFIG.forEach(col => {
    let colSpeed = col.speed * parallaxIntensity;
    let localScroll = currentScroll * colSpeed;

    col.cards.forEach(card => {
      // Basic relative coordinate with modulo loop
      let relativeY = card.initialY - (localScroll % COL_HEIGHT);

      // Loop coordinates cleanly around viewport buffers
      while (relativeY < -SLOT_HEIGHT) {
        relativeY += COL_HEIGHT;
      }
      while (relativeY > COL_HEIGHT - SLOT_HEIGHT) {
        relativeY -= COL_HEIGHT;
      }

      // Check if slot has WRAPPED offscreen this frame (element recycling)
      let verticalJump = Math.abs(relativeY - card.lastRelativeY);
      if (verticalJump > COL_HEIGHT / 2) {
        // Offscreen wrapping detected! Silent shuffle of this card face
        // Since it is off-screen, we can load a direct new image into the active face!
        const newImg = getRandomImage([card.currentImg]);
        const activeImgDom = card.isFlipped ? card.backImg : card.frontImg;
        const activeTagDom = card.isFlipped ? card.backTagDom : card.frontTagDom;
        const activeTitleDom = card.isFlipped ? card.backTitleDom : card.frontTitleDom;
        const activeIndexDom = card.dom.querySelector(`.card-${card.isFlipped ? 'back' : 'front'} .card-index`);
        
        activeImgDom.src = newImg;
        activeTagDom.textContent = getRandomItem(ART_TAGS);
        activeTitleDom.textContent = `${getRandomItem(ART_TITLES)} ${getImageId(newImg)}`;
        activeIndexDom.textContent = getImageId(newImg);
        card.currentImg = newImg;
        
        totalShuffles++;
        valShuffles.textContent = totalShuffles;
      }

      card.lastRelativeY = relativeY;

      // Inner Image Parallax (translate background image opposite of card movement)
      // As a card goes from top of viewport to bottom, we shift the background image Y slightly
      let cardCenter = relativeY + CARD_HEIGHT / 2;
      let viewportCenter = viewportHeight / 2;
      let centerOffset = (cardCenter - viewportCenter) / viewportHeight; // Normalised range ~[-1, 1]
      
      let imgTranslateY = centerOffset * -15; // Shift image within container up to -15%
      
      // Update DOM transform
      card.dom.style.transform = `translate3d(0, ${relativeY}px, 0)`;
      
      // Apply internal image parallax translation
      const activeImg = card.isFlipped ? card.backImg : card.frontImg;
      const inactiveImg = card.isFlipped ? card.frontImg : card.backImg;
      
      activeImg.style.transform = `translate3d(0, ${imgTranslateY}%, 0)`;
      // Keep inactive image still or offset
      inactiveImg.style.transform = `translate3d(0, 0, 0)`;

      // 3. Scroll-Driven 3D Card Shuffling logic (Mid-viewport flips)
      if (displaySpeed > 10 && entropyRate > 0) {
        // Only trigger on elements fully in the visible center of the screen
        let isInsideCenter = relativeY > SLOT_HEIGHT * 0.4 && relativeY < viewportHeight - SLOT_HEIGHT * 1.3;
        
        if (isInsideCenter && !card.isFlipping) {
          // Probability increases with scroll velocity and entropy settings
          let shuffleProbability = 0.00004 * displaySpeed * entropyRate;
          
          if (Math.random() < shuffleProbability) {
            triggerCardFlip(card);
          }
        }
      }
    });
  });
}

// Open premium glassmorphic lightbox with card details
function openLightbox(card) {
  const isFlipped = card.isFlipped;
  const activeImg = isFlipped ? card.backImg : card.frontImg;
  const activeTag = isFlipped ? card.backTagDom.textContent : card.frontTagDom.textContent;
  const activeTitle = isFlipped ? card.backTitleDom.textContent : card.frontTitleDom.textContent;

  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxTag = document.getElementById('lightboxTag');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxSource = document.getElementById('lightboxSource');

  // Load resources
  lightboxImage.src = activeImg.src;
  lightboxTag.textContent = activeTag;
  lightboxTitle.textContent = activeTitle;
  lightboxSource.textContent = activeImg.getAttribute('src');

  // Trigger native modal launch (places in Top Layer & locks focus)
  lightboxModal.showModal();
  
  // Update status overlay
  statusMsg.textContent = `EXPANDED VIEW // ${activeTitle.toUpperCase()}`;
}

// Launch the artwork canvas on page load
window.addEventListener('DOMContentLoaded', init);
