const loader = document.querySelector('.loader');
const formProductImage = document.getElementById('formProductImage');
const formProductName = document.getElementById('formProductName');
const formProductFeatures = document.getElementById('formProductFeatures');
const formProductDescription = document.getElementById('formProductDescription');
const formProductPrice = document.getElementById('formProductPrice');
const formProductQuantity = document.getElementById('formProductQuantity');
const form = document.querySelector('#formSection form');
const productsTableThead = document.querySelector('#productsTable thead');
const productsTableTbody = document.querySelector('#productsTable tbody');
const formSection = document.getElementById('formSection');
const productManagement = document.getElementById('productManagement');
const addNew = document.getElementById('addNew');
const cancelForm = document.getElementById('cancelForm');
const formTitle = document.querySelector('#formSection h3');
let updateMode = false;
let descriptionEditor;
let featureEditor;
let formIsValid;

window.onload = async () => {
    await getProducts();
    displayProducts();
    setTimeout(() => {
        loader.className += " notVisible";
    }, 500)
    formSection.style.display = "none";
    setInputFilter(document.getElementById("formProductPrice"), function(value) {
        return /^\d{0,7}[.]?\d{0,2}$/.test(value); });
    setInputFilter(document.getElementById("formProductQuantity"), function(value) {
        return /^\d{0,7}$/.test(value); });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    checkImage(formProductImage.value, formActions);
})

function formActions(isImageUrlValid){  
    if (validateInputs(isImageUrlValid)){
        if (!updateMode) {
            submitNewProduct();
        } else {
            updateProduct(currentProductId);
        }
    }
}

addNew.addEventListener('click', () => {
    formSection.style.display = "block";
    productManagement.style.display = "none";
    if (updateMode) {
        clearForm();
        updateMode = false;
    }
})

cancelForm.addEventListener('click', () => {
    productManagement.style.display = "block";
    formSection.style.display = "none";
    clearForm();
    if (updateMode) {
        updateMode = false;
    }
})

function clearForm() {
    formTitle.innerText = 'Adăugare produs';
    formProductImage.value = "";
    formProductName.value = "";
    formProductFeatures.value = "";
    formProductDescription.value = "";
    formProductPrice.value = "";
    formProductQuantity.value = "";
    featureEditor.setData("");
    descriptionEditor.setData("");
    formProductImage.parentElement.parentElement.classList.remove("valid");
    formProductImage.parentElement.parentElement.classList.remove("invalid");
    formProductName.parentElement.parentElement.classList.remove("valid");
    formProductName.parentElement.parentElement.classList.remove("invalid");
    formProductFeatures.parentElement.parentElement.classList.remove("valid");
    formProductFeatures.parentElement.parentElement.classList.remove("invalid");
    formProductDescription.parentElement.parentElement.classList.remove("valid");
    formProductDescription.parentElement.parentElement.classList.remove("invalid");
    formProductPrice.parentElement.parentElement.classList.remove("valid");
    formProductPrice.parentElement.parentElement.classList.remove("invalid");
    formProductQuantity.parentElement.parentElement.classList.remove("valid");
    formProductQuantity.parentElement.parentElement.classList.remove("invalid");
}

async function submitNewProduct() {
    var newProduct = new NewProduct(formProductImage.value, formProductName.value, formProductPrice.value, formProductQuantity.value, featureEditor.getData(), descriptionEditor.getData());
    await createProduct(newProduct);
    displayNewProduct(newProduct);
    clearForm();
    formSection.style.display = "none";
    productManagement.style.display = "block";
    Toast.show("Produsul a fost creat cu succes.", "success");
}

function displayProducts() {
    productsTableThead.innerHTML = `
        <tr>
            <td>Imagine</td>
            <td>Nume</td>
            <td>Preț</td>
            <td>Stoc</td>
            <td></td>
        </tr>
        `
    productsTableTbody.innerHTML = ""
    productsModel.forEach(obj => {
        productsTableTbody.innerHTML += `
        <tr id="${obj.id}">
            <td><img src="${obj.imageUrl}" onerror="this.onerror=null;this.src='img/noProductImg.png';"></td>
            <td><a onclick="editProduct('${obj.id}')" title="${obj.name}">${obj.name}</a></td>
            <td>${formatPrice(obj.price)}</td>
            <td>${obj.quantity}</td>
            <td><a onclick="deleteProduct('${obj.id}')">Șterge</a></td>
        </tr>
        `
    });
}

function displayNewProduct(obj) {
    obj.id = productsModel[productsModel.length - 1].id;
    productsTableTbody.innerHTML += `
        <tr id="${obj.id}">
            <td><img src="${obj.imageUrl}" onerror="this.onerror=null;this.src='img/noProductImg.png';" height="25px"></td>
            <td><a onclick="editProduct('${obj.id}')">${obj.name}</a></td>
            <td>${formatPrice(obj.price)}</td>
            <td>${obj.quantity}</td>
            <td><a onclick="deleteProduct('${obj.id}')">Șterge</a></td>
        </tr>
    `
}

async function deleteProduct(productId) {
    deleteProductFromArray(productId, productsModel);
    await deleteProductFromDB(productId);
    document.getElementById(`${productId}`).remove();
    Toast.show("Produsul a fost șters.", "success");
}

function editProduct(id) {
    currentProductId = id;
    let productToEdit = getArrayDataById(id, productsModel);
    updateForm(productToEdit);
    formSection.style.display = "block";
    productManagement.style.display = "none";
    updateMode = true;
}

function updateForm(productToEdit) {
    formTitle.innerText = `Editare produs: ${productToEdit.name}`
    formProductImage.value = productToEdit.imageUrl;
    formProductName.value = productToEdit.name;
    featureEditor.setData(`${productToEdit.features}`)
    descriptionEditor.setData(`${productToEdit.description}`)
    formProductPrice.value = productToEdit.price;
    formProductQuantity.value = productToEdit.quantity;
}

async function updateProduct(id) {
    var alteredProduct = new NewProduct(formProductImage.value, formProductName.value, parseFloat(formProductPrice.value), parseFloat(formProductQuantity.value), featureEditor.getData(), descriptionEditor.getData());
    await updateProductOnDB(alteredProduct, id);
    var alteredProductWithId = new Product(id, formProductImage.value, formProductName.value, parseFloat(formProductPrice.value), parseFloat(formProductQuantity.value), featureEditor.getData(), descriptionEditor.getData());
    updateProductInArray(alteredProductWithId, productsModel);
    clearForm();
    displayUpdatedProduct(alteredProductWithId);
    formSection.style.display = "none";
    productManagement.style.display = "block";
    Toast.show("Produsul a fost actualizat.", "success");
    updateMode = false;
}

function displayUpdatedProduct(obj) {
    document.getElementById(obj.id).innerHTML = `
        <td><img src="${obj.imageUrl}" onerror="this.onerror=null;this.src='img/noProductImg.png';" height="25px"></td>
        <td><a onclick="editProduct('${obj.id}')">${obj.name}</a></td>
        <td>${formatPrice(obj.price)}</td>
        <td>${obj.quantity}</td>
        <td><a onclick="deleteProduct('${obj.id}')">Șterge</a></td>
        `
}

const regexPatterns = {
    name: /^.{3,80}$/,
    price: /^\d{1,7}(\.\d{1,2})?$/,
    quantity: /^\d{1,7}$/
};

function validateInputs(isImageUrlValid) {
    if (isImageUrlValid){
        setValidFor(formProductImage)
    } else {
        setInvalidFor(formProductImage, "URL invalid.")
    }

    if (formProductName.value === "") {
        setInvalidFor(formProductName, 'Câmpul nu poate fi gol.');
    } else if (!regexPatterns["name"].test(formProductName.value)) {
        setInvalidFor(formProductName, "Numele trebuie să conțină între 3 și 80 de caractere.");
    } else {
        setValidFor(formProductName);
    }

    if (featureEditor.getData() === "") {
        setInvalidFor(formProductFeatures, 'Câmpul nu poate fi gol.');
    } else {
        setValidFor(formProductFeatures);
    }

    if (descriptionEditor.getData() === "") {
        setInvalidFor(formProductDescription, 'Câmpul nu poate fi gol.');
    } else {
        setValidFor(formProductDescription);
    }

    if (formProductPrice.value === "") {
        setInvalidFor(formProductPrice, 'Câmpul nu poate fi gol.');
    } else if (!regexPatterns["price"].test(formProductPrice.value)) {
        setInvalidFor(formProductPrice, "Prețul poate conține între 1 și 7 cifre și două zecimale.");
    } else {
        setValidFor(formProductPrice);
    }

    if (formProductQuantity.value === "") {
        setInvalidFor(formProductQuantity, 'Câmpul nu poate fi gol.');
    } else if (!regexPatterns["quantity"].test(formProductQuantity.value)) {
        setInvalidFor(formProductQuantity, "Stocul poate conține între 1 și 7 cifre.");
    } else {
        setValidFor(formProductQuantity);
    }

    if (form.getElementsByClassName('valid').length === 6){
        return true
    } else return false
}

function setInvalidFor(input, errorMessage) {
    const formControl = input.parentElement.parentElement;
    const small = formControl.querySelector("small");
    small.innerText = errorMessage;
    formControl.className = "form-control invalid"
}

function setValidFor(input) {
    const formControl = input.parentElement.parentElement;
    formControl.className = "form-control valid"
}

ClassicEditor
    .create( document.querySelector( '#formProductDescription' ), {
        toolbar: [ 'heading', '|', 'bold', 'link', 'bulletedList', 'numberedList', 'blockQuote' ],
        heading: {
            options: [
                { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' }
            ]
        }
    } )
    .then( newEditor => {
        descriptionEditor = newEditor;
    } )
    .catch( error => {
            console.error( error );
    } );

ClassicEditor
    .create( document.querySelector( '#formProductFeatures' ), {
        toolbar: [ 'heading', '|', 'bold', 'link', 'bulletedList', 'numberedList', 'blockQuote' ],
        heading: {
            options: [
                { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' }
            ]
        }
    } )
    .then( newEditor => {
        featureEditor = newEditor;
    } )
    .catch( error => {
            console.error( error );
    } );