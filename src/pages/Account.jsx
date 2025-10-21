import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import AddAccountForm from "../components/accounts/AddAccountForm";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);

  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setAccounts(data);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <AddAccountForm onSuccess={fetchAccounts} />

        <section className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            📘 Daftar Akun
          </h2>
          {accounts.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada akun</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {accounts.map((acc) => (
                <li
                  key={acc.id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-800">{acc.name}</p>
                    <p className="text-xs text-gray-500">
                      {acc.type === "bank" && acc.account_number
                        ? `Bank • ${acc.account_number}`
                        : acc.type === "ewallet"
                        ? "E-Wallet"
                        : "Tunai"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    Rp {Number(acc.balance).toLocaleString("id-ID")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
