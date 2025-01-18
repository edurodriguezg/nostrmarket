import React, { useState, useEffect } from 'react';
import NostrMarketplace from '../lib/NostrMarketplace';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="text-xl font-semibold">{product.title || 'Untitled Product'}</h3>
      <p className="text-gray-600">{product.description || 'No description provided'}</p>
      
      <div className="flex justify-between items-center">
        <span className="font-bold">
          {product.price ? `${product.price} ${product.currency || 'BTC'}` : 'Price not set'}
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
        {product.notes && (
          <p><strong>Notes:</strong> {product.notes}</p>
        )}
      </div>
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
      <h1 className="text-3xl font-bold mb-8">Nostr Marketplace</h1>

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
        <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Add New Product</h2>
        <ProductForm onSubmit={handleProductSubmit} />
      </div>
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