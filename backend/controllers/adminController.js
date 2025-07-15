const Challan = require('../models/challanModel');
const User = require('../models/userModel');

exports.getDashboardStats = async (req,res)=>{
  try {
    // total challans
    const totalChallans = await Challan.countDocuments();

    // total fine collected (only paid challans)
    const totalFineCollected = await Challan.aggregate([
      { $match: { paid: true } },
      {
        $group: {
          _id: null,
          total: { $sum: "$fineAmount" }
        }
      }
    ]);

     // Paid vs Unpaid challans count
    const paidUnpaidStats = await Challan.aggregate([
      {
        $group: {
          _id: "$paid",
          count: { $sum: 1 }
        }
      }
    ]);

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

     // Monthly trend of challans issued (last 6 months)
    const monthlyTrend = await Challan.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$issuedAt" },
            month: { $month: "$issuedAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({
      totalChallans,
      totalFineCollected: totalFineCollected[0]?.total || 0,
      paidUnpaidStats,
      challansPerTTE,
      challansPerTrain,
      challansByReason,
      monthlyTrend,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

exports.getMonthlyReport = async (req, res) => {
  const { month, year } = req.query;

  try {
    const start = new Date(`${year}-${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const challans = await Challan.find({
      issuedAt: { $gte: start, $lt: end }
    }).populate('issuedBy', 'name zone');

    const stats = {
      totalChallans: challans.length,
      totalRevenue: challans.reduce((sum, c) => sum + c.fineAmount, 0),
      paymentModeBreakdown: {},
      reasonBreakdown: {},
      stationBreakdown: {},
    };

    challans.forEach(c => {
      stats.paymentModeBreakdown[c.paymentMode] = (stats.paymentModeBreakdown[c.paymentMode] || 0) + 1;
      stats.reasonBreakdown[c.reason] = (stats.reasonBreakdown[c.reason] || 0) + 1;
      stats.stationBreakdown[c.location] = (stats.stationBreakdown[c.location] || 0) + 1;
    });

    res.json({ challans, stats });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
