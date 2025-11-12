import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

function VerifyOtpResetPage() {
    const [email, setEmail] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Get email and otpToken from localStorage
        const savedEmail = localStorage.getItem("resetPasswordEmail");
        const savedToken = localStorage.getItem("resetPasswordOtpToken");

        if (!savedEmail || !savedToken) {
            // If no email or token, go back to forgot password page
            navigate("/auth/forgot-password");
            return;
        }

        setEmail(savedEmail);
    }, [navigate]);

    function handleSubmit(event) {
        event.preventDefault();

        // Validate
        if (otpCode.length !== 6) {
            return;
        }

        // Get OTP token from localStorage
        const otpToken = localStorage.getItem("resetPasswordOtpToken");

        if (!otpToken) {
            navigate("/auth/forgot-password");
            return;
        }

        // Save OTP code to localStorage
        localStorage.setItem("resetPasswordOtpCode", otpCode);

        // Navigate to reset password page
        navigate("/auth/reset-password");
    }

    function handleInputChange(e) {
        const value = e.target.value.replace(/\D/g, ""); // Only allow numbers
        if (value.length <= 6) {
            setOtpCode(value);
        }
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
                        <CardTitle>Verify OTP</CardTitle>
                        <CardDescription>Enter the OTP code sent to {email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp">OTP Code</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="000000"
                                    value={otpCode}
                                    onChange={handleInputChange}
                                    maxLength={6}
                                    required
                                    className="text-center text-2xl tracking-widest"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading || otpCode.length !== 6}
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </Button>
                        </form>
                        <div className="mt-4 text-center text-sm">
                            <Link
                                to="/auth/forgot-password"
                                className="text-primary hover:underline"
                            >
                                Back to Forgot Password
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default VerifyOtpResetPage;
