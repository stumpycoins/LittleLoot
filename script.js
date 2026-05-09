const sampleProducts = [
  {
    id: "sku-101",
    name: "Mini Camera Keychain",
    category: "Keychain",
    price: 499,
    mrp: 999,
    stock: 18,
    image: "assets/mini-camera-keychain.svg",
    images: ["assets/mini-camera-keychain.svg", "assets/anime-keychain.svg", "assets/heart-clip-charm.svg"],
    description: "A tiny camera-style keychain for bags, keys and gifting.",
    color: "#dcefff"
  },
  {
    id: "sku-102",
    name: "Kawaii Star Bag Charm",
    category: "Charm",
    price: 349,
    mrp: 699,
    stock: 7,
    image: "assets/star-bag-charm.svg",
    images: ["assets/star-bag-charm.svg", "assets/heart-clip-charm.svg", "assets/desk-buddy-pen-set.svg"],
    description: "Soft pastel charm with a sturdy clip for backpacks.",
    color: "#ffdbe4"
  },
  {
    id: "sku-103",
    name: "Pocket Plush Hanger",
    category: "Gift",
    price: 599,
    mrp: 1199,
    stock: 0,
    image: "assets/pocket-plush-hanger.svg",
    images: ["assets/pocket-plush-hanger.svg", "assets/heart-clip-charm.svg", "assets/star-bag-charm.svg"],
    description: "Mini plush hanger made for birthday surprises.",
    color: "#d7f5e7"
  },
  {
    id: "sku-104",
    name: "Acrylic Anime Keychain",
    category: "Keychain",
    price: 299,
    mrp: 499,
    stock: 36,
    image: "assets/anime-keychain.svg",
    images: ["assets/anime-keychain.svg", "assets/mini-camera-keychain.svg", "assets/star-bag-charm.svg"],
    description: "Glossy acrylic keychain with a bright fandom look.",
    color: "#ffed94"
  },
  {
    id: "sku-105",
    name: "Desk Buddy Pen Set",
    category: "Stationery",
    price: 249,
    mrp: 399,
    stock: 15,
    image: "assets/desk-buddy-pen-set.svg",
    images: ["assets/desk-buddy-pen-set.svg", "assets/star-bag-charm.svg", "assets/heart-clip-charm.svg"],
    description: "Cute gel pens that make school and desk notes happier.",
    color: "#f3e5ff"
  },
  {
    id: "sku-106",
    name: "Heart Clip Charm",
    category: "Charm",
    price: 199,
    mrp: 349,
    stock: 4,
    image: "assets/heart-clip-charm.svg",
    images: ["assets/heart-clip-charm.svg", "assets/star-bag-charm.svg", "assets/pocket-plush-hanger.svg"],
    description: "Small clip-on heart charm for pouches and gift hampers.",
    color: "#ffe6d7"
  }
];

const storageKey = "littleloot-products";
const cartKey = "littleloot-cart-items";

function productImages(product, fallbackIndex = 0) {
  const fallback = sampleProducts[fallbackIndex % sampleProducts.length]?.image || "assets/mini-camera-keychain.svg";
  const images = Array.isArray(product.images) && product.images.length ? product.images : [product.image || fallback];
  return images.filter(Boolean);
}

function primaryImage(product, fallbackIndex = 0) {
  return productImages(product, fallbackIndex)[0];
}

function getProducts() {
  const stored = localStorage.getItem(storageKey);
  if (!stored) {
    localStorage.setItem(storageKey, JSON.stringify(sampleProducts));
    return sampleProducts;
  }

  try {
    const products = JSON.parse(stored).map((product, index) => ({
      ...product,
      images: productImages(product, index),
      image: primaryImage(product, index)
    }));
    localStorage.setItem(storageKey, JSON.stringify(products));
    return products;
  } catch {
    localStorage.setItem(storageKey, JSON.stringify(sampleProducts));
    return sampleProducts;
  }
}

function saveProducts(products) {
  localStorage.setItem(storageKey, JSON.stringify(products));
}

function formatPrice(value) {
  return `Rs. ${Number(value).toLocaleString("en-IN")}`;
}

function discount(product) {
  return Math.max(0, Math.round(((product.mrp - product.price) / product.mrp) * 100));
}

function productStatus(product) {
  if (product.stock <= 0) return "Sold Out";
  if (product.stock <= 5) return "Low Stock";
  return "In Stock";
}

function statusClass(status) {
  if (status === "Sold Out") return "out";
  if (status === "Low Stock") return "low";
  return "";
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(cartKey)) || {};
  } catch {
    localStorage.setItem(cartKey, JSON.stringify({}));
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

function cartQuantity() {
  const cart = getCart();
  return getProducts().reduce((total, product) => {
    if (product.stock <= 0) return total;
    return total + Math.min(Number(cart[product.id] || 0), product.stock);
  }, 0);
}

function updateCartCount() {
  const count = document.querySelector("#cart-count");
  if (count) count.textContent = cartQuantity();
}

function addToCart(productId) {
  const product = getProducts().find((item) => item.id === productId);
  if (!product || product.stock <= 0) return false;

  const cart = getCart();
  const nextQuantity = Math.min((cart[productId] || 0) + 1, product.stock);
  cart[productId] = nextQuantity;
  saveCart(cart);
  updateCartCount();
  return true;
}

function sortedProducts(products, sortValue) {
  const nextProducts = [...products];
  if (sortValue === "price-low") return nextProducts.sort((a, b) => a.price - b.price);
  if (sortValue === "price-high") return nextProducts.sort((a, b) => b.price - a.price);
  if (sortValue === "discount") return nextProducts.sort((a, b) => discount(b) - discount(a));
  if (sortValue === "name") return nextProducts.sort((a, b) => a.name.localeCompare(b.name));
  return nextProducts;
}

function renderProducts() {
  const grid = document.querySelector("#product-grid");
  if (!grid) return;

  const categoryFilter = document.querySelector("#category-filter")?.value || "All";
  const stockFilter = document.querySelector("#stock-filter")?.value || "All";
  const sortValue = document.querySelector("#sort-products")?.value || "featured";
  const productCount = document.querySelector("#product-count");
  const products = sortedProducts(
    getProducts().filter((product) => {
      const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
      const matchesStock = stockFilter === "All" || productStatus(product) === stockFilter;
      return matchesCategory && matchesStock;
    }),
    sortValue
  );

  if (productCount) {
    productCount.textContent = `${products.length} item${products.length === 1 ? "" : "s"}`;
  }

  if (!products.length) {
    grid.innerHTML = `
      <div class="empty-products">
        <h3>No products found.</h3>
        <p>Try a different filter or sort option.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products
    .map((product) => {
      const isSoldOut = product.stock <= 0;
      const images = productImages(product);
      const gallery = images
        .slice(1, 4)
        .map(
          (image, index) => `
            <button type="button" data-gallery-for="${product.id}" data-image-index="${index + 1}" aria-label="View ${product.name} image ${index + 2}">
              <img src="${image}" alt="" />
            </button>
          `
        )
        .join("");
      return `
        <article class="product-card">
          <span class="sale-badge">-${discount(product)}%</span>
          <span class="stock-pill">${productStatus(product)}</span>
          <div class="product-art" style="--card-bg: ${product.color || "#fff6df"}">
            <img src="${primaryImage(product)}" alt="${product.name}" />
          </div>
          <div class="product-info">
            <small>${product.category}</small>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            ${images.length > 1 ? `<div class="product-mini-gallery" aria-label="${product.name} extra images">${gallery}</div>` : ""}
            <div class="price-row">
              <strong>${formatPrice(product.price)}</strong>
              <del>${formatPrice(product.mrp)}</del>
            </div>
            <div class="product-actions">
              <button class="secondary-button quick-look-button" type="button" data-look="${product.id}">Quick Look</button>
              <button class="add-button" type="button" data-add="${product.id}" ${isSoldOut ? "disabled" : ""}>
                ${isSoldOut ? "Sold Out" : "Quick Add"}
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function setupStorefront() {
  const grid = document.querySelector("#product-grid");
  updateCartCount();

  document.querySelector(".cart-button")?.addEventListener("click", () => {
    window.location.href = "cart.html";
  });

  if (!grid) return;
  const quickLook = document.querySelector("#quick-look");
  const quickLookAdd = document.querySelector("#quick-look-add");
  let activeQuickLookId = "";

  document.querySelectorAll("#category-filter, #stock-filter, #sort-products").forEach((control) => {
    control.addEventListener("change", renderProducts);
  });

  grid.addEventListener("click", (event) => {
    const galleryButton = event.target.closest("[data-gallery-for]");
    const lookButton = event.target.closest("[data-look]");
    const button = event.target.closest("[data-add]");
    if (galleryButton) {
      const product = getProducts().find((item) => item.id === galleryButton.dataset.galleryFor);
      const card = galleryButton.closest(".product-card");
      if (!product || !card) return;
      const image = productImages(product)[Number(galleryButton.dataset.imageIndex)];
      if (!image) return;
      card.querySelector(".product-art img").src = image;
      card.querySelector(".product-art img").alt = product.name;
      return;
    }

    if (lookButton) {
      const product = getProducts().find((item) => item.id === lookButton.dataset.look);
      if (!product || !quickLook) return;
      const status = productStatus(product);
      const images = productImages(product);
      activeQuickLookId = product.id;
      document.querySelector("#quick-look-image").src = primaryImage(product);
      document.querySelector("#quick-look-image").alt = product.name;
      document.querySelector("#quick-look-thumbs").innerHTML = images
        .map(
          (image, index) => `
            <button class="${index === 0 ? "active" : ""}" type="button" data-quick-image="${image}" aria-label="View product image ${index + 1}">
              <img src="${image}" alt="" />
            </button>
          `
        )
        .join("");
      document.querySelector("#quick-look-category").textContent = product.category;
      document.querySelector("#quick-look-title").textContent = product.name;
      document.querySelector("#quick-look-description").textContent = product.description;
      document.querySelector("#quick-look-price").textContent = formatPrice(product.price);
      document.querySelector("#quick-look-mrp").textContent = formatPrice(product.mrp);
      document.querySelector("#quick-look-status").textContent = status;
      document.querySelector("#quick-look-status").className = `status ${statusClass(status)}`;
      quickLookAdd.disabled = product.stock <= 0;
      quickLookAdd.textContent = product.stock <= 0 ? "Sold Out" : "Add to Cart";
      quickLook.hidden = false;
      document.body.classList.add("modal-open");
      return;
    }

    if (!button) return;
    const wasAdded = addToCart(button.dataset.add);
    if (!wasAdded) return;
    button.textContent = "Added";
    window.setTimeout(() => {
      button.textContent = "Quick Add";
    }, 900);
  });

  quickLook?.addEventListener("click", (event) => {
    const imageButton = event.target.closest("[data-quick-image]");
    if (imageButton) {
      document.querySelector("#quick-look-image").src = imageButton.dataset.quickImage;
      quickLook.querySelectorAll("[data-quick-image]").forEach((button) => button.classList.remove("active"));
      imageButton.classList.add("active");
      return;
    }

    if (!event.target.closest("[data-close-quick-look]")) return;
    quickLook.hidden = true;
    document.body.classList.remove("modal-open");
  });

  quickLookAdd?.addEventListener("click", () => {
    if (!activeQuickLookId || !addToCart(activeQuickLookId)) return;
    quickLookAdd.textContent = "Added";
    window.setTimeout(() => {
      quickLookAdd.textContent = "Add to Cart";
    }, 900);
  });

  renderProducts();
}

setupStorefront();
