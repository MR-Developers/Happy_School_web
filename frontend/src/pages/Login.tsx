import React, { useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import appIcon from "../assets/Images/appicon2.png";
import toast, { Toaster } from "react-hot-toast";

function Login() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://api-rim6ljimuq-uc.a.run.app/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          }
        );

        const data = await response.json();

        if (response.ok) {
          if (data.role.toString().toLowerCase() === "principal") {
            toast.success("Login successful");
            localStorage.setItem("authToken", data.jwtToken);
            localStorage.setItem("firebaseToken", data.firebaseToken);
            localStorage.setItem("UserName", data.name);
            localStorage.setItem("role", data.role);
            localStorage.setItem("email", data.email);
            localStorage.setItem("school", data.school);

            setTimeout(() => {
              nav("/dashboard");
            }, 1200); // delay so user can see success toast
          } else {
            toast.error("Access denied. Only principals can log in.");
          }
        } else {
          toast.error(data.error || "Invalid credentials ");
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Something went wrong ");
      }
      setLoading(false);
    },
  });

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Toast container */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Left Section */}
      <div className="bg-[#345069] flex items-center justify-center p-8">
        <img
          src={appIcon}
          alt="Happy School Culture"
          className="w-2/3 max-w-sm mx-auto"
        />
      </div>

      {/* Right Section */}
      <div className="bg-[#f9f9f9] flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-[#2D4557] mb-1">
            Welcome to
          </h2>
          <h1 className="text-3xl font-extrabold text-center text-orange-500 mb-8">
            Happy School Culture
          </h1>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition duration-200"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
