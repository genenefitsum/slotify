import { Route, Routes } from "react-router-dom";
import Header from "@/components/layouts/Header";

const Page = ({ title, description }: { title: string; description: string }) => {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
    </main>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Routes>
        <Route
          path="/"
          element={<Page title="Welcome to Slotify" description="Find and book trusted vendors in minutes." />}
        />
        <Route
          path="/vendors"
          element={<Page title="Browse Vendors" description="Explore available vendors and compare your options." />}
        />
        <Route
          path="/about"
          element={<Page title="How It Works" description="Search vendors, select a timeslot, and confirm your booking." />}
        />
        <Route
          path="/login"
          element={<Page title="Log In" description="Access your account to manage bookings and availability." />}
        />
        <Route
          path="/register"
          element={<Page title="Get Started" description="Create your Slotify account and start booking today." />}
        />
      </Routes>
    </div>
  );
}

export default App;
