import React, { useState, useEffect } from 'react';
import NostrMarketplace from '../lib/NostrMarketplace';

const ImageModal = ({ image, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="max-w-4xl max-h-[90vh] p-2 bg-white rounded-lg">
        <img 
          src={image} 
          alt="Full size" 
          className="max-w-full max-h-[80vh] object-contain"
          onClick={e => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

const ImagePreview = ({ images, onRemove }) => {
  return (
    <div className="flex gap-2 mt-2">
      {images.map((image, index) => (
        <div key={index} className="relative">
          <img
            src={image}
            alt={`Preview ${index + 1}`}
            className="w-20 h-20 object-cover rounded"
          />
          <button
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions (max 800px width/height)
        if (width > height && width > 800) {
          height *= 800 / width;
          width = 800;
        } else if (height > 800) {
          width *= 800 / height;
          height = 800;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.7 quality
        canvas.toBlob(
          (blob) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          },
          'image/jpeg',
          0.7
        );
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const ProductForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'BTC',
    paymentMethods: [],
    website: '',
    contactInfo: '',
    deliveryMethods: [],
    images: [],
    notes: '',
    categories: []
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 3) {
      alert('Maximum 3 images allowed');
      return;
    }

    for (const file of files) {
      try {
        const compressedImage = await compressImage(file);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, compressedImage]
        }));
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try another one.');
      }
    }
    
    // Clear the input
    e.target.value = '';
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Clear form after submission
    setFormData({
      title: '',
      description: '',
      price: '',
      currency: 'BTC',
      paymentMethods: [],
      website: '',
      contactInfo: '',
      deliveryMethods: [],
      images: [],
      notes: '',
      categories: []
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
          className="w-full p-2 border rounded"
          rows="4"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Images (Max 3, will be resized if needed)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          multiple
          className="w-full p-2 border rounded"
          disabled={formData.images.length >= 3}
        />
        {formData.images.length > 0 && (
          <ImagePreview 
            images={formData.images}
            onRemove={removeImage}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData(prev => ({...prev, currency: e.target.value}))}
            className="w-full p-2 border rounded"
          >
            <option value="BTC">Bitcoin</option>
            <option value="SATS">Sats</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Payment Methods</label>
        <div className="space-y-2">
          {['Lightning', 'On-chain Bitcoin'].map(method => (
            <label key={method} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.paymentMethods.includes(method)}
                onChange={(e) => {
                  const methods = e.target.checked
                    ? [...formData.paymentMethods, method]
                    : formData.paymentMethods.filter(m => m !== method);
                  setFormData(prev => ({...prev, paymentMethods: methods}));
                }}
                className="mr-2"
              />
              {method}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Website (optional)</label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => setFormData(prev => ({...prev, website: e.target.value}))}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contact Info</label>
        <input
          type="text"
          value={formData.contactInfo}
          onChange={(e) => setFormData(prev => ({...prev, contactInfo: e.target.value}))}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        List Product
      </button>
    </form>
  );
};

const ProductCard = ({ product, onFollow }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold">{product.title}</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          #nostrmarketplace
        </span>
      </div>

      {/* Images Section */}
      {product.images?.length > 0 && (
        <div className="flex gap-2">
          {product.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Product ${index + 1}`}
              className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
              onClick={() => setSelectedImage(image)}
            />
          ))}
        </div>
      )}

      <p className="text-gray-600">{product.description}</p>
      
      <div className="flex justify-between items-center">
        <span className="font-bold">
          {product.price} {product.currency}
        </span>
        <button
          onClick={() => onFollow(product.pubkey)}
          className="text-blue-500 hover:text-blue-600"
        >
          Follow Seller
        </button>
      </div>

      <div className="space-y-2 text-sm">
        {product.paymentMethods?.length > 0 && (
          <p><strong>Payment:</strong> {product.paymentMethods.join(', ')}</p>
        )}
        {product.deliveryMethods?.length > 0 && (
          <p><strong>Delivery:</strong> {product.deliveryMethods.join(', ')}</p>
        )}
        {product.website && (
          <p>
            <strong>Website:</strong>{' '}
            <a href={product.website} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
              {product.website}
            </a>
          </p>
        )}
        {product.contactInfo && (
          <p><strong>Contact:</strong> {product.contactInfo}</p>
        )}
        {product.notes && <p><strong>Notes:</strong> {product.notes}</p>}
      </div>

      {selectedImage && (
        <ImageModal 
          image={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  );
};

const MarketplacePage = () => {
  const [client, setClient] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initMarketplace = async () => {
      const marketplace = new NostrMarketplace();
      await marketplace.connect();
      setClient(marketplace);
      
      const products = await marketplace.searchProducts({});
      setProducts(products);
      setLoading(false);
    };

    initMarketplace();
  }, []);

  const handleSearch = async () => {
    if (!client) return;
    
    setLoading(true);
    const results = await client.searchProducts({
      search: searchTerm
    });
    setProducts(results);
    setLoading(false);
  };

  const handleFollow = async (pubkey) => {
    if (!client) return;
    await client.followSeller(pubkey);
    alert('Seller followed successfully!');
  };

  const handleProductSubmit = async (productData) => {
    if (!client) return;
    
    try {
      await client.publishProduct(productData);
      alert('Product listed successfully!');
      
      // Refresh products
      const products = await client.searchProducts({});
      setProducts(products);
    } catch (error) {
      alert('Error listing product: ' + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Nostr Marketplace</h1>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          #nostrmarketplace
        </span>
      </div>

      <div className="mb-8">
        <div className="flex gap-2 mb-4">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Add New Product</h2>
        <ProductForm onSubmit={handleProductSubmit} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p>Loading...</p>
        ) : (
          products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onFollow={handleFollow}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;