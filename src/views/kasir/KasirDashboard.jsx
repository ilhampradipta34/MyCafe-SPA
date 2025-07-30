import SummaryDashboardKasir from "./DashboardKasir/SummaryDashboard";
import TopDashboardKasir from "./DashboardKasir/TopDashboard";

export default function KasirDashboard() {
  return (
       <div className="bg-[#f5f5f5]">
          <TopDashboardKasir />
          <SummaryDashboardKasir />
        </div>
      )
  
}
