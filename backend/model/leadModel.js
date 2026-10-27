const mongoose = require("mongoose");
const { calculatePriority, normalizeEmail, LEAD_SOURCES, LEAD_STATUSES } = require("../utils/leadRules");

const leadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        maxlength: 254,
        set: normalizeEmail,
    },
    company: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
    },
    leadSource: { type: String, required: true, enum: LEAD_SOURCES },
    estimatedRevenue: {
        type: Number,
        required: true,
        min: 0.01,
        max: 9999999999.99,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    priority: {
        type: String,
        required: true,
        enum: ["High", "Medium", "Low"],
    },
    status: {
        type: String,
        required: true,
        enum: LEAD_STATUSES,
        default: "New",
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

leadSchema.pre("validate", function () {
    if (Number.isFinite(this.estimatedRevenue) && this.estimatedRevenue > 0) {
        this.priority = calculatePriority(this.estimatedRevenue);
    }
});

leadSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("Lead", leadSchema);