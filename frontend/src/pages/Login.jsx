import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit() {
    try {
      const payload = {
        email: email.trim(),
        password: password,
      };

      const response = await axios.post(
        "https://tilawathub.onrender.com/api/auth/login",
        payload,
        { withCredentials: true }
      );

      if (response.status === 200) {
        navigate("/");
      } else {
        console.error("Login failed:", response.data);
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  }

  return (
    <div className="h-screen flex justify-center items-center w-full">
      <div className="max-w-sm w-full p-6 rounded-md bg-card">
        <h2 className="text-2xl font-semibold mb-4 text-text">Welcome back</h2>

        <button
          onClick={() => {
            window.location.href = "https://tilawathub.onrender.com/api/auth/google";
          }}
          type="button"
          className="w-full flex items-center justify-center gap-3 mb-4 px-4 py-2 rounded-md border border-border bg-input text-text hover:brightness-105"
          aria-label="Continue with Google"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="20"
            height="20"
            aria-hidden
          >
            <path
              fill="#fbc02d"
              d="M43.6 20.5H42V20H24v8h11.3C34.7 32.7 30.1 36 24 36c-7 0-12.7-5.7-12.7-12.7S17 10.7 24 10.7c3.3 0 6.3 1.2 8.6 3.2l6-6C34.6 4 29.6 2 24 2 12.3 2 3 11.3 3 23s9.3 21 21 21c10.9 0 20-7.6 20-20 0-1.3-.1-2.3-.4-3.5z"
            />
          </svg>
          <span className="font-medium">Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <hr className="flex-1 border-border" />
          <span className="text-sm text-muted">or</span>
          <hr className="flex-1 border-border" />
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-3"
        >
          <label className="flex flex-col text-sm">
            Email
            <input
              className="mt-1 px-3 py-2 rounded-md bg-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              name="email"
            />
          </label>

          <label className="flex flex-col text-sm relative">
            Password
            <div className="relative">
              <input
                className="mt-1 px-3 py-2 rounded-md bg-input w-full pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                name="password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            onClick={handleSubmit}
            className="mt-2 px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            Log in
          </button>
          <p className="text-sm text-muted mt-3">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-400">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

