import React, { useState, useEffect } from "react";
import { FaUserAlt, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import AnimatedGridPattern from "./ui/animated-grid-pattern";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Create axios instance with default config


const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setIsLoading(true);

      const response = await axios.post("http://localhost:5000/users/auth", {
        email,
        password,
      });

      const { data } = response.data;
      const { authToken } = data;
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log(data.user);
      console.log(authToken);

      if (authToken) {
        localStorage.setItem("token", authToken);
        navigate("/");
      }
      
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred during login");
    }
  };

  const handleGoogleLogin = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    window.open(
      "http://localhost:5000/users/auth/google",
      "Google Login",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="absolute inset-0">
        <AnimatedGridPattern 
          className="opacity-70"
          numSquares={100}
          strokeDasharray={2}
          maxOpacity={0.7}
          width={30}
          height={30}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/70 to-white" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md transform hover:scale-105 transition-transform duration-500">
          <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-6">Welcome Back!</h1>
          <p className="text-sm text-center text-gray-600 mb-8">
            Login to access your account
          </p>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full mb-6 py-3 px-4 flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-300"
          >
            <FcGoogle className="text-xl" />
            <span>Continue with Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/80 text-gray-500">Or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-red-500 mb-4">
                {error}
              </div>
            )}
            <div className="relative">
              <FaUserAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-indigo-300 focus:outline-none shadow-sm transition"
                required
              />
            </div>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-indigo-300 focus:outline-none shadow-sm transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg hover:opacity-90 hover:scale-105 transition duration-300"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="text-sm text-center text-gray-600 mt-6">
            Don't have an account?{" "}
            <a href="/signup" className="text-indigo-600 hover:underline font-medium">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;