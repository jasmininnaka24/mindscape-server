const express = require('express');
const router = express.Router();
const { User, Token, StudyMaterials, StudyMaterialsCategories, DashForPersonalAndGroup } = require('../models');
const sendEmail = require('../utils/sendEmail');
const resetPassword = require('../utils/resetPassword');
const crypto = require('crypto');
const bcrypt  = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');




const { sign, verify } = require('jsonwebtoken')

const jwtSecret = "mindscapeprojectkeysecret";

const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


// registration
router.post('/', async (req, res) => {
  const { username, password, email, name, url_host } = req.body;
  
  try {


    const usernameReponse = await User.findOne({
      where: {
        username: username,
      },
      attributes: {
        exclude: ["password"]
      }
    });

    const emailReponse = await User.findOne({
      where: {
        email: email,
      },
      attributes: {
        exclude: ["password"]
      }
    });

    console.log(emailReponse);

    // User already exists
    if (email == '' || username === '' || password === '') {
      return res.json({ message: 'Fill out all the empty fields.', error: true });
    } 

    if (usernameReponse) {
      return res.json({ message: 'Username is already taken.', error: true });
    } 
    
    if (emailReponse) {
      return res.json({ message: 'Email already exists.', error: true });
    } 

    if (!emailRegex.test(email)) {
      return res.json({ message: 'Enter a valid email address', error: true });
    }
    
    
    if (password.length < 8) {
      return res.json({ message: 'Password must be 8 characters long', error: true });
    }
    
    if (!/[A-Z]/.test(password)) {
      return res.json({ message: 'Password must contain at least one capital letter', error: true });
    }
    

    if (!passwordRegex.test(password)) {
      return res.json({ message: 'Password must have 1 number and 1 symbol', error: true });
    }


    const hash = await bcrypt.hash(password, 10);
    const savedUserData = await User.create({
      username: username,
      password: hash,
      email: email,
      name: name,
    });

    const token = await Token.create({
      UserId: savedUserData.id,
      token: crypto.randomBytes(32).toString('hex'),
    });

    const url = `${url_host}/users/${savedUserData.id}/verify/${token.token}`;
    // Use the correct frontend URL, adjust the port if needed
    
    const verificationMessage = `
    Kindly verify your account by clicking the link below:
    
    ${url}
    `;
    
    await sendEmail(savedUserData.email, 'Verify Email', verificationMessage);
    

    res.status(201).send({ message: "An email has been sent to your gmail account. Kindly check for verification." });



  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Verify email with token
router.get('/:id/verify/:token', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.json({ message: 'Invalid link', error: true });
    }

    const token = await Token.findOne({
      where: {
        UserId: user.id,
        token: req.params.token,
      },
    });

    if (!token) {
      return res.status(400).send({ message: 'Invalid token' });
    }

    // Update the user's isVerified field
    await user.update({ isVerified: true });
    res.json(token)

    // Remove the token from the database
    // await token.destroy();

    // Redirect the user to the login page (you can change the URL as needed)
    // res.redirect(`/classification-questions/${user.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});


// log in
router.post('/login', async (req, res) => {
  const { password, email, url_host } = req.body;

  try {

    if (email == '' || password === '') {
      return res.json({ message: 'Fill out all the empty fields.', error: true });
    } 

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.json({ message: 'User does not exist', error: true });
    }

    if (password !== undefined) {
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.json({ message: 'Wrong email and password combination.', error: true });
      }

      if (user.isVerified !== true) {
        const token = await Token.create({
          UserId: user.id,
          token: crypto.randomBytes(32).toString('hex'),
        });

        const url = `${url_host}/users/${user.id}/verify/${token.token}`;
        
        await sendEmail(user.email, 'Verify Email', url);
  
        return res.json({ message: 'An email has been sent for verification.', error: true });

      }
    }

    const accessToken = sign({ id: user.id }, jwtSecret);
    return res.json({ accessToken, user: { id: user.id } });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});









router.get('/', async (req, res) => {
  const listOfUsername = await User.findAll();
  res.json(listOfUsername);
})

router.get('/get-user/:id', async (req, res) => {
  const userId = req.params.id;
  const extractedUserDetails = await User.findByPk(userId, {
    attributes: {exclude: ["password"]}
  });
  res.json(extractedUserDetails)
})




router.put('/update-typeoflearner/:id', async (req, res) => {
  const userId = req.params.id;
  const { typeOfLearner } = req.body;

  try {
    const UserData = await User.findByPk(userId);

    if (!UserData) {
      return res.status(404).json({ error: 'Dashboard data not found' });
    }

    UserData.typeOfLearner = typeOfLearner;

    const updatedUserData = await UserData.save();

    res.json(updatedUserData);

  } catch (error) {
    console.error('Error updating dashboard data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/update-user/:id', async (req, res) => {
  const userId = req.params.id;
  const { username, studyProfTarget, typeOfLearner } = req.body;

  try {
    // Check if the provided username is already taken by another user
    const existingUser = await User.findOne({
      where: {
        username: username,
        id: {
          [Op.not]: userId, // Exclude the current user from the search
        },
      },
      attributes: {
        exclude: ["password"],
      },
    });

    if (existingUser) {
      return res.json({ message: 'Username is already taken.', error: true });
    }

    // Validate other input fields
    if (studyProfTarget === '' || username === '' || typeOfLearner === '') {
      return res.json({ message: 'Fill out all the empty fields.', error: true });
    }

    const UserData = await User.findByPk(userId);

    if (!UserData) {
      return res.json({ message: 'User not found', error: true });
    }

    // Update user details
    UserData.username = username;
    UserData.studyProfTarget = studyProfTarget;
    UserData.typeOfLearner = typeOfLearner;

    console.log('updated:', UserData);

    // Save the updated user data
    await UserData.save();

    res.json({ message: 'User details have been updated.', error: false });
  } catch (error) {
    console.error(error);
    res.json({ message: 'Failed updating user details.', error: true });
  }
});


router.put('/update-user-image/:id', async (req, res) => {
  const userId = req.params.id;
  const { userImage } = req.body;

  try {
    const UserData = await User.findByPk(userId, {
      attributes: {
        exclude: ["password"]
      }
    });

    if (!UserData) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('There is a value');
    console.log('Current user image:', UserData.dataValues.userImage);

    // Check if the new userImage is different from the existing one
    if (UserData.dataValues.userImage !== "user.png") {
      // Define the absolute path to the existing image file
      const existingImagePath = path.join(__dirname, '..', 'public/images', UserData.dataValues.userImage);

      // Delete the existing image file if it exists
      if (fs.existsSync(existingImagePath)) {
        fs.unlinkSync(existingImagePath);
        console.log('Existing image deleted:', existingImagePath);
      }
    } else {
      console.log('User image remains unchanged. Skipping unlinking.');
    }

    UserData.userImage = userImage;

    await UserData.save();

    res.json({ message: 'Profile photo has been updated.', error: false });
    
  } catch (error) {
    console.error('Error updating user image:', error);
    res.json({ message: 'Failed updating profile photo.', error: true });
  }
});


router.post('/verify-email', async (req, res) => {
  const { email, url_host} = req.body;

  try {
    const oldUser = await User.findOne({
      where: {
        email: email
      }
    })


    if (!oldUser) {
      return res.json({message: "User does not exist."})
    }

    const secret = jwtSecret + oldUser.password;
    const token =  sign({ email: oldUser.email, id: oldUser.id }, secret, {expiresIn: '5m'});



    // Construct the verification URL with the new token
    const url = `${url_host}/reset-password/${oldUser.id}/${token}`;
  
    // Use the correct frontend URL, adjust the port if needed
    await sendEmail(email, 'Verify Email', url);

    // return res.status(400).send('An email has been sent to your gmail account. Kindly check for verification.');



  } catch (error) {

  }
})


router.get('/reset-password/:id/:token', async(req,res) => {
  const { id, token } = req.params;


  const oldUser = await User.findByPk(id)

  if (!oldUser) {
    return res.json({message: "User does not exist.", error: true})
  }

  const secret = jwtSecret + oldUser.password;


  try {

    const verifyData = verify(token,secret);
    res.json({message: "Your password has been updated.", error: false});

  } catch (error) {
    console.log(error);
    res.json({message: "Your token has already expired.", error: true});
  }

})

router.post('/reset-password/:id/:token', async(req,res) => {
  const { id, token} = req.params;
  const { password } = req.body;

  const oldUser = await User.findByPk(id)

  if (!oldUser) {
    return res.json({message: "User does not exist."})
  }

  const secret = jwtSecret + oldUser.password;


  try {

    const verifyData = verify(token,secret);
    // res.json({email: verifyData.email});

    const encryptedPassword = await bcrypt.hash(password, 10);


    const UserData = await User.findByPk(id);

    UserData.password = encryptedPassword;
    const updatedUserData = await UserData.save();
    
    res.json({message: "Password Updated"});
  } catch (error) {
    console.log(error);
    res.json({message: "Not verified"});
  }

})





router.delete('/:id', async (req, res) => {
  const userId = req.params.id;
  const { password } = req.body;

  try {
    const user = await User.findByPk(userId, {
      where: {
        password: password
      },
    });

    if (!user) {
      console.log(user);
      return res.json({ message: "User not found", error: true });
    }

    if (password === '') {
      return res.json({ message: "Cannot submit an empty field", error: true });
    }

    const match = await bcrypt.compare(password, user.dataValues.password);

    if (!match) {
      return res.json({ message: "Incorrect Password", error: true });
    }



    // deleting dashboard records
    const studyMaterialCategories = await StudyMaterialsCategories.findAll({
      where: { 
        UserId: userId,
        isShared: false,
        StudyGroupId: !null
      },
    });

    // deleting dashboard records
    const DashForPersonalAndGroupResponse = await DashForPersonalAndGroup.findAll({
      where: { 
        UserId: userId,
        StudyGroupId: null,
      },
    });

    // deleting study materials
    const studyMaterial = await StudyMaterials.findAll({
      where: { 
        UserId: userId,
        materialFor: 'Personal',
        tag: 'Own Record' || 'Bookmarked',
        StudyGroupId: null,
      },
    });
    
    console.log(studyMaterial.length);

    
    // Delete each dashRecord individually
    for (const dashRecord of DashForPersonalAndGroupResponse) {
      await dashRecord.destroy();
    }
    
    // Delete each material individually
    for (const material of studyMaterial) {
      await material.destroy();
    }

    // Delete each material individually
    for (const material of studyMaterialCategories) {
      await material.destroy();
    }








    // Check if the new userImage is different from the existing one
    if (user.dataValues.userImage !== "user.png") {
      // Define the absolute path to the existing image file
      const existingImagePath = path.join(__dirname, '..', 'public/images', user.dataValues.userImage);

      // Delete the existing image file if it exists
      if (fs.existsSync(existingImagePath)) {
        fs.unlinkSync(existingImagePath);
        console.log('Existing image deleted:', existingImagePath);
      }
    } else {
      console.log('User image remains unchanged. Skipping unlinking.');
    }

    // Wait for user deletion to complete before sending the response
    await user.destroy();

    res.json({ message: "Your account has been permanently deleted.", error: false });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.json({ message: "Failed deleting your account.", error: true });
    }
});




router.delete('/delete-token/:id', async (req, res) => {
  const tokenId = req.params.id;
  const token = await Token.findByPk(tokenId);
  await token.destroy();
  res.json(token);
})

module.exports = router;