const loader = document.querySelector('.loader');
const productDetailsWrapper = document.getElementById('productDetailsWrapper');
const regexPatterns = {
    email: /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/,
};
updateCartBadge();

window.onload = () => {
    if (window.location.search !== "") {
        currentProductId = window.location.search.split('=')[1];
        initInterface(currentProductId);
    } else {
        display404();
    }
    setTimeout(() => {
        loader.className += " notVisible";
    }, 500)
}

async function initInterface(productId) {
    let productDetailsOk = await getProductDetails(productId);
    if (productDetailsOk){
        var currentProductObject = getArrayDataById(productId, productsModel);
        displayProduct(currentProductObject);
        loadModal();
    } else {
        display404();
    }
}

function displayProduct(obj){
    productDetailsWrapper.innerHTML = `
        <div class="row productDetails">
            <div class="productImage col-xs-12 col-sm-6 col-md-5 col-lg-5 text-center">
                <img src="${obj.imageUrl}" onerror="this.onerror=null;this.src='img/noProductImg.png';">
            </div>
            <div class="productInfo col-xs-12 col-sm-6 col-md-7 col-lg-7">
                <div class="productDetailsName row">
                    <h2>${obj.name}</h2>
                </div>
                <div class="rowProductDetails row">
                    <div class="colMainFeatures col-md-7">
                        ${obj.features}
                    </div>
                    <div class="colProductBuy col-md-5">
                        <span class="price">${formatPrice(obj.price)}</span>
                        <div style="display: ${obj.quantity>0 ? "block" : "none"}">
                            <div class="stock available">În stoc: ${obj.quantity} buc.</div>
                            <p>Livrare: 1-3 zile lucrătoare</p>
                            <label for="desiredQuantityField">Cantitate:</label>
                            <div class="numeric-input">
                                <input type="text" id="desiredQuantityField" value="1">
                                    <div class="quantityBtns">
                                        <a onclick="increaseDecreaseQuantity(+1, ${obj.quantity})"><i class="fas fa-caret-up"></i></a>
                                        <a onclick="increaseDecreaseQuantity(-1, ${obj.quantity})"><i class="fas fa-caret-down"></i></a>
                                    </div>
                            </div>
                            <button type="button" class="ctaBtn" onclick="addProductToCart('${obj.id}', parseInt(desiredQuantityField.value), '${obj.name}')"><i class="fas fa-shopping-cart"></i>Adaugă în coș</button>
                        </div>
                        <div style="display: ${obj.quantity===0 ? "block" : "none"}">
                            <div class="stock unavailable">Stoc epuizat</div>
                            <button type="button" data-modal-target="#modal" class="ctaBtn"><i class="fas fa-bell"></i>Setează alertă stoc</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row longDescription">
            <h3>Descriere</h3>
            <div>${obj.description}</div>
        </div>
        `
        let desiredQuantityField = document.getElementById('desiredQuantityField');
        setInputFilter(desiredQuantityField, function(value) {
            return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 1000); });
}

function display404() {
        productDetailsWrapper.innerHTML = `
        <div class="missingPage-404">
            <div>
                <span>4</span><i class="fas fa-frown"></i><span>4</span>
            </div>
            <h3>Această pagină a fost mutată sau nu mai există!</h3>
            <p>În 5 secunde vei fi redirecționat pe pagina principală TechCube.</p>
        </div>
        `
    setTimeout(() => {
        window.location.href = "index.html";
    }, 5000)
}

function increaseDecreaseQuantity(increase, limit) {
    let inputElement = document.getElementById('desiredQuantityField');
    if (inputElement.value === "") {
        inputElement.value = 1;
    }
    let currentValue = parseInt(inputElement.value);
    currentValue += increase;
    if (currentValue < 1) {
        currentValue = 1;
    }
    if (currentValue > limit) {
        currentValue = limit;
        Toast.show(`Stoc insuficient. Te rugăm să micșorezi cantitatea.`, "error");
    }

    inputElement.value = currentValue;
}

function addProductToCart(id, quantity, name){
    if (quantity === 0){
        Toast.show(`Produsul nu a putut fi adăugat în coș. Te rugăm să actualizezi cantitatea.`, "error");
    } else {
        let existingProduct = getArrayDataById(id, cartModel);
        if (existingProduct !== null){
            let totalDesired = existingProduct.quantity + quantity;
            if (totalDesired <= getArrayDataById(id, productsModel).quantity){
                existingProduct.quantity = totalDesired;
                localStorage.setItem('cart', `${JSON.stringify(cartModel)}`);
                updateCartBadge()
                Toast.show(`<b>${productsModel[0].name}</b> a fost adăugat în <a href="cart.html">coș</a>`, "success");
            } else {
                Toast.show(`Stoc insuficient. În <a href="cart.html">coș</a> există deja ${existingProduct.quantity} bucăți.`, "error");
            }
        } else if (quantity <= getArrayDataById(id, productsModel).quantity) {
            cartModel.push({id: id, quantity: quantity, name: name, available: true, inStock: true});
            localStorage.setItem('cart', `${JSON.stringify(cartModel)}`);
            updateCartBadge()
            Toast.show(`<b>${productsModel[0].name}</b> a fost adăugat în <a href="cart.html">coș</a>`, "success");
        } else {
            Toast.show(`Stoc insuficient. Te rugăm să micșorezi cantitatea.`, "error");
        }
    }
}


// -------- MODAL --------

function loadModal() {
    const openModalBtn = document.querySelector('[data-modal-target]');
    const closeModalBtn = document.querySelector('[data-close-button]');
    const overlay = document.getElementById('overlay');
    const modalForm = document.getElementById('modalForm');
    const modalEmail = document.getElementById('modalEmail');
    const small = document.querySelector("#modalForm ~ small");
    
    openModalBtn.addEventListener('click', () => {
        const modal = document.querySelector(openModalBtn.dataset.modalTarget);
        openModal(modal);
    })
    
    closeModalBtn.addEventListener('click', () => {
        const openModal = document.querySelector('.modal.active')
        closeModal(openModal);
    })

    overlay.addEventListener('click', () => {
        const modal = closeModalBtn.closest('.modal');
        closeModal(modal);
    })

    modalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if(modalEmail.value === ""){
            small.innerText = "Câmpul nu poate fi gol."
            small.className = "visible"
        } else if(!regexPatterns["email"].test(modalEmail.value)) {
            small.innerText = "E-mailul nu este valid.";
            small.className = "visible"
        } else {
            small.className = "invisible"
            const modal = e.target.closest('.modal');
            closeModal(modal);
            Toast.show("Alerta stoc a fost creată cu succes.", "success");
        }
    })

    function openModal(modal){
        if (modal === null) return
        modal.classList.add('active');
        overlay.classList.add('active');
    }
    
    function closeModal(modal){
        if (modal === null) return
        modal.classList.remove('active');
        overlay.classList.remove('active');
        modalEmail.value = "";
    }
}