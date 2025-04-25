import React, { useState, useEffect } from 'react';
import Doctorcard from './doctorcard';  
import './App.css';

const API_URL = 'https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json';  

function App() {
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        setData(data);  
        setLoading(false);  
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);  
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-center flex-col items-center">
        <div className="h-15 shadow-lg border-blue-600 border-2 bg-blue-600 rounded-xl  flex flex-row justify-between items-center mx-2 p-2 w-full">
          {/* Logo */}
          <div className="w-[250px] flex flex-row items-center justify-center">
            <img src="image.png" alt="logo" className="w-[30px] h-[30px] rounded-full m-2 border-2 border-white" />
            <h1 className="text-xl text-white font-bold">BAJAJA FINSERV</h1>
          </div>
        </div>

        {/* Cards Section */}
        <div className=" p-2 grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-3">
            {data.map((item, index) => (
              <Doctorcard key={index} data={item} />
            ))} 
        </div>
      </div>
    </>
  );
}

export default App;
