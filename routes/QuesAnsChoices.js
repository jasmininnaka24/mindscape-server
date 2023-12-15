const express = require('express');
const router = express.Router();
const { QuesAnsChoices } = require('../models')

router.post('/', async (req, res) => {
  const quesAnsChoicesData = req.body;
  const savedQACData = await QuesAnsChoices.create(quesAnsChoicesData);
  res.json(savedQACData);
})

router.get('/study-material/:studyMaterialID/:quesAnsID', async(req, res) => {
  const studyMaterialID = req.params.studyMaterialID;
  const quesAnsID = req.params.quesAnsID;
  const studyMaterial = await QuesAnsChoices.findAll({
    where: { QuesAnId: quesAnsID, StudyMaterialId: studyMaterialID }
  });

  res.json(studyMaterial);
});


router.put('/update-choices/:id', async (req, res) => {
  const id = req.params.id;
  const { choices } = req.body;

  const updatedChoices = await QuesAnsChoices.findByPk(id);

  updatedChoices.choices = choices; 



  await updatedChoices.save();
  res.json(updatedChoices);
});




router.delete('/delete-choice/:id', async (req, res) => {
  const choiceId = req.params.id;
  const deletedChoiceItem = await QuesAnsChoices.findByPk(choiceId);
  await deletedChoiceItem.destroy();
  res.json(deletedChoiceItem);
})



module.exports = router;