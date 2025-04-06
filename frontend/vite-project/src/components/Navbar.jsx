import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { useState } from "react";

const Navbar = () => {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="px-4 py-3 bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold hover:text-blue-200 transition duration-300">
            Futurebink
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {token ? (
              <>
                <Link to="/emailhistory" className="hover:text-blue-200 transition duration-300">
                  Email History
                </Link>
                <Link to="/schedule-email" className="hover:text-blue-200 transition duration-300">
                  Schedule Email
                </Link>
                <button
                  onClick={() => dispatch(logout())}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded-md transition duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200 transition duration-300">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-md transition duration-300"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-blue-600">
            <div className="flex flex-col space-y-3">
              {token ? (
                <>
                  <Link
                    to="/emailhistory"
                    className="hover:bg-blue-600 px-3 py-2 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Email History
                  </Link>
                  <Link
                    to="/schedule-email"
                    className="hover:bg-blue-600 px-3 py-2 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Schedule Email
                  </Link>
                  <button
                    onClick={() => {
                      dispatch(logout());
                      setIsMenuOpen(false);
                    }}
                    className="text-left px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hover:bg-blue-600 px-3 py-2 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;