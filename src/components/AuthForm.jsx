import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/auth.css";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        const res = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
      } else {
        await api.post("/auth/register", { email, password });
        const res = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
          <p>{isLogin ? "Enter your details to sign in" : "Sign up to get started"}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            className={`submit-btn ${!isLogin ? "register-mode" : ""}`} 
            disabled={isLoading}
          >
            {isLoading ? <span className="loader"></span> : (isLogin ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span onClick={() => { setIsLogin(!isLogin); setError(""); }}>
              {isLogin ? " Sign up" : " Log in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}