import React, { useEffect, useState } from "react";
import { fetchData } from "./api"; // Import API function

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then((result) => {
      if (result) setData(result);
    });
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {data ? <p>Data from Flask: {JSON.stringify(data)}</p> : <p>Loading...</p>}
    </div>
  );
}

export default Dashboard;