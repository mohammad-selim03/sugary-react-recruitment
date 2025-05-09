import { Link, useLocation } from "react-router";
import { FaHome, FaShoppingCart, FaHeart, FaBoxOpen } from "react-icons/fa";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { FiLogOut, FiX } from "react-icons/fi";
import { useState } from "react";

const Sidebar = () => {
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: <FaHome /> },
    { to: "/materials", label: "Materials", icon: <FaBoxOpen /> },
    { to: "/cart", label: "Cart", icon: <FaShoppingCart /> },
    { to: "/favourite", label: "Favourite", icon: <FaHeart /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.reload();
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);
  return (
    <div>
      <aside
        className={`lg:w-64 w-64 h-screen bg-white border-r border-gray-200 shadow-sm p-5 flex flex-col ${
          isSidebarOpen ? "block" : "hidden"
        } lg:block`}
      >
        <h2 className="text-2xl font-bold text-blue-600 mb-6">MyShop</h2>
        <div className="flex flex-col items-start justify-between h-[90%]">
          <nav className="flex-1 space-y-2 w-full">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeSidebar} // Close sidebar on link click
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition w-full ${
                  pathname === link.to
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-label={link.label}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="flex items-center pl-3 gap-2 cursor-pointer text-red-500 mt-auto hover:underline"
            aria-label="Log out"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </aside>
      <button
        className="lg:hidden absolute top-6 left-4 text-blue-600"
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
      >
        <HiOutlineMenuAlt2 size={24} />
      </button>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed h-screen  inset-0 bg-white z-10 shadow-lg p-5 space-y-4 ${
          isSidebarOpen ? "block" : "hidden"
        } transition-all`}
      >
        <div className="flex justify-between items-center w-[80%] overflow-hidden">
          <h2 className="text-2xl font-bold text-blue-600 mb-6">MyShop</h2>
          <button onClick={closeSidebar} className="text-gray-700">
            <FiX size={24} />
          </button>
        </div>
        <div className="flex flex-col items-start justify-between w-[50%] h-[90%]">
          <nav className="space-y-2 w-full">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeSidebar}  
                className={`flex items-center w-full gap-3 px-3 py-2 rounded-lg transition ${
                  pathname === link.to
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-label={link.label}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 pl-3 cursor-pointer text-red-500 mt-auto hover:underline"
            aria-label="Log out"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
