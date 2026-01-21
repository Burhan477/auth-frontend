import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/auth.css";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
    } else {
      await api.post("/auth/register", { email, password });
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
    }

    navigate("/dashboard");
  };

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={handleSubmit}>
        <h2>{isLogin ? "Login" : "Register"}</h2>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className={!isLogin ? "register" : ""}>
          {isLogin ? "Login" : "Register"}
        </button>

        <div className="auth-toggle" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Create account" : "Already have an account?"}
        </div>
      </form>
    </div>
  );
}
