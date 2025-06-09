import { ChartNoAxesColumn, SquareLibrary, User } from "lucide-react";
import React from "react";
import { Link, Outlet } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="hidden lg:block w-[250px] sm:w-[300px] p-6 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 shadow-sm min-h-screen">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            📊 Admin Panel
          </h2>

          <nav className="space-y-3">
            <Link
              to="dashboard"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
            >
              <ChartNoAxesColumn size={20} />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>

            <Link
              to="course"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
            >
              <SquareLibrary size={20} />
              <span className="text-sm font-medium">Courses</span>
            </Link>

            <Link
              to="userdata"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
            >
              <User size={20} />
              <span className="text-sm font-medium">Users</span>
            </Link>
          </nav>
          <div className="mt-auto text-xs text-center text-gray-400 dark:text-gray-600">
            © {new Date().getFullYear()} codewithanuj.com
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50 dark:bg-zinc-950 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default Sidebar; 