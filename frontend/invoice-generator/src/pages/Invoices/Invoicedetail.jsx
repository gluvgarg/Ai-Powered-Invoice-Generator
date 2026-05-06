import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  Printer, 
  Sparkles,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import moment from "moment";
import toast from "react-hot-toast";

const Invoicedetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderText, setReminderText] = useState("");

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.INVOICE.GET_INVOICE_BY_ID(id));
      setInvoice(response.data);
    } catch (error) {
      toast.error("Failed to fetch invoice details");
      navigate("/invoices");
    } finally {
      setLoading(false);
    }
  };

  const generateReminder = async () => {
    setReminderLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AI.GENERATE_REMINDER, { invoiceId: id });
      setReminderText(response.data.reminderText);
      toast.success("AI Reminder Generated!");
    } catch (error) {
      toast.error("Failed to generate reminder");
    } finally {
      setReminderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e2a5a]"></div>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={() => navigate("/invoices")}
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Invoices
        </button>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all font-medium">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
          <button className="flex items-center px-4 py-2 bg-[#1e2a5a] text-white rounded-lg hover:bg-[#162046] transition-all font-medium shadow-md">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Top Header Section */}
        <div className="bg-gradient-to-r from-[#1e2a5a] to-blue-800 p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-1">Invoice Number</p>
            <h1 className="text-4xl font-black">#{invoice.invoiceNumber}</h1>
          </div>
          <div className="flex items-center bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
            {invoice.status === "Paid" ? (
              <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
            ) : invoice.status === "Unpaid" ? (
              <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
            ) : (
              <Clock className="w-6 h-6 text-orange-400 mr-3" />
            )}
            <div>
              <p className="text-xs text-blue-200 uppercase font-bold tracking-tighter">Current Status</p>
              <p className="text-lg font-bold">{invoice.status}</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-12 space-y-12">
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Billed From</h3>
              <div className="space-y-1 text-gray-700">
                <p className="text-xl font-bold text-[#1e2a5a]">{invoice.user?.name}</p>
                <p>{invoice.user?.email}</p>
                {invoice.user?.businessName && <p>{invoice.user.businessName}</p>}
                {invoice.user?.address && <p>{invoice.user.address}</p>}
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Billed To</h3>
              <div className="space-y-1 text-gray-700">
                <p className="text-xl font-bold text-gray-900">{invoice.billTo?.clientName}</p>
                <p>{invoice.billTo?.email}</p>
                <p className="whitespace-pre-line">{invoice.billTo?.address}</p>
                <p>{invoice.billTo?.phone}</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="flex flex-wrap gap-8 py-6 border-y border-gray-50">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Issue Date</p>
              <p className="font-semibold text-gray-900">{moment(invoice.invoiceDate).format("MMMM DD, YYYY")}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Due Date</p>
              <p className="font-semibold text-red-600">{moment(invoice.dueDate).format("MMMM DD, YYYY")}</p>
            </div>
          </div>

          {/* Table */}
          <div className="space-y-4">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Order Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-100">
                  <tr className="text-gray-600 text-sm font-semibold">
                    <th className="py-4">Item Description</th>
                    <th className="py-4 text-center">Qty</th>
                    <th className="py-4 text-right">Unit Price</th>
                    <th className="py-4 text-right">Tax</th>
                    <th className="py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-5 font-medium text-gray-900">{item.name}</td>
                      <td className="py-5 text-center text-gray-600">{item.quantity}</td>
                      <td className="py-5 text-right text-gray-600">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-5 text-right text-gray-600">{item.taxPercent}%</td>
                      <td className="py-5 text-right font-bold text-gray-900">
                        ${(item.quantity * item.unitPrice * (1 + item.taxPercent / 100)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              {invoice.notes && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</h3>
                  <p className="text-gray-700 leading-relaxed italic">"{invoice.notes}"</p>
                </div>
              )}
            </div>
            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Subtotal</span>
                <span>${invoice.subTotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Tax Total</span>
                <span>${invoice.taxTotal?.toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-100 my-2"></div>
              <div className="flex justify-between text-2xl font-black text-[#1e2a5a]">
                <span>Total Due</span>
                <span>${invoice.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Reminder Generator */}
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-blue-50 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">AI Reminder Assistant</h2>
          </div>
          <button 
            onClick={generateReminder}
            disabled={reminderLoading}
            className="flex items-center bg-blue-50 text-blue-700 px-6 py-2 rounded-xl font-bold hover:bg-blue-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {reminderLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-700"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Email
              </>
            )}
          </button>
        </div>

        {reminderText ? (
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 relative">
            <div className="absolute top-4 right-4 flex space-x-2">
               <button 
                onClick={() => {
                  navigator.clipboard.writeText(reminderText);
                  toast.success("Copied to clipboard!");
                }}
                className="p-2 bg-white text-blue-600 rounded-lg shadow-sm hover:shadow-md transition-all"
                title="Copy"
              >
                <Download className="w-4 h-4 rotate-180" />
              </button>
              <button 
                className="p-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all flex items-center space-x-2 px-4"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm font-bold">Send Now</span>
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-gray-700 font-sans text-sm leading-relaxed pr-24">
              {reminderText}
            </pre>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-gray-400">Need to remind your client about payment? Let AI draft a professional email for you.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoicedetail;
