import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Mail, User, Lock, Calendar, LogOut, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  changePasswordService,
  updateUserProfileService,
} from "@/services";

function StudentProfilePage() {
  const { auth, resetCredentials, refreshUserData } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    role: "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Initialize form data with user info
  useEffect(() => {
    if (auth?.user) {
      setFormData({
        userName: auth.user.userName || "",
        userEmail: auth.user.userEmail || "",
        role: auth.user.role || "Student",
      });
    } else {
      navigate("/auth/login");
    }
  }, [auth?.user, navigate]);

  // Sync form data when auth user changes
  useEffect(() => {
    if (auth?.user && !isEditing) {
      setFormData({
        userName: auth.user.userName || "",
        userEmail: auth.user.userEmail || "",
        role: auth.user.role || "Student",
      });
    }
  }, [auth?.user, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    // Validate username
    if (!formData.userName || formData.userName.trim() === "") {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await updateUserProfileService(
        auth?.user?._id,
        formData.userName
      );

      if (response?.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        
        // Refresh user data in auth context
        await refreshUserData();
        
        // Close edit mode after refresh
        setIsEditing(false);
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };
//Password change handler
  const handleChangePassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await changePasswordService(
        auth?.user?._id,
        passwordData.oldPassword,
        passwordData.newPassword
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        });
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setIsChangingPassword(false);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to change password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to change password",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    resetCredentials();
    sessionStorage.clear();
    navigate("/auth/login");
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and information</p>
        </div>

        {/* Profile Card */}
        <Card className="p-8 shadow-lg">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8 pb-8 border-b">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
              <User className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">{auth?.user?.userName || "User"}</h2>
            <p className="text-gray-600 text-sm mt-1">
              {auth?.user?.role === "instructor" ? "Instructor" : "Student"}
            </p>
          </div>

          {/* Profile Information Section */}
          <div className="space-y-6">
            {/* Username Field */}
            <div>
              <Label className="flex items-center text-gray-700 font-semibold mb-2">
                <User className="w-4 h-4 mr-2" />
                Username
              </Label>
              <Input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="bg-gray-100 disabled:opacity-75"
                placeholder="Enter username"
              />
            </div>

            {/* Email Field - Read Only */}
            <div>
              <Label className="flex items-center text-gray-700 font-semibold mb-2">
                <Mail className="w-4 h-4 mr-2" />
                Email Address
              </Label>
              <Input
                type="email"
                value={formData.userEmail}
                disabled
                className="bg-gray-100 opacity-50 cursor-not-allowed"
              />
            </div>

            {/* Account Type Field (Read-only) */}
            <div>
              <Label className="flex items-center text-gray-700 font-semibold mb-2">
                <Lock className="w-4 h-4 mr-2" />
                Account Type
              </Label>
              <Input
                type="text"
                value={auth?.user?.role === "instructor" ? "Instructor" : "Student"}
                disabled
                className="bg-gray-100 opacity-50 cursor-not-allowed"
              />
            </div>

            {/* Account Created Date */}
            <div>
              <Label className="flex items-center text-gray-700 font-semibold mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                Member Since
              </Label>
              <Input
                type="text"
                value={auth?.user?.createdAt
                  ? new Date(auth.user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
                disabled
                className="bg-gray-100 opacity-50 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Action Buttons - Edit Profile */}
          <div className="flex gap-4 mt-8 pt-8 border-t">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSaveChanges}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Edit Profile
              </Button>
            )}
          </div>

          {/* Change Password Section */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Change Password
            </h3>

            {isChangingPassword ? (
              <div className="space-y-4">
                {/* Old Password */}
                <div>
                  <Label className="text-gray-700 font-semibold mb-2 block">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword.oldPassword ? "text" : "password"}
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("oldPassword")}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword.oldPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <Label className="text-gray-700 font-semibold mb-2 block">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword.newPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("newPassword")}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword.newPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <Label className="text-gray-700 font-semibold mb-2 block">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword.confirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirmPassword")}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword.confirmPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleChangePassword}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Update Password
                  </Button>
                  <Button
                    onClick={() => setIsChangingPassword(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsChangingPassword(true)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Change Password
              </Button>
            )}
          </div>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full mt-4 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Your profile information is secure and only visible to you.
          </p>
        </div>
      </div>
    </div>
  );
}

export default StudentProfilePage;
