const form = document.querySelector("#product-form");
const table = document.querySelector("#inventory-table");
const imageInput = document.querySelector("#image");
const imagePreview = document.querySelector("#image-preview");

function resetForm() {
  form.reset();
  document.querySelector("#product-id").value = "";
  imagePreview.hidden = true;
  imagePreview.innerHTML = "";
}

function statusClass(status) {
  if (status === "Sold Out") return "out";
  if (status === "Low Stock") return "low";
  return "";
}

function updateStats(products) {
  document.querySelector("#total-products").textContent = products.length;
  document.querySelector("#total-stock").textContent = products.reduce((total, product) => total + Number(product.stock), 0);
  document.querySelector("#low-stock").textContent = products.filter((product) => product.stock > 0 && product.stock <= 5).length;
}

function renderInventory() {
  const products = getProducts();
  updateStats(products);

  table.innerHTML = products
    .map((product) => {
      const status = productStatus(product);
      return `
        <tr>
          <td>
            <div class="inventory-item">
              <img class="inventory-thumb" src="${primaryImage(product)}" alt="${product.name}" />
              ${product.name}
            </div>
          </td>
          <td>${product.category}</td>
          <td>${formatPrice(product.price)}</td>
          <td>${product.stock}</td>
          <td><span class="status ${statusClass(status)}">${status}</span></td>
          <td>
            <div class="row-actions">
              <button class="icon-action" type="button" data-edit="${product.id}" title="Edit product">Edit</button>
              <button class="icon-action delete" type="button" data-delete="${product.id}" title="Delete product">Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function renderImagePreview(images) {
  imagePreview.innerHTML = images
    .map((image, index) => `<img src="${image}" alt="Product image preview ${index + 1}" />`)
    .join("");
  imagePreview.hidden = images.length === 0;
}

async function filesToDataUrls(files) {
  return Promise.all(Array.from(files).map((file) => fileToDataUrl(file)));
}

imageInput.addEventListener("change", async () => {
  if (!imageInput.files.length) return;
  imageInput.setCustomValidity("");
  renderImagePreview(await filesToDataUrls(imageInput.files));
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const products = getProducts();
  const existingId = document.querySelector("#product-id").value;
  const existingProduct = products.find((item) => item.id === existingId);
  const images = imageInput.files.length ? await filesToDataUrls(imageInput.files) : existingProduct ? productImages(existingProduct) : [];

  if (!images.length) {
    imageInput.setCustomValidity("Please upload at least one product image.");
    imageInput.reportValidity();
    return;
  }

  imageInput.setCustomValidity("");
  const product = {
    id: existingId || `sku-${Date.now()}`,
    name: document.querySelector("#name").value.trim(),
    category: document.querySelector("#category").value,
    price: Number(document.querySelector("#price").value),
    mrp: Number(document.querySelector("#mrp").value),
    stock: Number(document.querySelector("#stock").value),
    image: images[0],
    images,
    description: document.querySelector("#description").value.trim(),
    color: sampleProducts[Math.floor(Math.random() * sampleProducts.length)].color
  };

  const nextProducts = existingId
    ? products.map((item) => (item.id === existingId ? { ...item, ...product, color: item.color || product.color } : item))
    : [product, ...products];

  saveProducts(nextProducts);
  resetForm();
  renderInventory();
});

table.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");
  const products = getProducts();

  if (editButton) {
    const product = products.find((item) => item.id === editButton.dataset.edit);
    if (!product) return;
    document.querySelector("#product-id").value = product.id;
    document.querySelector("#name").value = product.name;
    document.querySelector("#category").value = product.category;
    document.querySelector("#price").value = product.price;
    document.querySelector("#mrp").value = product.mrp;
    document.querySelector("#stock").value = product.stock;
    renderImagePreview(productImages(product));
    document.querySelector("#description").value = product.description;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (deleteButton) {
    const nextProducts = products.filter((item) => item.id !== deleteButton.dataset.delete);
    saveProducts(nextProducts);
    renderInventory();
  }
});

document.querySelector("#reset-form").addEventListener("click", resetForm);

document.querySelector("#reset-sample").addEventListener("click", () => {
  saveProducts(sampleProducts);
  resetForm();
  renderInventory();
});

renderInventory();
