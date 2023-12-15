const express = require('express');
const router = express.Router();
const { StudyGroup } = require('../models')

// rendering group names
router.get('/extract-group-through-user/:UserId', async (req, res) => {

  const { UserId } = req.params;

  const listOfGroup = await StudyGroup.findAll({
    where: {
      UserId: UserId
    }
  });
  res.json(listOfGroup);
})



router.get('/find-room-id/:code', async (req, res) => {
  const { code } = req.params;
  const listOfGroup = await StudyGroup.findOne({
    where: {
      code: code
    }
  });
  res.json(listOfGroup);
})


router.get('/extract-all-group/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const listOfGroup = await StudyGroup.findByPk(roomId);
  res.json(listOfGroup);
})

// creating a group
router.post('/create-group', async (req, res) => {
  const groupDetails = req.body;
  const savedGroupDetails = await StudyGroup.create(groupDetails);
  res.json(savedGroupDetails);
})

// updating group name
router.put('/update-group/:id', async (req, res) => {
  const groupId = req.params.id;
  const { groupName } = req.body;

  try {
    const updatedGroupName = await StudyGroup.findByPk(groupId);
    updatedGroupName.groupName = groupName; // Assign the new groupName value here

    await updatedGroupName.save();
    res.json(updatedGroupName);
  } catch (error) {
    console.error('Error updating group name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// deleting a group
router.delete('/delete-group/:id', async (req, res) => {
  
  const groupId = req.params.id;

  try {
    const deletedGroup = await StudyGroup.findByPk(groupId);
    await deletedGroup.destroy();
    res.json({message: 'Successfully Deleted', error: false});
  } catch (error) {
    res.json({message: 'Fail to delete', error: true});
  }
})

module.exports = router;