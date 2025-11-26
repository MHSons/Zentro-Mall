/* This is where all your client-side logic will go:
   - Handling the shopping cart (adding, removing items)
   - Fetching product data from a (future) backend API
   - Form validation
*/

document.addEventListener('DOMContentLoaded', () => {
    let cartCount = 0;
    const cartIcon = document.getElementById('cart-icon');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    // Event listener for all "Add to Cart" buttons
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            
            // 1. Update the cart count visually
            cartCount++;
            cartIcon.querySelector('a').innerHTML = `🛒 Cart (${cartCount})`;

            // 2. Log to console (in a real app, you would send this to a backend server)
            console.log(`Product ${productId} added to cart. New count: ${cartCount}`);

            // 3. Simple feedback to user
            alert(`Item added to your cart!`);

            // In a more advanced application, you would:
            // - Store cart items in LocalStorage or SessionStorage
            // - Send an AJAX request to the server to update the user's persistent cart
        });
    });

    // You can add more functions here, such as:
    // function loadProducts() { ... } 
    // function initInternationalization() { ... }
});
