const express = require('express');
const router = express.Router();
const { DashForPersonalAndGroup } = require('../models')

router.post('/', async (req, res) => {
  const assessmentData = req.body;
  const SavedAssessmentData = await DashForPersonalAndGroup.create(assessmentData); 
  res.json(SavedAssessmentData)
})

router.get('/get-latest-assessment-group/:StudyMaterialId/:groupId', async (req, res) => {
  const { StudyMaterialId, groupId } = req.params;
  try {
    const extractedStudyMaterial = await DashForPersonalAndGroup.findAll({
      where: {
        StudyMaterialId: StudyMaterialId,
        StudyGroupId: groupId
      },
      order: [['updatedAt', 'DESC']], 
    });

    res.json(extractedStudyMaterial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/get-latest-assessment-personal/:StudyMaterialId/:userId', async (req, res) => {
  const { StudyMaterialId, userId } = req.params;
  try {
    const extractedStudyMaterial = await DashForPersonalAndGroup.findAll({
      where: {
        StudyMaterialId: StudyMaterialId,
        UserId: userId
      },
      order: [['updatedAt', 'DESC']], 
    });

    res.json(extractedStudyMaterial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




router.get('/get-assessments/:StudyMaterialId', async (req, res) => {
  const { StudyMaterialId } = req.params;
  try {
    const extractedStudyMaterial = await DashForPersonalAndGroup.findAll({
      where: {
        StudyMaterialId: StudyMaterialId,
      },
      order: [['createdAt', 'DESC']], 
    });

    res.json(extractedStudyMaterial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.get('/get-dash-data/:id', async (req, res) => {
  const { id } = req.params; // Access the id parameter directly from req.params
  try {
    const extractedStudyMaterial = await DashForPersonalAndGroup.findByPk(id);

    if (extractedStudyMaterial) {
      res.json(extractedStudyMaterial);
    } else {
      res.status(404).json({ error: 'Study material not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.put('/update-data/:id', async (req, res) => {
  const dashboardId = req.params.id;
  const { assessmentScore, assessmentImp, assessmentScorePerf, completionTime, confidenceLevel } = req.body;

  try {
    const dashboardData = await DashForPersonalAndGroup.findByPk(dashboardId);

    if (!dashboardData) {
      return res.status(404).json({ error: 'Dashboard data not found' });
    }

    dashboardData.assessmentScore = assessmentScore;
    dashboardData.assessmentImp = assessmentImp;
    dashboardData.assessmentScorePerf = assessmentScorePerf;
    dashboardData.completionTime = completionTime;
    dashboardData.confidenceLevel = confidenceLevel;

    await dashboardData.save();

    console.log('Dashboard data updated successfully:', dashboardData);
    res.json(dashboardData);
  } catch (error) {
    console.error('Error updating dashboard data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/set-update-analysis/:id', async (req, res) => {
  const dashboardId = req.params.id;
  const { analysis } = req.body;

  try {
    const dashboardData = await DashForPersonalAndGroup.findByPk(dashboardId);

    if (!dashboardData) {
      return res.status(404).json({ error: 'Dashboard data not found' });
    }

    dashboardData.analysis = analysis;

    await dashboardData.save();

    console.log('Dashboard data updated successfully:', dashboardData);
    res.json(dashboardData);
  } catch (error) {
    console.error('Error updating dashboard data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;