import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { handleResetPassword } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Get email, otpToken and otpCode from localStorage
        const savedEmail = localStorage.getItem("resetPasswordEmail");
        const savedToken = localStorage.getItem("resetPasswordOtpToken");
        const savedOtpCode = localStorage.getItem("resetPasswordOtpCode");

        if (!savedEmail || !savedToken || !savedOtpCode) {
            // If no email, token or OTP code, go back to verify OTP page
            navigate("/auth/verify-otp-reset");
            return;
        }

        setEmail(savedEmail);
    }, [navigate]);

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);

        // Validate
        if (newPassword.length < 6) {
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setLoading(false);
            return;
        }

        // Get otpToken and otpCode from localStorage
        const otpToken = localStorage.getItem("resetPasswordOtpToken");
        const otpCode = localStorage.getItem("resetPasswordOtpCode");

        if (!otpToken || !otpCode) {
            setLoading(false);
            navigate("/auth/verify-otp-reset");
            return;
        }

        // Call reset password API
        const result = await handleResetPassword(email, otpCode, otpToken, newPassword);

        if (result.success) {
            // Clear temporary data
            localStorage.removeItem("resetPasswordEmail");
            localStorage.removeItem("resetPasswordOtpToken");
            localStorage.removeItem("resetPasswordOtpCode");

            // Navigate to login page after 2 seconds
            setTimeout(() => {
                navigate("/auth");
            }, 2000);
        }

        setLoading(false);
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="px-4 lg:px-6 h-14 flex items-center border-b">
                <Link to={"/auth"} className="flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 mr-4" />
                    <span className="font-extrabold text-xl">LMS LEARN</span>
                </Link>
            </header>
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Reset Password</CardTitle>
                        <CardDescription>Enter your new password</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Enter your new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Re-enter your new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-sm text-destructive">Passwords do not match</p>
                            )}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={
                                    loading ||
                                    newPassword.length < 6 ||
                                    newPassword !== confirmPassword
                                }
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </Button>
                        </form>
                        <div className="mt-4 text-center text-sm">
                            <Link
                                to="/auth/verify-otp-reset"
                                className="text-primary hover:underline"
                            >
                                Back to Verify OTP
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default ResetPasswordPage;
