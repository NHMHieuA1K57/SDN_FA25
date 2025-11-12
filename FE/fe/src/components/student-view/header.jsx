import { GraduationCap, TvMinimalPlay, User, LogOut, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

function StudentViewCommonHeader() {
    const navigate = useNavigate();
    const { resetCredentials, auth } = useContext(AuthContext);

    function handleLogout() {
        resetCredentials();
        sessionStorage.clear();
        navigate("/auth");
    }

    function handleProfileClick() {
        navigate("/profile");
    }

    return (
        <header className="flex items-center justify-between p-4 border-b relative">
            <div className="flex items-center space-x-4">
                <Link to="/home" className="flex items-center hover:text-black">
                    <GraduationCap className="h-8 w-8 mr-4 " />
                    <span className="font-extrabold md:text-xl text-[14px]">LMS LEARN</span>
                </Link>
                <div className="flex items-center space-x-1">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            location.pathname.includes("/courses") ? null : navigate("/courses");
                        }}
                        className="text-[14px] md:text-[16px] font-medium"
                    >
                        Explore Courses
                    </Button>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex gap-4 items-center">
                    <div
                        onClick={() => navigate("/student-courses")}
                        className="flex cursor-pointer items-center gap-3"
                    >
                        <span className="font-extrabold md:text-xl text-[14px]">My Courses</span>
                        <TvMinimalPlay className="w-8 h-8 cursor-pointer" />
                    </div>

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center justify-center p-0"
                            >
                                <User className="h-5 w-5 text-white" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {auth?.user?.userName || "User"}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {auth?.user?.userEmail || "user@example.com"}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    onClick={handleProfileClick}
                                    className="cursor-pointer"
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    <span>View Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="cursor-pointer text-red-600"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}

export default StudentViewCommonHeader;
