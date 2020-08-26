const loader = document.querySelector('.loader');
const cartWrapper = document.getElementById('cartWrapper');
const emptyCartWrapper = document.getElementById('emptyCartWrapper');
const cartTableThead = document.querySelector('#cartTable thead');
const cartTableTbody = document.querySelector('#cartTable tbody');
const cartBtnBadge = document.querySelector('#cartBtn span');
const shoppingCartH3 = document.querySelector('#shoppingCart h3');
const cartErrorMsg = document.getElementById('cartErrorMsg');
updateCartBadge();


window.onload = async () => {
    await getProducts();
    displayCartItems();
    displayTotal();
    setTimeout(() => {
        loader.className += " notVisible";
    }, 500)
}

function displayCartItems() {
    if (cartModel.length > 0) {
        cartWrapper.style.display = "block";
        emptyCartWrapper.style.display = "none";
        shoppingCartH3.innerHTML = `Coș de cumpărături`;
        cartTableThead.innerHTML = `
        <tr>
            <td>Nume</td>
            <td>Preț unitar</td>
            <td>Cantitate</td>
            <td>Preț total</td>
            <td></td>
        </tr>
        `
        cartTableTbody.innerHTML = ""
        cartModel.forEach(cartItem => {
            let shopItem = getArrayDataById(cartItem.id, productsModel);
            if (cartItem.available && cartItem.inStock) {
                cartTableTbody.innerHTML += `
                <tr id="${cartItem.id}" class="availableCartProduct">            
                    <td>
                        <a href="details.html?id=${shopItem.id}" title="${shopItem.name}">${shopItem.name}</a>
                        <small class="${cartItem.quantity > shopItem.quantity? `visible` : `invisible`}">
                            <i class="fa fa-exclamation-triangle"></i>Stoc insuficient
                        </small>
                    </td>
                    <td>${formatPrice(shopItem.price)}</td>
                    <td>
                        <div class="numeric-input">
                            <input type="text" class="desiredQuantityField${cartItem.quantity > shopItem.quantity ? " error" : ""}" data-id=${cartItem.id} data-stock=${shopItem.quantity} value="${cartItem.quantity}">
                            <i class="fa fa-exclamation-circle" style="display:${cartItem.quantity > shopItem.quantity ? "block" : "none"}"></i>
                            <div class="quantityBtns">
                                <a onclick="increaseDecreaseQuantity(this, +1, ${shopItem.quantity})"><i class="fas fa-caret-up"></i></a>
                                <a onclick="increaseDecreaseQuantity(this, -1, ${shopItem.quantity})"><i class="fas fa-caret-down"></i></a>
                            </div>
                        </div>
                        <div class="updateQuantity"></div>
                    </td>
                    <td>${formatPrice(shopItem.price * cartItem.quantity)}</td>
                    <td><a onclick="removeCartItem('${cartItem.id}')">Șterge</a></td>
                </tr>
                `
            } else if (!cartItem.available) {
                cartTableTbody.innerHTML += `
                <tr id="${cartItem.id}" class="unavailableCartProduct">
                    <td colspan="4">
                        ${cartItem.name}
                        <small class="visible">
                            <i class="fa fa-exclamation-triangle"></i>Produs indisponibil
                        </small>
                    </td>
                    <td><a onclick="removeCartItem('${cartItem.id}')">Șterge</a></td>
                </tr>
                `
            } else if (cartItem.available && !cartItem.inStock){
                cartTableTbody.innerHTML += `
                <tr id="${cartItem.id}" class="unavailableCartProduct">
                    <td colspan="4">
                        <a href="details.html?id=${cartItem.id}" title="${shopItem.name}">${shopItem.name}</a>
                        <small class="visible">
                            <i class="fa fa-exclamation-triangle"></i>Stoc epuizat
                        </small>
                    </td>
                    <td><a onclick="removeCartItem('${cartItem.id}')">Șterge</a></td>
                </tr>
                `
            }
        });
        let quantityInputs = document.querySelectorAll('.desiredQuantityField');
        quantityInputs.forEach(input => {
            setInputFilter(input, function (value) {
                return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 1000);
            });

            input.addEventListener('input', () => {
                let updateLinkEl = `<a onclick="updateQuantity(this, '${input.dataset.id}', ${input.value})">Actualizați</a>`
                input.parentElement.parentElement.children[1].innerHTML = updateLinkEl;
            })
        });
    } else {
        displayEmptyCart(false);
    }
}

function displayEmptyCart(isOrderPlaced) {
    shoppingCartH3.innerHTML = ``;
    cartWrapper.style.display = "none";
    emptyCartWrapper.style.display = "block";
    if (!isOrderPlaced) {
        emptyCartWrapper.children[0].innerHTML = `
        <h3>Coșul tău este gol.</h3>
        <span>Pentru a adăuga produse în coș te rugăm să te întorci în magazin.</span>
        <button class="ctaBtn backBtn" onclick="window.location.href='index.html'">Întoarce-te în magazin</button>
        `;
    } else {
        emptyCartWrapper.children[0].innerHTML = `
        <h3>Comanda a fost plasată cu succes.</h3>
        <span>Vei primi prin email toate informațiile privind statusul comenzii.</span>
        <button class="ctaBtn backBtn" onclick="window.location.href='index.html'">Întoarce-te în magazin</button>
        `;
    }
    localStorage.removeItem('cart');
}

function increaseDecreaseQuantity(triggeringElement, increase, limit) {
    let inputElement = triggeringElement.parentElement.parentElement.firstElementChild;
    if (inputElement.value === "") {
        inputElement.value = 0;
    }
    let currentValue = parseInt(inputElement.value);
    currentValue += increase;
    if (currentValue < 0) {
        currentValue = 0;
    }

    inputElement.value = currentValue;
    let updateLinkEl = `<a onclick="updateQuantity(this, '${inputElement.dataset.id}',  ${inputElement.value})">Actualizați</a>`
    triggeringElement.parentElement.parentElement.parentElement.children[1].innerHTML = updateLinkEl;
}

function removeCartItem(id) {
    let currentRow = document.getElementById(id);
    currentRow.remove();
    deleteProductFromArray(id, cartModel);
    displayTotal();
    localStorage.setItem('cart', `${JSON.stringify(cartModel)}`);
    updateCartBadge();
    Toast.show(`Produsul a fost șters din coș.`, "success");
    if (cartModel.length === 0) {
        displayEmptyCart(false);
    }
}

async function updateQuantity(element, id, quantity) {
    await getProducts();
    element.innerHTML = "";
    const inputField = element.parentElement.parentElement.children[0].children[0];
    const errorIcon = element.parentElement.parentElement.children[0].children[1];
    const errorMsg = document.querySelector(`#${id} small`);
    let shopItem = getArrayDataById(id, productsModel);
    let cartItem = getArrayDataById(id, cartModel);
    if (cartItem.available && cartItem.inStock) {
        if (quantity !== 0) {
            inputField.className = "desiredQuantityField";
            errorIcon.style.display = "none";
            errorMsg.className = "invisible"
            cartErrorMsg.innerHTML = "";
            if (quantity <= shopItem.quantity) {
                cartItem.quantity = quantity;
            } else {
                inputField.value = shopItem.quantity;
                cartItem.quantity = shopItem.quantity;
                Toast.show(`Stoc insuficient. Cantitatea a fost actualizată automat.`, "error");
            }
            document.getElementById(id).children[3].innerHTML = `${formatPrice(inputField.value * shopItem.price)}`;
            displayTotal();
            localStorage.setItem('cart', `${JSON.stringify(cartModel)}`);
            updateCartBadge();
        } else {
            removeCartItem(id);
        }
    } else if (!cartItem.available || !cartItem.inStock) {
        displayCartItems();
        Toast.show(`Unul sau mai multe produse necesită atenția dumneavoastră.`, "error");
    }
}

const freeTransportThreshold = 150;

function displayTotal() {
    let transportPrice = calculateSubtotalPrice() > freeTransportThreshold ? 0 : 30;
    let subtotal = calculateSubtotalPrice() + transportPrice;
    const totalAmount = document.getElementById('totalAmount');
    totalAmount.innerHTML = `
        <ul>
            <li>Produse: ${cartModel.length}</li>
            <li>TVA: 0%</li>
            <li>
                <a title="Transport gratuit la comenzile de peste ${freeTransportThreshold} Lei.">
                    <i class="fas fa-info-circle"></i>
                </a>
                Transport: ${transportPrice} Lei
            </li>
            <li>Subtotal: <span>${formatPrice(subtotal)}</span></li>
        </ul>
        <button class="ctaBtn" onclick="buyProducts()"><i class="fas fa-arrow-circle-right"></i>Cumpără</button>
        `
}

function calculateSubtotalPrice() {
    let sum = 0;
    cartModel.forEach(cartItem => {
        if (cartItem.available && cartItem.inStock) {
            let shopItem = getArrayDataById(cartItem.id, productsModel);
            sum += cartItem.quantity * shopItem.price
        }
    });
    return sum
}

function findUnavailableProducts() {
    let missingItems = [];
    let outOfStockProducts = [];

    cartModel.forEach(cartItem => {
        if (!cartItem.available) {
            missingItems.push(cartItem.id);
        } else {
            let shopItem = getArrayDataById(cartItem.id, productsModel);
            if (shopItem.quantity < cartItem.quantity) {
                outOfStockProducts.push(cartItem.id);
            }
        }
    });

    if (missingItems.length === 0 && outOfStockProducts.length === 0) {
        cartErrorMsg.innerHTML = ""
    } else if (missingItems.length > 0 || outOfStockProducts.length > 0) {
        Toast.show(`În coș există unul sau mai multe produse care necesită atenția dumneavoastră.`, "error");
    }
    return missingItems.length > 0 || outOfStockProducts.length > 0 ? true : false
}

async function buyProducts() {
    await getProducts();
    if (!findUnavailableProducts()) {
        cartModel.forEach(cartItem => {
            let shopItem = getArrayDataById(cartItem.id, productsModel);
            // Update Stock
            shopItem.quantity += -cartItem.quantity;
            updateProductInArray(shopItem, productsModel);
            updateProductOnDB(shopItem, shopItem.id);
        });
        cartErrorMsg.innerHTML = "";
        displayEmptyCart(true);
        Toast.show(`Comanda a fost plasată.`, "success");
        console.log("sent to backend server: ", cartModel);
        cartModel = [];
        updateCartBadge();
    }
    else {
        displayCartItems();
        displayTotal();
        return
    }
}