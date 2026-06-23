const menuItems = [
  {
    id: "tandoori-chicken",
    name: "Tandoori Chicken",
    category: "Starters",
    price: 260,
    image: "assets/tandoori-chicken.svg",
    description: "Smoky chicken pieces marinated with yogurt, spices, and charred edges."
  },
  {
    id: "chicken-wings",
    name: "Peri Peri Wings",
    category: "Starters",
    price: 220,
    image: "assets/peri-peri-wings.svg",
    description: "Crisp wings tossed in a bright, spicy peri peri glaze."
  },
  {
    id: "mutton-seekh",
    name: "Mutton Seekh Kebab",
    category: "Starters",
    price: 310,
    image: "assets/mutton-seekh.svg",
    description: "Juicy minced mutton skewers grilled with herbs and warm spices."
  },
  {
    id: "butter-chicken",
    name: "Butter Chicken",
    category: "Mains",
    price: 340,
    image: "assets/butter-chicken.svg",
    description: "Tender chicken in a rich tomato-butter gravy with cream."
  },
  {
    id: "mutton-rogan",
    name: "Mutton Rogan Josh",
    category: "Mains",
    price: 420,
    image: "assets/mutton-rogan-josh.svg",
    description: "Slow-cooked mutton curry with deep spices and a silky red gravy."
  },
  {
    id: "egg-curry",
    name: "Masala Egg Curry",
    category: "Mains",
    price: 190,
    image: "assets/egg-curry.svg",
    description: "Boiled eggs simmered in onion-tomato masala and coriander."
  },
  {
    id: "chicken-biryani",
    name: "Chicken Dum Biryani",
    category: "Biryani",
    price: 280,
    image: "assets/chicken-biryani.svg",
    description: "Fragrant basmati rice layered with chicken, mint, and fried onions."
  },
  {
    id: "mutton-biryani",
    name: "Mutton Biryani",
    category: "Biryani",
    price: 370,
    image: "assets/mutton-biryani.svg",
    description: "Aromatic rice and tender mutton sealed with classic dum spices."
  },
  {
    id: "fish-fry",
    name: "Coastal Fish Fry",
    category: "Seafood",
    price: 300,
    image: "assets/fish-fry.svg",
    description: "Spiced fish fillets pan-fried until crisp and served with lemon."
  },
  {
    id: "prawn-masala",
    name: "Prawn Masala",
    category: "Seafood",
    price: 390,
    image: "assets/prawn-masala.svg",
    description: "Prawns cooked in a punchy coastal masala with curry leaves."
  },
  {
    id: "chicken-roll",
    name: "Chicken Kathi Roll",
    category: "Rolls",
    price: 170,
    image: "assets/chicken-roll.svg",
    description: "Flaky paratha wrapped with chicken tikka, onion, and chutney."
  },
  {
    id: "egg-chicken-roll",
    name: "Egg Chicken Roll",
    category: "Rolls",
    price: 190,
    image: "assets/egg-chicken-roll.svg",
    description: "Chicken roll layered with egg, crisp onions, and tangy sauce."
  }
];

const cart = new Map();
let activeFilter = "All";

const menuGrid = document.querySelector("#menu-grid");
const cartItems = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const subtotalEl = document.querySelector("#subtotal");
const deliveryEl = document.querySelector("#delivery");
const grandTotalEl = document.querySelector("#grand-total");
const orderStatus = document.querySelector("#order-status");
const searchInput = document.querySelector("#search-input");
const confirmation = document.querySelector("#confirmation");
const floatingCart = document.querySelector("#floating-cart");
const floatingCartTitle = document.querySelector("#floating-cart-title");
const floatingCartTotal = document.querySelector("#floating-cart-total");

const money = (amount) => `Rs ${amount.toLocaleString("en-IN")}`;

function filteredItems() {
  const query = searchInput.value.trim().toLowerCase();
  return menuItems.filter((item) => {
    const matchesFilter = activeFilter === "All" || item.category === activeFilter;
    const matchesSearch = item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
}

function renderMenu() {
  const items = filteredItems();
  menuGrid.innerHTML = items.map((item) => `
    <article class="item-card">
      <img src="${item.image}" alt="${item.name}">
      <div class="item-body">
        <div class="item-meta">
          <h3>${item.name}</h3>
          <span class="price">${money(item.price)}</span>
        </div>
        <p class="description">${item.description}</p>
        <div class="tag-row">
          <span class="tag">${item.category}</span>
          <button class="add-button" type="button" data-id="${item.id}">Add</button>
        </div>
      </div>
    </article>
  `).join("");

  if (!items.length) {
    menuGrid.innerHTML = `<p class="description">No dishes match your search.</p>`;
  }
}

function addToCart(itemId) {
  const item = menuItems.find((menuItem) => menuItem.id === itemId);
  const quantity = cart.get(itemId)?.quantity || 0;
  cart.set(itemId, { item, quantity: quantity + 1 });
  confirmation.textContent = "";
  renderCart();
}

function buildOrderMessage({ customerName, customerPhone, address, locationLink, paymentMethod, entries, subtotal, grandTotal }) {
  const itemLines = entries
    .map(({ item, quantity }) => `- ${item.name} x ${quantity} = ${money(item.price * quantity)}`)
    .join("\n");

  return [
    "New order for Rai Fish Centre",
    "",
    `Name: ${customerName}`,
    `Phone: ${customerPhone}`,
    `Address: ${address}`,
    `Location: ${locationLink || "Not shared"}`,
    `Payment: ${paymentMethod}`,
    "Payment instruction: Customer can do payment through WhatsApp/UPI on 9417561120.",
    "",
    "Order:",
    itemLines,
    "",
    `Subtotal: ${money(subtotal)}`,
    "Delivery: Free",
    `Total: ${money(grandTotal)}`
  ].join("\n");
}

function requestCustomerLocation() {
  return new Promise((resolve) => {
    let finished = false;
    const finish = (value) => {
      if (finished) return;
      finished = true;
      resolve(value);
    };

    window.setTimeout(() => finish(""), 3500);

    if (!navigator.geolocation) {
      finish("");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        finish(`https://www.google.com/maps?q=${latitude},${longitude}`);
      },
      () => finish(""),
      {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 0
      }
    );
  });
}

function redirectToWhatsApp(message) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=919872901342&text=${encodedMessage}`;
  window.location.assign(whatsappUrl);
}

function updateQuantity(itemId, change) {
  const cartEntry = cart.get(itemId);
  if (!cartEntry) return;

  const nextQuantity = cartEntry.quantity + change;
  if (nextQuantity <= 0) {
    cart.delete(itemId);
  } else {
    cart.set(itemId, { ...cartEntry, quantity: nextQuantity });
  }

  renderCart();
}

function renderCart() {
  const entries = Array.from(cart.values());
  const itemCount = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const subtotal = entries.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);
  const delivery = 0;
  const grandTotal = subtotal + delivery;

  cartCount.textContent = itemCount;
  subtotalEl.textContent = money(subtotal);
  deliveryEl.textContent = subtotal > 0 ? "Free" : money(delivery);
  grandTotalEl.textContent = money(grandTotal);
  orderStatus.textContent = itemCount ? `${itemCount} item${itemCount === 1 ? "" : "s"} selected` : "Add food items to begin.";
  floatingCart.hidden = itemCount === 0;
  floatingCartTitle.textContent = `${itemCount} item${itemCount === 1 ? "" : "s"} added`;
  floatingCartTotal.textContent = `${money(grandTotal)} total - tap to order`;

  if (!entries.length) {
    cartItems.className = "cart-items empty";
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  cartItems.className = "cart-items";
  cartItems.innerHTML = entries.map(({ item, quantity }) => `
    <div class="cart-row">
      <div>
        <strong>${item.name}</strong>
        <span>${money(item.price)} each</span>
      </div>
      <div class="qty-controls" aria-label="Quantity controls for ${item.name}">
        <button class="qty-button" type="button" data-id="${item.id}" data-change="-1">-</button>
        <strong>${quantity}</strong>
        <button class="qty-button" type="button" data-id="${item.id}" data-change="1">+</button>
      </div>
    </div>
  `).join("");
}

document.querySelector(".filters").addEventListener("click", (event) => {
  const button = event.target.closest(".filter");
  if (!button) return;

  document.querySelectorAll(".filter").forEach((filter) => filter.classList.remove("active"));
  button.classList.add("active");
  activeFilter = button.dataset.filter;
  renderMenu();
});

menuGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".add-button");
  if (button) addToCart(button.dataset.id);
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest(".qty-button");
  if (!button) return;
  updateQuantity(button.dataset.id, Number(button.dataset.change));
});

searchInput.addEventListener("input", renderMenu);

document.querySelector("#checkout-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!cart.size) {
    confirmation.textContent = "Please add at least one food item before placing your order.";
    return;
  }

  const formData = new FormData(event.currentTarget);
  const entries = Array.from(cart.values());
  const subtotal = entries.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);
  const grandTotal = subtotal;
  const customerName = formData.get("name");
  const customerPhone = formData.get("phone");
  const address = formData.get("address");
  const paymentMethod = formData.get("payment");
  confirmation.textContent = "Opening WhatsApp. Please allow location permission if you want your map location added.";
  const locationLink = await requestCustomerLocation();
  const paymentMessage = paymentMethod === "UPI Payment to 9417561120"
    ? " Please send the payment through UPI to 9417561120."
    : "";
  const orderMessage = buildOrderMessage({
    customerName,
    customerPhone,
    address,
    locationLink,
    paymentMethod,
    entries,
    subtotal,
    grandTotal
  });

  confirmation.textContent = `Thanks, ${customerName}. Redirecting to WhatsApp now.${locationLink ? " Your map location was added." : " Your map location was not added."}${paymentMessage}`;
  cart.clear();
  event.currentTarget.reset();
  renderCart();
  redirectToWhatsApp(orderMessage);
});

renderMenu();
renderCart();
