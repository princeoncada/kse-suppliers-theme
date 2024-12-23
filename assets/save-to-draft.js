$(document).ready(function () {
    eventListeners();
});

function eventListeners() {
    $('button[name="save-to-draft"]').on('click', function () {
        saveToDraft();
    });

    // Show modal when Add to Cart button is clicked
    $('.add-to-cart').on('click', function () {
        $('#cart-modal').removeClass('x-hidden');
        $('.selected-item').text($(this).data('item'));
        $('body').addClass('x-overflow-hidden'); // Disable scrolling
        $('#variant').val($(this).data('variant-id'));
    });

    // Hide modal when Cancel button is clicked
    $('#cancel-btn').on('click', function () {
        $('#cart-modal').addClass('x-hidden');
        $('body').removeClass('x-overflow-hidden'); // Enable scrolling
        $('#quantity').val(1);
        $('#variant').val('');
    });

    // Confirm adding to cart and hide modal
    $('#confirm-add-btn').on('click', function () {
        let variant_id = $('#variant').val();
        let amount = $('#quantity').val();

        addItemToCart(variant_id, amount);

        $('#cart-modal').addClass('x-hidden');
        $('body').removeClass('x-overflow-hidden'); // Enable scrolling
        $('#quantity').val(1);
        $('#variant').val('');
    });

    // Hide modal if clicking outside of it
    $('#cart-modal').on('click', function (e) {
        if ($(e.target).is('#cart-modal')) {
            $('#cart-modal').addClass('x-hidden');
            $('body').removeClass('x-overflow-hidden'); // Enable scrolling
            $('#quantity').val(1);
            $('#variant').val('');
        }
    });
}

function addItemToCart(variant_id, amount) {
    console.log("{{ customer.default_address }}")
    let cart = $('cart-notification').length ? $('cart-notification') : $('cart-drawer');

    let formData = {
        items: [{
            id: variant_id,
            quantity: amount
        }],
        sections: cart[0].getSectionsToRender().map(section => section.id)
    };

    const config = {
        url: routes.cart_add_url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        dataType: 'json',
        data: JSON.stringify(formData)
    };

    $.ajax(config).done(function (response) {
        if (response.errors) {
            publish(
                PUB_SUB_EVENTS.cartError,
                {
                    source: 'product-form',
                    productVariantId: variant_id,
                    errors: response.errors,
                    message: response.errors
                }
            );

            let errorMessageWrapper = $('.product-form__error-message-wrapper');
            if (!errorMessageWrapper) return;

            let errorMessage = errorMessageWrapper.find('.product-form__error-message');
            errorMessageWrapper.attr('hidden', !errorMessage.length);
            if (errorMessage.length) errorMessage.text(response.errors);
        } else {
            publish(
                PUB_SUB_EVENTS.cartUpdate,
                {
                    source: 'product-form',
                    productVariantId: variant_id
                }
            );

            let cartObj = {};
            $.extend(cartObj, response.items[0], { sections: response.sections });

            cart[0].renderContents(cartObj);
            cart.removeClass('is-empty');

            trapFocus(
                $('#CartDrawer')[0],
                $('#CartDrawer')[0]
            );

            $('button[name="save-to-draft"]').on('click', function () {
                saveToDraft();
            });
        }
    })
}

function draftSavedFeedback(success) {
    let errorMessageWrapper = $('.save_to_draft-error-container');

    if (success) {
        errorMessageWrapper.css('display', 'hidden');
        let emptyCartContainer = $('div.cart-drawer__empty-content');
        let emptyCartContent = emptyCartContainer.html();
        emptyCartContainer.html('<i class="bx bx-loader-alt bx-spin x-text-[24px] x-text-[#ac1200]"></i>');

        setTimeout(() => {
            emptyCartContainer.html('<p>Your cart has been saved to draft.</p>');
        }, 2000);

        setTimeout(() => {
            emptyCartContainer.html(emptyCartContent);
        }, 4000);
    } else {
        errorMessageWrapper.text('- An error occured saving cart to draft. Please try again later.');
        errorMessageWrapper.css('display', 'block');
    }
}

function saveToDraft() {
    const customerId = window.ShopifyData.customerId;
    const currentUserId = `gid://shopify/Customer/${customerId}`;
    const customerAddress = window.ShopifyData.defaultAddress;

    // Fetch the current cart items
    $.ajax({
        url: '/cart.js',
        method: 'GET',
        contentType: 'application/json'
    }).done(function (state) {
        // Handle success
        let stateObj = JSON.parse(state);
        const cartItems = stateObj.items.map(item => ({
            variantId: item.variant_id,
            quantity: item.quantity
        }));

        // Create the GraphQL mutation string with customer's default shipping address
        const mutation = `
            mutation {
                createDraftOrder(
                    customerId: "${currentUserId}",
                    lineItems: [${cartItems.map(item => `{ variantId: "gid://shopify/ProductVariant/${item.variantId}", quantity: ${item.quantity} }`).join(',')}],
                    shippingAddress: {
                        address1: "${customerAddress.address1}",
                        city: "${customerAddress.city}",
                        province: "${customerAddress.province}",
                        country: "${customerAddress.country}",
                        zip: "${customerAddress.zip}"
                    }
                ) {
                    id
                }
            }
        `;

        // Send the draft order request
        $.ajax({
            url: 'https://77e5-158-62-77-223.ngrok-free.app/graphql',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ query: mutation })
        }).done(function (response) {
            // Handle success
            console.log('Draft Order Response:', response);
            clearCart();
        }).fail(function (error) {
            // Handle error
            console.error('Error creating draft order:', error);
            draftSavedFeedback(false);
        });

    }).fail(function (error) {
        // Handle error
        console.error('Error fetching cart items:', error);
    });
}

function clearCart() {
    let cart = $('cart-notification').length ? $('cart-notification') : $('cart-drawer');

    let formData = {
        sections: cart[0].getSectionsToRender().map(section => section.id)
    };

    const config = {
        url: '/cart/clear',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        dataType: 'json',
        data: JSON.stringify(formData)
    };

    $.ajax(config).done(function (response) {
        if (response.errors) {
            publish(
                PUB_SUB_EVENTS.cartError,
                {
                    source: 'product-form',
                    productVariantId: variant_id,
                    errors: response.errors,
                    message: response.errors
                }
            );

            let errorMessageWrapper = $('.product-form__error-message-wrapper');
            if (!errorMessageWrapper) return;

            let errorMessage = errorMessageWrapper.find('.product-form__error-message');
            errorMessageWrapper.attr('hidden', !errorMessage.length);
            if (errorMessage.length) errorMessage.text(response.errors);
        } else {
            publish(
                PUB_SUB_EVENTS.cartUpdate,
                {
                    source: 'product-form'
                }
            );

            let cartObj = {
                items: [],
                sections: response.sections
            };

            cart[0].renderContents(cartObj);

            trapFocus(
                $('#CartDrawer')[0],
                $('#CartDrawer')[0]
            );

            cart.addClass('is-empty');
            cart.addClass('active');

            draftSavedFeedback(true);
        }
    })
}