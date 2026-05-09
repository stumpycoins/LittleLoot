const cartItems = document.querySelector("#cart-items");
const emptyCart = document.querySelector("#empty-cart");
const subtotalNode = document.querySelector("#subtotal");
const shippingNode = document.querySelector("#shipping");
const grandTotalNode = document.querySelector("#grand-total");
const payButton = document.querySelector("#pay-button");
const paymentForm = document.querySelector("#payment-form");
const paymentMethod = document.querySelector("#payment-method");
const paymentMessage = document.querySelector("#payment-message");
const cardFields = document.querySelector("#card-fields");
const upiField = document.querySelector("#upi-field");
const cardInputs = ["#card-number", "#card-expiry", "#card-cvv"].map((selector) => document.querySelector(selector));
const upiInput = document.querySelector("#upi-id");
let orderComplete = false;

function cartLines() {
  const cart = getCart();
  const normalizedCart = {};
  const lines = getProducts()
    .filter((product) => cart[product.id] && product.stock > 0)
    .map((product) => {
      const quantity = Math.min(cart[product.id], product.stock);
      normalizedCart[product.id] = quantity;
      return {
        ...product,
        quantity
      };
    });

  saveCart(normalizedCart);
  return lines;
}

function cartTotals(lines) {
  const subtotal = lines.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 499 ? 0 : 49;
  return {
    subtotal,
    shipping,
    total: subtotal + shipping
  };
}

function renderCart() {
  const lines = cartLines();
  const totals = cartTotals(lines);
  const hasItems = lines.length > 0;

  emptyCart.hidden = hasItems;
  cartItems.hidden = !hasItems;
  paymentForm.hidden = !hasItems;

  if (!hasItems && orderComplete) {
    emptyCart.querySelector("h3").textContent = "Order confirmed.";
    emptyCart.querySelector("p").textContent = "Payment successful. Your LittleLoot order is ready for packing.";
  }

  cartItems.innerHTML = lines
    .map(
      (item) => `
        <article class="cart-item">
          <img src="${primaryImage(item)}" alt="${item.name}" />
          <div>
            <small>${item.category}</small>
            <h3>${item.name}</h3>
            <strong>${formatPrice(item.price)}</strong>
          </div>
          <div class="quantity-control" aria-label="Quantity for ${item.name}">
            <button type="button" data-decrease="${item.id}" aria-label="Decrease quantity">-</button>
            <span>${item.quantity}</span>
            <button type="button" data-increase="${item.id}" aria-label="Increase quantity">+</button>
          </div>
          <button class="icon-action delete" type="button" data-remove="${item.id}">Remove</button>
        </article>
      `
    )
    .join("");

  subtotalNode.textContent = formatPrice(totals.subtotal);
  shippingNode.textContent = totals.shipping === 0 ? "Free" : formatPrice(totals.shipping);
  grandTotalNode.textContent = formatPrice(totals.total);
  payButton.textContent = `Pay ${formatPrice(totals.total)}`;
  updateCartCount();
}

function updatePaymentFields() {
  const method = paymentMethod.value;
  cardFields.hidden = method !== "card";
  upiField.hidden = method !== "upi";
  cardInputs.forEach((input) => {
    input.required = method === "card";
  });
  upiInput.required = method === "upi";
}

cartItems.addEventListener("click", (event) => {
  const cart = getCart();
  const increaseButton = event.target.closest("[data-increase]");
  const decreaseButton = event.target.closest("[data-decrease]");
  const removeButton = event.target.closest("[data-remove]");

  if (increaseButton) {
    const product = getProducts().find((item) => item.id === increaseButton.dataset.increase);
    if (product) cart[product.id] = Math.min((cart[product.id] || 0) + 1, product.stock);
  }

  if (decreaseButton) {
    const productId = decreaseButton.dataset.decrease;
    cart[productId] = (cart[productId] || 1) - 1;
    if (cart[productId] <= 0) delete cart[productId];
  }

  if (removeButton) {
    delete cart[removeButton.dataset.remove];
  }

  saveCart(cart);
  renderCart();
});

paymentMethod.addEventListener("change", updatePaymentFields);

paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const lines = cartLines();
  if (!lines.length) return;

  saveCart({});
  orderComplete = true;
  paymentMessage.textContent = "";
  paymentForm.reset();
  updatePaymentFields();
  renderCart();
});

document.querySelector(".cart-button")?.addEventListener("click", () => {
  window.location.href = "cart.html";
});

updatePaymentFields();
renderCart();
