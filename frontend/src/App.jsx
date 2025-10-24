import './App.css'
import { UserInfo } from './components/UserInfo'
import { WalletProvider } from "./context/WalletContext";
import { ContractProvider } from './context/ContractContext';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MakeManufacturer from './components/admin/makeManufacturer';
import MakeRetailer from './components/admin/makeRetailer';
import AddProduct from './components/manufacturer/AddProduct';
import GetProduct from './components/consumer/GetProduct';
import VerifyProduct from './components/consumer/VerifyProduct';
import SellProduct from './components/retailers/SellProduct';
import ViewProducts from './components/manufacturer/ViewProducts';

function App() {
  return (
    <WalletProvider>
      <ContractProvider>
        <BrowserRouter>
          <h1>
            Blockchain QR Product Verifier
          </h1>
          <div style={{ padding: 12, border: '1px solid #ccc'}}>
            <Routes>
              <Route path="/" element={<UserInfo />} />
              <Route path="/add-manufacturer" element={<MakeManufacturer />} />
              <Route path="/add-retailer" element={<MakeRetailer />} />
              <Route path="/add-product" element={<AddProduct />} />
              <Route path="/get-product" element={<GetProduct />} />
              <Route path="/verify-product" element={<VerifyProduct />} />
              <Route path="/sell-product" element={<SellProduct />} />
              <Route path="/view-products" element={<ViewProducts />} />
            </Routes>
          </div>

          <div style={{margin: 10}}>
            <Link to="/">Home</Link> 
          </div>

          <div style={{display: 'flex', gap: 5, flexDirection: 'column'}}>
            <strong>Actions - Admin</strong>
            <Link to="/add-manufacturer">Add Manufacturer</Link>
            <Link to="/add-retailer">Add Retailer</Link>

            <strong>Actions - Manufacturer</strong>
            <Link to="/add-product">Add Product</Link>
            <Link to="/get-product">Get Product</Link>
            <Link to="/view-products">View Products</Link>

            <strong>Actions - Retailer</strong>
            <Link to="/sell-product">Sell Product</Link>

            <strong>Actions - Consumer</strong>
            <Link to="/verify-product">Verify Product</Link>
          </div>

          <div>
            
          </div>
        </BrowserRouter>
      </ContractProvider>
    </WalletProvider>
  )
}

export default App
