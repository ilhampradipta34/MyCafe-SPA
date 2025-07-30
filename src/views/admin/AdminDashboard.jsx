import SummaryDashboard from "./Dashboard/SummaryDashboard";
import TopDashboard from "./Dashboard/TopDashboard";

export default function AdminDashboard() {
  return (
    <div className="bg-[#f5f5f5]">
      <TopDashboard />
      <SummaryDashboard />
    </div>
  )
}
