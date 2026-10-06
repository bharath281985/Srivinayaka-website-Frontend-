import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import About from './pages/About';
import FAQs from './pages/FAQs';
import TrackOrder from './pages/TrackOrder';
import ShippingPolicy from './pages/ShippingPolicy';
import ReturnsPolicy from './pages/ReturnsPolicy';
import FabricCare from './pages/FabricCare';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import ContactUs from './pages/ContactUs';
import DeleteAccount from './pages/DeleteAccount';
import ThankYouPage from './pages/ThankYouPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import Blogs from './pages/Blogs';
import BlogDetails from './pages/BlogDetails';
import NotFound from './pages/NotFound';

import ScrollToTop from './components/ScrollToTop';
import DynamicFavicon from './components/DynamicFavicon';

function App() {
  return (
    <>
      <DynamicFavicon />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<ProductListing />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="track-order" element={<TrackOrder />} />
          <Route path="about" element={<About />} />
          <Route path="faqs" element={<FAQs />} />
          <Route path="shipping" element={<ShippingPolicy />} />
          <Route path="returns" element={<ReturnsPolicy />} />
          <Route path="fabric-care" element={<FabricCare />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="account" element={<Account />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-conditions" element={<TermsAndConditions />} />
          <Route path="contact" element={<ContactUs />} />
          <Route path="delete-account" element={<DeleteAccount />} />
          <Route path="thank-you" element={<ThankYouPage />} />
          <Route path="payment/success" element={<PaymentSuccess />} />
          <Route path="payment/failure" element={<PaymentFailure />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="blog/:id" element={<BlogDetails />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
