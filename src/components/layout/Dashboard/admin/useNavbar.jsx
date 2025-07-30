import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useNavigate } from "react-router";

export default function useNavbar() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Auth Error:", authError);
        setLoading(false);
        return;
      }

      // Gunakan user.id dari auth untuk mencocokkan dengan id_new di public.users
      const { data, error } = await supabase
        .from("users") // public.users
        .select("*")
        .eq("id_new", user.id) // mencocokkan id dari auth.users dengan id_new
        .single();

      if (error) {
        console.error("Query Error:", error);
      } else {
        setUserProfile(data);
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleSignout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("forceRole"); // hapus cache role juga
    navigate("/login"); // redirect ke login page
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { userProfile, loading, handleSignout, isOnline };
}
