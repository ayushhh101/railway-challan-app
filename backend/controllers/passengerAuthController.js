const Passenger = require('../models/passengerModel'); // Your passenger mongoose model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logAudit = require('../utils/auditLogger');

const generateOnboardingToken = (passengerId) => {
  return jwt.sign(
    { passengerId },
    process.env.PASSENGER_ONBOARD_SECRET,
    { expiresIn: '1d' }
  );
};

async function sendOnboardingNotification(mobileNumber, name, onboardingUrl) {
  // Integration with SMS/email provider here
  console.log(`Sending onboarding SMS to +91${mobileNumber}:`);
  console.log(`Hello ${name}, you have a challan. Register here: ${onboardingUrl}`);
}

const generateAccessToken = (passenger) => {
  return jwt.sign({ id: passenger._id, role: 'passenger' }, process.env.PASSENGER_ACCESS_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (passenger) => {
  return jwt.sign({ id: passenger._id, role: 'passenger' }, process.env.PASSENGER_REFRESH_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { name, aadharLast4, mobileNumber, password } = req.body;

    if (!name || !aadharLast4 || !mobileNumber || !password) {
      const error = ErrorResponses.missingFields('All fields are required');
      return res.status(error.statusCode).json(error);
    }

    if (aadharLast4.length !== 4) {
      const error = ErrorResponses.validationError('Aadhar must be last 4 digits only');
      return res.status(error.statusCode).json(error);
    }

    const existingPassenger = await Passenger.findOne({ mobileNumber });
    if (existingPassenger) {
      const error = ErrorResponses.alreadyExists('Passenger');
      return res.status(error.statusCode).json(error);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPassenger = new Passenger({
      name,
      aadharLast4,
      mobileNumber,
      passwordHash: hashedPassword,
    });

    await newPassenger.save();

    res.status(201).json({ message: 'Registration successful' });

    await logAudit({
      action: 'PASSENGER_REGISTER',
      performedBy: newPassenger._id,
      role: 'passenger',
      metadata: { mobileNumber },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      severity: 'low',
    });
  } catch (err) {
    console.error('Passenger registration error:', err);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
};

exports.login = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    if (!mobileNumber || !password) {
      const error = ErrorResponses.missingFields('Mobile number and password are required');
      return res.status(error.statusCode).json(error);
    }

    const passenger = await Passenger.findOne({ mobileNumber });
    if (!passenger) {
      const error = ErrorResponses.passengerNotFound();
      return res.status(error.statusCode).json(error);
    }

    if (!passenger.passwordHash) {
      const now = Date.now();
      const cooldownMinutes = 5;
      let onboardingToken = passenger.lastOnboardingToken;
      let shouldSend = false;

      if (
        !passenger.lastOnboardingTokenSent ||
        now - new Date(passenger.lastOnboardingTokenSent).getTime() > cooldownMinutes * 60 * 1000
      ) {
        // generate a new onboarding token and update timestamp
        onboardingToken = generateOnboardingToken(passenger._id);
        passenger.lastOnboardingTokenSent = new Date(now);
        passenger.lastOnboardingToken = onboardingToken;
        shouldSend = true;

        // optionally, save async but don't block
        passenger.save().catch(console.error);
      }

      const onboardingUrl = `${process.env.FRONTEND_URL}/passenger/onboard?token=${onboardingToken}`;

      if (shouldSend) {
        await sendOnboardingNotification(passenger.mobileNumber, passenger.name, onboardingUrl);
      }
      return res.status(400).json({
        message: shouldSend
          ? 'Passenger must complete onboarding before login. Onboarding link has been sent.'
          : `Please wait ${cooldownMinutes} minutes before resending onboarding link.`,
        onboardingToken,
        onboardingUrl,
        cooldownActive: !shouldSend,
        nextAllowed: shouldSend
          ? null
          : new Date(new Date(passenger.lastOnboardingTokenSent).getTime() + cooldownMinutes * 60 * 1000),
      });
    }

    const isMatch = await bcrypt.compare(password, passenger.passwordHash);
    if (!isMatch) {
      const error = ErrorResponses.invalidCredentials();
      return res.status(error.statusCode).json(error);
    }

    const accessToken = generateAccessToken(passenger);
    const refreshToken = generateRefreshToken(passenger);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // Use HTTPS
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    try {
      await logAudit({
        action: 'PASSENGER_LOGIN',
        performedBy: passenger._id,
        role: 'passenger',
        metadata: { mobileNumber },
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'SUCCESS',
        severity: 'low',
      });
    } catch (err) {
      console.warn("Audit logging failed:", err);
    }

    return res.status(200).json({
      message: 'Login successful',
      token: accessToken,
      user: {
        id: passenger._id,
        name: passenger.name,
        mobileNumber: passenger.mobileNumber,
        role: 'passenger',
      },
    });


  } catch (err) {
    console.error('Passenger login error:', err);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
};

exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    const error = ErrorResponses.unauthorized('Refresh token is required');
    return res.status(error.statusCode).json(error);
  }

  try {
    const payload = jwt.verify(token, PASSENGER_REFRESH_SECRET);
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ token: newAccessToken });
  } catch (err) {
    console.error('Refresh token error:', err);
    const error = ErrorResponses.tokenInvalid();
    return res.status(error.statusCode).json(error);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
};

exports.resetPassword = async (req, res) => {
  const { mobileNumber, newPassword } = req.body;

  if (!mobileNumber || !newPassword) {
    const error = ErrorResponses.missingFields('Mobile number and new password are required');
    return res.status(error.statusCode).json(error);
  }
  try {
    const passenger = await Passenger.findOne({ mobileNumber });
    if (!passenger) {
      const error = ErrorResponses.passengerNotFound();
      return res.status(error.statusCode).json(error);
    }

    const hash = await bcrypt.hash(newPassword, 10);
    passenger.passwordHash = hash;
    await passenger.save();

    res.json({ message: 'Password reset successfully by staff.' });
  } catch (err) {
    console.error('Reset password error:', err);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
};
