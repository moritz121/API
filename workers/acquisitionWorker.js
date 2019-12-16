const {Worker, parentPort, workerData} = require('worker_threads');
const query = require('../query');
const fs = require('fs');

const lockQuery = `lock tables Tube write;`
const acquisitionQuery = `select ID_Tube from Tube as t where not exists ( select * from Acquired_Tubes as acqT where acqT.ID_Acquired_Tubes = t.ID_Tube);`; //Check
const unlockQuery = `unlock tables;`;

try {
    const run = async () => {
        console.log("Acquisition worker started");
        const options = workerData;
        console.log(`Worker Options:`);
        console.log(options);

        const connection = query.newWorkerConnection(options.workerIndex);

        // Get current date for queries

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        
        today = yyyy + '-' + mm + '-' + dd;

        // Get all tubes and select one to acquire

        let results = await query.queryDB(acquisitionQuery, connection);
        let tube2acquire = results[0].ID_Tube;

        while (results.length > 0) {

            console.log(`Tube selected for worker ${options.workerIndex}: ${tube2acquire}`);

            // Try to generate calibration for the acquisition ( roundDown(ID_Tube/5) + 1 ) 

            let calID = Math.floor(tube2acquire/5) + 1;
            const calibrationCreationQuery = `insert into Calibration values (${calID}, "${today}", "Equipment${calID}", 1);` //Check

            let rawFile = `/home/moritz121/Desktop/API_Files/${tube2acquire}.txt`;

            if((tube2acquire%5) == 0) {
                await query.queryDB(calibrationCreationQuery, connection).catch( () => { console.log(`Cal already created`);});
                console.log(`Calibration created by ${options.workerIndex}`);
            } 

            // Create acqTube

            await query.queryDB(`insert into Acquired_Tubes values(${tube2acquire}, "${today}", "${rawFile}", ${tube2acquire}, ${calID});`, connection).then( async () => {

                // Generate File

                fs.writeFile(rawFile, "Hello there", function(err) {
                    if(err) {
                        return console.log(`Error in file writer --> \n ${err}`)
                    }
                    console.log(`File saved by ${options.workerIndex}`);
                });

                // Wait random time 

                await sleep(Math.floor(Math.random() * (options.tMax - options.tMin + 1) + options.tMin));
                console.log(`Timeout done!  by ${options.workerIndex}`);

            }).catch( (e) => {
                console.log(`Tube ${tube2acquire} taken, ${options.workerIndex} moving on with error: ${e}`);
            });

            // Check if any work left

            results = await query.queryDB(acquisitionQuery, connection);

            if(results.length > 0) {
                tube2acquire = results[0].ID_Tube;
            }



        }

        // Return results

        let result = 2; 
        connection.destroy();
        parentPort.postMessage(result);
    }
    run();

} catch(err){
    parentPort.postMessage({'error': err});
}

function sleep(t) {
    return new Promise((resolve) => setTimeout(resolve, t));
}