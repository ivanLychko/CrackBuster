import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import CrackInjectionBackground from './components/CrackInjectionBackground';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ServiceDetail from './pages/ServiceDetail';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import OurWorks from './pages/OurWorks';
import GetEstimate from './pages/GetEstimate';
import ContactUs from './pages/ContactUs';
import NotFound from './pages/NotFound';
import Admin from './pages/Admin';

const App = ({ location: ssrLocation }) => {
  const clientLocation = useLocation();
  const location = ssrLocation || clientLocation;

  // Check if we're on admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      <Helmet>
        <html lang="en" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>
      {!isAdminRoute && <CrackInjectionBackground />}
      <div className="app">
        {!isAdminRoute && <Header />}
        <main className="main-content">
          <Routes location={location}>
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/our-works" element={<OurWorks />} />
            <Route path="/get-estimate" element={<GetEstimate />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
    </>
  );
};

export default App;

