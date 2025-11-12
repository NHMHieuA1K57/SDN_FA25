import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

function ForgotPasswordPage() {
    const [userEmail, setUserEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { handleSendOTPResetPassword } = useContext(AuthContext);
    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);

        const result = await handleSendOTPResetPassword(userEmail);

        if (result.success) {
            // Save email and otpToken for use in verify OTP step
            localStorage.setItem("resetPasswordEmail", userEmail);
            localStorage.setItem("resetPasswordOtpToken", result.otpToken);
            // Navigate to verify OTP page after 1.5 seconds
            setTimeout(() => {
                navigate("/auth/verify-otp-reset");
            }, 1500);
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
                        <CardTitle>Forgot Password</CardTitle>
                        <CardDescription>
                            Enter your email address and we'll send you an OTP code to reset your
                            password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading || !userEmail}
                            >
                                {loading ? "Sending..." : "Send OTP"}
                            </Button>
                        </form>
                        <div className="mt-4 text-center text-sm">
                            <Link to="/auth" className="text-primary hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
