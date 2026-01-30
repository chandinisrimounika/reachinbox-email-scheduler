import { GoogleLogin } from "@react-oauth/google";

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white w-[380px] rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        <GoogleLogin
          onSuccess={(credentialResponse) => {
            const token = credentialResponse.credential;
            if (!token) return;

            const payload = JSON.parse(atob(token.split(".")[1]));

            onLogin({
              name: payload.name,
              email: payload.email,
              picture: payload.picture,
            });
          }}
          onError={() => alert("Google Login Failed")}
        />

        <p className="text-xs text-gray-500 mt-4">
          Secure login using Google
        </p>
      </div>
    </div>
  );
}
