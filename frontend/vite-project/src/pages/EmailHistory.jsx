import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const EmailHistory = () => {
  const [scheduledEmails, setScheduledEmails] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      toast.error("Please log in to access this page");
      return;
    }
    fetchScheduledEmails(token);
    const intervalId = setInterval(() => fetchScheduledEmails(token, true), 30000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  const fetchScheduledEmails = async (token, isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) setRefreshing(true);
      const response = await axios.get("https://email-marketingbackend01.vercel.app/api/emails/allmails", { 
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.data) {
        setScheduledEmails(response.data.data);
        if (!isAutoRefresh) toast.success("Email list refreshed");
      }
    } catch (error) {
      console.error("Error fetching scheduled emails:", error);
      if (!isAutoRefresh) toast.error("Failed to refresh email list");
    } finally {
      if (!isAutoRefresh) setRefreshing(false);
    }
  };

  const manualRefresh = () => {
    const token = localStorage.getItem("token");
    if (token) fetchScheduledEmails(token);
  };

  const filteredEmails = scheduledEmails
    .filter(email => {
      if (filter === "all") return true;
      return email.status === filter;
    })
    .filter(email => 
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <Toaster position="top-right" />
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-0">Email Campaign History</h1>
            <Link 
              to="/schedule-email"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Campaign
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by subject or email..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent</option>
                <option value="paused">Paused</option>
                <option value="failed">Failed</option>
              </select>
              
              <button 
                onClick={manualRefresh} 
                disabled={refreshing} 
                className={`${refreshing ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} text-white px-4 py-2 rounded-md transition flex items-center gap-2 shadow-sm whitespace-nowrap`}
              >
                <svg className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
            </div>
          </div>

          {filteredEmails.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
              <svg className="mx-auto h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                {searchTerm || filter !== "all" ? "No matching emails found" : "No Emails Scheduled"}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {searchTerm || filter !== "all" ? 
                  "Try adjusting your search or filter criteria" : 
                  "Start by creating a new email sequence in the builder."}
              </p>
              {(searchTerm || filter !== "all") && (
                <button 
                  onClick={() => {
                    setSearchTerm("");
                    setFilter("all");
                  }}
                  className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Recipient</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Scheduled For</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmails.map((email) => (
                    <tr key={email._id} className="hover:bg-blue-50 transition">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{email.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{email.subject}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{new Date(email.scheduledAt).toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          email.status === "scheduled" ? "bg-yellow-100 text-yellow-800" : 
                          email.status === "sent" ? "bg-green-100 text-green-800" : 
                          email.status === "paused" ? "bg-purple-100 text-purple-800" : 
                          "bg-red-100 text-red-800"
                        }`}>
                          {email.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
            <p>Auto-refreshes every 30 seconds</p>
            <p>Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailHistory;