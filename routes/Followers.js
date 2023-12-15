const express = require('express');
const router = express.Router();
const { Followers } = require('../models');

router.post('/follow', async (req, res) => {
  const followingPersonId = req.body;
  const savedFollowedPersonId = await Followers.create(followingPersonId);
  res.json(savedFollowedPersonId);
})

router.get('/get-follower-list/:FollowerId', async (req, res) => {
  const id = req.params.FollowerId;
  const extractedFollowingList = await Followers.findAll({
    where: { FollowerId: id }
  });

  res.json(extractedFollowingList);
})

router.get('/get-following-list/:FollowerId', async (req, res) => {
  const id = req.params.FollowerId;
  const extractedFollowingList = await Followers.findAll({
    where: { FollowerId: id }
  });

  res.json(extractedFollowingList);
})


router.get('/following/:FollowingId', async (req, res) => {
  const id = req.params.FollowingId;
  const extractedFollowingList = await Followers.findOne({
    where: { FollowingId: id }
  });

  res.json(extractedFollowingList);
})

router.delete('/unfollow/:FollowingId/:FollowerId', async (req, res) => {
  const { FollowingId, FollowerId } = req.params;

  const extractedFollowingList = await Followers.findOne({
    where: { 
      FollowingId: FollowingId, 
      FollowerId: FollowerId, 
    }
  });

  await extractedFollowingList.destroy();

  res.json(extractedFollowingList);
})



module.exports = router;