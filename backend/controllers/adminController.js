const Challan = require('../models/challanModel');
const User = require('../models/userModel');

async function getDashboardStats(req, res) {
  try {
    // Total challans
    const totalChallans = await Challan.countDocuments();

    // Challans per TTE (Top 5)
    const challansPerTTE = await Challan.aggregate([
      {
        $group: {
          _id: "$issuedBy",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "tte"
        }
      },
      { $unwind: "$tte" },
      {
        $project: {
          _id: 0,
          tteName: "$tte.name",
          employeeId: "$tte.employeeId",
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Challans per train (Top 5)
    const challansPerTrain = await Challan.aggregate([
      {
        $group: {
          _id: "$trainNumber",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Challans by reason
    const challansByReason = await Challan.aggregate([
      {
        $group: {
          _id: "$reason",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalChallans,
      challansPerTTE,
      challansPerTrain,
      challansByReason,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getDashboardStats };
