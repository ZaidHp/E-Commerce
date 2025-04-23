import React, { useEffect, useState, useRef } from 'react';
import './ProductDescription.css';
import { useParams } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const HeartIcon = ({ className = "w-5 h-5 inline-block ml-2" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

function ProductDescription({ onAddToCart, onAddToWishlist, visitStore }) {
  const { urlKey } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const reviewContainerRef = useRef(null);
  const relatedProductsRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`http://localhost:8080/api/productPage/${urlKey}`);
        const data = await res.json();
        console.log(data);
        setProduct(data.product);
        setStoreInfo(data.storeInfo);
        setReviews(data.reviews);
        setRelatedProducts(data.relatedProducts || []);
        if (data.product?.colors?.length > 0) {
          setSelectedColor(data.product.colors[0].color_id);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [urlKey]);

  const handleSizeClick = (sizeValue) => {
    setSelectedSize(sizeValue);
  };

  const handleDecrement = () => {
    const newQuantity = Math.max(1, currentQuantity - 1);
    setCurrentQuantity(newQuantity);
  };

  const handleIncrement = () => {
    const newQuantity = currentQuantity + 1;
    setCurrentQuantity(newQuantity);
  };

  const handleScroll = (direction, ref) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      ref.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!product) return <div className="text-center py-10 text-red-500">Product not found.</div>;

  return (
    <div className='min-h-screen flex flex-col product-description'>
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row -mx-4">
          <div className="md:w-1/3 px-4 mb-6 md:mb-0">
            {product.images?.length > 0 ? (
              <Carousel showThumbs={true} showStatus={false} infiniteLoop autoPlay className="rounded-lg shadow-md border">
                {product.images.map((img, index) => (
                  <div key={index}>
                    <img
                      src={`http://localhost:8080${img}`}
                      alt={`Product Image ${index + 1}`}
                      className="object-cover max-h-[400px] rounded-lg"
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-lg shadow-md flex items-center justify-center text-gray-500 border">
                No Image Available
              </div>
            )}
          </div>
          <div className="md:w-2/3 px-4 flex flex-col">
            <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-gray-800">{product.product_name}</h1>
            <div className="relative">
              <div
                className="text-justify text-gray-600 leading-relaxed text-lg font-normal mt-10 pr-4 
                   max-h-40 overflow-y-auto
                   scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              >
                {product?.product_description}
              </div>
              <div className="pb-6"></div>
            </div>

            {/* Star Rating */}
            {product.average_rating && (
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => {
                const ratingValue = parseFloat(product.average_rating);
                const isFilled = ratingValue >= star;
                const isHalfFilled = ratingValue >= star - 0.5 && ratingValue < star;
      
                return (
                  <div key={star} className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      viewBox="0 0 20 20"
                      fill={isFilled ? '#FFD700' : '#E5E7EB'}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.146 3.51a1 1 0 00.95.69h3.692c.969 0 1.371 1.24.588 1.81l-2.988 2.172a1 1 0 00-.364 1.118l1.147 3.51c.3.921-.755 1.688-1.54 1.118l-2.988-2.172a1 1 0 00-1.176 0l-2.988 2.172c-.784.57-1.838-.197-1.539-1.118l1.146-3.51a1 1 0 00-.364-1.118L2.674 8.937c-.783-.57-.38-1.81.588-1.81h3.692a1 1 0 00.951-.69l1.144-3.51z" />
                    </svg>
                    {isHalfFilled && (
                      <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6"
                          viewBox="0 0 20 20"
                          fill="#FFD700"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.146 3.51a1 1 0 00.95.69h3.692c.969 0 1.371 1.24.588 1.81l-2.988 2.172a1 1 0 00-.364 1.118l1.147 3.51c.3.921-.755 1.688-1.54 1.118l-2.988-2.172a1 1 0 00-1.176 0l-2.988 2.172c-.784.57-1.838-.197-1.539-1.118l1.146-3.51a1 1 0 00-.364-1.118L2.674 8.937c-.783-.57-.38-1.81.588-1.81h3.692a1 1 0 00.951-.69l1.144-3.51z" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
              <span className="ml-2 text-gray-600">
                {product.average_rating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}

            {/* Store Info */}
            {storeInfo && (
              <div className="flex items-center mb-6 justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={storeInfo.business_logo_url}
                      alt={storeInfo.business_name}
                      className="w-12 h-12 rounded-xl"
                    />
                  </div>
                  <span className="text-gray-800 font-bold text-3xl">{storeInfo.business_name}</span>
                </div>
                <button 
                  onClick={() => visitStore(storeInfo.business_id)} 
                  className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600"
                >
                  Visit Store
                </button>
              </div>
            )}

            <div className="bg-gray-100 p-4 rounded-lg flex items-start justify-between mb-6">
              <div className="flex items-start space-x-6 md:space-x-8">
                <div>
                  <label className="block text-sm uppercase text-gray-500 mb-1 tracking-wide font-medium">Quantity</label>
                  <div className="flex items-center border border-gray-300 rounded overflow-hidden w-fit mt-1">
                    <button onClick={handleDecrement} className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200">−</button>
                    <span className="px-4 py-1 font-medium border-l border-r border-gray-300">{currentQuantity}</span>
                    <button onClick={handleIncrement} className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200">+</button>
                  </div>
                </div>
                <div>
                <div>
                <div className="text-sm uppercase text-gray-500 mb-1 tracking-wide">Color</div>
                  <div className="flex flex-wrap gap-2 mt-1 mb-4">
                    {product.colors?.length > 0 ? (
                    product.colors.map((color) => (
                    <button
                      key={color.color_id}
                      onClick={() => {
                      setSelectedColor(color.color_id);
                      setSelectedSize(null);
                      }}
                      className={`px-3 py-1 rounded border text-sm font-medium flex items-center ${selectedColor === color.color_id ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                      style={{ backgroundColor: color.color_code }}
                      title={color.color_name}
                    >
                  <span 
                    className={`inline-block w-4 h-4 rounded-full mr-2 ${selectedColor === color.color_id ? 'ring-1 ring-white' : ''}`}
                    style={{ backgroundColor: color.color_code }}
                  />
                    {color.color_name}
                  </button>
                  ))
                ) : (
                  <span className="text-sm font-medium text-gray-900">No Colors Available</span>
                )}
              </div>

              <div className="text-sm uppercase text-gray-500 mb-1 tracking-wide">Size</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {product.colors?.length > 0 && !selectedColor ? (
                  <span className="text-sm font-medium text-gray-900">Please select a color first</span>
                ) : product.sizes?.filter(size => 
                    !product.colors?.length ||  // If no colors, show all sizes
                    (selectedColor && size.color_id === selectedColor)
                  ).length > 0 ? (
                  product.sizes
                    .filter(size => 
                      !product.colors?.length ||  // If no colors, show all sizes
                      (selectedColor && size.color_id === selectedColor)
                    )
                    .map((size) => (
                      <button
                        key={size.size_id}
                        onClick={() => handleSizeClick(size.size)}
                        className={`px-3 py-1 rounded border text-sm font-medium ${selectedSize === size.size ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-black'}`}
                        disabled={size.quantity <= 0}
                      >
                        {size.size}
                        {size.quantity <= 0 && <span className="text-xs text-red-500 ml-1">(out of stock)</span>}
                      </button>
                    ))
                ) : (
                  <span className="text-sm font-medium text-gray-900">
                    {product.colors?.length ? 'No sizes available for selected color' : 'No sizes available'}
                  </span>
                )}
              </div>
            </div>
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">${parseFloat(product.product_price).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => onAddToCart({ 
                  productId: product.product_id,
                  quantity: currentQuantity, 
                  size: selectedSize 
                })}
                disabled={!selectedSize}
                className={`flex-1 bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 ${!selectedSize ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Add to cart
              </button>
              <button
                onClick={() => onAddToWishlist(product.product_id)}
                className="flex-1 flex items-center justify-center border border-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-100"
              >
                Add to wishlist <HeartIcon />
              </button>
            </div>
          </div>
        </div>

        {/* User Reviews Section - Full Width */}
        {reviews && reviews.length > 0 && (
          <div className="mt-12 pb-8 pt-4 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-6 px-4">User Reviews</h2>
            
            <div className="relative">
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2"
                onClick={() => handleScroll('left', reviewContainerRef)}
              >
                ◀
              </button>
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2"
                onClick={() => handleScroll('right', reviewContainerRef)}
              >
                ▶
              </button>

              <div
                ref={reviewContainerRef}
                className="flex overflow-x-auto space-x-6 px-4 pb-4 snap-x scroll-smooth"
              >
                {reviews.map((review, index) => (
                  <div
                    key={index}
                    className="w-[300px] sm:w-[400px] snap-start bg-white shadow-md border border-gray-200 rounded-xl p-4 flex-shrink-0"
                  >
                    <div className="flex items-center mb-2">
                      <h4 className="font-semibold text-gray-800 mr-2">{review.username}</h4>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className="w-4 h-4"
                            fill={review.rating >= star ? '#FFD700' : '#E5E7EB'}
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.146 3.51a1 1 0 00.95.69h3.692c.969 0 1.371 1.24.588 1.81l-2.988 2.172a1 1 0 00-.364 1.118l1.147 3.51c.3.921-.755 1.688-1.54 1.118l-2.988-2.172a1 1 0 00-1.176 0l-2.988 2.172c-.784.57-1.838-.197-1.539-1.118l1.146-3.51a1 1 0 00-.364-1.118L2.674 8.937c-.783-.57-.38-1.81.588-1.81h3.692a1 1 0 00.951-.69l1.144-3.51z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    {review.review_media && (
                      review.review_media.endsWith('.mp4') ? (
                        <video
                          src={`http://localhost:8080${review.review_media}`}
                          controls
                          className="w-full h-48 object-contain rounded-lg mb-3"
                        />
                      ) : (
                        <img
                          src={`http://localhost:8080${review.review_media}`}
                          alt="review"
                          className="w-full h-48 object-contain rounded-lg mb-3"
                        />
                      )
                    )}
                    <p className="text-gray-700 text-sm break-words overflow-hidden text-ellipsis">{review.review_text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Related Products Section - Full Width */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 pb-12 pt-4 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-6 px-4">You may also like</h2>
            
            <div className="relative">
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2"
                onClick={() => handleScroll('left', relatedProductsRef)}
              >
                ◀
              </button>
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2"
                onClick={() => handleScroll('right', relatedProductsRef)}
              >
                ▶
              </button>

              <div
                ref={relatedProductsRef}
                className="flex overflow-x-auto space-x-4 px-4 pb-4 snap-x scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              >
                {relatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct.product_id}
                    className="w-64 min-w-[256px] bg-white shadow-md border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow duration-300 snap-start"
                    onClick={() => window.location.href = `/product/${relatedProduct.url_key}`}
                  >
                    <div className="relative pb-[100%] mb-3"> {/* Aspect ratio box */}
                      {relatedProduct.images?.[0] ? (
                        <img
                          src={`http://localhost:8080${relatedProduct.images[0]}`}
                          alt={relatedProduct.product_name}
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-800 line-clamp-2 mb-1">
                      {relatedProduct.product_name}
                    </h3>
                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-4 h-4"
                          fill={star <= Math.round(relatedProduct.average_rating || 0) ? '#FFD700' : '#E5E7EB'}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.146 3.51a1 1 0 00.95.69h3.692c.969 0 1.371 1.24.588 1.81l-2.988 2.172a1 1 0 00-.364 1.118l1.147 3.51c.3.921-.755 1.688-1.54 1.118l-2.988-2.172a1 1 0 00-1.176 0l-2.988 2.172c-.784.57-1.838-.197-1.539-1.118l1.146-3.51a1 1 0 00-.364-1.118L2.674 8.937c-.783-.57-.38-1.81.588-1.81h3.692a1 1 0 00.951-.69l1.144-3.51z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-red-600 font-semibold">${parseFloat(relatedProduct.product_price).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDescription;