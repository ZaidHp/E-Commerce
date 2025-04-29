import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import './ProductDescription.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [singleLineAddress, setSingleLineAddress] = useState('');
  const shippingFee = 4;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:8080/api/cart/items', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cart items');
        }

        const data = await response.json();
        setCartItems(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [navigate]);

  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + (item.product_price * item.quantity), 0);
  };

  const handleContinueShopping = () => {
    navigate('/product');
  };

//   const handleQueryButtonClicked = () => {
//     navigate('/contact');
//   };

  const handleProceed = () => {
    if (!singleLineAddress) {
      toast.error('Please enter shipping address');
      return;
    }
    navigate('/checkout', { state: { address: singleLineAddress } });
  };

  const updateQuantity = async (itemId, delta) => {
    try {
      const token = localStorage.getItem('access_token');
      const item = cartItems.find(i => i.cart_item_id === itemId);
      const newQuantity = item.quantity + delta;

      if (newQuantity < 1) return;

      const response = await fetch(`http://localhost:8080/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      setCartItems(prev =>
        prev.map(item =>
          item.cart_item_id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success('Quantity updated');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8080/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      setCartItems(prev => prev.filter(item => item.cart_item_id !== itemId));
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8080/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      setCartItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatAddressSingleLine = (address) => address;

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <>
      <header className="bg-blue-800 text-white py-4">
        <h1 className="text-center">Your Shopping Cart</h1>
      </header>

      <div className="mt-5 mx-auto px-6 py-8 md:py-10 max-w-screen-xl bg-white border-4 border-gray-50 rounded-1.5xl product-description">
        {cartItems.length === 0 ? (
          <div className="text-center">
            <div className="text-xl mb-4">There are no items in this Cart</div>
            <button
              className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600"
              onClick={handleContinueShopping}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            <div className="w-full md:w-3/4 space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="flex flex-wrap md:flex-nowrap gap-4 bg-gray-50 border-4 border-gray-100 p-4 rounded-lg shadow-md items-center"
                >
                  <img
                    src={`http://localhost:8080${item.image_url}`}
                    alt={item.product_name}
                    className="w-32 h-24 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg md:text-xl font-semibold truncate">
                      {item.product_name}
                    </h2>
                    <p className="mt-2 text-sm md:text-base text-gray-600">
                      Color: <span className="inline-block w-4 h-4 rounded-full mr-2" 
                                 style={{ backgroundColor: item.color_code }}></span>
                      {item.color_name}
                    </p>
                    <p className="text-sm md:text-base text-gray-600">
                      Size: {item.size}
                    </p>
                    <p className="text-sm md:text-base text-gray-600">
                      Price: $ {item.product_price}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <button
                        className="p-1 border border-black rounded hover:bg-black hover:text-white"
                        onClick={() => updateQuantity(item.cart_item_id, -1)}
                      >
                        <Minus className="w-6 h-5" />
                      </button>
                      <span className="px-4 bg-white">{item.quantity}</span>
                      <button
                        className="p-1 border border-black rounded hover:bg-black hover:text-white"
                        onClick={() => updateQuantity(item.cart_item_id, 1)}
                      >
                        <Plus className="w-6 h-5" />
                      </button>
                    </div>
                    <p className="mt-4 text-sm md:text-base font-semibold text-gray-700">
                      Total: $ {(item.quantity * item.product_price).toFixed(2)}
                    </p>
                  </div>
                  <button
                    className="p-2 rounded-b-none hover:bg-black hover:text-white"
                    onClick={() => removeItem(item.cart_item_id)}
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              ))}

              <div className="flex justify-between gap-4 mt-6">
                <button
                  className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600"
                  onClick={handleContinueShopping}
                >
                  Continue Shopping
                </button>
                <button
                  onClick={clearCart}
                  className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            <div className="w-full md:w-1/4 bg-gray-50 border-4 border-gray-100 p-6 rounded-lg shadow-md space-y-4 h-fit">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">
                  Shipping Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={singleLineAddress}
                  onChange={(e) => setSingleLineAddress(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter address, city, country"
                />
              </div>
              {singleLineAddress && (
                <div className="mb-4">
                  <hr />
                  <span className="block text-gray-700 text-sm font-bold mb-2">
                    Shipping To:
                  </span>
                  <label className="block text-black font-bold text-sm">
                    {formatAddressSingleLine(singleLineAddress)}
                  </label>
                  <hr />
                </div>
              )}
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>$ {calculateTotal(cartItems).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>$ {shippingFee.toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>$ {(calculateTotal(cartItems) + shippingFee).toFixed(2)}</span>
              </div>
              <button
                className="w-full bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600"
                onClick={handleProceed}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* <footer className="mt-6 bg-[#0C2A4D] text-white py-12 px-6 sm:px-12">
        
      </footer> */}
    </>
  );
};

export default CartPage;