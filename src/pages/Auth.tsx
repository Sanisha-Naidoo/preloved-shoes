
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) setError(error.message);
    else navigate("/");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` }
    });
    setLoading(false);
    if (error) setError(error.message);
    else {
      alert("Check your email for a confirmation link and then log in!");
      setMode("login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === "login" ? "Login" : "Sign Up"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4">
            <div>
              <input
                disabled={loading}
                type="email"
                placeholder="Email"
                className="w-full p-2 border rounded"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                disabled={loading}
                type="password"
                placeholder="Password"
                className="w-full p-2 border rounded"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : mode === "login" ? "Login" : "Sign Up"}
            </Button>
            {error && <div className="text-red-600 text-sm">{error}</div>}
          </form>
          <div className="mt-4 flex items-center justify-between">
            <button className="text-sm underline" type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? "Need to sign up?" : "Already have an account?"}
            </button>
            <button
              type="button"
              className="text-sm text-gray-500 underline"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
