import {
  useEffect,
  useState,
} from "react";

import type {
  User,
} from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

import { AuthContext } from "./AuthContext";
import { handlePostLogin } from "./authService";
import { useActionEngineSubscriptions } from "./hooks/useActionEngineSubscriptions";
import { useUserSideEffects } from "./hooks/useUserSideEffects";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useActionEngineSubscriptions();
  useUserSideEffects(user?.id ?? null);

  useEffect(() => {

    async function loadSession() {

      try {

        const {

          data: {

            session,

          },

        } =
          await supabase.auth.getSession();

        if (!session?.user) {

          setUser(null);

          setLoading(false);

          return;

        }

        setUser(session.user);

      } finally {

        setLoading(false);

      }

    }

    loadSession();

    const {

      data: listener,

    } =
      supabase.auth.onAuthStateChange(

        async (event: string, session) => {

  const newUser = session?.user ?? null;
  setUser((prev) => {
    if (prev?.id === newUser?.id) return prev;
    return newUser;
  });

  if (session?.user && event === "SIGNED_IN") {
    void handlePostLogin(session.user);
  }

        }

      );

    return () => {

      listener.subscription.unsubscribe();

    };

  }, []);

  return (

    <AuthContext.Provider

      value={{

        user,

        loading,

      }}

    >

      {children}

    </AuthContext.Provider>

  );

}