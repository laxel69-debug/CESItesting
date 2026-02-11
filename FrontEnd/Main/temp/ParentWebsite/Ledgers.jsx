import React from "react";
import "../ParentWebsiteCSS/Ledgers.css";

const Ledgers = () => {
  const ledgerData = [
    { id: 1, item: "Payments", tDate: "06-09-2025", pDate: "06-10-2025", debit: "0.00", credit: "15,000", balance: "-15,000" },
    { id: 2, item: "Registration", tDate: "06-09-2025", pDate: "06-13-2025", debit: "26,900", credit: "0.00", balance: "11,900" },
    { id: 3, item: "Payments", tDate: "06-10-2025", pDate: "07-04-2025", debit: "0.00", credit: "3,500", balance: "8,400" },
    { id: 4, item: "Payments", tDate: "07-03-2025", pDate: "07-08-2025", debit: "0.00", credit: "8,400", balance: "0.00" },
  ];

  const installmentData = [
    { id: 1, label: "Upon Registration", amount: "8,500.00", due: "2025-11-27", pay: "8,500.00", bal: "0.00", status: "Paid" },
    { id: 2, label: "Installment No. 1", amount: "15,198.00", due: "2026-01-15", pay: "15,198.00", bal: "0.00", status: "Paid" },
    { id: 3, label: "Installment No. 2", amount: "15,199.00", due: "2026-02-16", pay: "0.00", bal: "15,199.00", status: "Pending" },
    { id: 4, label: "Installment No. 3", amount: "15,199.00", due: "2026-03-16", pay: "0.00", bal: "15,199.00", status: "Pending" },
    { id: 5, label: "Installment No. 4", amount: "15,199.00", due: "2026-04-25", pay: "0.00", bal: "15,199.00", status: "Pending" },
  ];

  return (
    <div className="ledger-content">
      <header className="ledger-header-flex">
        <div className="header-title-area">
          <h2 className="title-text">Student's Ledger</h2>
          <span className="sy-badge">S.Y. 2025-2026</span>
        </div>

        <div className="header-actions">
          <button type="button" className="btn-action btn-print" onClick={() => window.print()}>
            <i className="bi bi-printer-fill me-2"></i>Print
          </button>

          <button type="button" className="btn-action btn-download">
            <i className="bi bi-file-earmark-pdf-fill me-2"></i>PDF
          </button>
        </div>
      </header>

      {/* TRANSACTION HISTORY */}
      <section className="ledger-section">
        <div className="section-header blue-header">
          <i className="bi bi-clock-history me-2"></i> Transaction History
        </div>

        <div className="table-responsive">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Payment Date</th>
                <th>Due Date</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
              </tr>
            </thead>

            <tbody>
              {ledgerData.map((row) => (
                <tr key={row.id}>
                  <td data-label="Item">
                    <span className="item-badge">{row.item}</span>
                  </td>
                  <td data-label="T-Date">{row.tDate}</td>
                  <td data-label="P-Date">{row.pDate}</td>
                  <td data-label="Debit" className="text-debit">{row.debit}</td>
                  <td data-label="Credit" className="text-credit">{row.credit}</td>
                  <td
                    data-label="Balance"
                    className={`fw-bold ${
                      parseFloat(String(row.balance).replace(/,/g, "")) <= 0 ? "text-credit" : ""
                    }`}
                  >
                    {row.balance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* INSTALLMENT SCHEDULE */}
      <section className="ledger-section">
        <div className="section-header dark-header">
          <i className="bi bi-calendar-check me-2"></i> Payment Schedule
        </div>

        <div className="table-responsive">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Paid</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {installmentData.map((row) => (
                <tr key={row.id}>
                  <td data-label="Description" className="fw-semibold text-start-md">{row.label}</td>
                  <td data-label="Amount">{row.amount}</td>
                  <td data-label="Due Date">{row.due}</td>
                  <td data-label="Paid" className="text-credit">{row.pay}</td>
                  <td data-label="Status">
                    <span className={`status-pill ${row.status.toLowerCase()}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Ledgers;
