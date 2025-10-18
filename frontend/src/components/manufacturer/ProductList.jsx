import React, { useState, useEffect } from 'react';
import { Package, Search, Filter } from 'lucide-react';
import Loader from '../shared/Loader';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['all', 'Electronics', 'Pharmaceuticals', 'Fashion & Apparel', 'Food & Beverages', 'Other'];

  // Mock data - In production, fetch from blockchain or backend
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockProducts = [
        {
          productId: 'ELE-123456-001',
          productName: 'iPhone 15 Pro',
          batchNumber: 'BATCH-2024-Q4-001',
          category: 'Electronics',
          manufactureDate: new Date('2024-10-01'),
          status: 'Available'
        },
        {
          productId: 'ELE-123457-002',
          productName: 'Samsung Galaxy S24',
          batchNumber: 'BATCH-2024-Q4-002',
          category: 'Electronics',
          manufactureDate: new Date('2024-10-05'),
          status: 'Sold'
        },
        {
          productId: 'PHA-123458-003',
          productName: 'Medicine XYZ',
          batchNumber: 'BATCH-2024-Q3-015',
          category: 'Pharmaceuticals',
          manufactureDate: new Date('2024-09-15'),
          status: 'Available'
        }
      ];
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and search
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    // Search
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, filterCategory, products]);

  if (loading) {
    return <Loader message="Loading products..." />;
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '40px auto',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        padding: '30px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '30px'
        }}>
          <Package size={32} style={{ color: '#4F46E5' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '28px', color: '#1F2937' }}>
              Product Inventory
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#6B7280' }}>
              {filteredProducts.length} products
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '15px',
          marginBottom: '25px'
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search 
              size={20} 
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Product ID, Name, or Batch..."
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ position: 'relative', minWidth: '200px' }}>
            <Filter 
              size={20} 
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }}
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                  Product ID
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                  Product Name
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                  Batch Number
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                  Category
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                  Manufacture Date
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, idx) => (
                  <tr 
                    key={idx}
                    style={{
                      borderBottom: '1px solid #E5E7EB',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '14px', color: '#4F46E5', fontWeight: '600' }}>
                      {product.productId}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#1F2937' }}>
                      {product.productName}
                    </td>
                    <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '13px', color: '#6B7280' }}>
                      {product.batchNumber}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#6B7280' }}>
                      {product.category}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#6B7280' }}>
                      {product.manufactureDate.toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: product.status === 'Available' ? '#D1FAE5' : '#FEF3C7',
                        color: product.status === 'Available' ? '#065F46' : '#92400E'
                      }}>
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductList;