const {Worker, parentPort, workerData} = require('worker_threads');
const query = require('../query');
const fs = require('fs');

const acquisitionQuery = 'select (ID_Tube) from Tube;';                     // That don't have an acquisition
const analysisQuery = 'select (ID_Acquired_Tubes) from Acquired_Tubes;';
const resolutionQuery = '_';

try {
    const run = async () => {
        console.log("Adquisition worker started");
        const options = workerData;
        console.log(`Worker Options:`);
        console.log(options);

        const connection = query.newWorkerConnection(options.workerIndex);

        // Get all tubes and select one to acquire

        let results = await query.queryDB(acquisitionQuery, connection);
        let tube2acquire = results[0].ID_Tube;

        console.log(`Tube selected for worker ${options.workerIndex}: ${tube2acquire}`);

        // Acquire the selected tube (create acquisition with ID_Tube = ID_Acquisition)

        // Try to generate calibration for the acquisition ( roundDown(ID_Tube/5) + 1 ) 

        // Generate File

        fs.writeFile(`../API_Files/acquisition${tube2acquire}.txt`, "Hello there", function(err) {
            if(err) {
                return console.log(`Error in file writer --> \n ${err}`)
            }
            console.log('File saved');
        });

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