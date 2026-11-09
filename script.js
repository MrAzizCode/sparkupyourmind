const products = [
  {
    id: "reset-journal",
    name: "Creative Reset Journal",
    description: "A gentle journal for creatives who need space to rest, reflect, and begin again.",
    details: "Use this guided journal to slow down, notice burnout patterns, and rebuild your creative routine one calm page at a time.",
    price: 14.99,
    image: "assets/products/product-1.jpg",
    featured: true
  },
  {
    id: "spark-cards",
    name: "Spark Prompt Cards",
    description: "A 50-card prompt deck for creative warmups, sketching exercises, and writing starts.",
    details: "Each card gives one small low-pressure creative prompt, helping you restart momentum through play instead of perfection.",
    price: 9.99,
    image: "assets/products/product-2.jpg",
    featured: true
  },
  {
    id: "calm-kit",
    name: "Burnout Calm Kit",
    description: "A recovery bundle with planners, rest checklists, and creative energy tracking sheets.",
    details: "Designed for overwhelming days, this kit helps you recover, reset, recharge, and remember that rest is not laziness.",
    price: 19.99,
    image: "assets/products/product-3.jpg",
    featured: true
  }
];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("sparkCart") || "[]");
    if (!Array.isArray(saved)) return [];
    return products.flatMap(({ id }) => {
      const quantity = saved.find(item => item?.id === id)?.quantity;
      return Number.isSafeInteger(quantity) && quantity > 0 ? [{ id, quantity: Math.min(quantity, 99) }] : [];
    });
  } catch {
    return [];
  }
}

let cart = readCart();

function saveCart() {
  try { localStorage.setItem("sparkCart", JSON.stringify(cart)); } catch { /* Cart still works in memory. */ }
  renderCart();
}

function addToCart(productId) {
  if (!products.some(product => product.id === productId)) return;
  const item = cart.find((cartItem) => cartItem.id === productId);
  if (item) {
    item.quantity = Math.min(item.quantity + 1, 99);
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  saveCart();
  document.querySelector("[data-product-dialog][open]")?.close();
  openCart();
}

function removeFromCart(productId) {
  cart = cart.filter((cartItem) => cartItem.id !== productId);
  saveCart();
}

function getCartProducts() {
  return cart
    .map((cartItem) => {
      const product = products.find((entry) => entry.id === cartItem.id);
      return product ? { ...product, quantity: cartItem.quantity } : null;
    })
    .filter(Boolean);
}

function renderCart() {
  const cartItems = document.querySelector("[data-cart-items]");
  const cartCount = document.querySelectorAll("[data-cart-count]");
  const cartTotal = document.querySelector("[data-cart-total]");
  const cartProducts = getCartProducts();
  const totalQuantity = cartProducts.reduce((sum, product) => sum + product.quantity, 0);
  const total = cartProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const checkout = document.querySelector("[data-checkout]");
  if (checkout) checkout.disabled = !totalQuantity;
  const status = document.querySelector("[data-checkout-status]");
  if (status) status.textContent = "This is a demo store. No payment is collected.";

  cartCount.forEach((count) => {
    count.textContent = totalQuantity;
  });

  if (cartTotal) {
    cartTotal.textContent = money.format(total);
  }

  if (!cartItems) return;

  if (!cartProducts.length) {
    cartItems.innerHTML = '<div class="empty-state">Your cart is empty.</div>';
    return;
  }

  cartItems.innerHTML = cartProducts
    .map((product) => `
      <article class="cart-line">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <h3>${product.name}</h3>
          <p>${money.format(product.price * product.quantity)}</p>
          <div class="cart-quantity">
            <button type="button" data-quantity="${product.id}" data-delta="-1" aria-label="Decrease ${product.name} quantity">-</button>
            <span aria-live="polite">${product.quantity}</span>
            <button type="button" data-quantity="${product.id}" data-delta="1" aria-label="Increase ${product.name} quantity">+</button>
          </div>
        </div>
        <button class="icon-button" type="button" data-remove-cart="${product.id}" aria-label="Remove ${product.name}">x</button>
      </article>
    `)
    .join("");
}

function openCart() {
  const drawer = document.querySelector("[data-cart-drawer]");
  if (drawer && !drawer.open) drawer.showModal();
}

function closeCart() {
  const drawer = document.querySelector("[data-cart-drawer]");
  if (drawer?.open) drawer.close();
}

function productCard(product) {
  return `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async">
      <div class="product-body">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-meta">
          <span class="price">${money.format(product.price)}</span>
        </div>
        <div class="product-actions">
          <button class="small-button" type="button" data-view-product="${product.id}" aria-label="Details for ${product.name}">Details</button>
          <button class="small-button" type="button" data-add-cart="${product.id}" aria-label="Add ${product.name} to cart">Add to Cart</button>
        </div>
      </div>
    </article>
  `;
}

function renderFeaturedProducts() {
  const container = document.querySelector("[data-featured-products]");
  if (!container) return;
  container.innerHTML = products.filter((product) => product.featured).map(productCard).join("");
}

function getFilteredProducts() {
  const search = document.querySelector("[data-product-search]")?.value.trim().toLowerCase() || "";
  const sort = document.querySelector("[data-product-sort]")?.value || "featured";
  const filtered = products.filter((product) => {
    const text = `${product.name} ${product.description}`.toLowerCase();
    return text.includes(search);
  });

  if (sort === "price-low") filtered.sort((a, b) => a.price - b.price);
  if (sort === "price-high") filtered.sort((a, b) => b.price - a.price);
  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

  return filtered;
}

function renderProducts() {
  const grid = document.querySelector("[data-products-grid]");
  if (!grid) return;
  const filtered = getFilteredProducts();
  const count = document.querySelector("[data-results-count]");
  if (count) count.textContent = `${filtered.length} ${filtered.length === 1 ? "tool" : "tools"} in the collection`;
  grid.innerHTML = filtered.length
    ? filtered.map(productCard).join("")
    : '<div class="empty-state">No products match your search.</div>';
}

function openProductDialog(productId) {
  const product = products.find((entry) => entry.id === productId);
  const dialog = document.querySelector("[data-product-dialog]");
  const content = document.querySelector("[data-dialog-content]");
  if (!product || !dialog || !content) return;

  content.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <div class="dialog-copy">
      <p class="eyebrow">Product details</p>
      <h2 id="product-title">${product.name}</h2>
      <p>${product.details}</p>
      <strong class="price">${money.format(product.price)}</strong>
      <button class="button button-primary" type="button" data-add-cart="${product.id}">Add to Cart</button>
    </div>
  `;

  dialog.showModal();
}

function setupNavigation() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  nav.addEventListener("click", event => {
    if (!event.target.closest("a, [data-cart-open]")) return;
    if (nav.classList.contains("open")) toggle.focus();
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });
}

function setupEvents() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const addButton = target.closest("[data-add-cart]");
    const viewButton = target.closest("[data-view-product]");
    const removeButton = target.closest("[data-remove-cart]");

    if (addButton) addToCart(addButton.getAttribute("data-add-cart"));
    if (viewButton) openProductDialog(viewButton.getAttribute("data-view-product"));
    if (removeButton) removeFromCart(removeButton.getAttribute("data-remove-cart"));
    const step = target.closest("[data-quantity]");
    if (step) {
      const item = cart.find(entry => entry.id === step.dataset.quantity);
      if (item) {
        item.quantity = Math.min(99, item.quantity + Number(step.dataset.delta));
        if (item.quantity < 1) removeFromCart(item.id);
        else saveCart();
        const replacement = [...document.querySelectorAll("[data-quantity]")].find(button =>
          button.dataset.quantity === step.dataset.quantity && button.dataset.delta === step.dataset.delta);
        (replacement || document.querySelector("[data-cart-close]"))?.focus();
      }
    }
    if (target.closest("[data-cart-open]")) openCart();
    if (target.closest("[data-cart-close]")) closeCart();
    if (target.closest("[data-dialog-close]")) document.querySelector("[data-product-dialog]")?.close();
    if (target.closest("[data-checkout]")) {
      const status = document.querySelector("[data-checkout-status]");
      if (status) status.textContent = `Demo order preview: ${document.querySelector("[data-cart-total]").textContent}. No order placed or payment collected.`;
    }
  });

  document.querySelector("[data-cart-drawer]")?.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeCart();
  });

  document.querySelector("[data-product-search]")?.addEventListener("input", renderProducts);
  document.querySelector("[data-product-sort]")?.addEventListener("change", renderProducts);
}

setupNavigation();
setupEvents();
renderFeaturedProducts();
renderProducts();
renderCart();

const motionToggle = document.querySelector("[data-motion-toggle]");
if (motionToggle) {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let enabled = !reducedMotion.matches;
  const updateMotion = () => {
    document.body.classList.toggle("motion-paused", !enabled);
    document.body.classList.toggle("motion-opt-in", enabled && reducedMotion.matches);
    motionToggle.textContent = enabled ? "Pause motion" : "Play motion";
  };
  document.body.classList.add("motion-ready");
  updateMotion();
  motionToggle.hidden = false;
  motionToggle.addEventListener("click", () => {
    enabled = !enabled;
    updateMotion();
  });
  reducedMotion.addEventListener("change", event => {
    enabled = !event.matches;
    updateMotion();
  });
}

const prompts = {
  stuck: ["Draw one object without lifting your pen. Let the result be messy.", "Write three deliberately bad titles. Keep the one that makes you smile.", "Pick a color and find three ways to describe it without naming it."],
  tired: ["Close the draft. Write one sentence about where you want to pick it up tomorrow.", "Look away from your screen and notice one color, one sound, and one texture.", "Give yourself permission to stop after one line. Write that line."],
  scattered: ["Put every open idea on a list. Circle just one you want to spend five minutes with.", "Choose one tool and one tiny task. Put the other tools out of reach.", "Write what you are making in seven words or fewer."]
};
const mode = document.querySelector("#reset-mode");
const prompt = document.querySelector("#reset-prompt");
if (mode && prompt) {
  let current = 0;
  const show = () => { prompt.textContent = prompts[mode.value][current]; };
  mode.addEventListener("change", () => { current = 0; show(); });
  document.querySelector("[data-next-prompt]").addEventListener("click", () => {
    current = (current + 1) % prompts[mode.value].length;
    show();
  });
  show();
}
