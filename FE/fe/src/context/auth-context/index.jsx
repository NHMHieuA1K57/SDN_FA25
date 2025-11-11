// import { Skeleton } from "@/components/ui/skeleton";
// import { initialSignInFormData, initialSignUpFormData } from "@/config";
// import { checkAuthService, loginService, registerService } from "@/services";
// import { createContext, useEffect, useState } from "react";

// export const AuthContext = createContext(null);

// export default function AuthProvider({ children }) {
//   const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
//   const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);
//   const [auth, setAuth] = useState({
//     authenticate: false,
//     user: null,
//   });
//   const [loading, setLoading] = useState(true);

//   async function handleRegisterUser(event) {
//     event.preventDefault();
//     const data = await registerService(signUpFormData);
//   }

//   async function handleLoginUser(event) {
//     event.preventDefault();
//     const data = await loginService(signInFormData);
//     console.log(data, "datadatadatadatadata");

//     if (data.success) {
//       sessionStorage.setItem(
//         "accessToken",
//         JSON.stringify(data.data.accessToken)
//       );
//       setAuth({
//         authenticate: true,
//         user: data.data.user,
//       });
//     } else {
//       setAuth({
//         authenticate: false,
//         user: null,
//       });
//     }
//   }

//   //check auth user

//   async function checkAuthUser() {
//     try {
//       const data = await checkAuthService();
//       if (data.success) {
//         setAuth({
//           authenticate: true,
//           user: data.data.user,
//         });
//         setLoading(false);
//       } else {
//         setAuth({
//           authenticate: false,
//           user: null,
//         });
//         setLoading(false);
//       }
//     } catch (error) {
//       console.log(error);
//       if (!error?.response?.data?.success) {
//         setAuth({
//           authenticate: false,
//           user: null,
//         });
//         setLoading(false);
//       }
//     }
//   }

//   function resetCredentials() {
//     setAuth({
//       authenticate: false,
//       user: null,
//     });
//   }

//   useEffect(() => {
//     checkAuthUser();
//   }, []);

//   console.log(auth, "gf");

//   return (
//     <AuthContext.Provider
//       value={{
//         signInFormData,
//         setSignInFormData,
//         signUpFormData,
//         setSignUpFormData,
//         handleRegisterUser,
//         handleLoginUser,
//         auth,
//         resetCredentials,
//       }}
//     >
//       {loading ? <Skeleton /> : children}
//     </AuthContext.Provider>
//   );
// }

import { Skeleton } from "@/components/ui/skeleton";
import { initialSignInFormData, initialSignUpFormData } from "@/config";
import { checkAuthService, loginService, registerService } from "@/services";
import { createContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast"; // 1. Import useToast

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);
  const [auth, setAuth] = useState({
    authenticate: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast(); // 2. Initialize the hook

  async function handleRegisterUser(event) {
    event.preventDefault();
    try {
      // 3. Wrap in try...catch
      const data = await registerService(signUpFormData);
      if (data.success) {
        toast({
          title: "Registration Succeeded", // Your requested message
          description: "Please sign in to continue.",
        });
        return true; // 4. Return true on success for redirect
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "An unknown error occurred.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Registration Failed",
        description: error?.response?.data?.message || "An error occurred.",
        variant: "destructive",
      });
      return false; // 5. Return false on error
    }
  }

  async function handleLoginUser(event) {
    event.preventDefault();
    try {
      // 6. Wrap in try...catch
      const data = await loginService(signInFormData);
      console.log(data, "datadatadatadatadata");

      if (data.success) {
        sessionStorage.setItem(
          "accessToken",
          JSON.stringify(data.data.accessToken)
        );
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
      } else {
        // This path is unlikely if your API throws an error on fail, but good to have
        setAuth({
          authenticate: false,
          user: null,
        });
        toast({
          title: "Login Failed",
          description: data.message || "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      // 7. This catch block will handle 401 "Invalid credentials"
      console.log(error);
      setAuth({
        authenticate: false,
        user: null,
      });
      toast({
        title: "Login Failed",
        description:
          error?.response?.data?.message || "Invalid username or password", // Your requested message
        variant: "destructive",
      });
    }
  }

  //check auth user

  async function checkAuthUser() {
    try {
      const data = await checkAuthService();
      if (data.success) {
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
        setLoading(false);
      } else {
        setAuth({
          authenticate: false,
          user: null,
        });
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      if (!error?.response?.data?.success) {
        setAuth({
          authenticate: false,
          user: null,
        });
        setLoading(false);
      }
    }
  }

  function resetCredentials() {
    setAuth({
      authenticate: false,
      user: null,
    });
  }

  async function refreshUserData() {
    try {
      const data = await checkAuthService();
      if (data.success) {
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
      }
    } catch (error) {
      console.log("Error refreshing user data:", error);
    }
  }

  useEffect(() => {
    checkAuthUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signInFormData,
        setSignInFormData,
        signUpFormData,
        setSignUpFormData,
        handleRegisterUser,
        handleLoginUser,
        auth,
        resetCredentials,
        refreshUserData,
      }}
    >
      {loading ? <Skeleton /> : children}
    </AuthContext.Provider>
  );
}