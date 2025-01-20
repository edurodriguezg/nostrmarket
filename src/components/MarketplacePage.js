import React, { useState, useEffect } from 'react';
import NostrMarketplace from '../lib/NostrMarketplace';

const ImageModal = ({ image, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="max-w-4xl max-h-[90vh] p-2 bg-white rounded-lg">
        <img 
          src={image} 
          alt="Tamaño completo" 
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
            alt={`Vista previa ${index + 1}`}
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
    deliveryMethods: [],
    website: '',
    contactInfo: '',
    images: [],
    notes: '',
    categories: []
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 3) {
      alert('Máximo 3 imágenes permitidas');
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
        console.error('Error al procesar la imagen:', error);
        alert('Error al procesar la imagen. Por favor, intente con otra.');
      }
    }
    
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
    setFormData({
      title: '',
      description: '',
      price: '',
      currency: 'BTC',
      paymentMethods: [],
      deliveryMethods: [],
      website: '',
      contactInfo: '',
      images: [],
      notes: '',
      categories: []
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Título</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
          className="w-full p-2 border rounded"
          placeholder="Nombre del producto"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
          className="w-full p-2 border rounded"
          rows="4"
          placeholder="Describe tu producto"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Imágenes (Máximo 3, se redimensionarán si es necesario)
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
          <label className="block text-sm font-medium mb-1">Precio</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
            className="w-full p-2 border rounded"
            placeholder="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Moneda</label>
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
        <label className="block text-sm font-medium mb-1">Métodos de Pago</label>
        <div className="space-y-2">
          {[
            { id: 'Lightning', label: 'Lightning Network' },
            { id: 'On-chain Bitcoin', label: 'Bitcoin On-chain' }
          ].map(method => (
            <label key={method.id} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.paymentMethods.includes(method.id)}
                onChange={(e) => {
                  const methods = e.target.checked
                    ? [...formData.paymentMethods, method.id]
                    : formData.paymentMethods.filter(m => m !== method.id);
                  setFormData(prev => ({...prev, paymentMethods: methods}));
                }}
                className="mr-2"
              />
              {method.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Método de Entrega</label>
        <div className="space-y-2">
          {[
            { id: 'Presencial', label: 'Presencial' },
            { id: 'Digital', label: 'Digital / Online' },
            { id: 'Envio', label: 'Envío a domicilio' }
          ].map(method => (
            <label key={method.id} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.deliveryMethods.includes(method.id)}
                onChange={(e) => {
                  const methods = e.target.checked
                    ? [...formData.deliveryMethods, method.id]
                    : formData.deliveryMethods.filter(m => m !== method.id);
                  setFormData(prev => ({...prev, deliveryMethods: methods}));
                }}
                className="mr-2"
              />
              {method.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Sitio Web (opcional)</label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => setFormData(prev => ({...prev, website: e.target.value}))}
          className="w-full p-2 border rounded"
          placeholder="https://ejemplo.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Información de Contacto</label>
        <input
          type="text"
          value={formData.contactInfo}
          onChange={(e) => setFormData(prev => ({...prev, contactInfo: e.target.value}))}
          className="w-full p-2 border rounded"
          placeholder="Telegram, correo electrónico, etc."
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Publicar Producto
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
              alt={`Producto ${index + 1}`}
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
          Seguir Vendedor
        </button>
      </div>

      <div className="space-y-2 text-sm">
        {product.paymentMethods?.length > 0 && (
          <p><strong>Pago:</strong> {product.paymentMethods.map(method => 
            method === 'Lightning' ? 'Lightning Network' : 
            method === 'On-chain Bitcoin' ? 'Bitcoin On-chain' : 
            method
          ).join(', ')}</p>
        )}
        {product.deliveryMethods?.length > 0 && (
          <p><strong>Entrega:</strong> {product.deliveryMethods.join(', ')}</p>
        )}
        {product.website && (
          <p>
            <strong>Sitio Web:</strong>{' '}
            <a href={product.website} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
              {product.website}
            </a>
          </p>
        )}
        {product.contactInfo && (
          <p><strong>Contacto:</strong> {product.contactInfo}</p>
        )}
        {product.notes && <p><strong>Notas:</strong> {product.notes}</p>}
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
    try {
      await client.followSeller(pubkey);
      alert('¡Vendedor seguido exitosamente!');
    } catch (error) {
      alert('Error al seguir al vendedor: ' + error.message);
    }
  };

  const handleProductSubmit = async (productData) => {
    if (!client) return;
    
    try {
      await client.publishProduct(productData);
      alert('¡Producto publicado exitosamente!');
      
      // Refresh products
      const products = await client.searchProducts({});
      setProducts(products);
    } catch (error) {
      alert('Error al publicar el producto: ' + error.message);
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
            placeholder="Buscar productos..."
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Buscar
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Añadir Nuevo Producto</h2>
        <ProductForm onSubmit={handleProductSubmit} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p>Cargando...</p>
        ) : products.length === 0 ? (
          <p>No se encontraron productos</p>
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