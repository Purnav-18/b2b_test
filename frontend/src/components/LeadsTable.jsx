const STATUSES = ["New", "Contacted", "Qualified", "Lost"];

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const dateTime = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
  timeZoneName: "short",
});

export default function LeadsTable({
  leads,
  loading,
  error,
  updatingId,
  onStatusChange,
}) {
  if (loading && leads.length === 0) {
    return (
      <div className="table-state" role="status">
        <span className="spinner spinner-dark" aria-hidden="true" />
        Loading your leads…
      </div>
    );
  }
  if (error && leads.length === 0) return null;
  if (leads.length === 0) {
    return <p className="empty-state">No leads found.</p>;
  }

  return (
    <div className={`table-scroll${loading ? " table-loading" : ""}`}>
      <table className="leads-table">
        <thead>
          <tr>
            <th scope="col">Full name / email</th>
            <th scope="col">Company</th>
            <th scope="col">Phone</th>
            <th scope="col">Source</th>
            <th scope="col">Deal value</th>
            <th scope="col">Priority</th>
            <th scope="col">Status</th>
            <th scope="col">Created date · IST</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const id = lead._id || lead.id;
            return (
              <tr key={id}>
                <td>
                  <span className="lead-name">{lead.name}</span>
                  <span className="lead-email">{lead.email}</span>
                </td>
                <td className="company-cell">{lead.company}</td>
                <td className="muted-cell">{lead.phone}</td>
                <td>
                  <span className="source-label">{lead.leadSource}</span>
                </td>
                <td className="amount-cell">{currency.format(lead.estimatedRevenue)}</td>
                <td>
                  <span className={`badge priority-${lead.priority?.toLowerCase()}`}>
                    <span className="badge-dot" />
                    {lead.priority}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${lead.status?.toLowerCase()}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="date-cell">
                  {lead.createdAt
                    ? dateTime.format(new Date(lead.createdAt))
                    : "—"}
                </td>
                <td>
                  <label className="sr-only" htmlFor={`status-${id}`}>
                    Change status for {lead.name}
                  </label>
                  <select
                    className={`status-select status-${lead.status?.toLowerCase()}`}
                    id={`status-${id}`}
                    value={lead.status}
                    onChange={(event) => onStatusChange(lead, event.target.value)}
                    disabled={updatingId === id}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
