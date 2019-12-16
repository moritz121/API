const mysql = require('mysql');

// Functions

module.exports = {
    queryDB: function(query, connection) {
        return new Promise((resolve, reject) => { 
            connection.query(query, function (error, results, fieldds) {
                if (error) reject("Query promise rejected -> "+error);
                resolve(results);    
            });
        });
    },
    newWorkerConnection: function(worker) {

        const workerConnection = mysql.createConnection({
            host: 'localhost',
            user: `${worker}`,
            password: 'rootroot',
            database: 'DB_NUCLEAR',
            connectionLimit: 50,
            acquireTimeout: 1000000,
            queueLimit: 200

        });
        workerConnection.connect(function(err) {
            if (err) {
                console.error(`Worker ${worker} error connecting: ${err.stack}`);
                return;
            }           
            console.log(`Worker ${worker} connected as id  ${workerConnection.threadId}`);
        });
        return workerConnection;
    }
}
