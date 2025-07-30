/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { AuthContext } from "./AuthContext";

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(localStorage.getItem("forceRole") || null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const getSession = async () => {
  //     const { data } = await supabase.auth.getSession();
  //     setSession(data.session);

  //     if (data.session) {
  //       if (!role) {
  //         const userId = data.session.user.id;
  //         const { data: userData, error } = await supabase
  //           .from("users")
  //           .select("role")
  //           .eq("id_new", userId)
  //           .single();
  //         if (userData?.role) {
  //           setRole(userData.role);
  //           localStorage.setItem("forceRole", userData.role);
  //         }
  //       }
  //     } else {
  //       setRole(null);
  //       localStorage.removeItem("forceRole");
  //     }

  //     setLoading(false);
  //   };

  //   getSession();

  //   const { data: listener } = supabase.auth.onAuthStateChange(
  //     async (_event, session) => {
  //       setLoading(true);
  //       setSession(session);

  //       if (session) {
  //         if (!role) {
  //           const userId = session.user.id;
  //           const { data: userData, error } = await supabase
  //             .from("users")
  //             .select("role")
  //             .eq("id_new", userId)
  //             .single();
  //           if (userData?.role) {
  //             setRole(userData.role);
  //             localStorage.setItem("forceRole", userData.role);
  //           }
  //         }
  //       } else {
  //         setRole(null);
  //         localStorage.removeItem("forceRole");
  //       }

  //       setLoading(false);
  //     }
  //   );

  //   return () => listener.subscription.unsubscribe();
  // }, [role]);

  // 🚩 1️⃣ Gunakan localStorage untuk cache role di awal (sementara)

  // ✅ 1️⃣ Ambil session cepat
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (!data.session) {
        setRole(null);
        localStorage.removeItem("forceRole");
      }
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (!session) {
          setRole(null);
          localStorage.removeItem("forceRole");
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // ✅ 2️⃣ VALIDASI server-side, background saja
  useEffect(() => {
    const checkRole = async () => {
      if (!session) return;

      const userId = session.user.id;
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id_new", userId)
        .single();

      if (userData?.role) {
        if (userData.role !== role) {
          // ❗ Kalau localStorage beda sama server, force update
          setRole(userData.role);
          localStorage.setItem("forceRole", userData.role);
        }
      } else {
        // Role hilang? Tendang
        await supabase.auth.signOut();
        setSession(null);
        setRole(null);
        localStorage.removeItem("forceRole");
      }
    };

    checkRole();
  }, [session, role]);

  return (
    <AuthContext.Provider value={{ session, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
