class NewProduct {
    constructor(imageUrl, name, price, quantity, features, description) {
        this.imageUrl = imageUrl;
        this.name = name;
        this.price = parseFloat(price).toFixed(2);
        this.quantity = +quantity;
        this.features = features;
        this.description = description;
    }
}

class Product {
    constructor(id, imageUrl, name, price, quantity, features, description) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.name = name;
        this.price = parseFloat(price).toFixed(2);
        this.quantity = +quantity;
        this.features = features;
        this.description = description;
    }
}

var productsModel = [];
var currentProductId;

var cartModel = [];
getExistingCartItems();

function getExistingCartItems() {
    if (window.localStorage.getItem('cart') !== null) {
        cartModel = JSON.parse(window.localStorage.getItem('cart'));
    } else {
        cartModel = [];
    }
}

async function getProducts() {
    try {
        const res = await fetch("https://techcube-737e9.firebaseio.com/Products.json");
        if (res.status === 200) {
            let productsArray = (Object.entries(await res.json()));
            productsModel = [];
            productsArray.forEach(el => {
                let product = new Product(el[0], el[1].imageUrl, el[1].name, el[1].price, el[1].quantity, el[1].features, el[1].description);
                productsModel.push(product);
            });
            syncCartProducts();
            updateCartBadge();
        }
    } catch (err) {
        console.log(err, "error");
    }
}

async function getProductDetails(id) {
    try {
        const res = await fetch(`https://techcube-737e9.firebaseio.com/Products/${id}.json`);
        if (res.status === 200) {
            let productDetails = await res.json();
            if (productDetails !== null) {
                let currentProduct = new Product(id, productDetails.imageUrl, productDetails.name, productDetails.price, productDetails.quantity, productDetails.features, productDetails.description);
                productsModel.push(currentProduct);
                return true
            } else {
                return false
            }
        }
    } catch (err) {
        console.log(err, "error");
    }
}

async function createProduct(newProduct) {
    try {
        const res = await fetch("https://techcube-737e9.firebaseio.com/Products.json", {
            method: 'POST',
            body: JSON.stringify(newProduct)
        });
        if (res.status === 200) {
            let newId = await res.json();
            let newlyCreatedProduct = new Product(newId.name, newProduct.imageUrl, newProduct.name, newProduct.price, newProduct.quantity, newProduct.features, newProduct.description);
            productsModel.push(newlyCreatedProduct);
        }
    } catch (err) {
        console.log(err, "error");
    }
}

async function updateProductOnDB(alteredProduct, id) {
    try {
        await fetch(`https://techcube-737e9.firebaseio.com/Products/${id}.json`, {
            method: 'PUT',
            body: JSON.stringify(alteredProduct)
        })
    } catch (err) {
        console.log(err, "error");
    }
}

async function deleteProductFromDB(productId) {
    try {
        await fetch(`https://techcube-737e9.firebaseio.com/Products/${productId}.json`, {
            method: 'DELETE'
        })
    } catch (err) {
        console.log(err, "error");
    }
}

function deleteProductFromArray(productId, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i]['id'] === productId) {
            array.splice(i, 1);
        }
    }
}

function getArrayDataById(id, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i]['id'] === id) {
            return array[i]
        }
    } return null
}

function updateProductInArray(currentProduct, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i]['id'] === currentProduct.id) {
            array.splice(i, 1, currentProduct);
        }
    }
}

function syncCartProducts() {
    if (cartModel.length > 0){
        cartModel.forEach(cartItem => {
            let existingItem = getArrayDataById(cartItem.id, productsModel);
            if (existingItem !== null){
                cartItem.name = existingItem.name;
                cartItem.available = true;
                cartItem.inStock = existingItem.quantity > 0 ? true : false;
            } else {
                cartItem.available = false;
                cartItem.inStock = false;
            }
        });
        localStorage.setItem('cart', `${JSON.stringify(cartModel)}`);
    } else return
}

function formatPrice(price) {
    let fPrice = new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2 }).format(price);
    return `${fPrice.split(",")[0]}<sup>${fPrice.split(",")[1]}</sup> Lei`
}

function setInputFilter(textbox, inputFilter) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
        textbox.addEventListener(event, function () {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            } else {
                this.value = "";
            }
        });
    });
}

function checkImage(src, callback) {
    var img = new Image();
    img.onload = () => callback(true);
    img.onerror = () => callback(false);
    img.src = src;
}

function updateCartBadge() {
    const cartBtnBadge = document.querySelector('#cartBtn span');
    if (cartModel.length > 0) {
        let cartTotalItems = 0;
        cartModel.forEach(cartItem => {
            if (cartItem.available && cartItem.inStock){
                cartTotalItems += cartItem.quantity;
            }
        });
        cartBtnBadge.parentElement.className = 'nonEmptyCartBtn';
        cartBtnBadge.className = "visible"
        cartBtnBadge.innerHTML = cartTotalItems;
    } else {
        cartBtnBadge.className = "hidden"
        cartBtnBadge.parentElement.className = 'emptyCartBtn';
    }
}