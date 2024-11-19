export const dbConfig = {
    host: process.env.DB_HOST || 'autorack.proxy.rlwy.net',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'qyVdhMoyvGMvzYJvJpEfIYrjvgdLuxon',
    port: process.env.DB_PORT || 40026,
    database: process.env.DB_NAME || 'railway'
}; 