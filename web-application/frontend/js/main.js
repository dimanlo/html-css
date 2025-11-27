const API_URL = 'http://localhost:3000/api';
const LOCAL_IMAGES = [
    '../img/image.png',
    '../img/orig.webp',
    '../img/6870592334.jpg'
];
const productsContainer = document.getElementById('productsContainer');
const scrollToProductsBtn = document.getElementById('scrollToProducts');

document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    initMap();
    addEventListeners();
});

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const result = await response.json();
        
        if (result.success) {
            displayProducts(result.data);
        } else {
            console.error('Ошибка загрузки товаров:', result.error);
            displayError('Не удалось загрузить товары');
        }
    } catch (error) {
        console.error('Ошибка сети:', error);
        displayError('Ошибка подключения к серверу');
    }
}

function displayProducts(products) {
    if (products.length === 0) {
        productsContainer.innerHTML = '<p>Товары не найдены</p>';
        return;
    }
    
    productsContainer.innerHTML = products.map((product, index) => {
        const imageIndex = index % LOCAL_IMAGES.length;
        const localImage = LOCAL_IMAGES[imageIndex];
        
        return `
        <div class="product-card" data-id="${product.id}">
            <img src="${localImage}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description || 'Описание отсутствует'}</p>
                <p class="product-price">${product.price ? product.price.toFixed(2) : '0.00'} ₽</p>
                <button class="btn btn-primary" onclick="viewProduct(${product.id})">Подробнее</button>
            </div>
        </div>
        `;
    }).join('');
}

function displayError(message) {
    productsContainer.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
            <button class="btn btn-primary" onclick="loadProducts()">Повторить попытку</button>
        </div>
    `;
}

function viewProduct(productId) {
    alert(`Просмотр товара с ID: ${productId}`);
}

function initMap() {
    const map = L.map('map').setView([55.7558, 37.6176], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                map.setView([userLat, userLng], 13);
                
                const userIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });
                
                const userMarker = L.marker([userLat, userLng], {icon: userIcon})
                    .addTo(map)
                    .bindPopup('Вы находитесь здесь')
                    .openPopup();
            },
            (error) => {
                console.warn('Не удалось получить местоположение пользователя:', error);
                loadShops(map);
            }
        );
    } else {
        console.warn('Геолокация не поддерживается браузером');
        loadShops(map);
    }
    
    loadShops(map);
}

async function loadShops(map) {
    try {
        const response = await fetch(`${API_URL}/shops`);
        const result = await response.json();
        
        if (result.success) {
            displayShopsOnMap(result.data, map);
        } else {
            console.error('Ошибка загрузки магазинов:', result.error);
        }
    } catch (error) {
        console.error('Ошибка сети при загрузке магазинов:', error);
    }
}

function displayShopsOnMap(shops, map) {
    shops.forEach(shop => {
        if (shop.latitude && shop.longitude) {
            const marker = L.marker([shop.latitude, shop.longitude]).addTo(map);
            marker.bindPopup(`
                <div class="shop-popup">
                    <h4>Магазин</h4>
                    <p><strong>Адрес:</strong> ${shop.address}</p>
                    <p><strong>Телефон:</strong> ${shop.phone || 'Не указан'}</p>
                    <button onclick="getDirections(${shop.latitude}, ${shop.longitude})" class="btn btn-small">Проложить маршрут</button>
                </div>
            `);
        }
    });
}

function getDirections(lat, lng) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${lat},${lng}&travelmode=driving`;
                window.open(googleMapsUrl, '_blank');
            },
            (error) => {
                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                window.open(googleMapsUrl, '_blank');
            }
        );
    } else {
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(googleMapsUrl, '_blank');
    }
}

function addEventListeners() {
    if (scrollToProductsBtn) {
        scrollToProductsBtn.addEventListener('click', () => {
            document.querySelector('.products-section').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
}

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.product-card, .section-title, .hero');
    animatedElements.forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });
});