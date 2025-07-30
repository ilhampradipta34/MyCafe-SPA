import { useEffect, useState } from "react";

export default function TopDashboard() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      setCurrentTime(now.toLocaleDateString("id-ID", options));
    };

    updateDateTime(); // initial call
    const interval = setInterval(updateDateTime, 1000); // update every second

    return () => clearInterval(interval); // cleanup on unmount
  }, []);
  
  return (
    <div className="flex items-center justify-between mx-2">
      <div>
        <h2 className="text-xl font-bold text-[#1976d2]">Dashboard Summary</h2>
        <h5 className="text-sm font-bold text-gray-400">
          Manage your dashboard summary
        </h5>
      </div>
      <div className="flex justify-end">
        <p className="text-sm font-bold text-gray-400">{currentTime}</p>
      </div>
    </div>
  );
}
