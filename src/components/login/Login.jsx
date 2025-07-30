import {
  Button,
  Card,
  Checkbox,
  Label,
  Spinner,
  TextInput,
} from "flowbite-react";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router";
import Toaster from "../commons/toast/toaster";

export default function Login() {
  const bg = "/src/assets/images/bg.jpg";
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // mulai spinner

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });


    if (error) {
      setToast({ type: "error", message: error.message });
      setIsLoading(false); // stop spinner
      return;
    }

    const userId = data.user.id;
    

    // 🔥 Ambil role dari public.user
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id_new", userId)
      .single();

    if (userError) {
      setToast({ type: "error", message: userError.message });
      setIsLoading(false);
      return;
    }

    const role = userData.role;


    setToast({ type: "success", message: "Login berhasil!" });

    localStorage.setItem("forceRole", role);

    if (role === "admin") {
      navigate("/admin/dashboard");
    } else if (role === "kasir") {
      navigate("/kasir/dashboard");
    } else {
      navigate("/login");
    }
    // navigate({
    //   pathname: "/redirect",
    // });
  };

  return (
    <>
      <Card
        className="w-full max-w-sm p-4 shadow-lg !bg-cover !bg-white border-blue-500"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="flex flex-col items-center justify-center mb-1">
          <img
            src={"/src/assets/images/logo.png"}
            alt="logo"
            className="h-auto w-52"
          />
          <h1 className="text-2xl font-bold ">Welcome back!</h1>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <div>
            <div className="block mb-2 ">
              <Label htmlFor="email" className="!text-black">
                email
              </Label>
            </div>
            <TextInput
              id="email"
              type="email"
              placeholder="bagas@gmail.com"
              required
              color="white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="block mb-2">
              <Label htmlFor="password" color="black">
                Your password
              </Label>
            </div>
            <div className="relative">
              <TextInput
                id="password"
                type={visiblePassword ? "text" : "password"}
                required
                color="white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                onClick={() => setVisiblePassword(!visiblePassword)}
                className="absolute inset-y-0 flex items-center cursor-pointer right-3"
              >
                {visiblePassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="remember" color="white" className="!bg-white" />
            <Label htmlFor="remember" color="white">
              Remember me
            </Label>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" light />
                Loading...
              </div>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </Card>
      {toast && (
        <Toaster
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
