// Navbar.jsx
import { Menu, School } from "lucide-react";
import React, { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import DarkMode from "@/DarkMode";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

import {
  BookOpen,
  User,
  LogOut,
  LogIn,
  UserPlus,
  LayoutDashboard,
  ChartBar,
  Users,
  BookOpenCheck,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Separator } from "./ui/separator";
import { useState } from "react";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    await logoutUser();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "User logged out.");
      navigate("/login");
    }
  }, [isSuccess]);

  return (
    <div className="h-16 dark:bg-[#020817] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-50">
      {/* Desktop Navbar */}
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center px-6 h-full">
        <div className="flex items-center gap-2">
          <School size={30} />
          <Link to="/">
            <h1 className="font-extrabold text-2xl">E-Learning</h1>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src={user?.photoUrl || "https://github.com/shadcn.png"}
                    alt="user"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/my-learning">My Learning</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Edit Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logoutHandler}>
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                {user?.role === "instructor" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/login")}>Signup</Button>
            </div>
          )}
          <DarkMode />
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="flex md:hidden items-center justify-between px-4 h-full">
        <Link to="/">
          <h1 className="font-extrabold text-2xl">E-Learning</h1>
        </Link>
        <MobileNavbar user={user} logoutHandler={logoutHandler} />
      </div>
    </div>
  );
};

export default Navbar;

// Separate mobile navbar component
const MobileNavbar = ({ user, logoutHandler }) => {
  const navigate = useNavigate();
  const [showDashboardDropdown, setShowDashboardDropdown] = useState(false);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex flex-col gap-6 p-6 backdrop-blur-lg border-l dark:border-gray-700 bg-white/90 dark:bg-[#0f172a]/80"
      >
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
            <Link to="/">E-Learning</Link>
          </SheetTitle>
          <DarkMode />
        </SheetHeader>

        <Separator className="my-2" />

        {user ? (
          <div className="flex flex-col gap-3">
            <SheetClose asChild>
              <Link
                to="/my-learning"
                className="w-full px-4 py-2 rounded-lg flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-all font-medium"
              >
                <BookOpen size={18} /> My Learning
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link
                to="/profile"
                className="w-full px-4 py-2 rounded-lg flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-all font-medium"
              >
                <User size={18} /> Edit Profile
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-2 rounded-lg flex items-center gap-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-all font-medium"
                onClick={logoutHandler}
              >
                <LogOut size={18} /> Log Out
              </Button>
            </SheetClose>

            {user?.role === "instructor" && (
              <div>
                <Button
                  type="button"
                  className="w-full rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow flex items-center gap-2 justify-between"
                  onClick={() =>
                    setShowDashboardDropdown(!showDashboardDropdown)
                  }
                >
                  <LayoutDashboard size={18} /> Dashboard
                </Button>

                {showDashboardDropdown && (
                  <div className="mt-2 ml-2 flex flex-col gap-2">
                    <SheetClose asChild>
                      <Link
                        to="/admin/dashboard"
                        className="px-4 py-2 flex items-center gap-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-sm text-gray-800 dark:text-gray-100"
                      >
                        <ChartBar size={16} /> Overview
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link
                        to="/admin/course"
                        className="px-4 py-2 flex items-center gap-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-sm text-gray-800 dark:text-gray-100"
                      >
                        <BookOpenCheck size={16} /> Courses
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link
                        to="/admin/userdata"
                        className="px-4 py-2 flex items-center gap-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-sm text-gray-800 dark:text-gray-100"
                      >
                        <Users size={16} /> Users
                      </Link>
                    </SheetClose>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <SheetClose asChild>
              <Button
                variant="outline"
                className="w-full rounded-lg flex items-center gap-2 justify-center hover:border-indigo-500 transition-all"
                onClick={() => navigate("/login")}
              >
                <LogIn size={18} /> Login
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button
                className="w-full rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow flex items-center gap-2 justify-center"
                onClick={() => navigate("/login")}
              >
                <UserPlus size={18} /> Signup
              </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
