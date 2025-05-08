import { Link, Outlet, useLocation } from 'react-router';
import { FaHome, FaBoxOpen, FaShoppingCart } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';

export default function Layout() {
  const { pathname } = useLocation();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { to: '/cart', label: 'Cart', icon: <FaShoppingCart /> },
    { to: '/orders', label: 'Orders', icon: <FaBoxOpen /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm p-5 flex flex-col">
        <h2 className="text-2xl font-bold text-blue-600 mb-6">MyShop</h2>
        <nav className="flex-1 space-y-2">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                pathname === link.to ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
        <button className="flex items-center gap-2 text-red-500 mt-auto hover:underline">
          <FiLogOut />
          Logout
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800 capitalize">{pathname.slice(1) || 'Dashboard'}</h1>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring w-64"
            />
            <img
              src="https://i.pravatar.cc/40"
              alt="User"
              className="w-10 h-10 rounded-full border"
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
