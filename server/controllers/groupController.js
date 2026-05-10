import Group from "../models/Group.js";
import ErrorResponse from "../utils/errorResponse.js";

export const createGroup = async (req, res) => {
  const { name, description, members } = req.body;

  const memberIds = [req.user._id];
  if (members && Array.isArray(members)) {
    members.forEach(id => {
      if (id !== req.user._id.toString()) {
        memberIds.push(id);
      }
    });
  }

  const group = await Group.create({
    name,
    description,
    createdBy: req.user._id,
    members: memberIds,
  });

  await group.populate('members', 'name email avatar');
  await group.populate('createdBy', 'name email avatar');

  res.status(201).json({ success: true, group });
};

export const getMyGroups = async (req, res) => {
  const groups = await Group.find({ members: req.user._id })
    .populate('members', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: groups.length, groups });
};

export const getMyConnections = async (req, res) => {
  const groups = await Group.find({ members: req.user._id }).populate('members', 'name email avatar');
  
  const connectionsMap = new Map();
  groups.forEach(group => {
    group.members.forEach(member => {
      // Don't include the current user
      if (member._id.toString() !== req.user._id.toString()) {
        const id = member._id.toString();
        if (!connectionsMap.has(id)) {
          connectionsMap.set(id, {
            user: member,
            sharedGroups: [group.name]
          });
        } else {
          const existing = connectionsMap.get(id);
          if (!existing.sharedGroups.includes(group.name)) {
            existing.sharedGroups.push(group.name);
          }
        }
      }
    });
  });

  const connections = Array.from(connectionsMap.values());
  res.status(200).json({ success: true, count: connections.length, connections });
};

export const getGroupById = async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('members', 'name email avatar')
    .populate('createdBy', 'name email avatar');

  if (!group) {
    throw new ErrorResponse(`Group not found with id ${req.params.id}`, 404);
  }

  const isMember = group.members.some(
    (member) => member._id.toString() === req.user._id.toString()
  );

  if (!isMember) {
    throw new ErrorResponse('Not authorized to view this group', 403);
  }

  res.status(200).json({ success: true, group });
};

export const joinGroup = async (req, res) => {
  const group = await Group.findOne({ inviteToken: req.params.inviteToken });

  if (!group) {
    throw new ErrorResponse('Invalid invite link', 404);
  }

  const alreadyMember = group.members.some(
    (memberId) => memberId.toString() === req.user._id.toString()
  );

  if (alreadyMember) {
    throw new ErrorResponse('You are already a member of this group', 400);
  }

  group.members.push(req.user._id);
  await group.save();

  await group.populate('members', 'name email avatar');
  await group.populate('createdBy', 'name email avatar');

  res.status(200).json({ success: true, message: 'Successfully joined the group', group });
};

export const updateGroup = async (req, res) => {
  let group = await Group.findById(req.params.id);

  if (!group) {
    throw new ErrorResponse('Group not found', 404);
  }

  if (group.createdBy.toString() !== req.user._id.toString()) {
    throw new ErrorResponse('Only group creator can update the group', 403);
  }

  const { name, description, status } = req.body;

  group = await Group.findByIdAndUpdate(
    req.params.id,
    { name, description, status },
    { new: true, runValidators: true }
  )
    .populate('members', 'name email avatar')
    .populate('createdBy', 'name email avatar');

  res.status(200).json({ success: true, group });
};

export const addMember = async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    throw new ErrorResponse('Group not found', 404);
  }

  const isMember = group.members.some(
    (memberId) => memberId.toString() === req.user._id.toString()
  );

  if (!isMember) {
    throw new ErrorResponse('Not authorized to add members to this group', 403);
  }

  const { userId } = req.body;
  if (!userId) {
    throw new ErrorResponse('User ID is required', 400);
  }

  const alreadyMember = group.members.some(
    (memberId) => memberId.toString() === userId
  );

  if (alreadyMember) {
    throw new ErrorResponse('User is already a member of this group', 400);
  }

  group.members.push(userId);
  await group.save();

  await group.populate('members', 'name email avatar');
  await group.populate('createdBy', 'name email avatar');

  res.status(200).json({ success: true, message: 'Member added successfully', group });
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Only creator can delete
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only group creator can delete this group' });
    }

    // Use findByIdAndDelete to ensure it works across Mongoose versions
    await Group.findByIdAndDelete(req.params.id);

    // Optional: Clean up related data if needed
    // await Expense.deleteMany({ groupId: req.params.id });
    // await Settlement.deleteMany({ groupId: req.params.id });

    res.status(200).json({ success: true, message: 'Group deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
