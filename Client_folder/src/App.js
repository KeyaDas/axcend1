import React, { useEffect, useState } from 'react';
import './App.css';
import { Line } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import {chart as Chartjs} from 'chart.js/auto';
import moment from 'moment';

function App() {
  const [page, setpage] = useState('With Graph');

  const [alarmData, setAlarmData] = useState([]);
  const [sensor, setsensor] = useState([]);
  const [pressure, setPressure] = useState([]);

  const [linechart, setlinechart] = useState({
    labels: [],
    datasets: [{
      label: 'progress',
      data: [],
      backgroundColor: ['rgba(200, 10, 25, 0.6)']
    }],
  });

  const [linechart2, setlinechart2] = useState({
    labels: [],
    datasets: [{
      label: 'progress',
      data: [],
      backgroundColor: ['rgba(200, 10, 25, 0.6)']
    }],
  });

  const [chart2, setchart2] = useState({
    labels: [],
    datasets: [{
      label:'per day rate',
      data:[],
      backgroundColor: [
        'rgba(120, 0, 255, 0.6)',
        'rgba(200, 0, 55, 0.6)',
        'rgba(0, 255, 255, 0.6)'
      ],
      borderWidth: 1
    }]
  });

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/apil');
      const data = await response.json();
      setAlarmData(data);

      const response2 =await fetch('http://localhost:5000/bar');
      const bar = await response2.json();
      setsensor(bar);

      const response3 = await fetch('http://localhost:5000/pressure');
      const data2 = await response3.json();
      setPressure(data2);

    } catch (error) {
      console.error('Error fetching alarm data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData();
    }, 2000); // 
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

//LINE CHART
  useEffect(() => { // Added useEffect to update linechart when alarmData changes
    setlinechart({
      labels: alarmData.map((dataPoint) => new Date(dataPoint.timestamp).toLocaleString()),
      datasets: [{
        label: 'progress',
        data: alarmData.map((dataPoint) => dataPoint.value),
      }],
    });
  }, [alarmData]);

//BAR CHART
  useEffect(()=>{
    setchart2({
      labels: sensor.map((sensorPoint)=>  moment(sensorPoint.timestamp).format('MMMM Do YYYY')),
      datasets: [{
        label: 'per day rate',
        data: sensor.map((sensorPoint) => sensorPoint.value),
      }],
    });
  }, [sensor]);

  //LINE CHART2
  useEffect(() => { // Added useEffect to update linechart when alarmData changes
    setlinechart2({
      labels: pressure.map((dataPoint2) => new Date(dataPoint2.timestamp).toLocaleString()),
      datasets: [{
        label: 'progress',
        data: pressure.map((dataPoint2) => dataPoint2.value),
      }],
    });
  }, [pressure]);

  

  return (
    <div className='body'>
      <div className='submit'>
        <div className='Head'>{page}</div>
      </div> 

      <div className='submit-container'>
        <div className={page==="Data"?"btn grey":"btn"} onClick={()=> {setpage('Data')}}>Data</div>
        <div className={page==="With Graph"?"btn grey":"btn"} onClick={()=> {setpage('With Graph')}}>With Graph</div>
      </div>


      <div className='container'>
        <p className='header'><h2>Alarm Data</h2></p>
        <p className='header'><h2>Avarage Values of Days</h2></p>
      </div>
      <div className='container'>        
        <div className="alarm">
        
        <ul>
          {alarmData.map((dataPoint) => (
            <li key={dataPoint._id}>
            <p>Timestamp: { new Date(dataPoint.timestamp).toLocaleString()} 
              <b><span>  Value: {dataPoint.value}</span>
              <span id="alert">Alarm: {dataPoint.alarm}</span></b></p>
            </li>
          ))}
        </ul>
        </div>
        
        <div className="alarm">
        
        <ul>
          {sensor.map((sensorPoint) => (
            <li key={sensorPoint._id}>
            <p>Timestamp: {moment(sensorPoint.timestamp).format('MMMM Do YYYY')}
              <span><b>   Value: {sensorPoint.value}</b> </span></p>
            </li>
          ))}
        </ul>
        </div>
      </div>
      {page==="Data"?<div></div>:<div className='container'>
        <div className="chart">
          <Line data={linechart} />
        </div>
        <div className="chart">
          <Bar data={chart2} />
        </div>
      </div>}
      
      <div className='container'>
        <p className='header'><h2>Pressure Data</h2></p>
      </div>
      <div className='container'>
      <div className="alarm">        
        <ul>
          {pressure.map((dataPoint2) => (
            <li key={dataPoint2._id}>
            <p>Timestamp: {moment(dataPoint2.timestamp).format('MMMM Do YYYY')}
              <span><b>   Value: {dataPoint2.value}</b> </span></p>
            </li>
          ))}
        </ul>
        </div>
        {page==='Data'?<div></div>:
        <div className="chart">
          <Line data={linechart2} />
        </div>}
      </div>
      
      
    </div>
  
  );
}

export default App;