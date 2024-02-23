// const mongoose = require("mongoose");
// const opcua = require("node-opcua");

// // MongoDB connection setup
// mongoose.connect("mongodb://localhost:27017/axcend", { useNewUrlParser: true, useUnifiedTopology: true });
// const db = mongoose.connection;

// db.on("error", (error) => {
//     console.error("MongoDB connection error:", error);
// });

// db.once("open", () => {
//     console.log("Connected to MongoDB");

//     // Define the MongoDB schema and model
//     const sensorDataSchema = new mongoose.Schema({
//         timestamp: Date,
//         value: String, // Change the type based on your OPC UA data type
//     });
    
//     // Alarm schema
//     const alarmScheme = new mongoose.Schema({
//         timestamp: Date,
//         value: String, 
//         alarm: String,
//     });

//     const SensorData = mongoose.model("SensorData", sensorDataSchema);
//     const AlarmData = mongoose.model("AlarmData", alarmScheme);

//     // OPC UA connection setup
//     const endpointUrl = `opc.tcp://DESKTOP-LUO4FGD:53530/OPCUA/SimulationServer`;
//     const nodeIdToRead = "ns=3;i=1002";

//     const client = opcua.OPCUAClient.create({
//         endpointMustExist: false,
//         keepSessionAlive: true,
//         requestedSessionTimeout: 60000,
//     });

//     async function createSession() {
//         try {
//             await client.connect(endpointUrl);          

//             // Create a session
//             const session = await client.createSession();

//             // Read a node value
//             const dataValue = await session.read({
//                 nodeId: nodeIdToRead,
//                 attributeId: opcua.AttributeIds.Value,
//             });

//             // New alarm function
//             const value = dataValue.value.value.toString();
//             let alarm = "";
//             if (value < 5){
//                 console.log("low low Alarm");
//                 alarm = "lowlow";
//             }
//             else if ( 5 <= value <= 15) {
//                 console.log("low Alarm");
//                 alarm = "low";
//             } else if (15< value <= 25) {
//                 console.log("High Alarm");
//                 alarm = "High";
//             } else if (value >25) {
//                 console.log("high high Alarm");
//                 alarm = "highhigh";
//             }

//             // Print value
//             console.log("Value:", value);

//             // Save data to MongoDB
//             const newData = new SensorData({
//                 timestamp: new Date(),
//                 value: dataValue.value.value.toString(),
//             });

//             // Save data for alarm
//             const alarmdata = new AlarmData({
//                 timestamp: new Date(),
//                 value: dataValue.value.value.toString(),
//                 alarm: alarm,
//             });

//             await alarmdata.save();
//             console.log("Data for alarm: ", alarmdata);

//             await newData.save();
//             console.log("Data saved to MongoDB:", newData);

//             // Close the session
//             await session.close();

//             // Disconnect from the OPC UA server
//             await client.disconnect();

//             return AlarmData;
//         } catch (err) {
//             console.error("Error:", err);
//         }
//     }

//     // Function to run createSession at intervals
//     async function run() {
//         while (true) {
//             await createSession();
//             await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay
//         }
//     }

//     // Start the continuous execution
//     run();
//     module.exports = { createSession, AlarmData };
// });
