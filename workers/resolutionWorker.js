const {Worker, parentPort, workerData} = require('worker_threads');

const analysisCreationQuery = `insert into Analyzed_Tube values (ID_Analyzed_Tube, Method, State, ID_Analyst_FK, ID_Aquired_Tubes_FK);`;

// Get working data
try {

    console.log("Analysis worker started");
    const options = workerData;
    console.log(`Worker Options:`);
    console.log(options);

    const connection = query.newWorkerConnection(options.workerIndex);

    // Read RawFile of acquisition

    // Read all indications

    // Read all analysis

    // Create new Analysis (analysis number 1)

    // Return results

    let result = 2; 
    parentPort.postMessage(result);

} catch(err){
    parentPort.postMessage({'error': err});
}