const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, 'database.db');
        this.db = null;
        this.init();
    }

    init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Ошибка при подключении к базе данных:', err.message);
                    reject(err);
                } else {
                    console.log('База данных подключена успешно');
                    this.createTables()
                        .then(() => resolve())
                        .catch(reject);
                }
            });
        });
    }

    createTables() {
        return new Promise((resolve, reject) => {
            const createTablesQuery = `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    email TEXT UNIQUE,
                    password TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    price REAL,
                    description TEXT,
                    image_url TEXT,
                    category TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS reviews (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    product_id INTEGER NOT NULL,
                    review TEXT NOT NULL,
                    stars INTEGER CHECK (stars >= 1 AND stars <= 5) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(user_id) REFERENCES users(id),
                    FOREIGN KEY(product_id) REFERENCES products(id)
                );

                CREATE TABLE IF NOT EXISTS shops (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    address TEXT,
                    phone TEXT,
                    latitude REAL,
                    longitude REAL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;

            this.db.exec(createTablesQuery, (err) => {
                if (err) {
                    console.error('Ошибка при создании таблиц:', err.message);
                    reject(err);
                } else {
                    console.log('Таблицы созданы успешно');
                    resolve();
                }
            });
        });
    }

    register(userData) {
        return new Promise((resolve, reject) => {
            const { name, email, password } = userData;

            if (!email || !password) {
                return reject(new Error('Email и пароль обязательны'));
            }

            const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;

            this.db.run(query, [name, email, password], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        reject(new Error('Пользователь с таким email уже существует'));
                    } else {
                        reject(err);
                    }
                } else {
                    resolve({
                        id: this.lastID,
                        name,
                        email,
                        message: 'Пользователь успешно зарегистрирован'
                    });
                }
            });
        });
    }

    login(credentials) {
        return new Promise((resolve, reject) => {
            const { email, password } = credentials;

            if (!email || !password) {
                return reject(new Error('Email и пароль обязательны'));
            }

            const query = `SELECT id, name, email, created_at FROM users WHERE email = ? AND password = ?`;

            this.db.get(query, [email, password], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    resolve({
                        id: row.id,
                        name: row.name,
                        email: row.email,
                        created_at: row.created_at,
                        message: 'Авторизация успешна'
                    });
                } else {
                    reject(new Error('Неверный email или пароль'));
                }
            });
        });
    }

    getAllProducts() {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT id, name, price, description, image_url, category, created_at
            FROM products
            ORDER BY created_at DESC
        `;

            this.db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    getProductById(productId) {
        return new Promise((resolve, reject) => {
            if (!productId) {
                return reject(new Error('ID товара обязателен'));
            }

            const query = `
            SELECT id, name, price, description, image_url, category, created_at
            FROM products
            WHERE id = ?
        `;

            this.db.get(query, [productId], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    resolve(row);
                } else {
                    reject(new Error('Товар не найден'));
                }
            });
        });
    }

    getReviewsByProductId(productId) {
        return new Promise((resolve, reject) => {
            if (!productId) {
                return reject(new Error('ID товара обязателен'));
            }

            const query = `
            SELECT
                r.id,
                r.user_id,
                r.product_id,
                r.review,
                r.stars,
                r.created_at,
                u.name as user_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        `;

            this.db.all(query, [productId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    getReviewsByUserId(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                return reject(new Error('ID пользователя обязателен'));
            }

            const query = `
            SELECT
                r.id,
                r.user_id,
                r.product_id,
                r.review,
                r.stars,
                r.created_at,
                p.name as product_name
            FROM reviews r
            LEFT JOIN products p ON r.product_id = p.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `;

            this.db.all(query, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    createReview(reviewData) {
        return new Promise((resolve, reject) => {
            const { user_id, product_id, review, stars } = reviewData;

            if (!user_id || !product_id || !review || !stars) {
                return reject(new Error('Все поля обязательны для заполнения'));
            }

            if (stars < 1 || stars > 5) {
                return reject(new Error('Оценка должна быть от 1 до 5 звезд'));
            }

            const query = `
            INSERT INTO reviews (user_id, product_id, review, stars)
            VALUES (?, ?, ?, ?)
        `;

            this.db.run(query, [user_id, product_id, review, stars], function(err) {
                if (err) {
                    if (err.message.includes('FOREIGN KEY constraint failed')) {
                        reject(new Error('Пользователь или товар не существует'));
                    } else {
                        reject(err);
                    }
                } else {
                    resolve({
                        id: this.lastID,
                        user_id,
                        product_id,
                        review,
                        stars,
                        message: 'Отзыв успешно добавлен'
                    });
                }
            });
        });
    }

    getAllShops() {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT
                id,
                address,
                phone,
                latitude,
                longitude,
                created_at
            FROM shops
            ORDER BY created_at DESC
        `;

            this.db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    createProduct(productData) {
        return new Promise((resolve, reject) => {
            const { name, price, description, image_url, category } = productData;

            if (!name || !price) {
                return reject(new Error('Название и цена товара обязательны'));
            }

            const query = `
            INSERT INTO products (name, price, description, image_url, category)
            VALUES (?, ?, ?, ?, ?)
        `;

            this.db.run(query, [name, price, description, image_url, category], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        name,
                        price,
                        description,
                        image_url,
                        category,
                        message: 'Товар успешно создан'
                    });
                }
            });
        });
    }

    createShop(shopData) {
        return new Promise((resolve, reject) => {
            const { address, phone, latitude, longitude } = shopData;

            if (!address) {
                return reject(new Error('Адрес магазина обязателен'));
            }

            const query = `
            INSERT INTO shops (address, phone, latitude, longitude)
            VALUES (?, ?, ?, ?)
        `;

            this.db.run(query, [address, phone, latitude, longitude], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        address,
                        phone,
                        latitude,
                        longitude,
                        message: 'Магазин успешно создан'
                    });
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Соединение с базой данных закрыто');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = Database;