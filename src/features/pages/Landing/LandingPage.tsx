import { useNavigate } from "react-router-dom";

type Role = "admin" | "operator";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleSelectRole = (role: Role) => {
    // Save mock user (temporary for testing)
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: role === "admin" ? "Admin User" : "Operator User",
        role: role, // ✅ lowercase role (IMPORTANT)
      })
    );

    // Navigate based on role
    if (role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/operator/dashboard");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="text-center text-white space-y-8">
        
        <h1 className="text-4xl font-bold">
          BJOC Management System
        </h1>

        <p className="text-lg opacity-90">
          Select your access level
        </p>

        <div className="flex gap-6 justify-center">
          
          {/* Operator Button */}
          <button
            onClick={() => handleSelectRole("operator")}
            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform duration-200"
          >
            Operator Panel
          </button>

          {/* Admin Button */}
          <button
            onClick={() => handleSelectRole("admin")}
            className="px-8 py-4 bg-black text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform duration-200"
          >
            Admin Panel
          </button>

        </div>

      </div>
    </div>
  );
}