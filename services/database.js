const mysql = require('mysql2');

class DatabaseService {
    static async connect(config) {
        const connection = mysql.createConnection({
            ...config,
            port: config.port || 3306
        });
        
        return new Promise((resolve, reject) => {
            connection.connect((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(connection);
            });
        });
    }

    static async getTables(connection) {
        return new Promise((resolve, reject) => {
            connection.query('SHOW TABLES', (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results);
            });
        });
    }

    static async queryTable(connection, table, page = 1, pageSize = 10) {
        return new Promise((resolve, reject) => {
            // 先获取总记录数
            connection.query(`SELECT COUNT(*) as total FROM ${table}`, (err, countResult) => {
                if (err) {
                    reject(err);
                    return;
                }

                const offset = (page - 1) * pageSize;
                const query = `SELECT * FROM ${table} LIMIT ${offset}, ${pageSize}`;
                
                connection.query(query, (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve({
                        data: results,
                        total: countResult[0].total,
                        page,
                        pageSize,
                        totalPages: Math.ceil(countResult[0].total / pageSize)
                    });
                });
            });
        });
    }
}

module.exports = DatabaseService; 