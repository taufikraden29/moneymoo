// src/pages/PaymentPage.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getDebts } from "@/services/debtService";
import {
  getDebtPayments,
  addDebtPayment,
} from "../services/debtPaymentService";

export default function PaymentPage() {
  const [user, setUser] = useState(null);
  const [debts, setDebts] = useState([]);
  const [selectedDebt, setSelectedDebt] = useState("");
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const d = await getDebts(user.id);
        setDebts(d);
      }
    };
    init();
  }, []);

  const handleSelectDebt = async (id) => {
    setSelectedDebt(id);
    const p = await getDebtPayments(id);
    setPayments(p);
  };

  const handleAddPayment = async () => {
    if (!selectedDebt || !user || !amount) return;
    const paymentData = {
      debt_id: selectedDebt,
      user_id: user.id,
      amount: Number(amount),
      payment_date: new Date().toISOString(),
      description: "Cicilan bulanan",
    };

    await addDebtPayment(paymentData);

    // 🔁 Refresh data hutang dan pembayaran
    const updatedDebts = await getDebts(user.id);
    setDebts(updatedDebts);

    const updatedPayments = await getDebtPayments(selectedDebt);
    setPayments(updatedPayments);

    setAmount("");
  };

  const selected = debts.find((d) => d.id === selectedDebt);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        💰 Pembayaran Hutang
      </h1>

      <select
        className="border p-2 rounded w-full mb-4"
        onChange={(e) => handleSelectDebt(e.target.value)}
      >
        <option value="">Pilih Hutang</option>
        {debts.map((d) => (
          <option key={d.id} value={d.id}>
            {d.provider} — Rp {d.total_amount?.toLocaleString("id-ID")} (
            {d.status})
          </option>
        ))}
      </select>

      {selectedDebt && (
        <>
          <div className="mb-3 p-3 border rounded bg-gray-50">
            <p className="text-sm">
              <strong>Total:</strong> Rp{" "}
              {selected?.total_amount?.toLocaleString("id-ID")}
            </p>
            <p className="text-sm text-red-600">
              <strong>Sisa:</strong> Rp{" "}
              {selected?.remaining_balance?.toLocaleString("id-ID")}
            </p>
            <p className="text-sm text-green-600">
              <strong>Status:</strong> {selected?.status}
            </p>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="number"
              className="border p-2 rounded flex-1"
              placeholder="Nominal pembayaran"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              onClick={handleAddPayment}
              className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
            >
              Bayar
            </button>
          </div>

          <ul className="space-y-2">
            {payments.map((p) => (
              <li key={p.id} className="border p-3 rounded bg-gray-50">
                <p className="font-semibold">
                  Rp {p.amount.toLocaleString("id-ID")}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(p.payment_date).toLocaleDateString("id-ID")}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
