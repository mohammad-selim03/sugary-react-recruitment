import { Link, Outlet, useLocation } from "react-router";
import { FaBoxOpen } from "react-icons/fa";
import { FiLogOut, FiX } from "react-icons/fi";
import Sidebar from "../components/Sidebar";

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center ">
          <h1 className="text-xl font-semibold text-gray-800 capitalize pl-14 lg:pl-0">
            {pathname.slice(1) || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring w-64 hidden md:flex"
              aria-label="Search"
            />
            <img
              src="/user.png"
              alt="User"
              className="w-10 h-10 rounded-full border border-gray-200"
              loading="lazy"
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
 
      
    </div>
  );
}
