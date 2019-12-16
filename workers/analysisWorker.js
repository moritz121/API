const {Worker, parentPort, workerData} = require('worker_threads');
const query = require('../query');

const highestIndicationQuery = `select max(ID_Indication) as x from Indication`;

// Get working data
try {

    const run = async () => {
        console.log("Analysis worker started");
        const options = workerData;
        console.log(`Worker Options:`);
        console.log(options);

        // Get current date for queries

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        
        today = yyyy + '-' + mm + '-' + dd;

        const connection = query.newWorkerConnection(options.workerIndex);

        // Assign analyst role to worker

        let analystRole = (options.workerIndex % 2);

        // Get non analyzed acquisitions (by the same role)

        const analysisQuery = `select * from Acquired_Tubes as acqT where not exists (select * from Analyzed_Tube as anT where anT.ID_Analyzed_Tube = CONCAT(CAST(acqT.ID_Acquired_Tubes as CHAR(10)),${analystRole}) and anT.ID_Acquired_Tubes_FK = acqT.ID_Acquired_Tubes);`;

        let results = await query.queryDB(analysisQuery, connection);
        acq2analyze = results[0].ID_Acquired_Tubes;

        while(results.length > 0) {

            console.log(`acqTube selected for worker ${options.workerIndex}: ${acq2analyze}`);

            // Create anaysis

            await query.queryDB(`insert into Analyzed_Tube values (CONCAT('${acq2analyze}','${analystRole}'), 'Method', 'State', ${options.workerIndex}, ${acq2analyze});`, connection).then( async () => {

            console.log(`anTube created by worker ${options.workerIndex}: ${acq2analyze}${analystRole}`);

            // Generate random indications

            let rnd = Math.floor(Math.random() * (4 - 0 + 1) + 0);

            for(let i = 0; i < rnd; i++) {
                let indIdaux = await query.queryDB(highestIndicationQuery, connection);
                console.log(`---------------->1`);
                console.log(indIdaux);
                let indId = indIdaux[0].x;
                console.log(`---------------->2`);
                console.log(`${indId + 1}`);
                let rndaux = Math.floor(Math.random() * (100 - 0 + 1) + 0);
                await query.queryDB(`insert into Indication values (${indId + 1}, '${today}', ${rndaux}, 'A', CONCAT('${acq2analyze}','${analystRole}'));`, connection);
                console.log(`Indication created by worker ${options.workerIndex}: ${indId + 1}`);
            }

        }).catch((e) => {
            console.log(`acqTube ${acq2analyze} taken, ${options.workerIndex} moving on after error: {e}`);
        });

        // Check if more acq to be analyzed

        results = await query.queryDB(analysisQuery, connection);

        if(results.length > 0) {
            acq2analyze = results[0].ID_Acquired_Tubes;
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