import { Outlet } from "@tanstack/react-router";

import "@/config/marketingChrome.css";
import "@/config/marketingPages.css";

import "./Product.css";
import MarketingFooter from "./MarketingFooter";
import MarketingNav from "./MarketingNav";

export default function MarketingLayout() {
  return (
    <div className="product-container">
      <div className="product-noise" aria-hidden />
      <div className="hero-glow hero-glow-1" aria-hidden />
      <div className="hero-glow hero-glow-2" aria-hidden />
      <MarketingNav />
      <Outlet />
      <MarketingFooter />
    </div>
  );
}
