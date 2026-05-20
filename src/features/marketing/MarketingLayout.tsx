import { Outlet } from "@tanstack/react-router";

import "./marketing.css";
import { ScrollProgress } from "./motion/ScrollProgress";
import { Footer } from "./sections/Footer";
import { Nav } from "./sections/Nav";

export default function MarketingLayout() {
  return (
    <div className="marketing-root">
      <ScrollProgress />
      <Nav />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
