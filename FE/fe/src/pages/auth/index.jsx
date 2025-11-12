import CommonForm from "@/components/common-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"; // 1. Import các thành phần Dialog
import { Input } from "@/components/ui/input"; // 2. Import Input
import { Label } from "@/components/ui/label"; // 3. Import Label
import { Button } from "@/components/ui/button"; // 4. Import Button
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  signInFormControls,
  signUpFormControls,
  initialSignUpFormData,
} from "@/config";
import { AuthContext } from "@/context/auth-context";
import { GraduationCap } from "lucide-react";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast"; // 5. Import useToast

function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");
  const [resetEmail, setResetEmail] = useState(""); // 6. State cho email reset
  const {
    signInFormData,
    setSignInFormData,
    signUpFormData,
    setSignUpFormData,
    handleRegisterUser,
    handleLoginUser,
  } = useContext(AuthContext);
  const { toast } = useToast(); // 7. Khởi tạo toast

  function handleTabChange(value) {
    setActiveTab(value);
  }

  async function onSignUpSubmit(event) {
    const success = await handleRegisterUser(event);

    if (success) {
      setSignUpFormData(initialSignUpFormData);
      handleTabChange("signin");
    }
  }

  // 8. Hàm xử lý khi gửi yêu cầu quên mật khẩu
  function handleForgotPassword(event) {
    event.preventDefault();
    console.log("Yêu cầu đặt lại mật khẩu cho:", resetEmail);

    // !! Trong ứng dụng thực tế, bạn sẽ gọi API backend tại đây
    // ví dụ: await forgotPasswordService({ email: resetEmail });

    // Hiển thị thông báo cho người dùng
    toast({
      title: "Check your email",
      description:
        "If an account exists, we have sent a password reset link.",
    });
    setResetEmail(""); // Xóa email sau khi gửi
  }

  function checkIfSignInFormIsValid() {
    return (
      signInFormData &&
      signInFormData.userEmail !== "" &&
      signInFormData.password !== ""
    );
  }

  function checkIfSignUpFormIsValid() {
    return (
      signUpFormData &&
      signUpFormData.userName !== "" &&
      signUpFormData.userEmail !== "" &&
      signUpFormData.password !== ""
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link to={"/"} className="flex items-center justify-center">
          <GraduationCap className="h-8 w-8 mr-4" />
          <span className="font-extrabold text-xl">LMS LEARN</span>
        </Link>
      </header>
      <div className="flex items-center justify-center min-h-screen bg-background">
        {/* 9. Bọc Tabs trong Dialog */}
        <Dialog>
          <Tabs
            value={activeTab}
            defaultValue="signin"
            onValueChange={handleTabChange}
            className="w-full max-w-md"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <Card className="p-6 space-y-4">
                <CardHeader>
                  <CardTitle>Sign in to your account</CardTitle>
                  <CardDescription>
                    Enter your email and password to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <CommonForm
                    formControls={signInFormControls}
                    buttonText={"Sign In"}
                    formData={signInFormData}
                    setFormData={setSignInFormData}
                    isButtonDisabled={!checkIfSignInFormIsValid()}
                    handleSubmit={handleLoginUser}
                  />
                  {/* 10. Thêm nút "Forgot Password?" */}
                  <div className="text-sm text-right">
                    <DialogTrigger asChild>
                      <Button variant="link" className="p-0 h-auto font-medium">
                        Forgot Password?
                      </Button>
                    </DialogTrigger>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="signup">
              <Card className="p-6 space-y-4">
                <CardHeader>
                  <CardTitle>Create a new account</CardTitle>
                  <CardDescription>
                    Enter your details to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <CommonForm
                    formControls={signUpFormControls}
                    buttonText={"Sign Up"}
                    formData={signUpFormData}
                    setFormData={setSignUpFormData}
                    isButtonDisabled={!checkIfSignUpFormIsValid()}
                    handleSubmit={onSignUpSubmit}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 11. Thêm nội dung của Dialog */}
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a link to reset your
                password.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleForgotPassword}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reset-email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="col-span-3"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                {/* DialogClose sẽ tự động đóng cửa sổ khi nhấp vào */}
                <DialogClose asChild>
                  <Button type="submit" disabled={!resetEmail}>
                    Send Reset Link
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default AuthPage;
