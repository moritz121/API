const {Worker, parentPort, workerData} = require('worker_threads');
const query = require('./query');

const analysisQuery = `select * from Aquired_Tubes as acqT where not exists (select * from Analyzed_Tube as anT where anT.ID_Analyzed_Tube = 1 and anT.ID_Aquired_Tubes_FK = acqT.ID_Aquired_Tubes);`;
const analysisCreationQuery = `insert into Analyzed_Tube values (ID_Analyzed_Tube, Method, State, ID_Analyst_FK, ID_Aquired_Tubes_FK);`;
const indicationCreationQuery = `insert into Indication values (ID_Indication, IndDate, Position, type, ID_Analyzed_Tube_FK);`;

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