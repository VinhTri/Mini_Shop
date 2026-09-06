import { Navigate, Route, Routes } from 'react-router-dom'
import { PrivateRoute, PublicOnlyRoute } from './components/PrivateRoute'
import { ShopLayout } from './layouts/ShopLayout'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { OrderDetail } from './pages/OrderDetail'
import { Orders } from './pages/Orders'
import { OrderConfirmation } from './pages/OrderConfirmation'
import { ProductDetail } from './pages/ProductDetail'
import { Register } from './pages/Register'

export default function App() {
  return (
    <Routes>
      <Route element={<ShopLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
        <Route path="/cart" element={<Cart />} />
        <Route element={<PrivateRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
