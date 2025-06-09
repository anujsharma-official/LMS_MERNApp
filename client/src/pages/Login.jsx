import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/features/api/authApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });

  const [signupErrors, setSignupErrors] = useState({});
  const [loginErrors, setLoginErrors] = useState({});

  const [
    registerUser,
    { data: registerData, error: registerError, isLoading: registerIsLoading, isSuccess: registerIsSuccess },
  ] = useRegisterUserMutation();

  const [
    loginUser,
    { data: loginData, error: loginError, isLoading: loginIsLoading, isSuccess: loginIsSuccess },
  ] = useLoginUserMutation();

  const navigate = useNavigate();

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  const validateInputs = (type) => {
    const errors = {};
    if (type === "signup") {
      const { name, email, password } = signupInput;
      if (!name.trim()) errors.name = "Name is required";
      if (!email.trim()) errors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email";
      if (!password.trim()) errors.password = "Password is required";
      else if (password.length < 6) errors.password = "Min 6 characters required";
      setSignupErrors(errors);
      return Object.keys(errors).length === 0;
    } else {
      const { email, password } = loginInput;
      if (!email.trim()) errors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email";
      if (!password.trim()) errors.password = "Password is required";
      setLoginErrors(errors);
      return Object.keys(errors).length === 0;
    }
  };

  const handleRegistration = async (type) => {
    const isValid = validateInputs(type);
    if (!isValid) return;

    const inputData = type === "signup" ? signupInput : loginInput;
    const action = type === "signup" ? registerUser : loginUser;
    await action(inputData);
  };

  useEffect(() => {
  if (registerIsSuccess && registerData) {
    toast.success(registerData.message || "Signup successful.");
    setSignupInput({ name: "", email: "", password: "" }); // Reset signup inputs on success
  }
  if (registerError) {
    toast.error(registerError.data.message || "Signup Failed");
    setSignupInput({ name: "", email: "", password: "" });
  }
  if (loginIsSuccess && loginData) {
    toast.success(loginData.message || "Login successful.");
    setSignupInput({ name: "", email: "", password: "" });
    navigate("/");
  }
  if (loginError) {
    toast.error(loginError.data.message || "login Failed");
    setSignupInput({ name: "", email: "", password: "" });
  }
}, [
  loginIsLoading,
  registerIsLoading,
  loginData,
  registerData,
  loginError,
  registerError,
]);


  return (
    <div className="flex items-center w-full justify-center mt-20">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">Signup</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>

        {/* Signup Tab */}
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription>Create a new account and click signup when you're done.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={signupInput.name}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="John Doe"
                />
                {signupErrors.name && <p className="text-red-500 text-sm">{signupErrors.name}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={signupInput.email}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="john.doe@example.com"
                />
                {signupErrors.email && <p className="text-red-500 text-sm">{signupErrors.email}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={signupInput.password}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Strong password (min 6 chars)"
                />
                {signupErrors.password && <p className="text-red-500 text-sm">{signupErrors.password}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={registerIsLoading}
                onClick={() => handleRegistration("signup")}
              >
                {registerIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Signup"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Login Tab */}
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Login with your credentials below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={loginInput.email}
                  onChange={(e) => changeInputHandler(e, "login")}
                  placeholder="john.doe@example.com"
                />
                {loginErrors.email && <p className="text-red-500 text-sm">{loginErrors.email}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={loginInput.password}
                  onChange={(e) => changeInputHandler(e, "login")}
                  placeholder="Enter your password"
                />
                {loginErrors.password && <p className="text-red-500 text-sm">{loginErrors.password}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={loginIsLoading}
                onClick={() => handleRegistration("login")}
              >
                {loginIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Login;
