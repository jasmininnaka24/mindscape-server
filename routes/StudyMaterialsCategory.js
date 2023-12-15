const express = require('express');
const router = express.Router();
const { StudyMaterialsCategories } = require('../models'); // Ensure it's pluralized

router.post('/', async (req, res) => {
  const category = req.body;
  await StudyMaterialsCategories.create(category);
  res.json({ message: `Successfully added.`, error: false });

});



router.get('/get-categoryy/:id', async (req, res) => {
  const id = req.params.id;
  const extractedUserDetails = await StudyMaterialsCategories.findByPk(id);
  res.json(extractedUserDetails)
})

router.get('/get-category-value/:UserId/:category', async (req, res) => {
  const { category, UserId } = req.params;
  const extractedUserDetails = await StudyMaterialsCategories.findOne({
    where: {
      category: category,
      UserId: UserId,
      categoryFor: 'Personal'
    }
  });
  res.json(extractedUserDetails)
})

router.get('/get-category-value-group/:StudyGroupId/:category', async (req, res) => {
  try {
    const { category, StudyGroupId } = req.params;
    const extractedGroupDetails = await StudyMaterialsCategories.findOne({
      where: {
        category: category,
        StudyGroupId: StudyGroupId,
        categoryFor: 'Group'
      }
    });

    res.json(extractedGroupDetails);
  } catch (error) {
    console.error('Error fetching category details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});






router.get('/:categoryFor/:StudyGroupId', async (req, res) => {
  const { categoryFor, StudyGroupId } = req.params;
  const extractedCategories = await StudyMaterialsCategories.findAll({
    where: {
      categoryFor: categoryFor,
      StudyGroupId: StudyGroupId, 
    },
  });
  res.json(extractedCategories);
})

router.get('/personal/:categoryFor/:UserId', async (req, res) => {
  const { UserId } = req.params;
  const extractedCategories = await StudyMaterialsCategories.findAll({
    where: {
      categoryFor: 'Personal',
      UserId: UserId, 
    },
  });
  res.json(extractedCategories);
})





router.get('/get-all-study-material/:UserId', async (req, res) => {
  const { UserId } = req.params;
  const extractedCategories = await StudyMaterialsCategories.findAll({
    where: {
      categoryFor: 'Personal',
      UserId: UserId, 
    },
  });
  res.json(extractedCategories);
})


router.get('/personal-study-material/:categoryFor/:UserId', async (req, res) => {
  const { categoryFor, UserId } = req.params;
  const extractedCategories = await StudyMaterialsCategories.findAll({
    where: {
      categoryFor: categoryFor,
      UserId: UserId, 
    },
  });
  res.json(extractedCategories);
})



router.get('/get-lastmaterial/:id/:categoryFor/:UserId', async (req, res) => {
  const { id, categoryFor, UserId } = req.params;
  const extractedCategory = await StudyMaterialsCategories.findOne({
    where: {
      id: id, 
      categoryFor: categoryFor,
      UserId: UserId,
    },
  });
  res.json(extractedCategory);
  // console.log(id);
})


router.get('/shared-categories/:tag/:materialFor', async (req, res) => {
  const { tag } = req.params;
  const extractedCategories = await StudyMaterialsCategories.findAll({
    where: {
      tag: tag,
    },
  });
  res.json(extractedCategories);
})


router.get('/shared-material-category/:id/:categoryFor/:UserId', async (req, res) => {
  const { id } = req.params;
  const extractedCategory = await StudyMaterialsCategories.findOne({
    where: {
      id: id, 
    },
  });
  console.log(id);

  res.json(extractedCategory);

})







router.get('/get-lastmaterial/:id/:StudyGroupId/:categoryFor/:UserId', async (req, res) => {
  const { id, categoryFor, StudyGroupId, UserId } = req.params;
  const extractedCategory = await StudyMaterialsCategories.findOne({
    where: {
      id: id, 
      StudyGroupId: StudyGroupId,
      categoryFor: categoryFor,
      UserId: UserId,
    },
  });
  res.json(extractedCategory);
})

router.put('/update-study-performance/:id', async (req, res) => {
  const categoryID = req.params.id;
  const { studyPerformance } = req.body;

  try {
    const StudyMaterialsCategoriesData = await StudyMaterialsCategories.findByPk(categoryID);

    if (!StudyMaterialsCategoriesData) {
      return res.status(404).json({ error: 'Dashboard data not found' });
    }

    StudyMaterialsCategoriesData.studyPerformance = studyPerformance;

    const updatedStudyPerformance = await StudyMaterialsCategoriesData.save();

    console.log('Dashboard data updated successfully:', updatedStudyPerformance);
    res.json(updatedStudyPerformance);
  } catch (error) {
    console.error('Error updating dashboard data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/update-shared/:id', async (req, res) => {
  const id = req.params.id;
  const { isShared } = req.body;

  try {
    const StudyMaterialsCategoriesData = await StudyMaterialsCategories.findByPk(id);

    if (!StudyMaterialsCategoriesData) {
      return res.status(404).json({ error: 'Dashboard data not found' });
    }

    StudyMaterialsCategoriesData.isShared = isShared;

    const updatedStudyPerformance = await StudyMaterialsCategoriesData.save();

    console.log('Dashboard data updated successfully:', updatedStudyPerformance);
    res.json(updatedStudyPerformance);
  } catch (error) {
    console.error('Error updating dashboard data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




router.put('/update-category/:id', async (req, res) => {
  const id = req.params.id;
  const { category } = req.body;

  try {
    const StudyMaterialsCategoriesData = await StudyMaterialsCategories.findByPk(id);

    if (!StudyMaterialsCategoriesData) {
      return res.status(404).json({ error: 'Dashboard data not found' });
    }

    StudyMaterialsCategoriesData.category = category;

    const updatedStudyPerformance = await StudyMaterialsCategoriesData.save();

    console.log('Dashboard data updated successfully:', updatedStudyPerformance);
    res.json(updatedStudyPerformance);
  } catch (error) {
    console.error('Error updating dashboard data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});







router.delete('/delete-category/:categoryId/:category', async (req, res) => {
  const { categoryId, category } = req.params;
  const studyMaterial = await StudyMaterialsCategories.findByPk(categoryId);

  await studyMaterial.destroy();
  res.json({ message: `${category} is successfully deleted.`, error: false });
});



module.exports = router;
