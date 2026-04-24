import mysql from "mysql2/promise"

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'duydat@123',
    database: 'emiuBKfarm'
})

export default db;