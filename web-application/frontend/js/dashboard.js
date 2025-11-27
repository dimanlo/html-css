const API_URL = 'http://localhost:3000/api';
const reviewsTableBody = document.getElementById('reviewsTableBody');
const reviewsFilter = document.getElementById('reviewsFilter');
const reviewsSearch = document.getElementById('reviewsSearch');

document.addEventListener('DOMContentLoaded', async () => {
    await loadReviews();
    addEventListeners();
});

async function loadReviews() {
    try {
        reviewsTableBody.innerHTML = '<tr><td colspan="4" class="loading">Загрузка отзывов...</td></tr>';
        const response = await fetch(`${API_URL}/users/1/reviews`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            displayReviews(result.data);
        } else {
            console.error('Ошибка загрузки отзывов:', result.error);
            displayReviewsError('Не удалось загрузить отзывы');
        }
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
        displayReviewsError('Не удалось загрузить отзывы. Проверьте подключение к серверу.');
    }
}

function displayReviews(reviews) {
    if (reviews.length === 0) {
        reviewsTableBody.innerHTML = '<tr><td colspan="4" class="loading">Отзывы не найдены</td></tr>';
        return;
    }
    
    reviewsTableBody.innerHTML = reviews.map(review => {
        const date = new Date(review.created_at);
        const formattedDate = date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `
        <tr>
            <td>${review.product_name}</td>
            <td>${review.review}</td>
            <td>
                <div class="stars-rating">
                    ${'★'.repeat(review.stars)}${'☆'.repeat(5 - review.stars)}
                </div>
            </td>
            <td>${formattedDate}</td>
        </tr>
        `;
    }).join('');
}

function displayReviewsError(message) {
    reviewsTableBody.innerHTML = `<tr><td colspan="4" class="loading">${message}</td></tr>`;
}

function addEventListeners() {
    if (reviewsFilter) {
        reviewsFilter.addEventListener('change', filterReviews);
    }
    
    if (reviewsSearch) {
        reviewsSearch.addEventListener('input', filterReviews);
    }
}

function filterReviews() {
    const filterValue = reviewsFilter.value;
    const searchValue = reviewsSearch.value.toLowerCase();
    const rows = reviewsTableBody.querySelectorAll('tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        if (row.querySelector('.loading')) return;
        
        const starsCell = row.cells[2];
        const reviewCell = row.cells[1];
        const starsText = starsCell.textContent;
        const starsCount = (starsText.match(/★/g) || []).length;
        const reviewText = reviewCell.textContent.toLowerCase();
        const productName = row.cells[0].textContent.toLowerCase();
        const starsMatch = filterValue === 'all' || starsCount == filterValue;
        const searchMatch = searchValue === '' ||
                          reviewText.includes(searchValue) ||
                          productName.includes(searchValue);
        
        if (starsMatch && searchMatch) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    if (visibleCount === 0) {
        reviewsTableBody.innerHTML = '<tr><td colspan="4" class="loading">Отзывы не найдены</td></tr>';
    }
}