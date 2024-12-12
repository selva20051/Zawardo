import React from "react";
import Navbar from "@/components/navbar";
import LoginPage from "@/components/login";

function Login () {
    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Background pattern with overlay */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-white/70 to-white" />
            </div>

            {/* Added z-index and relative positioning to make navbar visible */}
            <div className="relative z-10">
                <Navbar />
            </div>
            
            <LoginPage />
        </div>
    );
}

export default Login;