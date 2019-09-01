const {Worker, parentPort, workerData} = require('worker_threads');
const query = require('../query');

const workerQuery = 'select (ID_Tube) from Tube;';
const analysisQuery = 'select (ID_Acquired_Tubes) from Acquired_Tubes;';
const resolutionQuery = '_';

try {
    const run = async () => {
        console.log("Adquisition worker started");
        const options = workerData;
        console.log(`Worker Options:`);
        console.log(options);

        const connection = query.newWorkerConnection(options.workerIndex);

        let tubeArray = [];

        let results = await query.queryDB(workerQuery, connection);

        for(let i = 0; i<Object.keys(results).length; i++) {
            tubeArray.push(results[i].ID_Tube);
        }

        console.log(`Tube array for ${options.workerIndex}: ${tubeArray}`);

        // Wait random time 

        await sleep(Math.floor(Math.random() * (options.tMax - options.tMin + 1) + options.tMin));
        console.log('Timeout done!');

        // Return results

        let result = 2; 
        connection.end();
        parentPort.postMessage(result);
    }
    run();

} catch(err){
    parentPort.postMessage({'error': err});
}

function sleep(t) {
    return new Promise((resolve) => setTimeout(resolve, t));
}