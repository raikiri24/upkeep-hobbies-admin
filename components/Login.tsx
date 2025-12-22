import React, { useState, useEffect } from "react";
import {
  Gamepad2,
  Lock,
  User as UserIcon,
  Loader2,
  Mail,
  AlertCircle,
} from "lucide-react";
import { apiService } from "../services/apiService";
import { GoogleUser, AuthResponse } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { GoogleOAuthService, GOOGLE_CONFIG } from "../services/googleOAuth";

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [useLocalAuth, setUseLocalAuth] = useState(true); // Default to local auth for testing

  useEffect(() => {
    // Check if Google OAuth is configured
    const googleOAuthService = GoogleOAuthService.getInstance();
    if (googleOAuthService.isConfigured()) {
      setGoogleConfigured(true);
      // Initialize Google OAuth service
      googleOAuthService.initialize().catch(console.error);
    }
  }, []);

  const handleGoogleLogin = async () => {
    if (!googleConfigured) {
      setError("Google OAuth is not configured. Please contact administrator.");
      return;
    }

    setGoogleLoading(true);
    setError("");

    try {
      const googleOAuthService = GoogleOAuthService.getInstance();
      const googleUser = await googleOAuthService.signIn();

      const response: AuthResponse = await apiService.loginWithGoogle({
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        given_name: googleUser.given_name,
        family_name: googleUser.family_name,
      });

      if (response.success && response.user && response.accessToken) {
        login(response.user, response.accessToken);
        onLogin();
      } else {
        setError(response.message || "Google authentication failed");
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      const errorMessage =
        err.message ||
        err.error_description ||
        "An error occurred during Google authentication";

      if (
        errorMessage.includes("popup_closed") ||
        errorMessage.includes("user_cancelled")
      ) {
        setError("Google sign-in was cancelled");
      } else if (errorMessage.includes("access_denied")) {
        setError("Access denied. Please allow access to your Google account.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isRegisterMode) {
        const response = await apiService.register({
          email,
          name,
          password,
        });

        if (response.user && response.accessToken) {
          login(response.user, response.accessToken);
          onLogin();
        } else {
          setError(response.message || "Registration failed");
        }
      } else {
        const response = await apiService.login({
          email,
          password,
        });
        console.log("Login successful:", response.user);
        if (response.user && response.accessToken) {
          login(response.user, response.accessToken);
          onLogin();
        } else {
          setError(
            response.message ||
              (useLocalAuth
                ? "Invalid credentials. Check your localhost:4000 server."
                : "Invalid credentials. Try admin@upkeep.com / password123")
          );
        }
      }
    } catch (err) {
      setError("An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-[20%] right-[20%] w-72 h-72 bg-purple-600/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="w-full max-w-md mx-4 p-6 sm:p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl relative z-10">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-indigo-500/10 rounded-full border border-indigo-500/30">
            <Gamepad2 className="w-10 h-10 text-indigo-400" />
          </div>
        </div>

        <h2 className="text-3xl font-display font-bold text-center text-white mb-2 tracking-wide">
          UPKEEP HOBBIES
        </h2>
        <p className="text-center text-slate-400 mb-8 text-sm uppercase tracking-widest font-semibold">
          Admin Access
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegisterMode && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
                Full Name
              </label>
              <div className="relative group">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600"
                  placeholder="Enter your full name"
                  required={isRegisterMode}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
              Email
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600"
                placeholder="Enter email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600"
                placeholder="Enter password"
              />
            </div>
          </div>

          {/* Local Auth Toggle */}
          <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700">
            <input
              type="checkbox"
              id="useLocalAuth"
              checked={useLocalAuth}
              onChange={(e) => setUseLocalAuth(e.target.checked)}
              className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-600 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <label
              htmlFor="useLocalAuth"
              className="text-sm text-slate-300 font-medium"
            >
              Use Local Auth Server (localhost:4000)
            </label>
          </div>

          {/* Test Credentials Info */}
          {useLocalAuth && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 text-xs font-medium mb-1">
                🧪 Test with your localhost:4000 server
              </p>
              <p className="text-blue-300/70 text-xs">
                Make sure your auth server is running on port 4000
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm text-center font-medium">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center uppercase tracking-wide font-display"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isRegisterMode ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>

          {googleConfigured && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900/80 text-slate-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div id="google-signin-button" className="w-full">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || isLoading}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Continue with Google"
                  )}
                </button>
              </div>
            </>
          )}

          {!googleConfigured && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-400 text-sm font-medium">
                    Google OAuth Not Configured
                  </p>
                  <p className="text-yellow-300/70 text-xs mt-1">
                    Please set VITE_GOOGLE_CLIENT_ID in your environment
                    variables to enable Google sign-in.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError("");
              }}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
            >
              {isRegisterMode
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
