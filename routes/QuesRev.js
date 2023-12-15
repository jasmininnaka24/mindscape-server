const express = require('express');
const router = express.Router();
const { QuesRev } = require('../models')

router.post('/', async (req, res) => {
  const data = req.body;
  const savedData = await QuesRev.create(data);
  res.json(savedData)
})

router.get('/study-material-rev/:studyMaterialID', async(req, res) => {
  const studyMaterialID = req.params.studyMaterialID;
  const studyMaterial = await QuesRev.findAll({
    where: { StudyMaterialId: studyMaterialID }
  });

  res.json(studyMaterial);
});



router.put('/update-rev/:id', async (req, res) => {
  const id = req.params.id;
  const { question, answer } = req.body;

  const studyMaterialRev = await QuesRev.findByPk(id);

  studyMaterialRev.question = question; 
  studyMaterialRev.answer = answer; 


  await studyMaterialRev.save();
  res.json(studyMaterialRev);
});


router.put('/update-rev-question/:id', async (req, res) => {
  const id = req.params.id;
  const { question } = req.body;

  try {
    let studyMaterialRev = await QuesRev.findByPk(id);

    // Check if the record exists
    if (!studyMaterialRev) {
      return res.status(404).json({ error: 'Record not found' });
    }

    studyMaterialRev.question = question;

    await studyMaterialRev.save();
    res.json(studyMaterialRev);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.put('/update-rev-answer/:id', async (req, res) => {
  const id = req.params.id;
  const { answer } = req.body;

  try {
    let studyMaterialRev = await QuesRev.findByPk(id);

    // Check if the record exists
    if (!studyMaterialRev) {
      return res.status(404).json({ error: 'Record not found' });
    }

    studyMaterialRev.answer = answer;

    await studyMaterialRev.save();
    res.json(studyMaterialRev);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





router.delete('/delete-rev/:id', async (req, res) => {
  const revId = req.params.id;
  const deletedRevItem = await QuesRev.findByPk(revId);
  await deletedRevItem.destroy();
  res.json(deletedRevItem);
})





module.exports = router;