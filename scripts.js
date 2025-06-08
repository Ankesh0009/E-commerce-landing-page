document.addEventListener('DOMContentLoaded', function () {
  const cartIcon = document.getElementById('cartIcon');
  const cartDropdown = document.getElementById('cartDropdown');
  const cartItems = document.getElementById('cartItems');
  const emptyCart = document.getElementById('emptyCart');
  const subtotalElement = document.getElementById('cartSubtotal');
  const wishlistContainer = document.querySelector('.wishlist-container');
  let isCartOpen = false;

  // Cart persistence
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  function showToast(message) {
    let toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'toast-notification fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow z-50';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }

  function renderCart() {
    const cartItemsContainer = cartItems.querySelector('.space-y-4');
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
      emptyCart.classList.remove('hidden');
      cartItems.classList.add('hidden');
    } else {
      emptyCart.classList.add('hidden');
      cartItems.classList.remove('hidden');
      cart.forEach(product => {
        const cartItem = createCartItem(product);
        cartItemsContainer.appendChild(cartItem);
      });
    }
    updateSubtotal();
  }

  cartIcon?.addEventListener('click', function (e) {
    e.stopPropagation();
    isCartOpen = !isCartOpen;
    cartDropdown?.classList.toggle('hidden');
  });

  document.addEventListener('click', function (e) {
    if (!cartIcon.contains(e.target) && isCartOpen) {
      cartDropdown.classList.add('hidden');
      isCartOpen = false;
    }
  });

  // Add to Cart API
  window.addToCart = function (product) {
    const existing = cart.find(item => item.name === product.name);
    if (existing) {
      existing.quantity += product.quantity;
      showToast(`${product.name} quantity updated!`);
    } else {
      cart.push(product);
      showToast(`${product.name} added to cart!`);
    }
    saveCart();
    renderCart();
  };

  // Remove item
  function removeItem(name) {
    cart = cart.filter(p => p.name !== name);
    saveCart();
    renderCart();
    showToast('Item removed from cart!');
  }

  // Update quantity
  function updateQuantity(name, change) {
    const item = cart.find(p => p.name === name);
    if (item) {
      item.quantity = Math.max(1, item.quantity + change);
      saveCart();
      renderCart();
      showToast('Quantity updated!');
    }
  }

  function createCartItem(product) {
    const cartItem = document.createElement('div');
    cartItem.className = 'flex items-center gap-3';
    cartItem.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="w-16 h-16 object-cover rounded">
      <div class="flex-1">
        <h4 class="text-sm font-medium">${product.name}</h4>
        <div class="flex items-center gap-2 mt-1">
          <div class="flex items-center border rounded">
            <button class="px-2 py-1 text-sm quantity-decrease" aria-label="Decrease quantity">-</button>
            <span class="px-2 py-1 text-sm">${product.quantity}</span>
            <button class="px-2 py-1 text-sm quantity-increase" aria-label="Increase quantity">+</button>
          </div>
          <span class="text-sm text-gray-500">$${product.price}</span>
        </div>
      </div>
      <button class="text-gray-400 hover:text-gray-600 remove-item" aria-label="Remove item">
        <i class="ri-close-line"></i>
      </button>
    `;

    // Add event listeners for quantity buttons and remove button
    cartItem.querySelector('.quantity-decrease').addEventListener('click', function () {
      updateQuantity(product.name, -1);
    });
    cartItem.querySelector('.quantity-increase').addEventListener('click', function () {
      updateQuantity(product.name, 1);
    });
    cartItem.querySelector('.remove-item').addEventListener('click', function () {
      removeItem(product.name);
    });

    return cartItem;
  }

  function updateSubtotal() {
    let total = 0;
    cart.forEach(item => {
      total += item.price * item.quantity;
    });
    subtotalElement.textContent = `$${total.toFixed(2)}`;
  }

  // Wishlist logic
  wishlistContainer?.addEventListener('click', function (e) {
    if (e.target.closest('.wishlist-icon')) {
      const heartIcon = e.target.closest('.wishlist-icon').querySelector('i');
      toggleWishlistIcon(heartIcon);
      showToast('Wishlist updated!');
    }
  });

  function toggleWishlistIcon(heartIcon) {
    if (heartIcon.classList.contains('ri-heart-line')) {
      heartIcon.classList.remove('ri-heart-line');
      heartIcon.classList.add('ri-heart-fill', 'text-red-500');
    } else {
      heartIcon.classList.remove('ri-heart-fill', 'text-red-500');
      heartIcon.classList.add('ri-heart-line');
    }
  }

  // Render cart on load
  renderCart();
});
