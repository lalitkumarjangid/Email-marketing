import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Home = () => {
  const token = useSelector((state) => state.auth.token);

  return (
    <div className="min-h-[calc(100vh-76px)] bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            Create Powerful <span className="text-blue-600">Email Marketing</span> Campaigns
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Design and schedule automated email sequences with our intuitive visual builder. 
            Reach your audience at the perfect time without any coding knowledge.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {!token ? (
              <>
                <Link
                  to="/register"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center shadow-md hover:shadow-lg transition duration-300"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 bg-white hover:bg-gray-100 text-blue-600 font-medium rounded-lg text-center border border-blue-600 transition duration-300"
                >
                  Log In
                </Link>
              </>
            ) : (
              <Link
                to="/schedule-email"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center shadow-md hover:shadow-lg transition duration-300"
              >
                Create New Campaign
              </Link>
            )}
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Sequence Builder</h3>
            <p className="text-gray-600">Create complex email sequences with our intuitive drag-and-drop interface.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Smart Scheduling</h3>
            <p className="text-gray-600">Set the perfect delivery time based on your audience's engagement patterns.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Performance Analytics</h3>
            <p className="text-gray-600">Track open rates, clicks, and conversions with detailed visual reports.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;