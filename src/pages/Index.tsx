
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useProgressTracking } from "@/hooks/useProgressTracking";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { AppHeader } from "@/components/index/AppHeader";
import { ActionButtons } from "@/components/index/ActionButtons";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const {
    hasShoeDetails,
    hasSolePhoto,
    canSubmit
  } = useProgressTracking();
  usePWAInstall();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,_rgba(34,197,94,0.3)_1px,_transparent_0)] bg-[length:32px_32px]"></div>
      {/* Ambient Background Shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-emerald-200/15 to-teal-200/15 rounded-full blur-3xl opacity-40"></div>
      <AppHeader />

      <div className="flex justify-end items-center px-6 pt-4">
        {loading ? null : user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Logged in as <span className="font-bold">{user.email}</span></span>
            <button
              className="text-sm text-emerald-700 underline ml-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            className="text-sm text-emerald-700 underline"
            onClick={() => navigate("/auth")}
          >
            Login / Signup
          </button>
        )}
      </div>

      <div className="flex-grow flex items-center justify-center p-6 relative z-10">
        <Card className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl shadow-gray-500/10 rounded-3xl transition-all duration-500 ease-out hover:shadow-3xl hover:shadow-gray-500/15 hover:bg-white/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">Get Started</CardTitle>
            <CardDescription className="text-gray-600 font-medium">with just a few simple steps </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ActionButtons hasShoeDetails={hasShoeDetails} hasSolePhoto={hasSolePhoto} canSubmit={canSubmit} />
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Index;
