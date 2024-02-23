// server.js
const express = require('express');
const bodyparser = require('body-parser');
const morgan = require('morgan');
const {DateTime} = require('luxon')
const EventEmitter = require('events');
EventEmitter.defaultMaxListeners = 150; // Set the maximum number of listeners

const app = express();
app.listen(5000, () => {
  console.log('Server started on Port 5000');
});

app.use(morgan());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

const cors = require('cors');
app.use(cors());

const mongoose = require("mongoose");
const opcua = require("node-opcua");

// MongoDB connection setup
mongoose.connect("mongodb://localhost:27017/axcend", { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on("error", (error) => {
    console.error("MongoDB connection error:", error);
});

db.once("open", () => {
    console.log("Connected to MongoDB");

    // Define the MongoDB schema and model
    const sensorDataSchema = new mongoose.Schema({
        timestamp: Date,
        value: String, // Change the type based on your OPC UA data type
    });
    
    // Alarm schema
    const alarmScheme = new mongoose.Schema({
        timestamp: Date,
        value: String, 
        alarm: String,
    });

    //pressure schema
    const pressureSchema = new mongoose.Schema({
        timestamp: Date,
        value: String
    });

    const SensorData = mongoose.model("SensorData", sensorDataSchema);
    const AlarmData = mongoose.model("AlarmData", alarmScheme);

    const Pressure = mongoose.model("Pressure", pressureSchema);

    // OPC UA connection setup
    const endpointUrl = `opc.tcp://DESKTOP-LUO4FGD:53530/OPCUA/SimulationServer`;
    const nodeIdToRead = "ns=3;i=1002";
    const nodeIdToRead2 = "ns=3;i=1003";

    const client = opcua.OPCUAClient.create({
        endpointMustExist: false,
        keepSessionAlive: true,
        requestedSessionTimeout: 60000,
    });

    async function createSession() {
        try {
            await client.connect(endpointUrl);          

            // Create a session
            const session = await client.createSession();

            // Read a node value
            const dataValue = await session.read({
                nodeId: nodeIdToRead,
                attributeId: opcua.AttributeIds.Value,
            });
            // Read second node value
            const dataValue2 = await session.read({
                nodeId: nodeIdToRead2,
                attributeId: opcua.AttributeIds.Value,
            });

            // New alarm function for first value
            const value = dataValue.value.value.toString();
            let alarm = "";
            if (value < 5) {
                console.log("low low Alarm");
                alarm = "lowlow";
            } else if (5 <= value <= 15) {
                console.log("low Alarm");
                alarm = "low";
            } else if (15 < value <= 25) {
                console.log("High Alarm");
                alarm = "High";
            } else if (value > 25) {
                console.log("high high Alarm");
                alarm = "highhigh";
            }

            // New alarm function for second value
            const value2 = dataValue2.value.value.toString();
            // You can implement a similar alarm logic for the second value if needed

            // Print values
            console.log("Value:", value);
            console.log("Value2:", value2);

            // Save data to MongoDB
            const newData = new SensorData({
                timestamp: new Date(),
                value: value,
            });

            const newData2 = new Pressure({
                timestamp: new Date(),
                value: value,
                value2: value2,
            });

            // Save data for alarm
            const alarmdata = new AlarmData({
                timestamp: new Date(),
                value: value,
                alarm: alarm,
            });

            await alarmdata.save();
            console.log("Data for alarm: ", alarmdata);

            await newData.save();
            console.log("Data saved to MongoDB:", newData);

            await newData2.save();
            console.log("Data saved to MongoDB for Pressure:", newData2);

            // Close the session
            await session.close();

            // Disconnect from the OPC UA server
            await client.disconnect();

            app.get('/apil', async (req, res) => {
                try {
                    const alarmData = await AlarmData.find().sort({ timestamp: -1 }).limit(100);
                    res.json(alarmData);
                } catch (error) {
                    console.error('Error fetching alarm data:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
            });

            app.get('/bar', async (req, res) => {
                const sensor = await SensorData.find().sort({ timestamp: -1 }).limit(10);
                res.json(sensor);
            });

            app.get('/pressure', async (req, res) => {
                const pressureData = await Pressure.find().sort({ timestamp: -1 }).limit(10);
                res.json(pressureData);
            });

        } catch (err) {
            console.error("Error:", err);
            }
    }

            // Function to run createSession at intervals
        async function run() {
            while (true) {
                await createSession();
                await new Promise((resolve) => setTimeout(resolve, 2000)); // 10-second delay
            }
        }

    // Start the continuous execution
    run();
});