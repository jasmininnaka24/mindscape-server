const express = require('express');
const router = express.Router();
const { StudyGroupMembers, StudyGroup } = require('../models')

// creating a member to the group
router.post('/add-member', async (req, res) => {
  const groupMemberDetails = req.body;
  const savedGroupMemberDetails = await StudyGroupMembers.create(groupMemberDetails);
  res.json(savedGroupMemberDetails);
})



router.get('/find-userId/:groupId/:UserId', async (req, res) => {
  const { groupId, UserId } = req.params;
  const listOfGroup = await StudyGroupMembers.findOne({
    where: {
      UserId: UserId,
      StudyGroupId: groupId
    }
  });
  res.json(listOfGroup);
})




// creating a member to the group
router.get('/get-members/:groupNameId', async (req, res) => {
  const { groupNameId } = req.params; // Access groupNameId from URL params
  try {
    const savedGroupMemberDetails = await StudyGroupMembers.findAll({
      where: {
        StudyGroupId: groupNameId,
      },
    });
    res.json(savedGroupMemberDetails);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.delete('/remove-member/:groupNameId/:userId', async (req, res) => {
  const { groupNameId, userId } = req.params;

  try {

    const ifTheresAHost = await StudyGroup.findByPk(groupNameId, {
      where: {
        UserId: !null
      }
    })

    const groupMembersLength = await StudyGroupMembers.findAll({
      where: {
        StudyGroupId: groupNameId
      }
    })


    if (ifTheresAHost.dataValues.UserId === null && groupMembersLength.length === 1) {
      const deletedGroup = await StudyGroup.findByPk(groupNameId);
      await deletedGroup.destroy();

      if (deletedGroup) {
        res.json({ message: 'Leaving the group...', error: false });
      } else {
        res.json({ message: 'Group member not found.', error: true });
      }
    } else {
      const deletedGroupMember = await StudyGroupMembers.destroy({
          where: {
          UserId: userId,
          StudyGroupId: groupNameId
        }
      });
      if (deletedGroupMember > 0) {
        res.json({ message: 'Leaving the group...', error: false });
      } else {
        res.json({ message: 'Group member not found.', error: true });
      }
    }
      

  } catch (error) {
    console.error(error);
    res.json({ message: 'Group member not found.', error: true });
  }
});



// creating a member to the group
router.get('/get-materialId/:userId', async (req, res) => {
  const { userId } = req.params; 
  try {
    const savedGroupMemberDetails = await StudyGroupMembers.findAll({
      where: {
        UserId: userId,
      },
    });
    res.json(savedGroupMemberDetails);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




module.exports = router;