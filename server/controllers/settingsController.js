import User from '../models/User.js';
import Property from '../models/Property.js';
import Info from '../models/Info.js';
import Resident from '../models/Resident.js';
import { uploadToGridFS, deleteFromGridFS } from '../config/gridfs.js';
import mongoose from 'mongoose';

// @desc    Get admin profile
// @route   GET /api/admin/settings/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      name: user.name,
      email: user.email || '',
      mobileNumber: user.mobileNumber,
      role: user.role,
      profilePhoto: user.profilePhoto || '',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/settings/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, mobileNumber } = req.body;

    if (!name || !mobileNumber) {
      return res.status(400).json({ message: 'Name and mobile number are required' });
    }

    // Check if mobile number is taken by another user
    const existing = await User.findOne({ mobileNumber, _id: { $ne: req.user.id } });
    if (existing) {
      return res.status(400).json({ message: 'Mobile number already in use by another account' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, mobileNumber },
      { returnDocument: 'after', runValidators: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email || '',
        mobileNumber: user.mobileNumber,
        role: user.role,
        profilePhoto: user.profilePhoto || '',
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get property details (singleton)
// @route   GET /api/admin/settings/property
export const getProperty = async (req, res) => {
  try {
    let property = await Property.findOne();
    if (!property) {
      property = await Property.create({});
    }
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update property details (singleton)
// @route   PUT /api/admin/settings/property
export const updateProperty = async (req, res) => {
  try {
    const { propertyName, address, totalBeds, contactNumber, managerEmail, upiId } = req.body;

    let property = await Property.findOne();
    if (!property) {
      property = new Property();
    }

    property.propertyName = propertyName ?? property.propertyName;
    property.address = address ?? property.address;
    property.totalBeds = totalBeds ?? property.totalBeds;
    property.contactNumber = contactNumber ?? property.contactNumber;
    property.managerEmail = managerEmail ?? property.managerEmail;
    property.upiId = upiId ?? property.upiId;

    await property.save();

    res.status(200).json({ message: 'Property updated successfully', property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password
// @route   POST /api/admin/settings/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload profile photo
// @route   POST /api/admin/settings/profile-photo
export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete old photo from GridFS if exists
    if (user.profilePhoto) {
      try {
        await deleteFromGridFS(user.profilePhoto);
      } catch {
        // old file may already be deleted
      }
    }

    // Upload new photo
    const fileId = await uploadToGridFS(
      req.file.buffer,
      `profile-${req.user.id}-${Date.now()}`,
      req.file.mimetype
    );

    user.profilePhoto = fileId.toString();
    await user.save();

    res.status(200).json({
      message: 'Profile photo updated',
      profilePhoto: user.profilePhoto,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove profile photo
// @route   DELETE /api/admin/settings/profile-photo
export const removeProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.profilePhoto) {
      try {
        await deleteFromGridFS(user.profilePhoto);
      } catch {
        // file may already be gone
      }
      user.profilePhoto = '';
      await user.save();
    }

    res.status(200).json({ message: 'Profile photo removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Rooms & Rates ──

// @desc    Get rooms and rent rates (with occupancy counts)
// @route   GET /api/admin/settings/rooms-rates
export const getRoomsAndRates = async (req, res) => {
  try {
    let info = await Info.findOne();
    if (!info) {
      info = await Info.create({ monthly: '0', daily: '0', rooms: [] });
    }

    // Count active residents per room
    const occupancyCounts = await Resident.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: { $toUpper: '$roomNumber' }, count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(occupancyCounts.map(o => [o._id, o.count]));

    const rooms = info.rooms.map(r => ({
      roomNo: r.roomNo,
      beds: r.beds,
      maxOccupants: r.maxOccupants,
      currentOccupants: countMap[r.roomNo.toUpperCase()] || 0,
    }));

    res.status(200).json({
      monthly: info.monthly,
      daily: info.daily,
      rooms,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update rent rates and rooms
// @route   PUT /api/admin/settings/rooms-rates
export const updateRoomsAndRates = async (req, res) => {
  try {
    const { monthly, daily, rooms } = req.body;

    let info = await Info.findOne();
    if (!info) {
      info = new Info({ monthly: '0', daily: '0', rooms: [] });
    }

    if (monthly !== undefined) info.monthly = String(monthly);
    if (daily !== undefined) info.daily = String(daily);

    if (rooms !== undefined) {
      // Validate no duplicate room numbers
      const roomNos = rooms.map(r => String(r.roomNo).trim().toUpperCase());
      const unique = new Set(roomNos);
      if (unique.size !== roomNos.length) {
        return res.status(400).json({ message: 'Duplicate room numbers are not allowed' });
      }
      info.rooms = rooms.map(r => ({
        roomNo: String(r.roomNo).trim().toUpperCase(),
        beds: Math.max(1, Number(r.beds) || 1),
        maxOccupants: Math.max(1, Number(r.maxOccupants) || 1),
      }));
    }

    await info.save();

    res.status(200).json({
      message: 'Rooms & rates updated successfully',
      monthly: info.monthly,
      daily: info.daily,
      rooms: info.rooms,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
