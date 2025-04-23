import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Signup from "./components/Signup";
import Login from "./components/Login";
import EmailVerify from "./components/EmailVerify";
import Main from "./components/Main/";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./business_pages/Dashboard";
import NewProduct from "./business_pages/NewProduct";
import Products from "./business_pages/Product";
import Orders from "./business_pages/Order";
import Customers from "./business_pages/Customers";
import Settings from "./business_pages/Settings";
import ProductReviews from "./business_pages/ProductReviews";
import BusinessReviews from "./business_pages/BusinessReviews";
import Payments from "./business_pages/Payments";
import AIProduct from "./business_pages/AIProduct";

import LandingPage from "./pages/landing";
import ProductsPage from "./customer_pages/ProductsPage";
import ProductDescription from './customer_pages/ProductDescription';

import BusinessLayout from "./layouts/BusinessLayout";

import Canvas from './canvas';
import Home from './pages/Home';
import Customizer from './pages/Customizer';

function App() {
  return (
    <>
      <ToastContainer />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<EmailVerify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/product" element={<ProductsPage />} />
          <Route path="/product/:urlKey" element={<ProductDescription />} />

          <Route path="/order-AIcustomize-product" element={
            <ProtectedRoute allowedUserType="customer">
              <main className='app transition-all ease-in'> 
                <Home />
                <Canvas /> 
                <Customizer nextStage="Order Now" />
              </main>
            </ProtectedRoute>
          } />

          <Route path="/create-custom-AIproduct" element={
            <ProtectedRoute allowedUserType="business">
              <BusinessLayout>
                <main className='app transition-all ease-in'> 
                  <Home />
                  <Canvas /> 
                  <Customizer nextStage="Add Product" />
                </main>
                </BusinessLayout>
            </ProtectedRoute>
          } />

          <Route
            path="/main"
            element={
              <ProtectedRoute allowedUserType="customer">
                <Main />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <Dashboard />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-product"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <NewProduct />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <Products />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <Orders />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <Customers />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/product-reviews"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <ProductReviews />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-reviews"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <BusinessReviews />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <Payments />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-product"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <AIProduct />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <Settings />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;