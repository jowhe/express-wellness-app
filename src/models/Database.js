const database = require('../config/database');

class Database{
    constructor(){
        this.db = database;
    }
    //Example: insert("INSERT INTO users (email, password) VALUES (?, ?)", [email, password]);
    async insert(sql, value){
        if(!sql.includes('INSERT'))
            return 'Invalid SQL Query';

        if(value!== null){
            const [result] = await this.db.query(sql, value);
            return [result];
        }

       const [result] = await this.db.query(sql); 
       return [result];
    }
    // Example: update("UPDATE users SET email = ? WHERE id = ?", [email, id]);
    async select(sql, value = null){
        if(!sql.includes('SELECT'))
            return 'Invalid SQL Query';

        if(value!== null){
            const [result] = await this.db.query(sql, value);
            return [result];
        }

       const [result] = await this.db.query(sql); 
       return [result];
    }

    // Example: delete("DELETE FROM users WHERE id = ?", id);
    async delete(sql, value){
        if(!sql.includes('DELETE'))
            return 'Invalid SQL Query';

        if(value!== null){
            const [result] = await this.db.query(sql, value);
            return [result];
        }

       const [result] = await this.db.query(sql); 
       return [result];
    }

    // Example: update("UPDATE users SET (email = ?) WHERE id = ?", [email, id]);
    async update(sql, value = null){
        if(!sql.includes('UPDATE'))
            return 'Invalid SQL Query';

        if(value !== null)
            return await this.db.query(sql, value);

        return await this.db.query(sql);
    }
}

module.exports = Database;