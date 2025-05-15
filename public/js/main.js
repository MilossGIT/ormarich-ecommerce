// DOM Elements
const productGrid = document.getElementById('productGrid');
const cartIcon = document.getElementById('cartIcon');
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const closeCart = document.getElementById('closeCart');
const cartOverlay = document.getElementById('cartOverlay');
const checkoutBtn = document.getElementById('checkoutBtn');
const mainNav = document.getElementById('mainNav');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const productPreview = document.getElementById('productPreview');
const previewClose = document.getElementById('previewClose');
const previewImage = document.getElementById('previewImage');
const previewTitle = document.getElementById('previewTitle');
const previewPrice = document.getElementById('previewPrice');
const previewDescription = document.getElementById('previewDescription');
const previewFeatures = document.getElementById('previewFeatures');
const previewAddToCart = document.getElementById('previewAddToCart');
const previewQuantity = document.getElementById('previewQuantity');

// Initialize cart
const cart = [];

// Utility functions
function formatPrice(price) {
    return `${price.toFixed(2)} €`;
}

// Cart management
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
}

function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.querySelector('.cart-total').textContent = `Ukupno: ${formatPrice(total)}`;
}

function addToCart(product) {
    try {
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        updateCartCount();
        updateCartTotal();
        showNotification('Proizvod dodan u košaricu');
    } catch (error) {
        handleError(error, 'dodavanje u košaricu');
    }
}

function removeFromCart(productId) {
    try {
        const index = cart.findIndex(item => item.id === productId);
        if (index > -1) {
            cart.splice(index, 1);
            updateCartCount();
            updateCartTotal();
            showNotification('Proizvod uklonjen iz košarice');
        }
    } catch (error) {
        handleError(error, 'uklanjanje iz košarice');
    }
}

function updateQuantity(productId, newQuantity) {
    try {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(0, newQuantity);
            if (item.quantity === 0) {
                removeFromCart(productId);
            } else {
                updateCartCount();
                updateCartTotal();
            }
        }
    } catch (error) {
        handleError(error, 'ažuriranje količine');
    }
}

// UI Components
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add the custom select functionality
function createCustomSelect(select) {
    if (!select || window.innerWidth > 768) return; // Only for mobile

    const parent = select.parentNode;
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';

    // Create the trigger button
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    trigger.textContent = select.options[select.selectedIndex]?.textContent || 'Odaberite veličinu';

    // Create options container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-select-options';

    // Create inner container for options
    const innerContainer = document.createElement('div');
    innerContainer.className = 'custom-options-container';

    // Add header with close button
    const header = document.createElement('div');
    header.className = 'custom-options-header';
    header.innerHTML = '<span>Odaberite veličinu</span>';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-options';
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', () => {
        wrapper.classList.remove('open');
    });

    header.appendChild(closeBtn);
    innerContainer.appendChild(header);

    // Add all options
    Array.from(select.options).forEach((option, index) => {
        const customOption = document.createElement('div');
        customOption.className = 'custom-select-option';
        if (option.disabled) customOption.classList.add('disabled');
        if (index === select.selectedIndex) customOption.classList.add('selected');
        customOption.textContent = option.textContent;
        customOption.dataset.value = option.value;

        if (!option.disabled) {
            customOption.addEventListener('click', () => {
                // Update original select
                select.value = option.value;
                select.dispatchEvent(new Event('change'));

                // Update trigger text
                trigger.textContent = option.textContent;

                // Update selected class
                innerContainer.querySelectorAll('.custom-select-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                customOption.classList.add('selected');

                // Close dropdown
                wrapper.classList.remove('open');
            });
        }

        innerContainer.appendChild(customOption);
    });

    optionsContainer.appendChild(innerContainer);

    // Event listener for trigger
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        wrapper.classList.toggle('open');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            wrapper.classList.remove('open');
        }
    });

    // Put everything together
    wrapper.appendChild(trigger);
    wrapper.appendChild(optionsContainer);

    // Hide the original select
    select.style.cssText = 'position:absolute;opacity:0;pointer-events:none;';

    // Insert the custom select before the original
    parent.insertBefore(wrapper, select);

    // Sync custom select with original select's change events
    select.addEventListener('change', () => {
        trigger.textContent = select.options[select.selectedIndex]?.textContent || 'Odaberite veličinu';
        innerContainer.querySelectorAll('.custom-select-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.value === select.value) {
                opt.classList.add('selected');
            }
        });
    });

    return wrapper;
}

// Function to create product card with mobile-specific adjustments
function createProductCard(product) {
    try {
        const card = document.createElement('div');
        card.className = 'product-card';
        const isMobile = window.innerWidth <= 768;

        // Add stock status information
        const stockStatus = product.inStock ? 'Dostupno' : 'Nije dostupno';
        const stockClass = product.inStock ? 'in-stock' : 'out-of-stock';

        // Create card content - handle differently for mobile
        if (isMobile && product.id === 1 && product.gallery && product.gallery.length > 0) {
            // For mobile - add arrow navigation directly in card
            let currentImageIndex = 0;

            // Card inner HTML for mobile
            card.innerHTML = `
                <div class="product-image mobile-gallery">
                    <img src="${product.gallery[0]}" alt="${product.name}" id="product-img-${product.id}">
                    <div class="mobile-nav-arrows">
                        <button class="nav-arrow left"><i class="fas fa-chevron-left"></i></button>
                        <button class="nav-arrow right"><i class="fas fa-chevron-right"></i></button>
                        </div>
                    <div class="dots-indicator"></div>
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">€${product.price.toFixed(2)}</p>
                    <p class="stock-status ${stockClass}">${stockStatus}</p>
                        ${product.sizes ? `
                            <div class="size-selector">
                            <label for="size-${product.id}">Odaberite veličinu:</label>
                                <select id="size-${product.id}" class="size-select" data-product-id="${product.id}">
                                    ${product.sizes.map(size => `
                                    <option value="${size.id}" ${size.stock <= 0 ? 'disabled' : ''}>
                                        ${size.name} ${size.stock <= 0 ? '(Nije dostupno)' : size.stock <= 3 ? `(Još ${size.stock})` : ''}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        ` : ''}
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease" data-id="${product.id}">-</button>
                        <input type="number" value="1" min="1" max="${product.id === 1 ? 10 : product.stock}" class="quantity-input" data-id="${product.id}">
                        <button class="quantity-btn increase" data-id="${product.id}">+</button>
                            </div>
                    <button class="btn btn-add-cart" data-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> Dodaj u košaricu
                            </button>
                    </div>
                `;

            // Create dots indicators
            const dotsContainer = card.querySelector('.dots-indicator');
            if (dotsContainer) {
                for (let i = 0; i < product.gallery.length; i++) {
                    const dot = document.createElement('span');
                    dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
                    dot.dataset.index = i;
                    dotsContainer.appendChild(dot);
                }
            }

            // Add navigation functionality for mobile image gallery - with timeouts to ensure elements exist
            setTimeout(() => {
                const leftArrow = card.querySelector('.nav-arrow.left');
                const rightArrow = card.querySelector('.nav-arrow.right');
                const productImage = card.querySelector(`#product-img-${product.id}`);
                const dots = card.querySelectorAll('.gallery-dot');

                if (!productImage || !leftArrow || !rightArrow) {
                    console.error('Missing gallery elements', { productImage, leftArrow, rightArrow });
                    return;
                }

                // Function to update the displayed image
                const updateImage = () => {
                    productImage.src = product.gallery[currentImageIndex];

                    // Update active dot
                    dots.forEach((dot, idx) => {
                        if (idx === currentImageIndex) {
                            dot.classList.add('active');
                        } else {
                            dot.classList.remove('active');
                        }
                    });
                };

                // Add click handlers for arrows
                leftArrow.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    currentImageIndex = (currentImageIndex - 1 + product.gallery.length) % product.gallery.length;
                    updateImage();
                });

                rightArrow.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    currentImageIndex = (currentImageIndex + 1) % product.gallery.length;
                    updateImage();
                });

                // Add click handlers for dots
                dots.forEach((dot) => {
                    dot.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        currentImageIndex = parseInt(dot.dataset.index);
                        updateImage();
                    });
                });

                // Make the whole image area clickable to advance to next image
                productImage.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentImageIndex = (currentImageIndex + 1) % product.gallery.length;
                    updateImage();
                });
            }, 0);

            // After card is created, check if we need to create custom selects
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    const sizeSelect = card.querySelector('.size-select');
                    if (sizeSelect) {
                        createCustomSelect(sizeSelect);
                    }
                }, 0);
            }
        } else {
            // Standard card for desktop or products without gallery
            card.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="product-overlay">
                        <button class="btn btn-secondary view-product" data-id="${product.id}">Brzi pregled</button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">€${product.price.toFixed(2)}</p>
                    <p class="stock-status ${stockClass}">${stockStatus}</p>
                    ${product.sizes ? `
                        <div class="size-selector">
                            <label for="size-${product.id}">Odaberite veličinu:</label>
                            <select id="size-${product.id}" class="size-select" data-product-id="${product.id}">
                                ${product.sizes.map(size => `
                                    <option value="${size.id}" ${size.stock <= 0 ? 'disabled' : ''}>
                                        ${size.name} ${size.stock <= 0 ? '(Nije dostupno)' : size.stock <= 3 ? `(Još ${size.stock})` : ''}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    ` : ''}
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease" data-id="${product.id}">-</button>
                        <input type="number" value="1" min="1" max="${product.id === 1 ? 10 : product.stock}" class="quantity-input" data-id="${product.id}">
                        <button class="quantity-btn increase" data-id="${product.id}">+</button>
                    </div>
                    <button class="btn btn-add-cart" data-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> Dodaj u košaricu
                    </button>
                </div>
            `;

            // Add event listeners for desktop view
            const viewBtn = card.querySelector('.view-product');
            if (viewBtn) {
                viewBtn.addEventListener('click', () => {
                    showProductPreview(product);
                });
            }
        }

        // Common event listeners for both mobile and desktop
        // Size selection for baby shoes
        const sizeSelect = card.querySelector('.size-select');
        if (sizeSelect) {
            sizeSelect.addEventListener('change', () => {
                const sizeId = sizeSelect.value;
                const selectedSize = product.sizes.find(s => s.id === sizeId);

                // Update max quantity based on selected size stock
                const quantityInput = card.querySelector('.quantity-input');
                if (quantityInput && selectedSize) {
                    quantityInput.max = selectedSize.stock;
                    if (parseInt(quantityInput.value) > selectedSize.stock) {
                        quantityInput.value = selectedSize.stock;
                    }
                }
            });
        }

        const decreaseBtn = card.querySelector('.decrease');
        const increaseBtn = card.querySelector('.increase');
        const quantityInput = card.querySelector('.quantity-input');
        const addToCartBtn = card.querySelector('.btn-add-cart');

        if (decreaseBtn && quantityInput) {
            decreaseBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value);
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                }
            });
        }

        if (increaseBtn && quantityInput) {
            increaseBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value);

                // For products with sizes, check the selected size stock
                let maxValue = 10; // Default max
                if (product.sizes && sizeSelect) {
                    const selectedSizeId = sizeSelect.value;
                    const selectedSize = product.sizes.find(s => s.id === selectedSizeId);
                    if (selectedSize) {
                        maxValue = selectedSize.stock;
                    }
                } else {
                    maxValue = parseInt(quantityInput.max);
                }

                if (currentValue < maxValue) {
                    quantityInput.value = currentValue + 1;
                }
            });
        }

        if (addToCartBtn && quantityInput) {
            addToCartBtn.addEventListener('click', () => {
                const quantity = parseInt(quantityInput.value);

                // For products with sizes, get the selected size
                if (product.sizes && sizeSelect) {
                    const selectedSizeId = sizeSelect.value;
                    const selectedSize = product.sizes.find(s => s.id === selectedSizeId);

                    if (selectedSize) {
                        addProductWithSize(product, selectedSize, quantity);
                    } else {
                        showNotification('Please select a size', 'error');
                    }
                } else if (product.hasStock) {
                    addToCart(product, quantity);
                }
            });
        }

        return card;
    } catch (error) {
        handleError(error, 'kreiranje kartice proizvoda');
        return null;
    }
}

function createCartItem(item) {
    try {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';

        cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p>${formatPrice(item.price)}</p>
        <div class="quantity-controls">
          <button class="quantity-btn minus">-</button>
          <span class="quantity">${item.quantity}</span>
          <button class="quantity-btn plus">+</button>
        </div>
      </div>
      <button class="remove-item">Ukloni</button>
    `;

        cartItem.querySelector('.minus').addEventListener('click', () =>
            updateQuantity(item.id, item.quantity - 1)
        );

        cartItem.querySelector('.plus').addEventListener('click', () =>
            updateQuantity(item.id, item.quantity + 1)
        );

        cartItem.querySelector('.remove-item').addEventListener('click', () =>
            removeFromCart(item.id)
        );

        return cartItem;
    } catch (error) {
        handleError(error, 'kreiranje stavke košarice');
        return null;
    }
}

// Error handling
function handleError(error, context = '') {
    console.error(`Greška ${context}:`, error);
    showNotification(`Došlo je do greške. Molimo pokušajte ponovno.`);
}

// Debug logging
function debugLog(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Debug] ${message}`, data || '');
    }
}

// Instead of hardcoded products array, use a let variable that will be populated from API
let products = [];

// Fetch products from the API
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        products = data; // Update the products array with data from API

        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

// Initialize the cart when the page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Fetch products from API
        fetchProducts()
            .then(() => {
                // After products are loaded, display them
                if (productGrid) {
                    displayProducts();
                }
            })
            .catch(error => {
                console.error('Error loading products:', error);
                if (productGrid) {
                    productGrid.innerHTML = `
                        <div class="error-message">
                            <p>Došlo je do greške pri učitavanju proizvoda. Molimo osvježite stranicu.</p>
                        </div>
                    `;
                }
            });

        // Initialize cart
        updateCartCount();
        updateCartTotal();

        // Setup event listeners for mobile menu
        if (mobileMenuBtn && mainNav) {
            mobileMenuBtn.addEventListener('click', () => {
                mainNav.classList.toggle('active');
            });
        }

        // Setup cart toggle
        if (cartIcon && cartSidebar) {
            cartIcon.addEventListener('click', () => {
                cartSidebar.classList.add('open');
                if (cartOverlay) cartOverlay.classList.add('open');
                document.body.classList.add('no-scroll');
            });
        }

        if (closeCart && cartSidebar) {
            closeCart.addEventListener('click', () => {
                cartSidebar.classList.remove('open');
                if (cartOverlay) cartOverlay.classList.remove('open');
                document.body.classList.remove('no-scroll');
            });
        }
    } catch (error) {
        handleError(error, 'inicijalizacija stranice');
    }
});

// Admin stock control function - allows updating stock of baby shoes
function updateShoesStock(sizeId, newStockAmount) {
    try {
        const babyShoes = products.find(p => p.id === 1);
        if (!babyShoes) {
            throw new Error('Baby shoes product not found');
        }

        const size = babyShoes.sizes.find(s => s.id === sizeId);
        if (!size) {
            throw new Error(`Size with ID ${sizeId} not found`);
        }

        // Update stock
        size.stock = newStockAmount;
        console.log(`Updated stock for Baby Shoes ${size.name} to ${newStockAmount}`);

        // Update display if needed
        if (productGrid) {
            displayProducts();
        }

        return { success: true, message: `Stock updated for ${size.name}` };
    } catch (error) {
        handleError(error, 'updateShoesStock');
        return { success: false, message: error.message };
    }
}

// Get total stock for baby shoes (across all sizes)
function getTotalShoesStock() {
    const babyShoes = products.find(p => p.id === 1);
    if (!babyShoes) return 0;

    return babyShoes.sizes.reduce((total, size) => total + size.stock, 0);
}

// Display products in the product grid
function displayProducts() {
    try {
        // Check if product grid exists
        if (!productGrid) {
            console.log('Product grid element not found in the DOM');
            return; // Exit the function early if the element doesn't exist
        }

        // Clear existing products
        productGrid.innerHTML = '';

        // Check if we're on mobile
        const isMobile = window.innerWidth <= 768;

        // Add each product
        products.forEach(product => {
            const productCard = createProductCard(product);
            if (productCard) {
                productGrid.appendChild(productCard);
            }
        });
    } catch (error) {
        handleError(error, 'displayProducts');
    }
}

// Add product with selected size to cart
function addProductWithSize(product, size, quantity) {
    try {
        if (size.stock < quantity) {
            showNotification(`Not enough stock available for ${size.name}`, 'error');
            return;
        }

        // Find if this specific size is already in cart
        const existingItem = cart.find(item =>
            item.id === product.id && item.sizeId === size.id
        );

        if (existingItem) {
            // Update quantity
            if (existingItem.quantity + quantity > size.stock) {
                showNotification(`Cannot add more than available stock for ${size.name}`, 'error');
                return;
            }

            existingItem.quantity += quantity;
            showNotification(`Updated quantity of ${product.name} (${size.name}) in cart`);
        } else {
            // Add new item
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity,
                sizeId: size.id,
                sizeName: size.name
            });
            showNotification(`Added ${product.name} (${size.name}) to cart`);
        }

        // Update product stock
        size.stock -= quantity;

        // Update UI
        updateCart();
        displayProducts();
    } catch (error) {
        handleError(error, 'addProductWithSize');
    }
}

// Update cart display
function updateCart() {
    try {
        if (!cartItems) return;

        // Clear cart items
        cartItems.innerHTML = '';

        // Calculate total
        let total = 0;

        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Vaša košarica je prazna</p>';
        } else {
            // Add each cart item
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';

                // HTML structure with size if it exists
                cartItem.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                        <div>
                            <h3 class="cart-item-name">${item.name}</h3>
                            <p class="cart-item-price">€${itemTotal.toFixed(2)}</p>
                            ${item.sizeName ? `<span class="cart-item-size">${item.sizeName}</span>` : ''}
                        </div>
                    <div class="cart-item-actions">
                            <div class="cart-item-quantity">
                                <button class="quantity-btn decrease" data-index="${index}">-</button>
                                <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-index="${index}">
                                <button class="quantity-btn increase" data-index="${index}">+</button>
                        </div>
                            <button class="cart-item-remove" data-index="${index}">
                                <i class="fas fa-trash-alt"></i> Ukloni
                            </button>
                    </div>
                </div>
            `;

                cartItems.appendChild(cartItem);

                // Add event listeners for this cart item
                const decreaseBtn = cartItem.querySelector('.decrease');
                const increaseBtn = cartItem.querySelector('.increase');
                const quantityInput = cartItem.querySelector('.quantity-input');
                const removeBtn = cartItem.querySelector('.cart-item-remove');

                decreaseBtn.addEventListener('click', () => {
                    if (item.quantity > 1) {
                        item.quantity--;

                        // Return one item to product stock
                        if (item.sizeId) {
                            // For products with sizes, return to the specific size
                            const productWithSizes = products.find(p => p.id === item.id);
                            if (productWithSizes) {
                                const size = productWithSizes.sizes.find(s => s.id === item.sizeId);
                                if (size) size.stock++;
                            }
                        } else {
                            // For regular products
                            const product = products.find(p => p.id === item.id);
                            if (product) product.stock++;
                        }

                        updateCart();
                        displayProducts();
                    }
                });

                increaseBtn.addEventListener('click', () => {
                    // Check available stock
                    if (item.sizeId) {
                        // For products with sizes, check specific size stock
                        const productWithSizes = products.find(p => p.id === item.id);
                        if (productWithSizes) {
                            const size = productWithSizes.sizes.find(s => s.id === item.sizeId);
                            if (size && size.stock > 0) {
                                item.quantity++;
                                size.stock--;
                                updateCart();
                                displayProducts();
                            } else {
                                showNotification(`No more stock available for ${item.sizeName}`, 'error');
                            }
                        }
                    } else {
                        // For regular products
                        const product = products.find(p => p.id === item.id);
                        if (product && product.stock > 0) {
                            item.quantity++;
                            product.stock--;
                            updateCart();
                            displayProducts();
                        } else {
                            showNotification('No more stock available', 'error');
                        }
                    }
                });

                quantityInput.addEventListener('change', () => {
                    const newQuantity = parseInt(quantityInput.value);
                    if (newQuantity > 0) {
                        const diff = newQuantity - item.quantity;

                        if (item.sizeId) {
                            // For products with sizes, handle specific size stock
                            const productWithSizes = products.find(p => p.id === item.id);
                            if (productWithSizes) {
                                const size = productWithSizes.sizes.find(s => s.id === item.sizeId);
                                if (size) {
                                    if (diff > 0 && size.stock >= diff) {
                                        // Taking more items from stock
                                        size.stock -= diff;
                                        item.quantity = newQuantity;
                                        updateCart();
                                        displayProducts();
                                    } else if (diff < 0) {
                                        // Returning items to stock
                                        size.stock -= diff; // Negative diff means adding to stock
                                        item.quantity = newQuantity;
                                        updateCart();
                                        displayProducts();
                                    } else {
                                        // Not enough stock
                                        quantityInput.value = item.quantity;
                                        showNotification(`Not enough stock available for ${item.sizeName}`, 'error');
                                    }
                                }
                            }
                        } else {
                            // Regular product stock handling
                            const product = products.find(p => p.id === item.id);
                            if (diff > 0 && product && product.stock >= diff) {
                                product.stock -= diff;
                                item.quantity = newQuantity;
                                updateCart();
                                displayProducts();
                            } else if (diff < 0) {
                                if (product) product.stock -= diff; // Negative diff means adding to stock
                                item.quantity = newQuantity;
                                updateCart();
                                displayProducts();
                            } else {
                                quantityInput.value = item.quantity;
                                showNotification('Not enough stock available', 'error');
                            }
                        }
                    }
                });

                removeBtn.addEventListener('click', () => {
                    // Return items to product stock
                    if (item.sizeId) {
                        // For products with sizes, return to specific size
                        const productWithSizes = products.find(p => p.id === item.id);
                        if (productWithSizes) {
                            const size = productWithSizes.sizes.find(s => s.id === item.sizeId);
                            if (size) size.stock += item.quantity;
                        }
                    } else {
                        // For regular products
                        const product = products.find(p => p.id === item.id);
                        if (product) product.stock += item.quantity;
                    }

                    // Remove item from cart
                    cart.splice(index, 1);

                    updateCart();
                    displayProducts();
                });
            });
        }

        // Update total
        if (cartTotal) {
            cartTotal.textContent = `€${total.toFixed(2)}`;
        }

        // Update cart count
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = itemCount;
        }

        // Enable/disable checkout button
        if (checkoutBtn) {
            checkoutBtn.disabled = cart.length === 0;
        }
    } catch (error) {
        handleError(error, 'updateCart');
    }
}

// Show product preview
function showProductPreview(product) {
    try {
        if (!productPreview) return;

        // Update preview content
        previewTitle.textContent = product.name;
        previewPrice.textContent = `€${product.price.toFixed(2)}`;
        previewDescription.textContent = product.description;

        // Clear and add features
        previewFeatures.innerHTML = '';
        product.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            previewFeatures.appendChild(li);
        });

        // Add image gallery for shoes product
        const previewImageContainer = document.querySelector('.preview-image');
        if (previewImageContainer) {
            previewImageContainer.innerHTML = '';

            // Main image/video container
            const mainMediaContainer = document.createElement('div');
            mainMediaContainer.className = 'main-media-container';

            // First, always start with the main image
            const mainImage = document.createElement('img');
            mainImage.src = product.image;
            mainImage.alt = product.name;
            mainImage.className = 'main-preview-image';
            mainMediaContainer.appendChild(mainImage);

            previewImageContainer.appendChild(mainMediaContainer);

            // Add gallery thumbnails for shoes product
            if (product.gallery && product.gallery.length > 0) {
                const galleryContainer = document.createElement('div');
                galleryContainer.className = 'gallery-thumbnails';

                // Mobile indicator for swipe functionality
                if (window.innerWidth <= 768) {
                    const swipeIndicator = document.createElement('div');
                    swipeIndicator.className = 'swipe-indicator';
                    swipeIndicator.innerHTML = '<small>← Swipe to see more →</small>';
                    previewImageContainer.appendChild(swipeIndicator);
                }

                // Variable to keep track of which thumbnail is active
                let currentIndex = 0;

                // Create thumbnails for all images
                product.gallery.forEach((imageSrc, index) => {
                    const thumbnail = document.createElement('div');
                    thumbnail.className = 'thumbnail';
                    thumbnail.setAttribute('data-index', index.toString());

                    // Add an actual img element inside the thumbnail
                    const thumbImg = document.createElement('img');
                    thumbImg.src = imageSrc;
                    thumbImg.alt = `${product.name} thumbnail ${index + 1}`;
                    thumbImg.className = 'thumb-img';
                    thumbImg.loading = 'lazy'; // Lazy load thumbnails
                    thumbnail.appendChild(thumbImg);

                    // Set first thumbnail as active
                    if (index === 0) thumbnail.classList.add('active');

                    thumbnail.addEventListener('click', function () {
                        // Update current index for swipe navigation
                        currentIndex = index;

                        // Remove active class from all thumbnails
                        document.querySelectorAll('.thumbnail').forEach(thumb =>
                            thumb.classList.remove('active'));

                        // Add active class to clicked thumbnail
                        thumbnail.classList.add('active');

                        // Update main media container with image
                        mainMediaContainer.innerHTML = '';
                        const mainImage = document.createElement('img');
                        mainImage.src = imageSrc;
                        mainImage.alt = product.name;
                        mainImage.className = 'main-preview-image';
                        mainMediaContainer.appendChild(mainImage);

                        // Update dots if they exist
                        const dots = document.querySelectorAll('.gallery-dot');
                        if (dots && dots.length) {
                            dots.forEach((dot, i) => {
                                if (i === index) {
                                    dot.classList.add('active');
                                } else {
                                    dot.classList.remove('active');
                                }
                            });
                        }

                        // On mobile, scroll the thumbnail into better view if needed
                        if (window.innerWidth <= 768) {
                            setTimeout(() => {
                                thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                            }, 100);
                        }
                    });

                    galleryContainer.appendChild(thumbnail);
                });

                previewImageContainer.appendChild(galleryContainer);

                // Setup touch swipe detection for mobile gallery navigation
                if (window.innerWidth <= 768) {
                    setupGallerySwipeNavigation(galleryContainer, product.gallery, mainMediaContainer);
                }
            }
        }

        // Set up quantity input and add to cart button
        const quantityControls = previewQuantity.querySelector('.quantity-controls');

        // Different handling for products with sizes vs other products
        if (product.sizes) {
            // Product with sizes - add size selector
            let previewHTML = `
                <div class="size-selector">
                    <label for="preview-size">Odaberite veličinu:</label>
                    <select id="preview-size" class="size-select">
                        ${product.sizes.map(size => {
                // Simplified display for mobile
                const isMobile = window.innerWidth <= 768;
                let displayText = size.name;
                let stockInfo = '';

                if (size.stock <= 0) {
                    stockInfo = ' - Nije dostupno';
                } else if (size.stock <= 3) {
                    stockInfo = ` - Još ${size.stock}`;
                }

                return `<option value="${size.id}" ${size.stock <= 0 ? 'disabled' : ''}>
                                    ${displayText}${stockInfo}
                                </option>`;
            }).join('')}
                    </select>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease" id="preview-decrease">-</button>
                    <input type="number" value="1" min="1" max="10" id="preview-quantity" />
                    <button class="quantity-btn increase" id="preview-increase">+</button>
                </div>
            `;

            previewQuantity.innerHTML = previewHTML;

            // Add special class for better mobile visibility
            if (window.innerWidth <= 768) {
                const sizeSelect = document.getElementById('preview-size');
                if (sizeSelect) {
                    sizeSelect.classList.add('mobile-enhanced');
                }
            }

            // Handle preview size selection
            const previewSizeSelect = document.getElementById('preview-size');
            const previewQuantityInput = document.getElementById('preview-quantity');

            if (previewSizeSelect && previewQuantityInput) {
                // Fix: Force a value for the size selector and trigger change event
                if (previewSizeSelect.options.length > 0) {
                    let selectedAny = false;

                    // Try to select the first available size
                    for (let i = 0; i < previewSizeSelect.options.length; i++) {
                        if (!previewSizeSelect.options[i].disabled) {
                            previewSizeSelect.selectedIndex = i;
                            selectedAny = true;
                            break;
                        }
                    }

                    // If nothing was selected, set to first option even if disabled
                    if (!selectedAny && previewSizeSelect.options.length > 0) {
                        previewSizeSelect.selectedIndex = 0;
                    }
                }

                previewSizeSelect.addEventListener('change', () => {
                    const sizeId = previewSizeSelect.value;
                    const selectedSize = product.sizes.find(s => s.id === sizeId);

                    if (selectedSize) {
                        previewQuantityInput.max = selectedSize.stock;

                        // Make sure quantity is not more than available stock
                        if (parseInt(previewQuantityInput.value) > selectedSize.stock) {
                            previewQuantityInput.value = selectedSize.stock;
                        }

                        // Make sure quantity is at least 1 if stock is available
                        if (selectedSize.stock > 0 && parseInt(previewQuantityInput.value) < 1) {
                            previewQuantityInput.value = 1;
                        }

                        // Update add to cart button state
                        if (selectedSize.stock <= 0) {
                            previewAddToCart.disabled = true;
                            previewAddToCart.innerHTML = 'Nije dostupno';
                        } else {
                            previewAddToCart.disabled = false;
                            previewAddToCart.innerHTML = `<i class="fas fa-shopping-cart"></i> Dodaj u košaricu`;
                        }
                    }
                });

                // Trigger change event to initialize max value
                previewSizeSelect.dispatchEvent(new Event('change'));

                // Set up quantity buttons
                const decreaseBtn = document.getElementById('preview-decrease');
                const increaseBtn = document.getElementById('preview-increase');

                if (decreaseBtn) {
                    decreaseBtn.onclick = () => {
                        if (parseInt(previewQuantityInput.value) > 1) {
                            previewQuantityInput.value = parseInt(previewQuantityInput.value) - 1;
                        }
                    };
                }

                if (increaseBtn) {
                    increaseBtn.onclick = () => {
                        const sizeId = previewSizeSelect.value;
                        const selectedSize = product.sizes.find(s => s.id === sizeId);

                        if (selectedSize && parseInt(previewQuantityInput.value) < selectedSize.stock) {
                            previewQuantityInput.value = parseInt(previewQuantityInput.value) + 1;
                        }
                    };
                }

                // Handle add to cart button
                previewAddToCart.onclick = () => {
                    const sizeId = previewSizeSelect.value;
                    const selectedSize = product.sizes.find(s => s.id === sizeId);
                    const quantity = parseInt(previewQuantityInput.value);

                    if (selectedSize && selectedSize.stock > 0) {
                        addProductWithSize(product, selectedSize, quantity);
                        closeProductPreview();
                    } else {
                        showNotification('Molimo odaberite dostupnu veličinu', 'error');
                    }
                };
            }

            // After the size selector is created, apply custom select
            setTimeout(() => {
                const previewSizeSelect = document.getElementById('preview-size');
                if (previewSizeSelect && window.innerWidth <= 768) {
                    createCustomSelect(previewSizeSelect);
                }
            }, 0);
        } else {
            // Regular product handling
            const quantityInput = previewQuantity.querySelector('input');

            if (quantityInput) {
                quantityInput.value = 1;
                quantityInput.max = product.stock;

                // Disable add to cart if no stock
                previewAddToCart.disabled = !product.inStock;

                // Set up preview quantity buttons for regular products
                const decreaseBtn = previewQuantity.querySelector('.decrease');
                const increaseBtn = previewQuantity.querySelector('.increase');

                if (decreaseBtn) {
                    decreaseBtn.onclick = () => {
                        if (parseInt(quantityInput.value) > 1) {
                            quantityInput.value = parseInt(quantityInput.value) - 1;
                        }
                    };
                }

                if (increaseBtn) {
                    increaseBtn.onclick = () => {
                        if (product.inStock && parseInt(quantityInput.value) < product.stock) {
                            quantityInput.value = parseInt(quantityInput.value) + 1;
                        }
                    };
                }

                // Handle add to cart from preview
                previewAddToCart.onclick = () => {
                    if (product.inStock) {
                        const quantity = parseInt(quantityInput.value);
                        addToCart(product, quantity);
                        closeProductPreview();
                    } else {
                        showNotification('Ovaj proizvod nije dostupan', 'error');
                    }
                };
            }
        }

        // Update button text
        previewAddToCart.innerHTML = `<i class="fas fa-shopping-cart"></i> Dodaj u košaricu`;

        // Show preview
        productPreview.style.display = 'flex';
        setTimeout(() => {
            productPreview.classList.add('active');
        }, 10);
    } catch (error) {
        handleError(error, 'showing product preview');
    }
}

// Function to set up swipe navigation for the gallery on mobile
function setupGallerySwipeNavigation(galleryContainer, images, mainMediaContainer) {
    const mainContainer = document.querySelector('.main-media-container');
    if (!mainContainer) return;

    let startX, endX;
    let startY, endY;
    let initialIndex = 0; // Track initial index from gallery
    const thumbnails = galleryContainer.querySelectorAll('.thumbnail');

    // Find initial active thumbnail index
    thumbnails.forEach((thumb, idx) => {
        if (thumb.classList.contains('active')) {
            initialIndex = idx;
        }
    });

    // Use a dedicated variable to track current index
    let currentIndex = initialIndex;

    // Create dots indicator for current position
    if (window.innerWidth <= 768) {
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'gallery-dots';

        // Create a dot for each image plus video if exists
        for (let i = 0; i < thumbnails.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'gallery-dot';
            if (i === initialIndex) dot.classList.add('active');
            dotsContainer.appendChild(dot);
        }

        // Insert dots after main container
        mainContainer.parentNode.insertBefore(dotsContainer, galleryContainer);
    }

    // Add an overlay to handle touch events better
    const touchOverlay = document.createElement('div');
    touchOverlay.style.position = 'absolute';
    touchOverlay.style.top = '0';
    touchOverlay.style.left = '0';
    touchOverlay.style.width = '100%';
    touchOverlay.style.height = '100%';
    touchOverlay.style.zIndex = '10';
    mainContainer.appendChild(touchOverlay);

    // Use touchOverlay for all touch events to prevent bubbling
    touchOverlay.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        // Prevent event bubbling
        e.stopPropagation();
    }, { passive: true });

    touchOverlay.addEventListener('touchmove', (e) => {
        // Determine if scroll is more horizontal than vertical
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = startX - currentX;
        const deltaY = startY - currentY;

        // If horizontal movement is greater than vertical, prevent default scrolling
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            e.preventDefault();
        }
    }, { passive: false });

    touchOverlay.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;

        // Only handle swipe if it's more horizontal than vertical
        const deltaX = startX - endX;
        const deltaY = startY - endY;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            handleSwipe();
        }
        // Prevent event bubbling
        e.stopPropagation();
    }, { passive: true });

    function handleSwipe() {
        const threshold = 50; // Minimum distance to register as swipe
        const difference = startX - endX;

        if (Math.abs(difference) < threshold) return;

        if (difference > 0) {
            // Swipe left - show next image
            currentIndex = Math.min(currentIndex + 1, thumbnails.length - 1);
        } else {
            // Swipe right - show previous image
            currentIndex = Math.max(currentIndex - 1, 0);
        }

        // Trigger click on the appropriate thumbnail
        thumbnails[currentIndex].click();

        // Update dots indicator
        const dots = document.querySelectorAll('.gallery-dot');
        if (dots && dots.length) {
            dots.forEach((dot, i) => {
                if (i === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    }

    // Add click events to dots for direct navigation
    const dots = document.querySelectorAll('.gallery-dot');
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            if (i < thumbnails.length) {
                currentIndex = i;
                thumbnails[i].click();

                // Update dots
                dots.forEach((d, idx) => {
                    if (idx === i) {
                        d.classList.add('active');
                    } else {
                        d.classList.remove('active');
                    }
                });
            }
        });
    });
}

// Close product preview
function closeProductPreview() {
    productPreview.classList.remove('active');
    setTimeout(() => {
        productPreview.style.display = 'none';
    }, 300);
}

// Product preview close button
if (previewClose) {
    previewClose.addEventListener('click', closeProductPreview);
}

// Add scroll event for header styling
const header = document.querySelector('header');
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });

            // Close mobile menu if open
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon && icon.classList.contains('fa-times')) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
    });
});

// Add window resize handler to refresh products when switching between mobile/desktop
window.addEventListener('resize', () => {
    const newIsMobile = window.innerWidth <= 768;
    const oldIsMobile = document.querySelector('.mobile-gallery') !== null;

    // Only redisplay if mode changed
    if (newIsMobile !== oldIsMobile) {
        displayProducts();
    }
});