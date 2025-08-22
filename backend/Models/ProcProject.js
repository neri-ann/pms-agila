const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const procProjectSchema = new Schema({
  projectId: {
    type: String,
    unique: true,
  },

    procurementRequests: [{
      requestId: {type: String, index: true},
      faculty: { type: String, index: true },
      department: { type: String, index: true },
      date: { type: Date, index: true },
      contactPerson: { type: String },
      contactNo: { type: Number },
      budgetAllocation: { type: Number },
      usedAmount: { type: Number },
      balanceAvailable: { type: Number },
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected","Bid Opening","Invite Bids","TEC Evaluation"],
        default: "Pending",
        index: true
      },
      purpose: {
        type: String,
        default: "normal",
        enum: ["", "normal", "Fast Track", "Urgent", "Normal"],
        index: true
      },
      sendTo: {
        type: String,
        default: "dean",
        enum: ["", "dean", "registrar", "viceChancellor"],
        index: true
      },
      items: [], // Array of items within ProcurementRequest schema
      files: [],
    }],

  projectTitle: {
    type: String,
    index: true
  },
  biddingType: {
    type: String,
    default: "Direct Purchasing",
    enum: ["", "Direct Purchasing", "Shopping Method", "National Competitive Method (NCB)", "International Competitive Bidding (ICB)"],
    index: true
  },
  closingDate: { type: Date, index: true },
  closingTime: { type: Date },
  appointTEC: [{ type: String }], // Array of appointTEC values
  appointBOCommite: [{ type: String }], // Array of appointBOCommite values
});

const procProject = mongoose.model("procProject", procProjectSchema);

module.exports = procProject;