const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../../utils/mailer");
const { getResetPasswordOTPTemplate } = require("../../utils/emailTemplates");

const registerUser = async (req, res) => {
    const { userName, userEmail, password, role } = req.body;

    const existingUser = await User.findOne({
        $or: [{ userEmail }, { userName }],
    });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "User name or user email already exists",
        });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        userName,
        userEmail,
        role,
        password: hashPassword,
    });

    await newUser.save();

    return res.status(201).json({
        success: true,
        message: "User registered successfully!",
    });
};

const loginUser = async (req, res) => {
    const { userEmail, password } = req.body;

    const checkUser = await User.findOne({ userEmail });

    if (!checkUser || !(await bcrypt.compare(password, checkUser.password))) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials",
        });
    }

    const accessToken = jwt.sign(
        {
            _id: checkUser._id,
            userName: checkUser.userName,
            userEmail: checkUser.userEmail,
            role: checkUser.role,
        },
        "JWT_SECRET",
        { expiresIn: "120m" }
    );

    res.status(200).json({
        success: true,
        message: "Logged in successfully",
        data: {
            accessToken,
            user: {
                _id: checkUser._id,
                userName: checkUser.userName,
                userEmail: checkUser.userEmail,
                role: checkUser.role,
                profileImage: checkUser.profileImage,
            },
        },
    });
};

const changePassword = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect",
            });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { userId, userName } = req.body;

        console.log("Update Profile Request:", { userId, userName });

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        // Check if username already exists (but not for the current user)
        if (userName) {
            const existingUser = await User.findOne({
                userName: userName,
                _id: { $ne: userId },
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Username already in use",
                });
            }
        }

        const updateData = {};
        if (userName) updateData.userName = userName;

        console.log("Updating with data:", updateData);

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

        console.log("User after update:", user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                user: {
                    _id: user._id,
                    userName: user.userName,
                    userEmail: user.userEmail,
                    role: user.role,
                    createdAt: user.createdAt,
                },
            },
        });
    } catch (error) {
        console.log("Error updating profile:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

const sendOTPResetPassword = async (req, res) => {
    try {
        const { userEmail } = req.body;

        if (!userEmail) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Check if email exists
        const user = await User.findOne({ userEmail });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Email does not exist in the system",
            });
        }

        // Generate OTP code (6 digits)
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Create JWT token containing OTP with 15 minutes expiration
        const otpToken = jwt.sign(
            {
                type: "reset-password",
                userEmail: userEmail,
                code: otpCode,
            },
            process.env.JWT_SECRET || "JWT_SECRET",
            { expiresIn: "15m" }
        );

        // Send OTP email
        try {
            await sendMail({
                to: userEmail,
                subject: "LMS LEARN Password Reset Verification Code",
                html: getResetPasswordOTPTemplate(user, otpCode),
            });

            res.json({
                success: true,
                message: "OTP code has been sent to your email",
                otpToken: otpToken,
            });
        } catch (mailError) {
            console.error("Mail error:", mailError);
            return res.status(500).json({
                success: false,
                message: "Unable to send email. Please try again later.",
            });
        }
    } catch (e) {
        console.error("Send OTP Reset Password error:", e);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { userEmail, otpCode, otpToken, newPassword } = req.body;

        if (!userEmail || !otpCode || !otpToken || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Missing required information",
            });
        }

        // Validate password
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        // Verify OTP from JWT Token
        try {
            const decoded = jwt.verify(otpToken, process.env.JWT_SECRET || "JWT_SECRET");

            // Check token type
            if (decoded.type !== "reset-password") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid token",
                });
            }

            // Check email matches
            if (decoded.userEmail !== userEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email does not match OTP",
                });
            }

            // Check OTP code matches
            if (decoded.code !== otpCode) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid verification code",
                });
            }
        } catch (jwtError) {
            if (jwtError.name === "TokenExpiredError") {
                return res.status(400).json({
                    success: false,
                    message: "Verification code has expired. Please request a new code.",
                });
            }
            return res.status(400).json({
                success: false,
                message: "Invalid token",
            });
        }

        // Find user and reset password
        const user = await User.findOne({ userEmail });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (e) {
        console.error("Reset Password error:", e);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    changePassword,
    updateUserProfile,
    sendOTPResetPassword,
    resetPassword,
};
