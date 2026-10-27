import { useCallback, useEffect, useState } from "react";
import "./App.css";
import LeadForm from "./components/LeadForm";
import LeadsTable from "./components/LeadsTable";
import { getLeads, updateLeadStatus } from "./services/leadService";

const EMPTY_RESULT = {
  leads: [],
  total: 0,
  page: 1,
  totalPages: 1,
};

export default function App() {
  const [leads, setLeads] = useState(EMPTY_RESULT);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const result = await getLeads(
          { search, status, priority, page },
          { signal: controller.signal }
        );
        if (page > result.totalPages) {
          setPage(result.totalPages);
          return;
        }
        setLeads(result);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [search, status, priority, page, refreshKey]);

  const refresh = useCallback(() => {
    setNotice("");
    setRefreshKey((current) => current + 1);
  }, []);

  const handleCreated = useCallback(() => {
    setNotice("Lead created successfully.");
    setRefreshKey((current) => current + 1);
  }, []);

  const handleStatusChange = async (lead, nextStatus) => {
    setStatusError("");
    setUpdatingId(lead._id || lead.id);
    try {
      const { lead: updatedLead } = await updateLeadStatus(
        lead._id || lead.id,
        nextStatus
      );
      setLeads((current) => ({
        ...current,
        leads: current.leads.map((item) =>
          (item._id || item.id) === (updatedLead._id || updatedLead.id)
            ? updatedLead
            : item
        ),
      }));
      setNotice(`${lead.name}'s status updated to ${nextStatus}.`);
      setRefreshKey((current) => current + 1);
    } catch (requestError) {
      setStatusError(requestError.message);
    } finally {
      setUpdatingId("");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setPage(1);
    setNotice("");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Only B2B leads home">
          <span className="brand-mark">O</span>
          <span>only<span className="brand-light">b2b</span></span>
        </a>
        <div className="topbar-meta">
          <span className="topbar-dot" />
          Sales workspace
          <span className="topbar-divider" />
          Lead management
        </div>
      </header>

      <main className="dashboard">
        <section className="page-heading">
          <div>
            <p className="eyebrow">YOUR PIPELINE</p>
            <h1>Lead management</h1>
            <p className="page-subtitle">
              Keep every opportunity moving, from first hello to signed deal.
            </p>
          </div>
          <div className="heading-note">
            <span className="heading-note-icon" aria-hidden="true">↗</span>
            <span>Stay close to your next big win.</span>
          </div>
        </section>

        <section className="overview-card" aria-label="Lead overview">
          <div className="overview-copy">
            <span className="overview-icon" aria-hidden="true">✦</span>
            <div>
              <p className="overview-label">MATCHING LEADS</p>
              <p className="overview-count">{loading ? "—" : leads.total}</p>
            </div>
          </div>
          <p className="overview-caption">
            {search || status || priority
              ? "Leads matching your current search and filters"
              : "Your complete sales pipeline, all in one place"}
          </p>
        </section>

        <div className="workspace-grid">
          <aside className="form-panel">
            <div className="panel-heading">
              <span className="panel-icon" aria-hidden="true">＋</span>
              <div>
                <h2>Add a lead</h2>
                <p>A good conversation starts here.</p>
              </div>
            </div>
            <LeadForm onCreated={handleCreated} />
          </aside>

          <section className="leads-panel" aria-labelledby="leads-title">
            <div className="leads-heading">
              <div>
                <p className="eyebrow">THE OPPORTUNITIES</p>
                <h2 id="leads-title">Your leads</h2>
              </div>
              <button
                className="button button-secondary refresh-button"
                type="button"
                onClick={refresh}
                disabled={loading}
              >
                <span aria-hidden="true">↻</span>
                Refresh
              </button>
            </div>

            {notice && (
              <p className="notice" role="status">
                <span aria-hidden="true">✓</span> {notice}
              </p>
            )}
            {statusError && (
              <p className="error-banner" role="alert">{statusError}</p>
            )}
            {error && (
              <div className="error-banner request-error" role="alert">
                <span>{error}</span>
                <button className="text-button" type="button" onClick={refresh}>
                  Try again
                </button>
              </div>
            )}

            <div className="filters" aria-label="Search and filter leads">
              <label className="search-field">
                <span className="search-icon" aria-hidden="true">⌕</span>
                <span className="sr-only">Search leads</span>
                <input
                  type="search"
                  value={search}
                  maxLength={200}
                  placeholder="Search name, email or company"
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                />
              </label>
              <label className="filter-field">
                <span className="sr-only">Filter by status</span>
                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Lost">Lost</option>
                </select>
              </label>
              <label className="filter-field">
                <span className="sr-only">Filter by priority</span>
                <select
                  value={priority}
                  onChange={(event) => {
                    setPriority(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All priorities</option>
                  <option value="High">High priority</option>
                  <option value="Medium">Medium priority</option>
                  <option value="Low">Low priority</option>
                </select>
              </label>
              <button
                className="clear-button"
                type="button"
                onClick={clearFilters}
                disabled={!search && !status && !priority}
              >
                Clear
              </button>
            </div>

            <LeadsTable
              leads={leads.leads}
              loading={loading}
              error={Boolean(error)}
              updatingId={updatingId}
              onStatusChange={handleStatusChange}
            />

            <div className="pagination">
              <span>
                {leads.total === 0
                  ? "0 matching leads"
                  : `Showing ${(page - 1) * 10 + 1}–${Math.min(
                      page * 10,
                      leads.total
                    )} of ${leads.total}`}
              </span>
              <div className="pagination-controls">
                <button
                  className="page-button"
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={loading || page <= 1}
                  aria-label="Previous page"
                >
                  ‹
                </button>
                <span className="page-number">
                  {page} <span>of</span> {leads.totalPages}
                </span>
                <button
                  className="page-button"
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(leads.totalPages, current + 1))
                  }
                  disabled={loading || page >= leads.totalPages}
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>
            </div>
          </section>
        </div>
        <footer className="footer">
          <span>Only B2B · Sales workspace</span>
          <span>All dates shown in India Standard Time (IST)</span>
        </footer>
      </main>
    </div>
  );
}
