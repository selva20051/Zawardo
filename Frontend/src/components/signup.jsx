import React, { useState } from "react";
import { FaUserAlt, FaLock, FaEnvelope } from "react-icons/fa";
import AnimatedGridPattern from "./ui/animated-grid-pattern";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);
    // Add your sign-up logic here
  };

  return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-400 via-teal-500 to-blue-600">
        <AnimatedGridPattern/>
      <div className="bg-gradient-to-br from-white to-gray-100 p-8 rounded-2xl shadow-2xl w-full max-w-md transform hover:scale-105 transition-transform duration-500">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-6">Create an Account</h1>
        <p className="text-sm text-center text-gray-600 mb-8">
          Sign up to get started
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <FaUserAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-300 focus:outline-none shadow-sm transition"
              required
            />
          </div>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-300 focus:outline-none shadow-sm transition"
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
              className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-300 focus:outline-none shadow-sm transition"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 text-white font-semibold bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-lg hover:from-teal-600 hover:to-green-500 transition duration-300"
          >
            Sign Up
          </button>
        </form>
        <p className="text-sm text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <a href="#" className="text-teal-600 hover:underline font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
