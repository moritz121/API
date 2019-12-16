const {Worker, parentPort, workerData} = require('worker_threads');
const query = require('../query');
const fs = require('fs');

const acquisitionQuery = `select * from Acquired_Tubes;`; //Check
const indicationQuery = `select * from Indication;`; //Check
const analysisQuery = `select * from Analyzed_Tube;`; //Check

try {


    const run = async () => {
        console.log("Resolution worker started");
        const options = workerData;
        console.log(`Worker Options:`);
        console.log(options);

        const connection = query.newWorkerConnection(options.workerIndex);

        // Read RawFile of acquisition

        let results = await query.queryDB(acquisitionQuery, connection);
        let iaux = 0;
        let acqFile2read;

        while(iaux < results.length) {


            acqFile2read = results[iaux].RawFile;

            // Read

            fs.readFile(`${acqFile2read}`, function read(err, data) {
                if (err) {
                    throw err;
                }
            });

            iaux++;

        }


        // Read all indications

        results = await query.queryDB(indicationQuery, connection);
        iaux = 0;
        let ind2read;

        while(iaux < results.length) {


            ind2read = results[iaux].ID_Indication;

            // Read

            iaux++;

        }

        // Read all analysis

        results = await query.queryDB(analysisQuery, connection);
        iaux = 0;
        let an2read;

        while(iaux < results.length) {


            an2read = results[iaux].ID_Analyzed_Tube;

            // Read

            iaux++;

        }
        
        // Create new Analysis (analysis number 1)

        const analysisCreationQuery = `insert into Analyzed_Tube (ID_Analyzed_Tube, Method, State, ID_Analyst_FK) values (3, 'Resolution', 'Resolution', ${options.workerIndex});`; 

        await query.queryDB(analysisCreationQuery, connection).catch((e) => {
            console.log(`Error creating resolution: ${e}`);
        });

        // Return results

        let result = 2; 
        connection.destroy();
        parentPort.postMessage(result);
    }
    run();

} catch(err){
    parentPort.postMessage({'error': err});
}