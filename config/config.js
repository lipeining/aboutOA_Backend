module.exports = {
    // development: {
    //     dialect: "sqlite",
    //     storage: "./db.development.sqlite"
    // },
    // test: {
    //     dialect: "sqlite",
    //     storage: ":memory:"
    // },
    production: {
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'admin',
        database: process.env.DB_NAME || 'aboutoa',
        host: process.env.DB_HOSTNAME || 'mysql',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
    }
};