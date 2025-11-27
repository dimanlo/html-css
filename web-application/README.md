# Web Application

## Описание проекта

Веб-приложение с функционалом электронной коммерции, включающее каталог товаров, систему отзывов и карту магазинов.

## Структура проекта
```text
webapp/
├── backend/           # Backend API сервер
│   ├── server.js      # Основной серверный файл
│   ├── database.js     # Работа с базой данных
│   ├── package.json   # Зависимости backend
│   ├── README.md      # Документация backend
│   └── database.db    # Файл базы данных SQLite
├── frontend/          # Фронтенд приложение
│   ├── index.html     # Главная страница
│   ├── dashboard.html # Личный кабинет пользователя
│   ├── css/           # Стили
│   ├── js/            # JavaScript файлы
│   └── assets/      # Изображения и другие ресурсы
├── docs/              # Документация
│   └── database_schema.md # Схема базы данных
├── .gitignore         # Git ignore
└── README.md         # Общая документация
```

## Технологии

### Backend
- Node.js
- Express.js
- SQLite

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Leaflet (карты)
- Chart.js (графики)

## Установка и запуск

### Backend
1. Перейдите в директорию backend:
```bash
cd backend
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите сервер:
```bash
npm start
```

Сервер будет доступен по адресу: http://localhost:3000

### Frontend
Фронтенд можно открыть напрямую в браузере через файл `frontend/index.html` или разместить на веб-сервере.

## API Endpoints

### Товары
- `GET /api/products` - Получение всех товаров
- `GET /api/products/:id` - Получение товара по ID
- `POST /api/products` - Создание товара

### Отзывы
- `GET /api/products/:id/reviews` - Получение отзывов по product_id
- `GET /api/users/:id/reviews` - Получение отзывов по user_id
- `POST /api/reviews` - Создание отзыва

### Магазины
- `GET /api/shops` - Получение всех магазинов
- `POST /api/shops` - Создание магазина

## База данных

Схема базы данных описана в файле [docs/database_schema.md](docs/database_schema.md)