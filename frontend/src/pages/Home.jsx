import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-6 card">
      <h1 className="text-3xl font-bold text-text mb-4">
        Welcome to TilawatHub
      </h1>
      <p className="text-muted mb-4">Explore music, artists and more.</p>

      <div className="flex gap-3">
        <Link
          to="/music"
          className="px-4 py-2 rounded-md bg-blue-600 text-white"
        >
          Go to Music
        </Link>
        <Link
          to="/login"
          className="px-4 py-2 rounded-md border border-border text-text"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
