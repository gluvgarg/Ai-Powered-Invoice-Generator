import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import { 
  Plus, 
  Trash2, 
  Save, 
  Sparkles,
  ArrowLeft,
  Info
} from "lucide-react";
import toast from "react-hot-toast";

const Createinvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");

  const [invoice, setInvoice] = useState({
    invoiceNumber: "INV-" + Math.floor(Math.random() * 10000),
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    billTo: {
      clientName: "",
      email: "",
      address: "",
      phone: ""
    },
    items: [
      { name: "", quantity: 1, unitPrice: 0, taxPercent: 0 }
    ],
    notes: "",
    status: "Unpaid"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("billTo.")) {
      const field = name.split(".")[1];
      setInvoice({
        ...invoice,
        billTo: { ...invoice.billTo, [field]: value }
      });
    } else {
      setInvoice({ ...invoice, [name]: value });
    }
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...invoice.items];
    newItems[index][name] = name === "name" ? value : parseFloat(value) || 0;
    setInvoice({ ...invoice, items: newItems });
  };

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { name: "", quantity: 1, unitPrice: 0, taxPercent: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = invoice.items.filter((_, i) => i !== index);
    setInvoice({ ...invoice, items: newItems });
  };

  const handleAiParse = async () => {
    if (!aiText) return toast.error("Please enter some text to parse");
    setAiLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AI.PARSE_INVOICE_TEXT, { text: aiText });
      const data = response.data;
      
      setInvoice({
        ...invoice,
        billTo: {
          ...invoice.billTo,
          clientName: data.clientName || "",
          email: data.email || "",
          address: data.address || ""
        },
        items: data.items.map(item => ({
          name: item.name || "",
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          taxPercent: 0
        }))
      });
      toast.success("Data extracted successfully!");
    } catch (error) {
      toast.error("Failed to parse text with AI");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post(API_PATHS.INVOICE.CREATE, invoice);
      toast.success("Invoice created successfully");
      navigate("/invoices");
    } catch (error) {
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice * (item.taxPercent / 100)), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate("/invoices")}
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Invoices
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
      </div>

      {/* AI Assistant Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-blue-900">AI Assistant</h2>
        </div>
        <p className="text-sm text-blue-700 mb-4 flex items-center">
          <Info className="w-4 h-4 mr-2" />
          Paste raw text (e.g. from an email or notes) to automatically fill the invoice details.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <textarea 
            className="flex-1 px-4 py-2 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-24 resize-none"
            placeholder="Example: Bill to John Doe at Acme Corp for 5 hours of consulting at $100/hr..."
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
          />
          <button 
            onClick={handleAiParse}
            disabled={aiLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {aiLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Fill Form
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Info */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900 border-b border-gray-50 pb-2">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice Number</label>
                <input 
                  type="text" 
                  name="invoiceNumber"
                  value={invoice.invoiceNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1e2a5a] focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                <select 
                  name="status"
                  value={invoice.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1e2a5a] focus:outline-none"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice Date</label>
                <input 
                  type="date" 
                  name="invoiceDate"
                  value={invoice.invoiceDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1e2a5a] focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Due Date</label>
                <input 
                  type="date" 
                  name="dueDate"
                  value={invoice.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1e2a5a] focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900 border-b border-gray-50 pb-2">Bill To</h3>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Client Name</label>
              <input 
                type="text" 
                name="billTo.clientName"
                value={invoice.billTo.clientName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1e2a5a] focus:outline-none"
                placeholder="Company or Individual Name"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                name="billTo.email"
                value={invoice.billTo.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1e2a5a] focus:outline-none"
                placeholder="client@example.com"
              />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-semibold text-gray-900">Items & Services</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4 w-24 text-center">Qty</th>
                  <th className="px-6 py-4 w-32">Price ($)</th>
                  <th className="px-6 py-4 w-24 text-center">Tax %</th>
                  <th className="px-6 py-4 w-32 text-right">Total</th>
                  <th className="px-6 py-4 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items.map((item, index) => (
                  <tr key={index} className="group">
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        name="name"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full bg-transparent focus:outline-none text-gray-900"
                        placeholder="Description of service..."
                        required
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full bg-transparent text-center focus:outline-none"
                        min="1"
                        required
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        name="unitPrice"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full bg-transparent focus:outline-none"
                        min="0"
                        step="0.01"
                        required
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        name="taxPercent"
                        value={item.taxPercent}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full bg-transparent text-center focus:outline-none"
                        min="0"
                        max="100"
                      />
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      ${(item.quantity * item.unitPrice * (1 + (item.taxPercent || 0) / 100)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={invoice.items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50/50">
            <button 
              type="button"
              onClick={addItem}
              className="flex items-center text-sm font-semibold text-[#1e2a5a] hover:text-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </button>
          </div>
        </div>

        {/* Footer Info & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Notes</h3>
            <textarea 
              name="notes"
              value={invoice.notes}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e2a5a] focus:outline-none h-32 resize-none"
              placeholder="Additional information for the client..."
            />
          </div>

          <div className="bg-[#1e2a5a] text-white p-8 rounded-2xl shadow-xl space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-white/70">
                <span>Subtotal</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Tax Total</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex justify-between text-2xl font-bold">
                <span>Total Amount</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-white text-[#1e2a5a] py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all flex items-center justify-center active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#1e2a5a]"></div>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Invoice
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Createinvoice;
