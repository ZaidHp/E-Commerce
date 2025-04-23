import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const CategoryItem = ({ 
  parentCategory, 
  selectedCategory, 
  setSelectedCategory,
  expandedCategories,
  toggleCategory 
}) => {
  const hasSubcategories = parentCategory.subcategories?.length > 0;
  const isExpanded = expandedCategories.includes(parentCategory.id);

  return (
    <>
      <li>
        <div className="flex items-center">
          <button
            onClick={() => {
              setSelectedCategory(parentCategory.id);
              if (hasSubcategories) {
                toggleCategory(parentCategory.id);
              }
            }}
            className={`flex-1 text-left p-2 rounded ${
              selectedCategory === parentCategory.id 
                ? 'bg-blue-100 text-blue-600' 
                : 'hover:bg-gray-100'
            }`}
          >
            {parentCategory.name}
          </button>
          {hasSubcategories && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(parentCategory.id);
              }}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          )}
        </div>
      </li>
      {hasSubcategories && isExpanded && (
        <div className="ml-4">
          {parentCategory.subcategories.map(subcategory => (
            <li key={`subcat-${subcategory.id}`}>
              <button
                onClick={() => setSelectedCategory(subcategory.id)}
                className={`w-full text-left p-2 rounded ${
                  selectedCategory === subcategory.id 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {subcategory.name}
              </button>
            </li>
          ))}
        </div>
      )}
    </>
  );
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const [categoryStructure, setCategoryStructure] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, priceRange, sortOption]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/productPage");
      const data = await res.json();
      setProducts(data.products || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch products', err);
      setProducts([]);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/categories");
      const data = await res.json();
      setCategoryStructure(data);
      
      const flatCategories = data.reduce((acc, parent) => {
        return [...acc, parent, ...parent.subcategories];
      }, []);
      setCategories(flatCategories);
    } catch (err) {
      console.error('Failed to fetch categories', err);
      setCategories([]);
      setCategoryStructure([]);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filterProducts = () => {
    const sourceProducts = Array.isArray(products) ? products : [];
    let result = [...sourceProducts];

    if (searchTerm) {
      result = result.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      const selectedCategoryObj = categories.find(c => c.id === selectedCategory);
      if (selectedCategoryObj) {
        if (selectedCategoryObj.subcategories) {
          const subcategoryIds = selectedCategoryObj.subcategories.map(sc => sc.id);
          result = result.filter(product => 
            product.categoryId === selectedCategory || 
            subcategoryIds.includes(product.categoryId)
          );
        } else {
          result = result.filter(product => product.categoryId === selectedCategory);
        }
      }
    }

    result = result.filter(product => {
      const price = Number(product.price) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'popular':
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  };

  const handleProductClick = (urlKey) => {
    navigate(`/product/${urlKey}`);
  };

  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white p-4 shadow-md hidden md:block">
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <ul className="space-y-2">
          <li key="all-categories">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full text-left p-2 rounded ${
                !selectedCategory ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              All Categories
            </button>
          </li>
          {categoryStructure.map(parentCategory => (
            <CategoryItem
              key={`parent-${parentCategory.id}`}
              parentCategory={parentCategory}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              expandedCategories={expandedCategories}
              toggleCategory={toggleCategory}
            />
          ))}
        </ul>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Price Range</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"
              >
                <FiFilter />
                Filters
                {showFilters ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="mt-4 md:hidden bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Categories</h3>
              <div className="space-y-2 mb-4">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left p-2 rounded-lg ${
                    !selectedCategory ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  All Categories
                </button>
                {categoryStructure.map(parentCategory => (
                  <div key={`mobile-parent-${parentCategory.id}`}>
                    <button
                      onClick={() => {
                        setSelectedCategory(parentCategory.id);
                        toggleCategory(parentCategory.id);
                      }}
                      className={`w-full text-left p-2 rounded-lg flex items-center justify-between ${
                        selectedCategory === parentCategory.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      {parentCategory.name}
                      {parentCategory.subcategories?.length > 0 && (
                        <span>
                          {expandedCategories.includes(parentCategory.id) ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          )}
                        </span>
                      )}
                    </button>
                    {parentCategory.subcategories?.length > 0 && 
                      expandedCategories.includes(parentCategory.id) && (
                        <div className="ml-4">
                          {parentCategory.subcategories.map(subcategory => (
                            <button
                              key={`mobile-subcat-${subcategory.id}`}
                              onClick={() => setSelectedCategory(subcategory.id)}
                              className={`w-full text-left p-2 rounded-lg ${
                                selectedCategory === subcategory.id
                                  ? 'bg-blue-400 text-white'
                                  : 'bg-gray-100'
                              }`}
                            >
                              {subcategory.name}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>

              <h3 className="font-bold mb-2">Price Range</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 cursor-pointer"
                    onClick={() => handleProductClick(product.urlKey)}
                  >
                    {product.images?.length > 0 ? (
                      <img
                        src={`http://localhost:8080${product.images[0]}`}
                        alt={product.name}
                        className="h-48 w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300';
                        }}
                      />
                    ) : (
                      <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h2 className="text-lg font-bold mb-1">{product.name || 'No Name'}</h2>
                      <p className="text-gray-600 text-sm mb-2">
                        {product.category?.name || 'No Category'}
                        {product.category?.subcategories?.length > 0 && (
                          ` > ${product.category.subcategories[0].name}`
                        )}
                      </p>
                      <p className="text-gray-800 font-semibold text-xl mb-3">
                        ${Number(product.price)?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {truncateDescription(product.description)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-xl text-gray-500">No products found matching your criteria</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory(null);
                      setPriceRange([0, 1000]);
                    }}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredProducts.length > productsPerPage && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center gap-1">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded ${
                        currentPage === number 
                          ? 'bg-blue-500 text-white' 
                          : 'border hover:bg-gray-100'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-100"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;