import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Navbar from "./components/Navbar";
import LoginForm from "./components/Login";
import RegistrationForm from "./components/Register";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Demo from "./components/demo";

import PaymentPage from "./components/Paymentpage";
import ContactWidget from "./components/ContactWidget";
import BusinessDashboard from "./components/business/dashboard/page";
import BusinessReviews from "./components/business/reviews/page";
import ReviewLinkPage from "./components/business/review-link/page";
import AdminDashboard from "./components/admin/dashboard/page";
import BusinessesPage from "./components/admin/business/page";
import UsersPage from "./components/admin/users/page";
import Sidebar from "./components/sidebar";
import BusinessForm from "./components/Business-form";
import AccountPage from "./components/business/settings/account";
import BusinessUsersPage from "./components/business/settings/businessusers";
import LocationPage from "./components/business/settings/location";
import AnalyticsPage from "./components/admin/analytics/page";

import ReviewPage from "./components/business/review-link/review";
import AdminRegistrationForm from "./components/admin/register/page";
import BusinessDetailsPage from "./components/admin/business/[uid]";
import SubscriptionPage from "./components/admin/subscriptions/[uid]";
import AnalyticPage from "./components/business/analytics/analytics";
import SettingsPage from "./components/admin/settings/page";
import ContactPage from "./components/ContactPage";
import Demo2 from "./components/demo2";
import ChatSupportWidget from "./components/chat-support-widget";
import QRGenerator from "./components/qr-generator";
import DemoBookingChat from "./components/admin/settings/demo-booking-chat";
import PricingSettings from "./components/admin/settings/pricing-settings";
import CtaSection from "./components/CtaSection";
import PricingSection from "./components/PricingSection";
import ContactPanel from "./components/ContactPanel";
import AboutPage from "./components/footer/about";
import CareersPage from "./components/footer/carrers";
import PrivacyPolicyPage from "./components/footer/privacy";
import CookiePolicyPage from "./components/footer/cookies";
import TermsOfServicePage from "./components/footer/terms";
import { HomeSettings } from "./components/admin/settings/homesettings";
import JobApplicationModal from "./components/JobApplicationModal";
import CareersSettingsPage from "./components/admin/settings/carrer settings";
import SharableRedirect from "./components/business/sharablelink/SharableRedirect";


function useScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);
}

function AppRoutes() {
  useScrollToHash();
  const location = useLocation();

const currentPath = location.pathname;

// Hide navbar for /review, /feedback, or any single-segment slug like /demo123
const shouldHideNavbar = /^\/[^\/]+$/.test(currentPath) || ["/review", "/feedback"].includes(currentPath);

return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/contact" element={<ContactWidget />} />
        <Route path="/pricing" element={<PricingSection />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/admin" element={<BusinessForm />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/cookies" element={<CookiePolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/businessform" element={<BusinessForm />} />
        <Route path="/application" element={<JobApplicationModal isOpen={false} onClose={function (): void {
        throw new Error("Function not implemented.");
      } } job={undefined} whatsappNumber={""} />} />
        <Route path="/contact" element={<ContactPanel contactSettings={undefined} onScheduleDemo={function (): void {
        throw new Error("Function not implemented.");
      } } />} />
        <Route path="/demo2" element={<Demo2 />} />
        <Route path="/cta" element={<CtaSection />} />
        <Route
          path="/qr-generator"
          element={
            <QRGenerator
              reviewUrl=""
              businessName=""
              hasCustomPlan={false}
            />
          }
        />
        <Route path="/chatsupportwidget" element={<ChatSupportWidget isOpen={false} onClose={function (): void {
        throw new Error("Function not implemented.");
      } } />} />
        <Route path="/components/business/dashboard" element={<BusinessDashboard />} />
        <Route path="/components/business/reviews" element={<BusinessReviews />} />
        <Route path="/components/business/review-link" element={<ReviewLinkPage />} />
        <Route path="/components/business/analytics" element={<AnalyticPage />} />
        <Route path="/components/business/settings/account" element={<AccountPage />} />
        <Route path="/components/business/settings/businessusers" element={<BusinessUsersPage />} />
        <Route path="/components/business/settings/location" element={<LocationPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/businesses" element={<BusinessesPage />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/register" element={<AdminRegistrationForm />} />
        <Route path="/admin/analytics" element={<AnalyticsPage />} />
        <Route path="/admin/settings/general" element={<SettingsPage />} />
        <Route path="/admin/demo-chat" element={<DemoBookingChat />} />
        <Route path="/admin/pricing" element={<PricingSettings />} />
        <Route path="/admin/settings/home" element={<HomeSettings />} />
        <Route path="/admin/settings/careers" element={<CareersSettingsPage />} />

        <Route path="/admin/businesses/:uid" element={<BusinessDetailsPage params={{ uid: "" }} />} />
        <Route path="/admin/subscriptions/:uid" element={<SubscriptionPage params={{ uid: "" }} />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/:businessSlug" element={<ReviewPage />} />
        <Route path="/s/:slug" element={<SharableRedirect />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
