import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAdminStore } from "../../store/useAdminStore";
import LoadingSpinner from "../../components/LoadingSpinner";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
axios.defaults.withCredentials = true;

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (document.getElementById("razorpay-script")) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.id = "razorpay-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const StatusBadge = ({ status }) => {
    const styles = {
        paid: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        created: "bg-amber-100 text-amber-700 border border-amber-200",
        failed: "bg-red-100 text-red-600 border border-red-200",
    };
    const labels = { paid: "Paid", created: "Pending", failed: "Failed" };
    return (
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${styles[status] || styles.created}`}>
            {labels[status] || status}
        </span>
    );
};

const AdminBilling = () => {
    const { patients, fetchPatients, isLoadingPatients } = useAdminStore();

    const [bills, setBills] = useState([]);
    const [isLoadingBills, setIsLoadingBills] = useState(false);

    // Form state
    const [selectedPatient, setSelectedPatient] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchBills = useCallback(async () => {
        setIsLoadingBills(true);
        try {
            const res = await axios.get(`${API}/payment/all`);
            setBills(res.data);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to load billing history");
        } finally {
            setIsLoadingBills(false);
        }
    }, []);

    useEffect(() => {
        fetchPatients();
        fetchBills();
    }, [fetchPatients, fetchBills]);

    const handleGenerateBill = async (e) => {
        e.preventDefault();
        if (!selectedPatient) return toast.error("Please select a patient");
        if (!amount || parseFloat(amount) <= 0) return toast.error("Enter a valid amount");

        setIsSubmitting(true);

        try {
            // 1. Load Razorpay checkout script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                toast.error("Failed to load Razorpay. Check your internet connection.");
                setIsSubmitting(false);
                return;
            }

            // 2. Create Razorpay order on backend
            const { data } = await axios.post(`${API}/payment/create-order`, {
                patientId: selectedPatient,
                amount: parseFloat(amount),
                description,
            });

            const patient = patients.find((p) => p._id === selectedPatient);

            // 3. Open Razorpay checkout modal
            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: "MedCare Hospital",
                description: description || `Bill for ${patient?.name || "Patient"}`,
                order_id: data.orderId,
                theme: { color: "#0066cc" },
                prefill: { name: patient?.name || "" },
                handler: async (response) => {
                    // 4. Verify payment on success
                    try {
                        const verify = await axios.post(`${API}/payment/verify`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        if (verify.data.success) {
                            toast.success("Payment verified & recorded successfully!");
                            setSelectedPatient("");
                            setAmount("");
                            setDescription("");
                            fetchBills();
                        } else {
                            toast.error("Payment signature mismatch — marked as failed.");
                            fetchBills();
                        }
                    } catch {
                        toast.error("Verification failed. Please contact support.");
                        fetchBills();
                    }
                },
                modal: {
                    ondismiss: () => {
                        toast("Payment cancelled.", { icon: "ℹ️" });
                        setIsSubmitting(false);
                        // Refresh so the "created" order shows in the table
                        fetchBills();
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", (resp) => {
                toast.error(`Payment failed: ${resp.error.description}`);
                fetchBills();
            });
            rzp.open();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to create order");
        } finally {
            setIsSubmitting(false);
        }
    };

    const fmtDate = (d) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const fmtAmount = (paise) => `₹${(paise / 100).toLocaleString("en-IN")}`;

    return (
        <>
            {/* ── Page Header ── */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-lg font-bold text-[#1a2b4a] uppercase">Billing & Payments</h1>
                <span className="text-xs bg-blue-50 text-[#0066cc] border border-blue-200 px-3 py-1 rounded-md font-bold">
                    {bills.filter((b) => b.status === "created").length} Pending
                </span>
            </div>

            {/* ── Create Bill Form ── */}
            <div className="bg-white border border-gray-200 rounded-sm p-5 mb-6">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                    Generate New Bill
                </div>
                <form onSubmit={handleGenerateBill} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    {/* Patient dropdown */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Patient</label>
                        {isLoadingPatients ? (
                            <div className="h-9 flex items-center"><LoadingSpinner size="sm" /></div>
                        ) : (
                            <select
                                value={selectedPatient}
                                onChange={(e) => setSelectedPatient(e.target.value)}
                                className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#0066cc] bg-white"
                            >
                                <option value="">Select patient…</option>
                                {patients.map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.name} — {p.doctorId?.userId?.name || "No doctor"}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Amount */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Amount (₹)</label>
                        <input
                            type="number"
                            min="1"
                            step="0.01"
                            placeholder="e.g. 500"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#0066cc]"
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                        <input
                            type="text"
                            placeholder="e.g. Consultation fee"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#0066cc]"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-[#0066cc] hover:bg-[#0055aa] text-white text-xs font-bold uppercase tracking-wide rounded-sm disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? "Processing…" : "Generate Bill & Pay"}
                    </button>
                </form>
            </div>

            {/* ── Payment History Table ── */}
            <div className="bg-white border border-gray-200 rounded-sm">
                <div className="px-4 pt-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Payment History
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-[#f0f4f8] border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Patient</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Doctor</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoadingBills && (
                            <tr>
                                <td colSpan="6" className="px-4 py-10 text-center">
                                    <LoadingSpinner size="md" />
                                </td>
                            </tr>
                        )}
                        {!isLoadingBills && bills.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-4 py-10 text-center text-sm text-gray-400">
                                    No bills generated yet.
                                </td>
                            </tr>
                        )}
                        {!isLoadingBills &&
                            bills.map((b) => (
                                <tr key={b._id} className="border-t hover:bg-[#f8fafc]">
                                    <td className="px-4 py-3 font-medium text-[#1a2b4a]">
                                        {b.patientId?.name || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {b.doctorId?.userId?.name || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">
                                        {b.description || "—"}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-[#1a2b4a]">
                                        {fmtAmount(b.amount)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={b.status} />
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {fmtDate(b.createdAt)}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default AdminBilling;
