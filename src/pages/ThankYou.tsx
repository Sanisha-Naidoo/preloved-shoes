import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
const ThankYou = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col relative overflow-hidden p-4">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,_rgba(34,197,94,0.3)_1px,_transparent_0)] bg-[length:32px_32px]"></div>
      {/* Ambient Background Shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-emerald-200/15 to-teal-200/15 rounded-full blur-3xl opacity-40"></div>
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl shadow-gray-500/10 rounded-3xl transition-all duration-500 ease-out hover:shadow-3xl hover:shadow-gray-500/15 hover:bg-white/80 relative z-10">
          <CardContent className="p-8 text-center">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
            <p className="text-gray-600 mb-8">Your contribution will go a long way. </p>

            <Button onClick={() => navigate("/")} className="w-full h-14 text-base font-medium bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-xl hover:shadow-purple-500/30 border-0 rounded-2xl button-premium">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default ThankYou;