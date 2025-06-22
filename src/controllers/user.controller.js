import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
import { Op } from 'sequelize';

export async function getRecommendedUsers(req, res) {
  try {

    const currentUserId= req.user.id;
    const currentUser=await User.findByPk(currentUserId, {
      include: {
        model: User,
        as: 'Friends',
        attributes: ['id'],
        through: { attributes: [] }
      }
    });
    const friendIds = currentUser.Friends.map(friend => friend.id);

    const recommendedUsers = await User.findAll({
      where: {
        id: {
          [Op.notIn]: [currentUserId, ...friendIds]
        },
        isOnboarded: true
      },
      attributes: { exclude: ['password'] }
    });
    res.json({users: recommendedUsers });
  } 
  catch (error) {
    console.error("Error in getRecommendedUers controller ", error.message);
    res.json({ message: "Internal Server Error" });
  }   
}

export async function getMyFriends(req, res) {
  try {
    const currentUser = await User.findByPk(req.user.id, {
      include: {
        model: User,
        as: 'Friends',
        attributes: ['id', 'fullname', 'profilePic', 'nativeLanguage', 'learningLanguage'],
        through: { attributes: [] }
      }
    });

    res.json({ friends: currentUser.Friends });
  } catch (error) {
    console.error("Error in getMyFriends controller ", error.message);
    res.json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest (req, res) {
  try {
    const myId=req.user.id;
    const {id: recipientId}=req.params;

    if (parseInt(myId) === parseInt(recipientId)) {
      return res.status(400).json({ message: "You can't send a friend request to yourself." });
    }

    const recipient=await User.findByPk(recipientId);
    if(!recipient){
      return res.json({ message: "Recipient not found" });
    }

    const me = await User.findByPk(myId, {
      include: {
        model: User,
        as: 'Friends',
        attributes: ['id'],
        through: { attributes: [] }
      }
    });

    const isAlreadyFriend = me.Friends.some(friend => friend.id === parseInt(recipientId));
    if (isAlreadyFriend) {
      return res.status(400).json({ message: "You are already friends with this user." });
    }

    const existingRequest= await FriendRequest.findOne({
      where: {
        [Op.or]: [
          { senderId: myId, recipientId: recipientId },
          { senderId: recipientId, recipientId: myId }
        ]
      }
    });

    if(existingRequest) {
      return res.json({ message: "A friend request already exists between you and this user"});
    }

    const friendRequest=await FriendRequest.create({
      senderId: myId,
      recipientId: recipientId,
      status: 'pending'
    });

    res.json({
      message: "Friend request sent",
      request: friendRequest
    });

  } catch (error) {
    console.error("Error sending friend request:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const {id: requestId}=req.params;

    const friendRequest= await FriendRequest.findByPk(requestId);
    if(!friendRequest){
      return res.json({ message: "friend request not found" });
    }

    if(friendRequest.recipientId !==req.user.id){
      return res.json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status="accepted";
    await friendRequest.save();

    const sender = await User.findByPk(friendRequest.senderId);
    const recipient = await User.findByPk(friendRequest.recipientId);

    await sender.addFriend(recipient);
    await recipient.addFriend(sender);

    res.json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error accepting friend request:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequest(req,res) {
  try {
    const userId = req.user.id;
    const incomingReqs = await FriendRequest.findAll({
      where: {
        recipientId: userId,
        status: "pending"
      },
      include: {
        model: User,
        as: 'Sender',
        attributes: ['id', 'fullname', 'profilePic', 'nativeLanguage', 'learningLanguage']
      }
    });

    const acceptedReqs = await FriendRequest.findAll({
      where: {
        status: "accepted",
        [Op.or]: [
          { senderId: userId },
          { recipientId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'Recipient',
          attributes: ['id', 'fullname', 'profilePic']
        },
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'fullname', 'profilePic']
        }
      ]
    });
    const recentlyAcceptedReqs = await FriendRequest.findAll({
      where: {
        recipientId: userId,
        status: "accepted"
      },
      include: {
        model: User,
        as: 'Sender', // the one who sent you the request
        attributes: ['id', 'fullname', 'profilePic', 'nativeLanguage', 'learningLanguage']
      },
      order: [['updatedAt', 'DESC']], // optional, to sort by recent
    });


    res.json({ incomingReqs, acceptedReqs, recentlyAcceptedReqs });
  } catch (error) {
    console.error("Error in getFriendRequest controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const userId = req.user.id;
    const outgoingRequests = await FriendRequest.findAll({
      where: {
        senderId: userId,
        status: "pending"
      },
      include: {
        model: User,
        as: 'Recipient',
        attributes: ['id', 'fullname', 'profilePic', 'nativeLanguage', 'learningLanguage']
      }
    });
    res.json(outgoingRequests);
  } catch (error) {
    console.error("Error in getOutgoingFriendReqs:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}