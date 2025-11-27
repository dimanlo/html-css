const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'images')));

const db = new Database();

app.use((req, res, next) => {
    req.db = db;
    next();
});

app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const result = await db.register({ name, email, password });
        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await db.login({ email, password });
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await db.getAllProducts();
        res.json({
            success: true,
            data: products,
            count: products.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const product = await db.getProductById(productId);
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/products/:id/reviews', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const reviews = await db.getReviewsByProductId(productId);
        res.json({
            success: true,
            data: reviews,
            count: reviews.length
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/users/:id/reviews', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const reviews = await db.getReviewsByUserId(userId);
        res.json({
            success: true,
            data: reviews,
            count: reviews.length
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        const { user_id, product_id, review, stars } = req.body;
        const result = await db.createReview({
            user_id: parseInt(user_id),
            product_id: parseInt(product_id),
            review,
            stars: parseInt(stars)
        });
        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/shops', async (req, res) => {
    try {
        const shops = await db.getAllShops();
        res.json({
            success: true,
            data: shops,
            count: shops.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, price, description, image_url, category } = req.body;
        const result = await db.createProduct({
            name,
            price: parseFloat(price),
            description,
            image_url,
            category
        });
        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/shops', async (req, res) => {
    try {
        const { address, phone, latitude, longitude } = req.body;
        const result = await db.createShop({
            address,
            phone,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null
        });
        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API работает',
        endpoints: {
            auth: {
                register: 'POST /api/register',
                login: 'POST /api/login'
            },
            products: {
                getAll: 'GET /api/products',
                getById: 'GET /api/products/:id',
                create: 'POST /api/products'
            },
            reviews: {
                getByProduct: 'GET /api/products/:id/reviews',
                getByUser: 'GET /api/users/:id/reviews',
                create: 'POST /api/reviews'
            },
            shops: {
                getAll: 'GET /api/shops',
                create: 'POST /api/shops'
            }
        }
    });
});

app.use((error, req, res, next) => {
    console.error('Ошибка сервера:', error);
    res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера'
    });
});

const startServer = async () => {
    try {
        const products = await db.getAllProducts();
        if (products.length === 0) {
            await db.createProduct({
                name: 'Смартфон iPhone 15',
                price: 89999.00,
                description: 'Новейший смартфон Apple с отличной камерой и производительностью',
                image_url: 'https://main-cdn.sbermegamarket.ru/upload/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA_%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0_2024-04-22_205141_6626a3de2a849.png',
                category: 'Электроника'
            });
            
            await db.createProduct({
                name: 'Ноутбук Apple MacBook Pro',
                price: 159999.00,
                description: 'Мощный ноутбук для работы и развлечений',
                image_url: 'https://avatars.mds.yandex.net/get-mpic/11695357/2a000001909c25cfb294fb6a3e39991373ff/orig',
                category: 'Компьютеры'
            });
            
            await db.createProduct({
                name: 'Беспроводные наушники',
                price: 2999.00,
                description: 'Качественные беспроводные наушники с шумоподавлением',
                image_url: 'https://avatars.mds.yandex.net/get-mpic/14373055/2a00000196860e2f7227f11c89fd2c7742e4/orig',
                category: 'Аксессуары'
            });
            
            console.log('Тестовые товары добавлены в базу данных');
        }
        
        const shops = await db.getAllShops();
        if (shops.length === 0) {
            await db.createShop({
                address: 'ул. Тверская, 1',
                phone: '+7 (495) 123-45-67',
                latitude: 55.7558,
                longitude: 37.6176
            });
            
            await db.createShop({
                address: 'пр. Мира, 15',
                phone: '+7 (495) 234-56-78',
                latitude: 55.7950,
                longitude: 37.6400
            });
            
            console.log('Тестовые магазины добавлены в базу данных');
        }
    } catch (error) {
        console.error('Ошибка при добавлении тестовых данных:', error.message);
    }
    
    app.listen(PORT, () => {
        console.log(`Сервер запущен на порту ${PORT}`);
        console.log(`API доступно по адресу: http://localhost:${PORT}/api`);
    });
};

process.on('SIGINT', async () => {
    console.log('\nЗавершение работы сервера...');
    if (db) {
        await db.close();
    }
    process.exit(0);
});

startServer().catch(console.error);