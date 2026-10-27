const Lead = require("../model/leadModel");
const { LEAD_PRIORITIES, LEAD_STATUSES, validateLead } = require("../utils/leadRules");

const PAGE_SIZE = 10;

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createLeadHandlers(LeadModel) {
    async function createLead(req, res, next) {
        const { errors, value } = validateLead(req.body || {});
        if (errors) {
            return res.status(400).json({
                message: "Please correct the highlighted fields.",
                errors,
            });
        }

        try {
            const lead = new LeadModel(value);
            await lead.save();
            return res.status(201).json({
                id: lead.id || lead._id,
                priority: lead.priority,
                lead,
            });
        } catch (error) {
            if (error.code === 11000 && error.keyPattern?.email) {
                return res.status(409).json({
                    message: "Lead already exists with this email.",
                    errors: { email: "Lead already exists with this email." },
                });
            }
            if (error.name === "ValidationError") {
                return res.status(400).json({ message: "Invalid lead data." });
            }
            return next(error);
        }
    }

    async function getLeads(req, res, next) {
        const pageText = req.query.page ?? "1";
        const page = Number(pageText);
        const status = req.query.status || "";
        const priority = req.query.priority || "";
        const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

        if (!/^[1-9]\d*$/.test(String(pageText)) || !Number.isSafeInteger(page)) {
            return res.status(400).json({ message: "Page must be a positive whole number." });
        }
        if (status && !LEAD_STATUSES.includes(status)) {
            return res.status(400).json({ message: "Unsupported status filter." });
        }
        if (priority && !LEAD_PRIORITIES.includes(priority)) {
            return res.status(400).json({ message: "Unsupported priority filter." });
        }
        if (search.length > 200) {
            return res.status(400).json({ message: "Search must be 200 characters or fewer." });
        }

        const filter = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (search) {
            const expression = new RegExp(escapeRegex(search), "i");
            filter.$or = [
                { name: expression },
                { email: expression },
                { company: expression },
            ];
        }

        try {
            const [leads, total] = await Promise.all([
                LeadModel.find(filter)
                    .sort({ createdAt: -1, _id: -1 })
                    .skip((page - 1) * PAGE_SIZE)
                    .limit(PAGE_SIZE),
                LeadModel.countDocuments(filter),
            ]);

            return res.status(200).json({
                leads,
                total,
                page,
                totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
                pageSize: PAGE_SIZE,
            });
        } catch (error) {
            return next(error);
        }
    }

    async function updateLeadStatus(req, res, next) {
        const { status } = req.body || {};
        if (!LEAD_STATUSES.includes(status)) {
            return res.status(400).json({
                message: "Choose New, Contacted, Qualified, or Lost.",
                errors: { status: "Unsupported status." },
            });
        }

        try {
            const lead = await LeadModel.findByIdAndUpdate(
                req.params.id,
                { status },
                { new: true, runValidators: true }
            );
            if (!lead) {
                return res.status(404).json({ message: "Lead not found." });
            }
            return res.status(200).json({ lead });
        } catch (error) {
            if (error.name === "CastError") {
                return res.status(404).json({ message: "Lead not found." });
            }
            return next(error);
        }
    }

    return { createLead, getLeads, updateLeadStatus };
}

const handlers = createLeadHandlers(Lead);

module.exports = { ...handlers, createLeadHandlers, PAGE_SIZE };
