const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: false, required: true },
    title: { type: String, required: true },
    question: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("question", QuestionSchema);
