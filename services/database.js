import mysql from 'mysql2/promise';

class DatabaseService {
    static async connect({ host, user, password, database, port }) {
        return await mysql.createConnection({
            host,
            user,
            password,
            database,
            port
        });
    }

    static async getTables(connection) {
        const [rows] = await connection.query('SHOW TABLES');
        return rows.map(row => Object.values(row)[0]);
    }

    static async queryTable(connection, table, page = 1, pageSize = 10) {
        const offset = (page - 1) * pageSize;
        
        // 获取总记录数
        const [countResult] = await connection.query(`SELECT COUNT(*) as total FROM ${table}`);
        const total = countResult[0].total;
        
        // 获取数据
        const [rows] = await connection.query(`SELECT * FROM ${table} LIMIT ? OFFSET ?`, [pageSize, offset]);
        
        return {
            data: rows,
            total,
            page,
            pageSize
        };
    }
}

export { DatabaseService }; 