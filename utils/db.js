import mysql from 'mysql2/promise';
import { dbConfig } from '../config/database.js';

export async function createConnection() {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('SET time_zone = SYSTEM');
    return connection;
} 