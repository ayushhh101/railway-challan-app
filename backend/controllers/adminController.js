const Challan = require('../models/challanModel');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const { ErrorResponses } = require('../utils/errorResponses');

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

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

    // paid vs unpaid challans count
    const paidUnpaidStats = await Challan.aggregate([
      {
        $group: {
          _id: "$paid",
          count: { $sum: 1 }
        }
      }
    ]);

    //(only the latest 5)
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

    //(only the latest 5)
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

    const challansByReason = await Challan.aggregate([
      {
        $group: {
          _id: "$reason",
          count: { $sum: 1 }
        }
      }
    ]);

    //(last 6 months)
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

    const challansThisMonth = await Challan.countDocuments({
      issuedAt: { $gte: startOfThisMonth }
    });
    const challansLastMonth = await Challan.countDocuments({
      issuedAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }
    });
    const totalChallansChange = challansLastMonth === 0 ? 100 : ((challansThisMonth - challansLastMonth) / Math.max(challansLastMonth, 1)) * 100;

    const fineThisMonthAgg = await Challan.aggregate([
      { $match: { paid: true, issuedAt: { $gte: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: "$fineAmount" } } }
    ]);
    const fineLastMonthAgg = await Challan.aggregate([
      { $match: { paid: true, issuedAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: "$fineAmount" } } }
    ]);
    const fineThisMonth = fineThisMonthAgg[0]?.total || 0;
    const fineLastMonth = fineLastMonthAgg[0]?.total || 0;
    const totalFineCollectedChange = fineLastMonth === 0 ? (fineThisMonth ? 100 : 0) : ((fineThisMonth - fineLastMonth) / Math.max(fineLastMonth, 1)) * 100;


    const paidUnpaidThisMonth = await Challan.aggregate([
      { $match: { issuedAt: { $gte: startOfThisMonth } } },
      { $group: { _id: "$paid", count: { $sum: 1 } } }
    ]);
    const paidUnpaidLastMonth = await Challan.aggregate([
      { $match: { issuedAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
      { $group: { _id: "$paid", count: { $sum: 1 } } }
    ]);
    const findCount = (arr, paid) => arr.find(x => x._id === paid)?.count || 0;
    const paidChallansThis = findCount(paidUnpaidThisMonth, true);
    const paidChallansLast = findCount(paidUnpaidLastMonth, true);
    const unpaidChallansThis = findCount(paidUnpaidThisMonth, false);
    const unpaidChallansLast = findCount(paidUnpaidLastMonth, false);
    const paidChallansChange = paidChallansLast === 0 ? (paidChallansThis ? 100 : 0) : ((paidChallansThis - paidChallansLast) / Math.max(paidChallansLast, 1)) * 100;
    const unpaidChallansChange = unpaidChallansLast === 0 ? (unpaidChallansThis ? 100 : 0) : ((unpaidChallansThis - unpaidChallansLast) / Math.max(unpaidChallansLast, 1)) * 100;


    res.json({
      totalChallans,
      totalChallansChange: Number(totalChallansChange.toFixed(2)),
      totalFineCollected: totalFineCollected[0]?.total || 0,
      totalFineCollectedChange: Number(totalFineCollectedChange.toFixed(2)),
      paidUnpaidStats,
      paidChallansChange: Number(paidChallansChange.toFixed(2)),
      unpaidChallansChange: Number(unpaidChallansChange.toFixed(2)),
      challansPerTTE,
      challansPerTrain,
      challansByReason,
      monthlyTrend,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
}

exports.getMonthlyReport = async (req, res) => {
  const { month, year } = req.query;

  if (
    !month || !year ||
    !/^(0[1-9]|1[0-2])$/.test(month) ||
    !/^\d{4}$/.test(year)
  ) {
    const error = ErrorResponses.validationError('Invalid month or year');
    return res.status(error.statusCode).json(error);
  }

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
    console.error("Monthly report error:", err);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
};

exports.getTTEAnalytics = async (req, res) => {
  try {
    const ttes = await User.find({ role: 'tte' });

    //each tc stats
    const stats = await Promise.all(
      ttes.map(async (tte) => {
        const challans = await Challan.find({ issuedBy: tte._id });
        const issued = challans.length;
        const paid = challans.filter(c => c.paid).length;
        const unpaid = issued - paid;
        const recovery = issued === 0 ? 0 : Math.round((paid / issued) * 100);
        return {
          id: tte._id,
          name: tte.name,
          employeeId: tte.employeeId,
          zone: tte.zone || "N/A",
          lastLogin: tte.lastLogin,
          issued,
          paid,
          unpaid,
          recovery,
        };
      })
    );

    res.status(200).json({ tteStats: stats });
  } catch (error) {
    console.error("TTE analytics error:", error);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
}

exports.adminResetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      const error = ErrorResponses.missingFields('User ID and new password are required');
      return res.status(error.statusCode).json(error);
    }

    if (newPassword.length < 8) {
      const error = ErrorResponses.validationError('Password must be at least 8 characters');
      return res.status(error.statusCode).json(error);
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = ErrorResponses.userNotFound();
      return res.status(error.statusCode).json(error);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    // TODO:Optional: user.passwordChangedAt = new Date();
    await user.save();
    // TODO:Log action here for audit if desired

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error("Admin reset password error:", err);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
};