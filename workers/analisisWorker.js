const {Worker, parentPort, workerData} = require('worker_threads');
const query = require('./query');

const analysisQuery = 'select (ID_Analyzed_Tube) from Analyzed_Tube;';
const resolutionQuery = '_';

// Get working data
try {

    console.log("Analysis worker started");

    const data = workerData;

    const connection = query.newWorkerConnection(data[1]);
    console.log("Processing data -> "+data);

    // Return results

    let result = 2; 
    parentPort.postMessage(result);

} catch(err){
    parentPort.postMessage({'error': err});
}