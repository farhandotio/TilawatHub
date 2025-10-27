import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  // Form state
  const [fullname, setFullname] = useState({ firstName: "", lastName: "" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState("user");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // basic client-side validation
  function validate() {
    setError(null);
    if (!fullname.firstName.trim() || !fullname.lastName.trim()) {
      setError("Please enter your first and last name.");
      return false;
    }
    if (!email.trim()) {
      setError("Please enter your email.");
      return false;
    }
    // simple email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        email: email.trim(),
        fullname: {
          firstName: fullname.firstName.trim(),
          lastName: fullname.lastName.trim(),
        },
        password,
        userType,
      };

      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        payload,
        { withCredentials: true }
      );

      if (response.status >= 200 && response.status < 300) {
        navigate("/");
      } else {
        // handle unexpected but non-error responses
        setError(
          response.data?.message || "Registration failed. Please try again."
        );
      }
    } catch (err) {
      // Show helpful error message
      if (err.response?.data?.message) setError(err.response.data.message);
      else
        setError(
          "Could not register. Please check your network or try again later."
        );
      console.error("Error registering user:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="h-screen flex justify-center items-center py-20">
      <div className="max-w-md mx-auto p-6 rounded-md bg-card">
        <h2 className="text-2xl font-semibold mb-4 text-text">
          Create an account
        </h2>

        <button
          onClick={() => {
            window.location.href = "http://localhost:3000/api/auth/google";
          }}
          type="button"
          className="w-full flex items-center justify-center gap-3 mb-4 px-4 py-2 rounded-md border border-border hover:bg-primary bg-input text-text hover:brightness-105 cursor-pointer"
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

        <fieldset className="mb-3">
          <legend className="sr-only">Select account type</legend>
          <div className="flex gap-4 items-center text-text mb-2">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="userType"
                value="user"
                checked={userType === "user"}
                onChange={() => setUserType("user")}
                className="form-radio"
              />
              <span> User </span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="userType"
                value="artist"
                checked={userType === "artist"}
                onChange={() => setUserType("artist")}
                className="form-radio"
              />
              <span> Artist </span>
            </label>
          </div>
        </fieldset>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3"
          noValidate
        >
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col text-sm">
              First name
              <input
                className="mt-1 px-3 py-2 rounded-md bg-input border-border border"
                value={fullname.firstName}
                onChange={(e) =>
                  setFullname({ ...fullname, firstName: e.target.value })
                }
                required
                name="firstName"
                autoComplete="given-name"
              />
            </label>

            <label className="flex flex-col text-sm">
              Last name
              <input
                className="mt-1 px-3 py-2 rounded-md bg-input border-border border"
                value={fullname.lastName}
                onChange={(e) =>
                  setFullname({ ...fullname, lastName: e.target.value })
                }
                required
                name="lastName"
                autoComplete="family-name"
              />
            </label>
          </div>

          <label className="flex flex-col text-sm">
            Email
            <input
              className="mt-1 px-3 py-2 rounded-md bg-input border-border border"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              name="email"
              autoComplete="email"
            />
          </label>

          <label className="flex flex-col text-sm relative">
            Password
            <div className="relative">
              <input
                className="mt-1 px-3 py-2 rounded-md bg-input border-border border w-full pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                name="password"
                autoComplete="new-password"
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
            className="mt-2 px-4 py-2 rounded-md bg-primary text-white font-medium hover:bg-primaryHover cursor-pointer disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        {error && (
          <div
            className="mt-3 text-sm text-red-500"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <p className="text-sm text-muted mt-3">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400">
            Log in
          </Link>
        </p>

        <p className="text-xs text-muted mt-3">
          By continuing you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  );
}
