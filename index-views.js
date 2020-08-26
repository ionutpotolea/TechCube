const loader = document.querySelector('.loader');
const mainContent = document.getElementById('mainContent');
updateCartBadge();

window.onload = async () => {
    await getProducts();
    displayProducts();
    setTimeout(() => {
        loader.className += " notVisible";
    }, 500)
}

function displayProducts() {
    mainContent.innerHTML = ""
    productsModel.forEach(obj => {
        mainContent.innerHTML += `
        <div class="productCard" id="${obj.id}">
            <a href="details.html?id=${obj.id}"><img src="${obj.imageUrl}" onerror="this.onerror=null;this.src='img/noProductImg.png';"></a>
            <div class="productName"><h3><a href="details.html?id=${obj.id}" title="${obj.name}">${obj.name}</a></h3></div>
            <span class="price">${formatPrice(obj.price)}</span>
            <a href="details.html?id=${obj.id}" class="ctaBtn"><i class="fas fa-angle-double-right"></i>Detalii</a>
        </div>
        `
    });
}