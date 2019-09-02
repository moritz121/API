const {Worker, parentPort, workerData} = require('worker_threads');
const query = require('./query');

const analysisQuery = 'select (ID_Analyzed_Tube) from Analyzed_Tube;';
const resolutionQuery = '_';

// Get working data
try {

    console.log("Analysis worker started");
    const options = workerData;
    console.log(`Worker Options:`);
    console.log(options);

    const connection = query.newWorkerConnection(options.workerIndex);

    // Assign analyst role to worker

    let analystRole = (options.workerIndex % 2) + 1;

    // Get non analyzed acquisitions (by the same role)

    // Create anaysis

    // Generate random indications

    // Return results

    let result = 2; 
    parentPort.postMessage(result);

} catch(err){
    parentPort.postMessage({'error': err});
}