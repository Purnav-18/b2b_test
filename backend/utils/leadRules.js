const LEAD_SOURCES = ["Website", "LinkedIn", "Referral", "Event"];
const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Lost"];
const LEAD_PRIORITIES = ["High", "Medium", "Low"];
const MAX_DEAL_VALUE = 9999999999.99;

function normalizeEmail(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function calculatePriority(amount) {
    if (amount >= 100000) return "High";
    if (amount >= 50000) return "Medium";
    return "Low";
}

function validateLead(input) {
    const errors = {};
    const name = typeof input.name === "string" ? input.name.trim() : "";
    const email = normalizeEmail(input.email);
    const company = typeof input.company === "string" ? input.company.trim() : "";
    const phone = typeof input.phone === "string" ? input.phone.trim() : "";
    const leadSource = input.leadSource;
    const rawAmount = input.estimatedRevenue;
    const amountText = typeof rawAmount === "number" ? String(rawAmount) : rawAmount;
    const amount = Number(amountText);

    if (name.length < 2 || name.length > 100) {
        errors.name = "Full name must be between 2 and 100 characters.";
    }

    if (
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        errors.email = "Enter a valid email address (maximum 254 characters).";
    }

    if (!company || company.length > 150) {
        errors.company = "Company name is required and must be 150 characters or fewer.";
    }

    if (!/^\+?\d{7,15}$/.test(phone)) {
        errors.phone = "Phone must contain 7 to 15 digits, with an optional leading +.";
    }

    if (!LEAD_SOURCES.includes(leadSource)) {
        errors.leadSource = "Choose Website, LinkedIn, Referral, or Event.";
    }

    if (
        typeof amountText !== "string" ||
        !/^\d+(?:\.\d{1,2})?$/.test(amountText.trim()) ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        amount > MAX_DEAL_VALUE
    ) {
        errors.estimatedRevenue =
            "Enter an amount greater than 0 and no greater than INR 9,999,999,999.99, with up to 2 decimal places.";
    }

    if (Object.keys(errors).length > 0) {
        return { errors };
    }

    return {
        errors: null,
        value: {
            name,
            email,
            company,
            phone,
            leadSource,
            estimatedRevenue: amount,
        },
    };
}

module.exports = {
    LEAD_SOURCES,
    LEAD_STATUSES,
    LEAD_PRIORITIES,
    MAX_DEAL_VALUE,
    calculatePriority,
    normalizeEmail,
    validateLead,
};
