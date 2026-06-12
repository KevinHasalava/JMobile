import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import axios from 'axios';
import api, { API_BASE_URL } from '../../services/api';
import toast from 'react-hot-toast';
import { formatRupees, getImageUrl } from '../../utils/currency';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filters, setFilters] = useState({ brands: [], categories: [] });
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, pages: 1, total: 0 });
  const [uploadingFiles, setUploadingFiles] = useState(false);
  
  // Brand and Category modal states
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingBrand, setAddingBrand] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  
  // File upload states
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    model: '',
    price: '',
    originalPrice: '',
    stock: '',
    description: '',
    image: '',
    images: [],
    video: '',
    discount: 0,
    specifications: {
      display: '',
      processor: '',
      ram: '',
      storage: '',
      camera: '',
      battery: '',
      os: '',
      color: []
    }
  });

  useEffect(() => {
    fetchProducts();
    fetchBrandsAndCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand, selectedCategory, searchTerm, pagination.currentPage]); // fetch fns omitted intentionally

  const fetchBrandsAndCategories = async () => {
    try {
      // Use shared `api` instance — token injected automatically via interceptor
      const [brandsResponse, categoriesResponse] = await Promise.all([
        api.get('/brands'),
        api.get('/categories')
      ]);

      setFilters({
        brands: brandsResponse.data.data.map(b => b.name),
        categories: categoriesResponse.data.data.map(c => c.name)
      });
    } catch (error) {
      console.error('Error fetching brands/categories:', error);
    }
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      toast.error('Please enter a brand name');
      return;
    }

    setAddingBrand(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/brands',
        { name: newBrandName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Brand added successfully!');
      setNewBrandName('');
      setShowBrandModal(false);

      // Refresh brands list
      await fetchBrandsAndCategories();

      // Set the newly added brand in the form
      setFormData({ ...formData, brand: response.data.data.name });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add brand');
    } finally {
      setAddingBrand(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setAddingCategory(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/categories',
        { name: newCategoryName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Category added successfully!');
      setNewCategoryName('');
      setShowCategoryModal(false);

      // Refresh categories list
      await fetchBrandsAndCategories();

      // Set the newly added category in the form
      setFormData({ ...formData, category: response.data.data.name });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add category');
    } finally {
      setAddingCategory(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Build query string properly — passing a plain object to axios `params`
      // lets it serialize correctly (e.g. ?page=1&limit=10&brand=Apple)
      const params = { page: pagination.currentPage, limit: 10 };
      if (searchTerm)       params.search   = searchTerm;
      if (selectedBrand)    params.brand    = selectedBrand;
      if (selectedCategory) params.category = selectedCategory;

      const response = await api.get('/admin/products', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      setProducts(response.data.data);
      setFilters(response.data.filters || { brands: [], categories: [] });
      setPagination({
        currentPage: response.data.currentPage,
        pages: response.data.pages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadingFiles(true);

    try {
      const token = localStorage.getItem('token');
      // Explicit auth header — passed on every call including multipart uploads
      const authHeader = { Authorization: `Bearer ${token}` };

      let uploadedImages = formData.images || [];
      let uploadedVideo  = formData.video  || '';

      // ── Step 1: Upload media files if any were selected ──────────────────────
      if (imageFiles.length > 0 || videoFile) {
        const uploadFormData = new FormData();

        imageFiles.forEach(file => uploadFormData.append('images', file));
        if (videoFile) uploadFormData.append('video', videoFile);

        const uploadResponse = await api.post(
          '/upload/product',
          uploadFormData,
          {
            headers: {
              // Do NOT set Content-Type manually for multipart/form-data —
              // axios must set it automatically so it can include the correct
              // multipart boundary (e.g. multipart/form-data; boundary=----xyz).
              // Overriding it here strips the boundary and breaks server-side parsing.
              ...authHeader
            }
          }
        );

        if (uploadResponse.data.data.images?.length > 0) {
          const newImagePaths = uploadResponse.data.data.images.map(
            img => `${window.location.origin}${img.path}`
          );
          uploadedImages = [...uploadedImages, ...newImagePaths];
        }

        if (uploadResponse.data.data.video) {
          uploadedVideo = `${window.location.origin}${uploadResponse.data.data.video.path}`;
        }
      }

      // ── Step 2: Save or update the product record ─────────────────────────────
      const productData = {
        ...formData,
        price:         parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice) || parseFloat(formData.price),
        stock:         parseInt(formData.stock),
        images:        uploadedImages,
        image:         uploadedImages[0] || formData.image,
        video:         uploadedVideo
      };

      if (editingProduct) {
        await api.put(
          `/admin/products/${editingProduct._id}`,
          productData,
          { headers: authHeader }
        );
        toast.success('Product updated successfully!');
      } else {
        await api.post(
          '/admin/products',
          productData,
          { headers: authHeader }
        );
        toast.success('Product created successfully!');
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Error saving product');
    } finally {
      setUploadingFiles(false);
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setImageFiles(files);

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Handle video file selection
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video file size should not exceed 50MB');
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  // Remove image from existing images
  const removeExistingImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
  };

  // Remove selected image file before upload
  const removeImageFile = (index) => {
    const updatedFiles = imageFiles.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
  };

  // Remove video
  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setFormData({ ...formData, video: '' });
  };

  const handleDelete = async (id, productName) => {
    // Custom confirmation modal using toast
    toast((t) => (
      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-semibold text-text-primary">Delete Product?</p>
        </div>
        <p className="text-text-secondary text-sm">
          Are you sure you want to delete <span className="font-semibold text-primary">"{productName}"</span>? This action cannot be undone.
        </p>
        <div className="flex space-x-2 pt-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const deletePromise = (async () => {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_BASE_URL}/admin/products/${id}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                await fetchProducts();
              })();

              toast.promise(deletePromise, {
                loading: 'Deleting product...',
                success: 'Product deleted successfully!',
                error: (err) => `Failed to delete: ${err.response?.data?.message || err.message}`
              });
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 bg-dark-bg hover:bg-dark-border text-text-primary px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: {
        background: '#1C1C1E',
        border: '1px solid #2C2C2E',
        padding: '16px',
        maxWidth: '500px',
      }
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      model: product.model || '',
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      stock: product.stock,
      description: product.description || '',
      image: product.image || '',
      images: product.images || [],
      video: product.video || '',
      discount: product.discount || 0,
      specifications: {
        display: product.specifications?.display || '',
        processor: product.specifications?.processor || '',
        ram: product.specifications?.ram || '',
        storage: product.specifications?.storage || '',
        camera: product.specifications?.camera || '',
        battery: product.specifications?.battery || '',
        os: product.specifications?.os || '',
        color: product.specifications?.color || []
      }
    });
    
    // Clear file upload states
    setImageFiles([]);
    setImagePreviews([]);
    setVideoFile(null);
    setVideoPreview(null);
    
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category: '',
      model: '',
      price: '',
      originalPrice: '',
      stock: '',
      description: '',
      image: '',
      images: [],
      video: '',
      discount: 0,
      specifications: {
        display: '',
        processor: '',
        ram: '',
        storage: '',
        camera: '',
        battery: '',
        os: '',
        color: []
      }
    });
    
    // Clear file upload states
    setImageFiles([]);
    setImagePreviews([]);
    setVideoFile(null);
    setVideoPreview(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Products Management</h2>
            <p className="text-text-muted">Manage your product inventory</p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-gradient-orange text-white px-6 py-3 rounded-lg hover:shadow-glow-orange transition-all font-semibold flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Product</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
            />
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
            >
              <option value="">All Brands</option>
              {filters.brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
            >
              <option value="">All Categories</option>
              {filters.categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="text-text-muted flex items-center justify-end">
              Total: {pagination.total} products
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-bg border-b border-dark-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase">Brand</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase">Stock</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-text-muted uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-dark-bg transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={getImageUrl(product.image || product.images)}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-text-primary font-medium">{product.name}</div>
                      {product.description && (
                        <div className="text-text-muted text-sm truncate max-w-xs">
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{product.brand}</td>
                    <td className="px-6 py-4 text-text-secondary">{product.category}</td>
                    <td className="px-6 py-4">
                      <div className="text-primary font-bold">{formatRupees(product.price)}</div>
                      {product.originalPrice && product.originalPrice !== product.price && (
                        <div className="text-text-muted text-sm line-through">
                          {formatRupees(product.originalPrice)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.stock > 10
                            ? 'bg-green-500/20 text-green-500'
                            : product.stock > 0
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-500 hover:text-blue-400 mr-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        className="text-red-500 hover:text-red-400"
                        title="Delete product"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-text-primary hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-text-muted">
              Page {pagination.currentPage} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
              disabled={pagination.currentPage === pagination.pages}
              className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-text-primary hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-card border border-dark-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-text-primary mb-6">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-primary font-medium mb-2">Product Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-text-primary font-medium mb-2">Brand</label>
                      <div className="relative">
                        <select
                          required
                          value={formData.brand}
                          onChange={(e) => {
                            if (e.target.value === '__add_new__') {
                              setShowBrandModal(true);
                            } else {
                              setFormData({ ...formData, brand: e.target.value });
                            }
                          }}
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary appearance-none cursor-pointer"
                        >
                          <option value="">Select Brand</option>
                          {filters.brands.map((brand) => (
                            <option key={brand} value={brand}>
                              {brand}
                            </option>
                          ))}
                          <option value="__add_new__" className="text-primary font-semibold">
                            + Add New Brand
                          </option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-primary font-medium mb-2">Category</label>
                      <div className="relative">
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => {
                            if (e.target.value === '__add_new__') {
                              setShowCategoryModal(true);
                            } else {
                              setFormData({ ...formData, category: e.target.value });
                            }
                          }}
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary appearance-none cursor-pointer"
                        >
                          <option value="">Select Category</option>
                          {filters.categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                          <option value="__add_new__" className="text-primary font-semibold">
                            + Add New Category
                          </option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-text-primary font-medium mb-2">Stock</label>
                      <input
                        type="number"
                        required
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-text-primary font-medium mb-2">Price (Rs.)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-semibold">
                          Rs.
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={formData.price}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || parseFloat(value) >= 0) {
                              setFormData({ ...formData, price: value });
                            }
                          }}
                          onBlur={(e) => {
                            // Format to 2 decimal places on blur
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              setFormData({ ...formData, price: value.toFixed(2) });
                            }
                          }}
                          placeholder="0.00"
                          className="w-full pl-14 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                        />
                      </div>
                      <p className="text-text-muted text-xs mt-1">Enter amount in Sri Lankan Rupees</p>
                    </div>
                    <div>
                      <label className="block text-text-primary font-medium mb-2">Original Price (Rs.)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-semibold">
                          Rs.
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.originalPrice}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || parseFloat(value) >= 0) {
                              setFormData({ ...formData, originalPrice: value });
                            }
                          }}
                          onBlur={(e) => {
                            // Format to 2 decimal places on blur
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              setFormData({ ...formData, originalPrice: value.toFixed(2) });
                            }
                          }}
                          placeholder="0.00"
                          className="w-full pl-14 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                        />
                      </div>
                      <p className="text-text-muted text-xs mt-1">Optional: For showing discount</p>
                    </div>
                    <div>
                      <label className="block text-text-primary font-medium mb-2">Discount (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={formData.discount}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                              setFormData({ ...formData, discount: value });
                            }
                          }}
                          placeholder="0"
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-semibold">
                          %
                        </span>
                      </div>
                      <p className="text-text-muted text-xs mt-1">Discount percentage (0-100)</p>
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-4">
                    <label className="block text-text-primary font-medium mb-2">
                      Product Images (Max 5 images)
                    </label>
                    
                    {/* Existing Images */}
                    {formData.images && formData.images.length > 0 && (
                      <div className="mb-3">
                        <p className="text-text-muted text-sm mb-2">Existing Images:</p>
                        <div className="grid grid-cols-5 gap-2">
                          {formData.images.map((img, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={getImageUrl(img)} 
                                alt={`Product ${index + 1}`} 
                                className="w-full h-20 object-cover rounded-lg border border-dark-border"
                              />
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Image File Input */}
                    <div className="border-2 border-dashed border-dark-border rounded-lg p-6 hover:border-primary transition-colors">
                      <input
                        type="file"
                        id="images"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label htmlFor="images" className="cursor-pointer">
                        <div className="text-center">
                          <svg className="w-12 h-12 text-text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-text-primary font-medium">Upload Images</p>
                          <p className="text-text-muted text-sm">PNG, JPG, GIF, WEBP up to 5MB each</p>
                        </div>
                      </label>
                    </div>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-5 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={preview} 
                              alt={`Preview ${index + 1}`} 
                              className="w-full h-20 object-cover rounded-lg border-2 border-green-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeImageFile(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <span className="absolute bottom-1 right-1 bg-green-500 text-white text-xs px-1 rounded">New</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Video Upload Section */}
                  <div className="space-y-4">
                    <label className="block text-text-primary font-medium mb-2">
                      Product Video (Optional)
                    </label>

                    {/* Existing Video */}
                    {formData.video && !videoPreview && (
                      <div className="mb-3">
                        <p className="text-text-muted text-sm mb-2">Existing Video:</p>
                        <div className="relative group">
                          <video 
                            src={formData.video} 
                            className="w-full h-40 object-cover rounded-lg border border-dark-border"
                            controls
                          />
                          <button
                            type="button"
                            onClick={removeVideo}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Video File Input */}
                    {!videoPreview && (
                      <div className="border-2 border-dashed border-dark-border rounded-lg p-6 hover:border-primary transition-colors">
                        <input
                          type="file"
                          id="video"
                          accept="video/*"
                          onChange={handleVideoChange}
                          className="hidden"
                        />
                        <label htmlFor="video" className="cursor-pointer">
                          <div className="text-center">
                            <svg className="w-12 h-12 text-text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <p className="text-text-primary font-medium">Upload Video</p>
                            <p className="text-text-muted text-sm">MP4, AVI, MOV up to 50MB</p>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* Video Preview */}
                    {videoPreview && (
                      <div className="relative group">
                        <video 
                          src={videoPreview} 
                          className="w-full h-40 object-cover rounded-lg border-2 border-green-500"
                          controls
                        />
                        <button
                          type="button"
                          onClick={removeVideo}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <span className="absolute bottom-2 right-2 bg-green-500 text-white text-sm px-2 py-1 rounded">New Video</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-text-primary font-medium mb-2">Description</label>
                    <textarea
                      rows="3"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter product description..."
                      className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                    ></textarea>
                  </div>

                  {/* Specifications Section */}
                  <div className="border-t border-dark-border pt-6 mt-2">
                    <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Product Specifications
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-text-primary font-medium mb-2">Model Number</label>
                        <input
                          type="text"
                          value={formData.model}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                          placeholder="e.g., iPhone 14 Pro"
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-text-primary font-medium mb-2">Display</label>
                        <input
                          type="text"
                          value={formData.specifications.display}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            specifications: { ...formData.specifications, display: e.target.value }
                          })}
                          placeholder="e.g., 6.1-inch OLED"
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-text-primary font-medium mb-2">Processor</label>
                        <input
                          type="text"
                          value={formData.specifications.processor}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            specifications: { ...formData.specifications, processor: e.target.value }
                          })}
                          placeholder="e.g., A16 Bionic"
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-text-primary font-medium mb-2">RAM</label>
                        <input
                          type="text"
                          value={formData.specifications.ram}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            specifications: { ...formData.specifications, ram: e.target.value }
                          })}
                          placeholder="e.g., 6GB"
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-text-primary font-medium mb-2">Storage</label>
                        <input
                          type="text"
                          value={formData.specifications.storage}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            specifications: { ...formData.specifications, storage: e.target.value }
                          })}
                          placeholder="e.g., 128GB, 256GB, 512GB"
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-text-primary font-medium mb-2">Camera</label>
                        <input
                          type="text"
                          value={formData.specifications.camera}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            specifications: { ...formData.specifications, camera: e.target.value }
                          })}
                          placeholder="e.g., 48MP + 12MP + 12MP"
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-text-primary font-medium mb-2">Battery</label>
                        <input
                          type="text"
                          value={formData.specifications.battery}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            specifications: { ...formData.specifications, battery: e.target.value }
                          })}
                          placeholder="e.g., 4323mAh"
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-text-primary font-medium mb-2">Operating System</label>
                        <input
                          type="text"
                          value={formData.specifications.os}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            specifications: { ...formData.specifications, os: e.target.value }
                          })}
                          placeholder="e.g., iOS 16, Android 13"
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-text-primary font-medium mb-2">Available Colors (comma-separated)</label>
                      <input
                        type="text"
                        value={formData.specifications.color.join(', ')}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          specifications: { 
                            ...formData.specifications, 
                            color: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                          }
                        })}
                        placeholder="e.g., Black, White, Gold, Silver"
                        className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                      />
                      <p className="text-text-muted text-xs mt-1">Separate colors with commas</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingProduct(null);
                        resetForm();
                      }}
                      className="px-6 py-2 border border-dark-border rounded-lg text-text-primary hover:border-primary transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploadingFiles}
                      className="px-6 py-2 bg-gradient-orange text-white rounded-lg hover:shadow-glow-orange transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {uploadingFiles ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <span>{editingProduct ? 'Update Product' : 'Add Product'}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Brand Modal */}
        {showBrandModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-card border border-dark-border rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-primary">Add New Brand</h3>
                <button
                  onClick={() => {
                    setShowBrandModal(false);
                    setNewBrandName('');
                  }}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-text-primary font-medium mb-2">Brand Name</label>
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !addingBrand) {
                        handleAddBrand();
                      }
                    }}
                    placeholder="Enter brand name (e.g., Apple, Samsung)"
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary placeholder-text-muted"
                    autoFocus
                  />
                  <p className="text-text-muted text-sm mt-1">
                    Brand names are case-sensitive and must be unique
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => {
                      setShowBrandModal(false);
                      setNewBrandName('');
                    }}
                    disabled={addingBrand}
                    className="px-6 py-2 border border-dark-border rounded-lg text-text-primary hover:border-primary transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBrand}
                    disabled={addingBrand || !newBrandName.trim()}
                    className="px-6 py-2 bg-gradient-orange text-white rounded-lg hover:shadow-glow-orange transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {addingBrand ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Brand</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-card border border-dark-border rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-primary">Add New Category</h3>
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    setNewCategoryName('');
                  }}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-text-primary font-medium mb-2">Category Name</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !addingCategory) {
                        handleAddCategory();
                      }
                    }}
                    placeholder="Enter category name (e.g., Smartphones, Tablets)"
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary placeholder-text-muted"
                    autoFocus
                  />
                  <p className="text-text-muted text-sm mt-1">
                    Category names are case-sensitive and must be unique
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => {
                      setShowCategoryModal(false);
                      setNewCategoryName('');
                    }}
                    disabled={addingCategory}
                    className="px-6 py-2 border border-dark-border rounded-lg text-text-primary hover:border-primary transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCategory}
                    disabled={addingCategory || !newCategoryName.trim()}
                    className="px-6 py-2 bg-gradient-orange text-white rounded-lg hover:shadow-glow-orange transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {addingCategory ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Category</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
