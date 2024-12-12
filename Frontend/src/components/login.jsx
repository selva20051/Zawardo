import React, { useState } from "react";
import { FaUserAlt, FaLock } from "react-icons/fa";
import AnimatedGridPattern from "./ui/animated-grid-pattern";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
    // Add your login logic here
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600">
        <AnimatedGridPattern/>
      <div className="bg-gradient-to-br from-white to-gray-100 p-8 rounded-2xl shadow-2xl w-full max-w-md transform hover:scale-105 transition-transform duration-500">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-6">Welcome Back!</h1>
        <p className="text-sm text-center text-gray-600 mb-8">
          Login to access your account
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <FaUserAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-300 focus:outline-none shadow-sm transition"
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
              className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-300 focus:outline-none shadow-sm transition"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 text-white font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg hover:from-blue-600 hover:to-cyan-500 transition duration-300"
          >
            Login
          </button>
        </form>
        <p className="text-sm text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <a href="#" className="text-blue-600 hover:underline font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
