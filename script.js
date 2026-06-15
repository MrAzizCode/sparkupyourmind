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
  },
  {
    id: "idea-map",
    name: "Idea Map Workbook",
    description: "A workbook for organizing scattered ideas into themes, projects, and next steps.",
    details: "Great for students and creators who have many ideas but feel too overwhelmed to choose where to begin.",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=85",
    featured: false
  },
  {
    id: "rest-planner",
    name: "Creative Rest Planner",
    description: "A weekly planner that balances creative work, study time, sleep, breaks, and personal routines.",
    details: "This planner helps prevent burnout by making rest visible and treating recovery as part of the creative process.",
    price: 11.99,
    image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=900&q=85",
    featured: false
  },
  {
    id: "focus-playlist",
    name: "Focus Playlist Guide",
    description: "A digital guide for building sound routines for focus, brainstorming, deep work, and rest.",
    details: "Includes sample playlist moods and reflection prompts to help you understand which sounds support your creativity.",
    price: 6.99,
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=85",
    featured: false
  }
];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

let cart = JSON.parse(localStorage.getItem("sparkCart") || "[]");

function saveCart() {
  localStorage.setItem("sparkCart", JSON.stringify(cart));
  renderCart();
}

function addToCart(productId) {
  const item = cart.find((cartItem) => cartItem.id === productId);
  if (item) {
    item.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  saveCart();
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
          <p>${product.quantity} x ${money.format(product.price)}</p>
        </div>
        <button class="icon-button" type="button" data-remove-cart="${product.id}" aria-label="Remove ${product.name}">x</button>
      </article>
    `)
    .join("");
}

function openCart() {
  const drawer = document.querySelector("[data-cart-drawer]");
  if (!drawer) return;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  const drawer = document.querySelector("[data-cart-drawer]");
  if (!drawer) return;
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
}

function productCard(product) {
  return `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-body">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-meta">
          <span class="price">${money.format(product.price)}</span>
        </div>
        <div class="product-actions">
          <button class="small-button" type="button" data-view-product="${product.id}">Details</button>
          <button class="small-button" type="button" data-add-cart="${product.id}">Add to Cart</button>
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
  const search = document.querySelector("[data-product-search]")?.value.toLowerCase() || "";
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
      <h2>${product.name}</h2>
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
    if (target.closest("[data-cart-open]")) openCart();
    if (target.closest("[data-cart-close]")) closeCart();
    if (target.closest("[data-dialog-close]")) document.querySelector("[data-product-dialog]")?.close();
    if (target.closest("[data-checkout]")) alert("Checkout demo: cart functionality is working.");
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
