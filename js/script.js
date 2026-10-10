const DRINKS = [
  {
    name: "CHERRY",
    subtitle: "SODA",
    desc: "A modern take on a classic soda with a perfect blend of sweet and tart, full of nostalgic flavor.",
    color: "#D32F2F", // Red
    accent: "#FFEBEE",
    id: "cherry",
    frames: 80,
    sequencePath: "animation/animation/Create_a_dynamic_202602032027_dgwz8_",
    sequenceExt: ".jpg",
    isSequence: true
  },
  {
    name: "GRAPE",
    subtitle: "SODA",
    desc: "A modern functional soda brand inspired by classic flavours but made with better ingredients.",
    color: "#7B1FA2", // Purple
    accent: "#F3E5F5",
    id: "grape",
    frames: 1,
    heroImage: "assets/images/grape_hero.svg",
    isSequence: false
  },
  {
    name: "LEMON",
    subtitle: "GINGER SODA",
    desc: "Bright and refreshing citrus soda with natural lemon spark and crisp bubbles.",
    color: "#FBC02D", // Yellow
    accent: "#FFFDE7",
    id: "lemon",
    frames: 1,
    heroImage: "assets/images/lemon_hero.svg",
    isSequence: false
  },
];

let state = {
  currentDrinkIndex: 0,
  theme: 'dark',
  images: {}, // Cache for loaded images: { 'drinkId': [img, img...] or img }
  loaded: false
};

const dom = {
  heroTitle: document.getElementById("heroTitle"),
  heroSubtitle: document.getElementById("heroSubtitle"),
  heroDesc: document.getElementById("heroDesc"),
  canvas: document.getElementById("heroCanvas"),
  ctx: document.getElementById("heroCanvas").getContext("2d"),
  flavorIndex: document.getElementById("flavorIndex"),
  body: document.body,
  loader: document.getElementById("loader"),
  progressBar: document.getElementById("progressBar"),
  loadingText: document.getElementById("loadingText"),
  navbar: document.getElementById("navbar"),
  heroSection: document.getElementById("hero"),
};

// --- Initialization ---

async function init() {
  setupCanvas();
  setupEventListeners();
  await loadCurrentDrinkAssets();
  hideLoader();
  updateUI();
  renderLoop();
}

function setupCanvas() {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
}

function resizeCanvas() {
  dom.canvas.width = window.innerWidth;
  dom.canvas.height = window.innerHeight;
  renderFrame(); // Redraw on resize
}

function setupEventListeners() {
  document
    .getElementById("prevBtn")
    .addEventListener("click", () => switchDrink(-1));
  document
    .getElementById("nextBtn")
    .addEventListener("click", () => switchDrink(1));
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);
  window.addEventListener("scroll", onScroll);
}

// --- Asset Loading ---

async function loadCurrentDrinkAssets() {
    const drink = DRINKS[state.currentDrinkIndex];
    
    if (state.images[drink.id]) {
        updateProgress(100);
        return Promise.resolve();
    }

    if (drink.isSequence) {
        state.images[drink.id] = [];
        let loadedCount = 0;
        const total = drink.frames;
        
        const promises = [];
        for (let i = 0; i < total; i++) {
            const p = new Promise((resolve) => {
                const img = new Image();
                // Format: 000, 001, ...
                const num = i.toString().padStart(3, '0');
                img.src = `${drink.sequencePath}${num}${drink.sequenceExt}`;
                img.onload = () => {
                    loadedCount++;
                    updateProgress(Math.round((loadedCount / total) * 100));
                    resolve();
                };
                img.onerror = () => {
                    console.error("Failed to load", img.src);
                    resolve(); // Resolve anyway to not block
                };
                state.images[drink.id][i] = img;
            });
            promises.push(p);
        }
        return Promise.all(promises);

    } else {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = drink.heroImage;
            img.onload = () => {
                state.images[drink.id] = img;
                updateProgress(100); 
                resolve();
            };
        });
    }
}

function updateProgress(percent) {
  dom.progressBar.style.width = percent + "%";
  dom.loadingText.innerText = `Loading ${percent}%`;
}

function hideLoader() {
  if (!state.loaded) {
    setTimeout(() => {
      dom.loader.classList.add("hidden");
      dom.body.classList.remove("loading-active");
      state.loaded = true;
    }, 500);
  }
}

// --- Interaction Logic ---

function switchDrink(direction) {
  let newIndex = state.currentDrinkIndex + direction;
  if (newIndex < 0) newIndex = DRINKS.length - 1;
  if (newIndex >= DRINKS.length) newIndex = 0;

  // Optional: Fade out text
  dom.heroTitle.style.opacity = 0;
  dom.heroSubtitle.style.opacity = 0;
  dom.heroDesc.style.opacity = 0;

  // Show small loader if needed, but for now we preload on demand
  // Ideally we might want to keep the current background until new one is ready
  
  setTimeout(async () => {
      state.currentDrinkIndex = newIndex;
      // Reset loading bar for variant switch? Or just small indicator.
      // For simplicity, we just await.
      await loadCurrentDrinkAssets();
      
      updateUI();
      
      // Fade in
      dom.heroTitle.style.opacity = 1;
      dom.heroSubtitle.style.opacity = 1;
      dom.heroDesc.style.opacity = 1;
  }, 300);
}

function updateUI() {
  const drink = DRINKS[state.currentDrinkIndex];

  // Text
  dom.heroTitle.innerText = drink.name;
  dom.heroSubtitle.innerText = drink.subtitle;
  dom.heroDesc.innerText = drink.desc;
  dom.flavorIndex.innerText = `0${state.currentDrinkIndex + 1}`;

  // Colors
  document.documentElement.style.setProperty("--primary-color", drink.color);
  document.documentElement.style.setProperty("--accent-color", drink.accent);

  // Force re-render
  renderFrame();
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  dom.body.setAttribute("data-theme", state.theme);
}

// --- Scroll & Parallax ---

let scrollY = 0;

function onScroll() {
  scrollY = window.scrollY;
  requestAnimationFrame(renderFrame);
}

function renderLoop() {
  // unused
}

function renderFrame() {
    const drink = DRINKS[state.currentDrinkIndex];
    let img;

    const maxScroll = window.innerHeight; 
    // progress 0 to 1 over 100vh
    const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

    if (drink.isSequence) {
        // Map progress to frame index
        const frameIndex = Math.min(
            Math.floor(progress * (drink.frames - 1)),
            drink.frames - 1
        );
        const images = state.images[drink.id];
        if (images && images[frameIndex]) {
            img = images[frameIndex];
        }
    } else {
        img = state.images[drink.id];
    }
    
    if (!img) return;

    // Clear
    dom.ctx.clearRect(0, 0, dom.canvas.width, dom.canvas.height);

    // Zoom/Move effect (applied to both sequence and static for consistency)
    const scale = 1; // Sequence usually has its own motion, so maybe no extra scale? 
                     // Or slight punch in. Let's keep it 1:1 for sequence to preserve quality.
    
    // If static, we might still want the parallax move
    if (!drink.isSequence) {
         const scaleStatic = 1 + (progress * 0.1); 
         const translateY = progress * 50; 
         drawImageCover(dom.ctx, img, dom.canvas.width, dom.canvas.height, scaleStatic, translateY);
    } else {
         drawImageCover(dom.ctx, img, dom.canvas.width, dom.canvas.height, 1, 0);
    }
}

/**
 * Helper to draw image cover style
 */
function drawImageCover(ctx, img, w, h, scale = 1, translateY = 0) {
  const imgRatio = img.width / img.height;
  const winRatio = w / h;

  let drawW, drawH, offsetX, offsetY;

  if (imgRatio > winRatio) {
    drawH = h;
    drawW = h * imgRatio;
    offsetX = (w - drawW) / 2;
    offsetY = 0;
  } else {
    drawW = w;
    drawH = w / imgRatio;
    offsetX = 0;
    offsetY = (h - drawH) / 2;
  }

  // Apply effects
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(scale, scale);
  ctx.translate(-w / 2, -h / 2);

  ctx.drawImage(img, offsetX, offsetY + translateY, drawW, drawH);
  ctx.restore();
}

// Start
document.addEventListener("DOMContentLoaded", init);
