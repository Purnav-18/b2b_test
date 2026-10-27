import { useState } from "react";
import { createLead } from "../services/leadService";

const initialForm = {
  name: "",
  email: "",
  company: "",
  phone: "",
  leadSource: "",
  estimatedRevenue: "",
};

const fieldLabels = {
  name: "Full name",
  email: "Email address",
  company: "Company name",
  phone: "Phone number",
  leadSource: "Lead source",
  estimatedRevenue: "Estimated deal value",
};

function validateForm(form) {
  const errors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const company = form.company.trim();
  const phone = form.phone.trim();
  const amountText = form.estimatedRevenue.trim();
  const amount = Number(amountText);

  if (name.length < 2 || name.length > 100) {
    errors.name = "Enter 2 to 100 characters.";
  }
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email = "Enter a valid email address.";
  }
  if (!company || company.length > 150) {
    errors.company = "Enter a company name (up to 150 characters).";
  }
  if (!/^\+?\d{7,15}$/.test(phone)) {
    errors.phone = "Use 7 to 15 digits; an initial + is optional.";
  }
  if (!["Website", "LinkedIn", "Referral", "Event"].includes(form.leadSource)) {
    errors.leadSource = "Choose a lead source.";
  }
  if (
    !/^\d+(?:\.\d{1,2})?$/.test(amountText) ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > 9999999999.99
  ) {
    errors.estimatedRevenue = "Enter a positive INR amount with up to 2 decimals.";
  }
  return errors;
}

export default function LeadForm({ onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    try {
      await createLead({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        phone: form.phone.trim(),
        estimatedRevenue: form.estimatedRevenue.trim(),
      });
      setForm(initialForm);
      setErrors({});
      onCreated();
    } catch (requestError) {
      setErrors(requestError.fields || {});
      setFormError(
        Object.keys(requestError.fields || {}).length
          ? ""
          : requestError.message
      );
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, input) => (
    <div className="form-field" key={name}>
      <label htmlFor={name}>{label}</label>
      {input}
      {errors[name] && (
        <span className="field-error" id={`${name}-error`}>
          {errors[name]}
        </span>
      )}
    </div>
  );

  return (
    <form className="lead-form" onSubmit={handleSubmit} noValidate>
      {field(
        "name",
        fieldLabels.name,
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={updateField}
          placeholder="e.g. Ananya Sharma"
          minLength={2}
          maxLength={100}
          autoComplete="name"
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
      )}
      {field(
        "email",
        fieldLabels.email,
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={updateField}
          placeholder="ananya@company.com"
          maxLength={254}
          autoComplete="email"
          required
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
      )}
      {field(
        "company",
        fieldLabels.company,
        <input
          id="company"
          name="company"
          value={form.company}
          onChange={updateField}
          placeholder="Company name"
          maxLength={150}
          autoComplete="organization"
          required
          aria-invalid={Boolean(errors.company)}
          aria-describedby={errors.company ? "company-error" : undefined}
        />
      )}
      {field(
        "phone",
        fieldLabels.phone,
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={updateField}
          placeholder="+919876543210"
          autoComplete="tel"
          required
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "phone-error" : undefined}
        />
      )}
      {field(
        "leadSource",
        fieldLabels.leadSource,
        <select
          id="leadSource"
          name="leadSource"
          value={form.leadSource}
          onChange={updateField}
          required
          aria-invalid={Boolean(errors.leadSource)}
          aria-describedby={errors.leadSource ? "leadSource-error" : undefined}
        >
          <option value="" disabled>Select a source</option>
          <option value="Website">Website</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Referral">Referral</option>
          <option value="Event">Event</option>
        </select>
      )}
      {field(
        "estimatedRevenue",
        fieldLabels.estimatedRevenue,
        <div className="amount-input">
          <span aria-hidden="true">₹</span>
          <input
            id="estimatedRevenue"
            name="estimatedRevenue"
            type="number"
            value={form.estimatedRevenue}
            onChange={updateField}
            placeholder="50,000"
            min="0.01"
            max="9999999999.99"
            step="0.01"
            required
            aria-invalid={Boolean(errors.estimatedRevenue)}
            aria-describedby={
              errors.estimatedRevenue ? "estimatedRevenue-error" : undefined
            }
          />
        </div>
      )}
      <div className="priority-hint">
        <span className="hint-sparkle" aria-hidden="true">✦</span>
        <span>Priority is calculated automatically from deal value.</span>
      </div>
      {formError && <p className="form-error" role="alert">{formError}</p>}
      <button className="button button-primary submit-button" type="submit" disabled={saving}>
        {saving ? (
          <>
            <span className="spinner" aria-hidden="true" /> Saving lead…
          </>
        ) : (
          <>
            Add lead <span aria-hidden="true">→</span>
          </>
        )}
      </button>
      <p className="form-footnote">All fields are required. Your lead stays saved in your pipeline.</p>
    </form>
  );
}
