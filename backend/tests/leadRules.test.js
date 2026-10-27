const test = require("node:test");
const assert = require("node:assert/strict");
const {
    calculatePriority,
    normalizeEmail,
} = require("../utils/leadRules");
const { createLeadHandlers } = require("../controller/leadController");

test("priority thresholds classify amounts below, at and above each boundary", () => {
    assert.equal(calculatePriority(49999.99), "Low");
    assert.equal(calculatePriority(50000), "Medium");
    assert.equal(calculatePriority(50000.01), "Medium");
    assert.equal(calculatePriority(99999.99), "Medium");
    assert.equal(calculatePriority(100000), "High");
    assert.equal(calculatePriority(100000.01), "High");
});

test("duplicate email is rejected regardless of surrounding spaces or capitalization", async () => {
    const savedEmails = new Set();
    class FakeLead {
        constructor(value) {
            Object.assign(this, value);
            this.priority = calculatePriority(value.estimatedRevenue);
            this._id = "test-lead-id";
            this.id = this._id;
        }

        async save() {
            if (savedEmails.has(this.email)) {
                const error = new Error("Duplicate key");
                error.code = 11000;
                error.keyPattern = { email: 1 };
                throw error;
            }
            savedEmails.add(this.email);
        }
    }

    const { createLead } = createLeadHandlers(FakeLead);
    const createResponse = () => ({
        statusCode: 200,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    });
    const next = (error) => {
        throw error;
    };
    const validLead = {
        name: "Riya Patel",
        email: "  Sales@Example.com ",
        company: "Example Ltd",
        phone: "+919876543210",
        leadSource: "Website",
        estimatedRevenue: "50000",
    };

    const firstResponse = createResponse();
    await createLead({ body: validLead }, firstResponse, next);
    assert.equal(firstResponse.statusCode, 201);
    assert.equal(firstResponse.body.lead.email, "sales@example.com");

    const duplicateResponse = createResponse();
    await createLead(
        { body: { ...validLead, email: "sales@example.com" } },
        duplicateResponse,
        next
    );
    assert.equal(duplicateResponse.statusCode, 409);
    assert.equal(
        duplicateResponse.body.message,
        "Lead already exists with this email."
    );
    assert.equal(normalizeEmail(" Sales@Example.com "), "sales@example.com");
});
