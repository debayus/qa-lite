import { Navigate, Link } from "react-router-dom";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import SignupForm from "../components/SignupForm";

export default function SignupPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-600/30">
            <span className="text-white text-xl font-bold">Q</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            QALite
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Create your free account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <SignupForm />

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to={ROUTES.LOGIN}
              className="text-indigo-600 font-semibold hover:text-indigo-700"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          QALite · Quality Assurance Made Simple
        </p>
      </div>
    </div>
  );
}
