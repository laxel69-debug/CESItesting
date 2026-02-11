import React, { useEffect, useState } from "react";
import "../ParentWebsiteCSS/Ledgers.css";
import { apiFetch } from "../api/apiFetch";

const API_BASE = "";

const TYPE_LABELS = {
  TUITION: "Tuition Fee",
  REGISTRATION: "Registration Fee",
  MISC: "Miscellaneous",
  BOOKS: "Books & Materials",
  UNIFORM: "Uniform",
  OTHER: "Other",
};

const METHOD_LABELS = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  GCASH: "GCash",
  PAYMAYA: "PayMaya",
  CHECK: "Check",
  OTHER: "Other",
};

const Ledgers = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyTransactions = async () => {
      try {
        const res = await apiFetch(`${API_BASE}/api/finance/my-transactions/`);
        if (!res.ok) throw new Error("Failed to load transactions");
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Ledger fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTransactions();
  }, []);

  // ── derived data ──
  const paidTransactions = transactions.filter((t) => t.status === "PAID");
  const pendingTransactions = transactions.filter((t) => t.status !== "PAID");

  const totalDebit = transactions.reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalPaid = paidTransactions.reduce((s, t) => s + Number(t.amount || 0), 0);
  const balance = totalDebit - totalPaid;

  return (
    <div className="ledger-content">
      <header className="ledger-header-flex">
        <div className="header-title-area">
          <h2 className="title-text">Student's Ledger</h2>
          <span className="sy-badge">S.Y. 2025-2026</span>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-action btn-print"
            onClick={() => window.print()}
          >
            <i className="bi bi-printer-fill me-2"></i>Print
          </button>
          <button type="button" className="btn-action btn-download">
            <i className="bi bi-file-earmark-pdf-fill me-2"></i>PDF
          </button>
        </div>
      </header>

      {/* Loading / Error */}
      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
          Loading transactions...
        </div>
      )}
      {error && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "#991b1b",
            background: "#fee2e2",
            borderRadius: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* TRANSACTION HISTORY */}
          <section className="ledger-section">
            <div className="section-header blue-header">
              <i className="bi bi-clock-history me-2"></i> Transaction History
            </div>

            <div className="table-responsive">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Due Date</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", color: "#94a3b8" }}>
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((row) => (
                      <tr key={row.id}>
                        <td data-label="Type">
                          <span className="item-badge">
                            {TYPE_LABELS[row.transaction_type] || row.transaction_type}
                          </span>
                        </td>
                        <td data-label="Date">
                          {row.date_created ? row.date_created.split(" ")[0] : "—"}
                        </td>
                        <td data-label="Due Date">{row.due_date || "—"}</td>
                        <td data-label="Method">
                          {METHOD_LABELS[row.payment_method] || row.payment_method}
                        </td>
                        <td data-label="Amount" className="text-debit">
                          ₱{Number(row.amount).toLocaleString()}
                        </td>
                        <td data-label="Status">
                          <span
                            className={`status-pill ${
                              row.status === "PAID"
                                ? "paid"
                                : row.status === "OVERDUE"
                                ? "overdue"
                                : "pending"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* PAYMENT SUMMARY */}
          <section className="ledger-section">
            <div className="section-header dark-header">
              <i className="bi bi-calculator me-2"></i> Payment Summary
            </div>

            <div className="table-responsive">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Reference</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {paidTransactions.length === 0 && pendingTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", color: "#94a3b8" }}>
                        No payment data yet.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {paidTransactions.map((row) => (
                        <tr key={row.id}>
                          <td data-label="Description" className="fw-semibold text-start-md">
                            {TYPE_LABELS[row.transaction_type] || row.transaction_type}
                            {row.description ? ` — ${row.description}` : ""}
                          </td>
                          <td data-label="Amount" className="text-credit">
                            ₱{Number(row.amount).toLocaleString()}
                          </td>
                          <td data-label="Reference">{row.reference_number || "—"}</td>
                          <td data-label="Status">
                            <span className="status-pill paid">Paid</span>
                          </td>
                        </tr>
                      ))}
                      {pendingTransactions.map((row) => (
                        <tr key={row.id}>
                          <td data-label="Description" className="fw-semibold text-start-md">
                            {TYPE_LABELS[row.transaction_type] || row.transaction_type}
                            {row.description ? ` — ${row.description}` : ""}
                          </td>
                          <td data-label="Amount" className="text-debit">
                            ₱{Number(row.amount).toLocaleString()}
                          </td>
                          <td data-label="Reference">{row.reference_number || "—"}</td>
                          <td data-label="Status">
                            <span className={`status-pill ${row.status === "OVERDUE" ? "overdue" : "pending"}`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                  {/* Balance row */}
                  {transactions.length > 0 && (
                    <tr style={{ fontWeight: 800, borderTop: "2px solid #0056b3" }}>
                      <td>Outstanding Balance</td>
                      <td className={balance <= 0 ? "text-credit" : "text-debit"}>
                        ₱{balance.toLocaleString()}
                      </td>
                      <td></td>
                      <td>
                        <span className={`status-pill ${balance <= 0 ? "paid" : "pending"}`}>
                          {balance <= 0 ? "Fully Paid" : "Balance Due"}
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Ledgers;
