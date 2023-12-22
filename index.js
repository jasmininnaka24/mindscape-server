const express = require('express');
const app = express();
const db = require('./models');
const cors = require('cors'); 
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const multer = require('multer')
require('dotenv').config();


app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  }
});

app.use(express.static(path.join(__dirname, 'client/build')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  }, 
  filename: (req, file, cb) => {

    cb(null, file.fieldname + "_" + Date.now() + '_' + file.originalname);
  }
});

const upload = multer({
  storage: storage
});

app.post('/upload', upload.single('image'), (req, res) => {
  let data = req.file;
  res.json(data)
  console.log(req.file);
});



let rooms = {};
let userTurnSer = 0;
let selectedChoiceValCurr = {};
let currentFailCountVal = 0;
let reviewShuffledChoices = {}
let reviewUserTurnSer = {}
let reviewSelectedChoiceValCurr = {}
let reviewFailCount = {}
let reviewNextQA = {}
let reviewQuestionIndex = {}
let reviewLostPoints = {}
let reviewGainedPoints = {}
let isRunningListReview = {}
let setSecondsReview = {}
let reviewExtractedQA = {}
let isStartStudyButtonStartedList = {}
let itemsDoneList = {}
let messageListReview = {}



// assessment
let assessmentRoomList = {};
let ioSelectedAssessmentAnswers = {}
let isRunningList = {}
let setSeconds = {}
let isSubmittedButtonClicked = {}
let idOfWhoSubmittedPerson = {}
let usernameOfWhoSubmittedPerson = {}
let assessmentScores = {}
let isSubmittedAssess = {}
let isAssessmentDoneList = {}
let showSubmittedAnswerModalList = {}
let showTextsList = {}
let showAnalysisList = {}
let showAssessmentList = {}
let overAllItemsList = {}
let preAssessmentScoreList = {}
let assessmentScoreLatestList = {}
let assessmentImpList = {}
let assessmentScorePerfList = {}
let completionTimeList = {}
let confidenceLevelList = {}
let overAllPerformanceList = {}
let assessmentCountMoreThanOneList = {}
let generatedAnalysisList = {}
let shuffledChoicesAssessmentData = {}
let extractedQAAssessmentList = {}
let assessmentUsersChoicesList = {}
let messageListData = {}
let isAssessmentButtonStartedList = {}




// Discussion imports
let discussionRoomList = {};
let discussionCreatedRoomsList = {};
let discussionJoinedRoomsList = {};



const handleUserDisconnectReviewer = (room, socketId) => {
  const makePointsZero = () => {
    if (rooms[room].length === 1 && rooms[room][0]) {
      rooms[room][0].points = 0;
      let updateUserList = rooms[room];
      io.to(room).emit('userList', updateUserList);
    }
  }

  const userIndex = rooms[room].findIndex((user) => user.socketId === socketId);

  if (userIndex !== -1) {
    const isUserAtIndexZero = userIndex === 0;

    rooms[room].splice(userIndex, 1);
    io.to(room).emit('userList', rooms[room]);

    if (rooms[room].length === 0) {
      reviewUserTurnSer[room] = 0; // Reset userTurnSer to 0 for the new userTurn
      io.to(room).emit('received_next_user', reviewUserTurnSer[room]);

    } else if (isUserAtIndexZero && reviewUserTurnSer[room] === 0) {
      // If the user at index 0 disconnects and userTurn is 0, keep userTurn as 0
      reviewUserTurnSer[room] = 0;
    } else if (isUserAtIndexZero || userIndex < reviewUserTurnSer[room]) {
      // Set userTurnSer to the previous user if the user at index 0 disconnects or before the current turn user
      reviewUserTurnSer[room] = (reviewUserTurnSer[room] - 1 + rooms[room].length) % rooms[room].length;
    }

    // Check if the user being disconnected is the current turn user
    if (userIndex === reviewUserTurnSer[room]) {
      if (rooms[room].length <= 1) {
        selectedChoiceValCurr[room] = "";
        makePointsZero();
      } else {
        reviewUserTurnSer[room] = reviewUserTurnSer[room] % rooms[room].length;
      }
    } else {
      if (isUserAtIndexZero || userIndex < reviewUserTurnSer[room]) {
        // Do nothing, no need to subtract if the user at index 0 disconnects or before the current turn user
      } else {
        if (rooms[room].length <= 1) {
          selectedChoiceValCurr[room] = "";
          makePointsZero();
        }
      }
    }


    if (rooms[room].length === 1) {
      isStartStudyButtonStartedList[room] = false
      io.to(room).emit('study_session_started', isStartStudyButtonStartedList[room]);
    }

    io.to(room).emit('received_next_user', reviewUserTurnSer[room]);
    io.to(room).emit('userList', rooms[room]);



    // Remove the room if there are no users in it
    if (rooms[room].length === 0) {
      delete rooms[room];
      selectedChoiceValCurr[room] = ""
      reviewUserTurnSer[room] = 0
      currentFailCountVal[room] = 0
      reviewShuffledChoices[room] = []
      reviewUserTurnSer[room] = 0
      reviewSelectedChoiceValCurr[room] = ""
      reviewFailCount[room] = 2
      reviewNextQA[room] = 0
      reviewQuestionIndex[room] = 0
      reviewLostPoints[room] = false
      reviewGainedPoints[room] = false
      isRunningListReview[room] = false;
      setSecondsReview[room] = 0;
      reviewExtractedQA[room] = [];
      isStartStudyButtonStartedList[room] = false;
      itemsDoneList[room] = 0;
      messageListReview[room] = []
    }
  }
}


const handleUserDisconnectAssessment = (assessmentRoom, socketId) => {
  const userIndex = assessmentRoomList[assessmentRoom].findIndex(user => user.socketId === socketId);
  if (userIndex !== -1) {
    assessmentRoomList[assessmentRoom].splice(userIndex, 1);

    if (assessmentRoomList[assessmentRoom].length === 1) {
      isAssessmentButtonStartedList[assessmentRoom] = false
      io.to(assessmentRoom).emit('assessment_started', isAssessmentButtonStartedList[assessmentRoom]);


      isAssessmentButtonStartedList[assessmentRoom] = false
      isRunningList[assessmentRoom] = false;
      ioSelectedAssessmentAnswers[assessmentRoom] = []
      idOfWhoSubmittedPerson[assessmentRoom] = ''
      usernameOfWhoSubmittedPerson[assessmentRoom] = ''
      assessmentScores[assessmentRoom] = 0
      isAssessmentDoneList[assessmentRoom] = false
      showSubmittedAnswerModalList[assessmentRoom] = false
      showTextsList[assessmentRoom] = false
      showAnalysisList[assessmentRoom] = false
      showAssessmentList[assessmentRoom] = true
      overAllItemsList[assessmentRoom] = 0
      preAssessmentScoreList[assessmentRoom] = 0
      assessmentScoreLatestList[assessmentRoom] = 0
      assessmentImpList[assessmentRoom] = 0
      assessmentScorePerfList[assessmentRoom] = 0
      completionTimeList[assessmentRoom] = 0
      confidenceLevelList[assessmentRoom] = 0
      overAllPerformanceList[assessmentRoom] = 0
      assessmentCountMoreThanOneList[assessmentRoom] = false
      generatedAnalysisList[assessmentRoom] = ''
      messageListData[assessmentRoom] = []
      isAssessmentButtonStartedList[assessmentRoom] = false;
      
      io.to(assessmentRoom).emit('assessment_started', isAssessmentButtonStartedList[assessmentRoom]);
      io.to(assessmentRoom).emit('is_running', isRunningList[assessmentRoom]);
      io.to(assessmentRoom).emit('selected_assessment_answers', ioSelectedAssessmentAnswers[assessmentRoom]);
      io.to(assessmentRoom).emit('id_of_who_submitted', idOfWhoSubmittedPerson[assessmentRoom]);
      io.to(assessmentRoom).emit('username_of_who_submitted', usernameOfWhoSubmittedPerson[assessmentRoom]);
      io.to(assessmentRoom).emit('assessment_score', assessmentScores[assessmentRoom]);
      io.to(assessmentRoom).emit('isSubmitted_assess', isSubmittedAssess[assessmentRoom]);
      io.to(assessmentRoom).emit('isAssessment_done', isAssessmentDoneList[assessmentRoom]);

      io.to(assessmentRoom).emit('show_submitted_answer_modal', showSubmittedAnswerModalList[assessmentRoom]);
      io.to(assessmentRoom).emit('show_texts', showTextsList[assessmentRoom]);
      io.to(assessmentRoom).emit('show_analysis', showAnalysisList[assessmentRoom]);
      io.to(assessmentRoom).emit('show_assessment', showAssessmentList[assessmentRoom]);
  
      io.to(assessmentRoom).emit('over_all_items', overAllItemsList[assessmentRoom]);
      io.to(assessmentRoom).emit('pre_assessment_score', preAssessmentScoreList[assessmentRoom]);
      io.to(assessmentRoom).emit('assessment_score_latest', assessmentScoreLatestList[assessmentRoom]);
      io.to(assessmentRoom).emit('assessment_imp', assessmentImpList[assessmentRoom]);
      io.to(assessmentRoom).emit('assessment_score_perf', assessmentScorePerfList[assessmentRoom]);
      io.to(assessmentRoom).emit('completion_time', completionTimeList[assessmentRoom]);
      io.to(assessmentRoom).emit('confidence_level', confidenceLevelList[assessmentRoom]);
      io.to(assessmentRoom).emit('over_all_performance', overAllPerformanceList[assessmentRoom]);
      io.to(assessmentRoom).emit('assessment_count_more_than_one', assessmentCountMoreThanOneList[assessmentRoom]);
      io.to(assessmentRoom).emit('generated_analysis', generatedAnalysisList[assessmentRoom]);
      io.to(assessmentRoom).emit('assessment_started', isAssessmentButtonStartedList[assessmentRoom]);
      
    }


    // Remove the assessmentRoom if there are no users in it
    if (assessmentRoomList[assessmentRoom].length === 0) {
      delete assessmentRoomList[assessmentRoom];
      ioSelectedAssessmentAnswers[assessmentRoom] = [];
      isRunningList[assessmentRoom] = false;
      setSeconds[assessmentRoom] = 0;
      isSubmittedButtonClicked[assessmentRoom] = false;
      idOfWhoSubmittedPerson[assessmentRoom] = ''
      usernameOfWhoSubmittedPerson[assessmentRoom] = ''
      assessmentScores[assessmentRoom] = 0
      isSubmittedAssess[assessmentRoom] = false
      isAssessmentDoneList[assessmentRoom] = false
      showSubmittedAnswerModalList[assessmentRoom] = false
      showTextsList[assessmentRoom] = false
      showAnalysisList[assessmentRoom] = false
      showAssessmentList[assessmentRoom] = true
      overAllItemsList[assessmentRoom] = 0
      preAssessmentScoreList[assessmentRoom] = 0
      assessmentScoreLatestList[assessmentRoom] = 0
      assessmentImpList[assessmentRoom] = 0
      assessmentScorePerfList[assessmentRoom] = 0
      completionTimeList[assessmentRoom] = 0
      confidenceLevelList[assessmentRoom] = 0
      overAllPerformanceList[assessmentRoom] = 0
      assessmentCountMoreThanOneList[assessmentRoom] = false
      generatedAnalysisList[assessmentRoom] = ''
      shuffledChoicesAssessmentData[assessmentRoom] = []
      extractedQAAssessmentList[assessmentRoom] = []
      assessmentUsersChoicesList[assessmentRoom] = []
      messageListData[assessmentRoom] = []
      isAssessmentButtonStartedList[assessmentRoom] = false;

    }
    io.to(assessmentRoom).emit('assessment_user_list', assessmentRoomList[assessmentRoom]);

  }
}






io.on('connection', (socket) => {


  socket.on('leave-reviewer-page-room', ({ room, socketId }) => {
    // Find the index of the user in the room
    handleUserDisconnectReviewer(room, socketId)
  });
  



  socket.on('join_room', (data) => {
    const { room, username, userId, points, questionIndex, shuffledChoices, userList, failCount, lostPoints, gainedPoints, isRunningReview, timeDurationValReview, extractedQA, isStudyStarted, itemsDone } = data;
    socket.join(room);
  
    // Initialize arrays for the room if they don't exist
    if (!rooms[room]) {
      rooms[room] = [];
    }
    if (!reviewShuffledChoices[room]) {
      reviewShuffledChoices[room] = [];
    }
    if (!reviewUserTurnSer[room]) {
      reviewUserTurnSer[room] = 0;
    }
    if (!reviewSelectedChoiceValCurr[room]) {
      reviewSelectedChoiceValCurr[room] = "";
    }
    if (!reviewFailCount[room]) {
      reviewFailCount[room] = 2;
    }
    if (!reviewNextQA[room]) {
      reviewNextQA[room] = 0;
    }
    if (!reviewQuestionIndex[room]) {
      reviewQuestionIndex[room] = 0;
    }
    if (!reviewLostPoints[room]) {
      reviewLostPoints[room] = false;
    }
    if (!reviewGainedPoints[room]) {
      reviewGainedPoints[room] = false;
    }

    if (!isRunningListReview[room]) {
      isRunningListReview[room] = false;
    }

    if (!setSecondsReview[room]) {
      setSecondsReview[room] = 0;
    }

    if (!reviewExtractedQA[room]) {
      reviewExtractedQA[room] = [];
    }

    if (!isStartStudyButtonStartedList[room]) {
      isStartStudyButtonStartedList[room] = false;
    }


    if (!itemsDoneList[room]) {
      itemsDoneList[room] = 0;
    }

    if (!messageListReview[room]) {
      messageListReview[room] = [];
    }

    
    // Check if the user with the same userId already exists in the room
    const userExists = rooms[room].some(user => user.userId === userId);

    if (userExists) {
      // Kick out the existing user with the same userId
      const duplicateUserIndex = rooms[room].findIndex(user => user.userId === userId);
      if (duplicateUserIndex !== -1) {
        const duplicateSocketId = rooms[room][duplicateUserIndex].socketId;

        // Remove the duplicate user from the room's user list
        rooms[room].splice(duplicateUserIndex, 1);

        // Notify the removed user about being kicked
        io.to(duplicateSocketId).emit('duplicate_user_kicked');
      }
    }
  
    // Add user to the room's user list
    rooms[room].push({ socketId: socket.id, username, userId, points });

    // Only push new user's data if arrays are empty
    if (reviewShuffledChoices[room].length === 0) {
      reviewShuffledChoices[room] = shuffledChoices;
    }

    if (reviewUserTurnSer[room] === 0) {
      reviewUserTurnSer[room] = reviewUserTurnSer[room];
    }
    if (reviewSelectedChoiceValCurr[room] === "") {
      reviewSelectedChoiceValCurr[room] = reviewSelectedChoiceValCurr[room];
    }
    if (reviewFailCount[room] === 2) {
      reviewFailCount[room] = failCount;
    }
    if (reviewNextQA[room] === 0) {
      reviewNextQA[room] = reviewNextQA[room];
    }
    if (reviewQuestionIndex[room] === 0) {
      reviewQuestionIndex[room] = questionIndex;
    }
    if (reviewLostPoints[room] === false) {
      reviewLostPoints[room] = lostPoints;
    }
    if (reviewGainedPoints[room] === false) {
      reviewGainedPoints[room] = gainedPoints;
    }
    if (reviewExtractedQA[room].length === 0) {
      reviewExtractedQA[room] = extractedQA;
    }
    if (isStartStudyButtonStartedList[room] === false) {
      isStartStudyButtonStartedList[room] = isStudyStarted;
    }
    if (itemsDoneList[room] === 0) {
      itemsDoneList[room] = itemsDone;
    }

    if (messageListReview[room].length === 0) {
      messageListReview[room] = [];
    }


    if (isRunningListReview[room] === false) {
      if (itemsDoneList[room] !== 0) {
        isRunningListReview[room] = false;
        setSecondsReview[room] = timeDurationValReview;
        
        io.to(room).emit('updated_time_review', setSecondsReview[room]);
        io.to(room).emit('is_running_review', isRunningListReview[room]);

      } else {

        isRunningListReview[room] = isRunningReview;
        setSecondsReview[room] = timeDurationValReview;
        
        io.to(room).emit('updated_time_review', setSecondsReview[room]);
        io.to(room).emit('is_running_review', isRunningListReview[room]);

      }
    } else {
      io.to(room).emit('updated_time_review', setSecondsReview[room]);
      io.to(room).emit('is_running_review', isRunningListReview[room]);
    }
    
    
    // Emit the updated user list and current turn to all clients in the room
    io.to(room).emit('userList', rooms[room]);
    io.to(room).emit('received_next_user_join', reviewUserTurnSer[room]);
    io.to(room).emit('received_selected_choice_join', reviewSelectedChoiceValCurr[room]);
    io.to(room).emit('received_current_fail_val', reviewFailCount[room]);
    io.to(room).emit('next_qa_join', reviewNextQA[room]);
    io.to(room).emit('received_question_index', reviewQuestionIndex[room]);
    io.to(room).emit('shuffled_join', reviewShuffledChoices[room]);
    io.to(room).emit('is_lost_points', reviewLostPoints[room]);
    io.to(room).emit('is_gained_points', reviewGainedPoints[room]);
    io.to(room).emit('extracted_qa_data', reviewExtractedQA[room]);
    io.to(room).emit('study_session_started', isStartStudyButtonStartedList[room]);
    io.to(room).emit('items_done', itemsDoneList[room]);

    if (messageListReview.length !== 0) {
      io.to(room).emit('message_list_review', messageListReview[room]);
    } else {
      io.to(room).emit('message_list_review', []);
    }

  
  });

  socket.on("sent_messages_review", (data) => {
    const { room } = data;
  
    // Ensure messageListData[assessementRoom] is initialized as an array
    if (!messageListReview[room]) {
      messageListReview[room] = [];
    }
  
    // Push the new data to the array
    messageListReview[room].push(data);
  
    // Emit the updated message list to clients in the room
    io.to(room).emit('message_list_review', messageListReview[room]);
  
    // Log the updated message list
    console.log(messageListReview[room]);
  });



  socket.on('updated_items_done', ({ itemsDone, room }) => {
    itemsDoneList[room] = itemsDone;
    io.to(room).emit('items_done', itemsDoneList[room]);
  });


  socket.on('updated_study_session_started', ({ isStarted, room }) => {
    isStartStudyButtonStartedList[room] = isStarted;
    io.to(room).emit('study_session_started', isStartStudyButtonStartedList[room]);
  });


  socket.on('updated_question_index', ({ questionIndex, room }) => {
    reviewQuestionIndex[room] = questionIndex;
    io.to(room).emit('received_question_index', reviewQuestionIndex[room]);
  });


  socket.on("update_is_running_review", (data) => {
    const {room, isRunningReview } = data
    isRunningListReview[room] = isRunningReview;
    io.to(room).emit("is_running_review", isRunningListReview[room])
  })

  socket.on("update_time_review", (data) => {
    const {room, timeDurationValReview } = data
    setSecondsReview[room] = timeDurationValReview;
    io.to(room).emit("updated_time_review", setSecondsReview[room])
  })



  socket.on('updated_gained_points', (data) => {

    const {room, gainedPoints} = data;

    reviewGainedPoints[room] = gainedPoints;
    io.to(room).emit('is_gained_points', reviewGainedPoints[room]);
  });

  socket.on('updated_lost_points', (data) => {

    const {room, lostPoints} = data;

    reviewLostPoints[room] = lostPoints;
    io.to(room).emit('is_lost_points', reviewLostPoints[room]);
  });


  socket.on('next_turn', ({ nextUser, room }) => {
    // Determine the next turn and emit it to all clients in the room
    // const usersInRoom = rooms[room];
    // const currentTurn = usersInRoom.findIndex(user => user.socketId === socket.id);
    const nextTurn = nextUser;

    io.to(room).emit('received_next_user', nextTurn);
    reviewUserTurnSer[room] = nextTurn;
  });
  
 
  socket.on('shuffled_choices', ({ room, shuffledArray }) => {
    io.to(room).emit('received_shuffled_choices', shuffledArray);
    reviewShuffledChoices[room] = shuffledArray;
  });
  


  socket.on("user_zero", ({userTurn, questionIndex, room}) => {
    io.to(room).emit('received_next_user_zero', {userTurnSer, questionIndex})
    reviewUserTurnSer[room] = userTurn;
    reviewQuestionIndex[room] = questionIndex;
  })


  socket.on("user_list", ({userListCount, room}) => {
    if(userListCount === 1){
      let userTurnCurr = 0
      io.to(room).emit("user_turn_disc", userTurnCurr)
      reviewUserTurnSer[room] = userTurnCurr
    }
  })

  socket.on("selected_choice", ({room, selectedChoiceVal}) => {
    io.to(room).emit("received_selected_choice", selectedChoiceVal)
    reviewSelectedChoiceValCurr[room] = selectedChoiceVal
  })

  socket.on('updated_QA_data', ({room, extractedQA}) => {
    reviewExtractedQA[room] = extractedQA;
    io.emit('extracted_qa_data', reviewExtractedQA[room]);
  });

  socket.on("updated_userlist", ({room, userList}) => {
    rooms[room] = userList
    io.to(room).emit("userList", rooms[room])
  })




  socket.on("submitted_answer", ({room, currentFailCount, submittedAnswerVal}) => {
    reviewFailCount[room] = currentFailCount;
    selectedChoiceValCurr[room] = submittedAnswerVal;
    io.to(room).emit("received_submitted_answer", reviewFailCount[room])
  })














  // assessment sockets

  socket.on('leave-assessment-page-room', ({ assessementRoom, socketId }) => {
    // Find the index of the user in the room
    handleUserDisconnectAssessment(assessementRoom, socketId)
  });


  socket.on('join_assessment_room', (data) => {
    const {
      room,
      username,
      userId,
      selectedAssessmentAnswers,
      timeDurationVal,
      isAnswersSubmitted,
      idOfWhoSubmitted,
      assessmentScore,
      isSubmittedChar,
      isAssessmentDone,
      isRunning,
      showSubmittedAnswerModal,
      showTexts,
      showAnalysis,
      showAssessment,
      overAllItems,
      preAssessmentScore,
      assessmentScoreLatest,
      assessmentImp,
      assessmentScorePerf,
      completionTime,
      confidenceLevel,
      overAllPerformance,
      assessmentCountMoreThanOne,
      generatedAnalysis,
      shuffledChoicesAssess,
      extractedQAAssessment,
      assessmentUsersChoices,
      messageList,
      isStudyStarted
    } = data;
    socket.join(room);


    if (!assessmentRoomList[room]) {
      assessmentRoomList[room] = [];
    }

    if (!ioSelectedAssessmentAnswers[room]) {
      ioSelectedAssessmentAnswers[room] = [];
    }

    if (!isRunningList[room]) {
      isRunningList[room] = false;
    }

    if (!setSeconds[room]) {
      setSeconds[room] = 0;
    }

    if (!isSubmittedButtonClicked[room]) {
      isSubmittedButtonClicked[room] = false;
    }

    if (!idOfWhoSubmittedPerson[room]) {
      idOfWhoSubmittedPerson[room] = '';
    }

    if (!usernameOfWhoSubmittedPerson[room]) {
      usernameOfWhoSubmittedPerson[room] = '';
    }

    if (!assessmentScores[room]) {
      assessmentScores[room] = 0;
    }

    if (!isSubmittedAssess[room]) {
      isSubmittedAssess[room] = false;
    }

    if (!isAssessmentDoneList[room]) {
      isAssessmentDoneList[room] = false;
    }

    if (!showSubmittedAnswerModalList[room]) {
      showSubmittedAnswerModalList[room] = false;
    }

    if (!showTextsList[room]) {
      showTextsList[room] = true;
    }

    if (!showAnalysisList[room]) {
      showAnalysisList[room] = false;
    }

    if (!showAssessmentList[room]) {
      showAssessmentList[room] = true;
    }

    
    if (!overAllItemsList[room]) {
      overAllItemsList[room] = 0;
    }
    
    
    if (!preAssessmentScoreList[room]) {
      preAssessmentScoreList[room] = 0;
    }
    
    
    if (!assessmentScoreLatestList[room]) {
      assessmentScoreLatestList[room] = 0;
    }
    
    
    if (!assessmentImpList[room]) {
      assessmentImpList[room] = 0;
    }
    
    
    if (!assessmentScorePerfList[room]) {
      assessmentScorePerfList[room] = 0;
    }
    
    
    if (!completionTimeList[room]) {
      completionTimeList[room] = 0;
    }
    
    
    if (!confidenceLevelList[room]) {
      confidenceLevelList[room] = 0;
    }
    

    if (!overAllPerformanceList[room]) {
      overAllPerformanceList[room] = 0;
    }


    if (!assessmentCountMoreThanOneList[room]) {
      assessmentCountMoreThanOneList[room] = false;
    }

    if (!generatedAnalysisList[room]) {
      generatedAnalysisList[room] = '';
    }

    if (!shuffledChoicesAssessmentData[room]) {
      shuffledChoicesAssessmentData[room] = [];
    }

    if (!extractedQAAssessmentList[room]) {
      extractedQAAssessmentList[room] = [];
    }

    if (!assessmentUsersChoicesList[room]) {
      assessmentUsersChoicesList[room] = [];
    }

    if (!messageListData[room]) {
      messageListData[room] = [];
    }

    if (!isAssessmentButtonStartedList[room]) {
      isAssessmentButtonStartedList[room] = false;
    }



    // Add user to the room's user list
    assessmentRoomList[room].push({ socketId: socket.id, username, userId });

    if (ioSelectedAssessmentAnswers[room].length === 0) {
      ioSelectedAssessmentAnswers[room].push(selectedAssessmentAnswers);
    }

    if (isSubmittedAssess[room] === false) {
      isSubmittedAssess[room] = isSubmittedChar;
    }

    if (idOfWhoSubmittedPerson[room] === '') {
      idOfWhoSubmittedPerson[room] = idOfWhoSubmitted;
      idOfWhoSubmittedPerson[room] = idOfWhoSubmitted;
    }

    if (usernameOfWhoSubmittedPerson[room] === '') {
      usernameOfWhoSubmittedPerson[room] = idOfWhoSubmitted;
    }
    
    if (assessmentScores[room] === 0) {
      assessmentScores[room] = assessmentScore;
    }
    
    if (isAssessmentDoneList[room] === false) {
      isAssessmentDoneList[room] = isAssessmentDone;
    }
    
    if (showSubmittedAnswerModalList[room] === false) {
      showSubmittedAnswerModalList[room] = showSubmittedAnswerModal;
    }
    
    if (showTextsList[room] === true) {
      showTextsList[room] = showTexts;
    }
    
    if (showAnalysisList[room] === false) {
      showAnalysisList[room] = showAnalysis;
    }
    
    if (showAssessmentList[room] === true) {
      showAssessmentList[room] = showAssessment;
    }


    
    if (overAllItemsList[room] === 0) {
      overAllItemsList[room] = overAllItems;
    }
    
    if (preAssessmentScoreList[room] === 0) {
      preAssessmentScoreList[room] = preAssessmentScore;
    }
    
    if (assessmentScoreLatestList[room] === 0) {
      assessmentScoreLatestList[room] = assessmentScoreLatest;
    }
    
    if (assessmentImpList[room] === 0) {
      assessmentImpList[room] = assessmentImp;
    }
    
    if (assessmentScorePerfList[room] === 0) {
      assessmentScorePerfList[room] = assessmentScorePerf;
    }
    
    if (completionTimeList[room] === 0) {
      completionTimeList[room] = completionTime;
    }


    if (confidenceLevelList[room] === 0) {
      confidenceLevelList[room] = confidenceLevel;
    }
    
    if (overAllPerformanceList[room] === 0) {
      overAllPerformanceList[room] = overAllPerformance;
    }
    
    if (assessmentCountMoreThanOneList[room] === true) {
      assessmentCountMoreThanOneList[room] = assessmentCountMoreThanOne;
    }
    
    if (generatedAnalysisList[room] === '') {
      generatedAnalysisList[room] = generatedAnalysis;
    }
    
    if (shuffledChoicesAssessmentData[room].length === 0) {
      shuffledChoicesAssessmentData[room] = shuffledChoicesAssess;
    }
    
    if (extractedQAAssessmentList[room].length === 0) {
      extractedQAAssessmentList[room] = extractedQAAssessment;
    }
    
    if (assessmentUsersChoicesList[room].length === 0) {
      assessmentUsersChoicesList[room] = assessmentUsersChoices;
    }

    if (isAssessmentButtonStartedList[room] === false) {
      isAssessmentButtonStartedList[room] = isStudyStarted;
    }
    
    if (messageListData[room].length === 0) {
      messageListData[room] = [];
    }


    if (isRunningList[room] === false) {
      isRunningList[room] = isRunning;
      setSeconds[room] = timeDurationVal;
      io.to(room).emit('updated_time', setSeconds[room]);
      io.to(room).emit('is_running', isRunningList[room]);
    } else {
      io.to(room).emit('updated_time', setSeconds[room]);
      io.to(room).emit('is_running', isRunningList[room]);
    }

    if (isSubmittedButtonClicked[room] === false) {
      isSubmittedButtonClicked[room] = isAnswersSubmitted;
      io.to(room).emit('submitted_button_response', isSubmittedButtonClicked[room]);
    } else {
      io.to(room).emit('submitted_button_response', isSubmittedButtonClicked[room]);
    }

    // Emit the updated user list and current turn to all clients in the room
    io.to(room).emit('assessment_user_list', assessmentRoomList[room]);
    io.to(room).emit('selected_assessment_answers', ioSelectedAssessmentAnswers[room]);
    io.to(room).emit('id_of_who_submitted', idOfWhoSubmittedPerson[room]);
    io.to(room).emit('username_of_who_submitted', usernameOfWhoSubmittedPerson[room]);
    io.to(room).emit('assessment_score', assessmentScores[room]);
    io.to(room).emit('isSubmitted_assess', isSubmittedAssess[room]);
    io.to(room).emit('isAssessment_done', isAssessmentDoneList[room]);
    io.to(room).emit('show_submitted_answer_modal', showSubmittedAnswerModalList[room]);
    io.to(room).emit('show_texts', showTextsList[room]);
    io.to(room).emit('show_analysis', showAnalysisList[room]);
    io.to(room).emit('show_assessment', showAssessmentList[room]);

    io.to(room).emit('over_all_items', overAllItemsList[room]);
    io.to(room).emit('pre_assessment_score', preAssessmentScoreList[room]);
    io.to(room).emit('assessment_score_latest', assessmentScoreLatestList[room]);
    io.to(room).emit('assessment_imp', assessmentImpList[room]);
    io.to(room).emit('assessment_score_perf', assessmentScorePerfList[room]);
    io.to(room).emit('completion_time', completionTimeList[room]);
    io.to(room).emit('confidence_level', confidenceLevelList[room]);
    io.to(room).emit('over_all_performance', overAllPerformanceList[room]);
    io.to(room).emit('assessment_count_more_than_one', assessmentCountMoreThanOneList[room]);
    io.to(room).emit('generated_analysis', generatedAnalysisList[room]);
    io.to(room).emit('shuffled_choices_assessment', shuffledChoicesAssessmentData[room]);
    io.to(room).emit('extracted_QA_assessment', extractedQAAssessmentList[room]);
    io.to(room).emit('assessment_users_choices', assessmentUsersChoicesList[room]);
    io.to(room).emit('assessment_started', isAssessmentButtonStartedList[room]);

    if (messageListData.length !== 0) {
      io.to(room).emit('message_list', messageListData[room]);
    } else {
      io.to(room).emit('message_list', []);
    }

  });



  socket.on('updated_assessment_started', ({ isStarted, assessementRoom }) => {
    isAssessmentButtonStartedList[assessementRoom] = isStarted;
    io.to(assessementRoom).emit('assessment_started', isAssessmentButtonStartedList[assessementRoom]);
  });


  socket.on("sent_messages", (data) => {
    const { assessementRoom } = data;
  
    // Ensure messageListData[assessementRoom] is initialized as an array
    if (!messageListData[assessementRoom]) {
      messageListData[assessementRoom] = [];
    }
  
    // Push the new data to the array
    messageListData[assessementRoom].push(data);
  
    // Emit the updated message list to clients in the room
    io.to(assessementRoom).emit('message_list', messageListData[assessementRoom]);
  
    // Log the updated message list
    console.log(messageListData[assessementRoom]);
  });
  

  socket.on("updated_assessment_users_choices", (data) => {
    const {assessementRoom, assessmentUsersChoices } = data
    assessmentUsersChoicesList[assessementRoom] = assessmentUsersChoices;
    io.to(assessementRoom).emit('assessment_users_choices', assessmentUsersChoicesList[assessementRoom]);
    console.log(assessmentUsersChoicesList[assessementRoom]);
  })

  socket.on("updated_generated_analysis", (data) => {
    const {room, generatedAnalysis } = data
    generatedAnalysisList[room] = generatedAnalysis;
    io.to(room).emit('generated_analysis', generatedAnalysisList[room]);
  })


  socket.on("updated_over_all_items", (data) => {
    const {room, overAllItems } = data
    overAllItemsList[room] = overAllItems;
    io.to(room).emit('over_all_items', overAllItemsList[room])
  })


  socket.on("updated_pre_assessment_score", (data) => {
    const {room, preAssessmentScore } = data
    preAssessmentScoreList[room] = preAssessmentScore;
    io.to(room).emit('pre_assessment_score', preAssessmentScoreList[room])
  })


  socket.on("updated_assessment_score_latest", (data) => {
    const {room, assessmentScoreLatest } = data
    assessmentScoreLatestList[room] = assessmentScoreLatest;
    io.to(room).emit('assessment_score_latest', assessmentScoreLatestList[room])
  })


  socket.on("updated_assessment_imp", (data) => {
    const {room, assessmentImp } = data
    assessmentImpList[room] = assessmentImp;
    io.to(room).emit('assessment_imp', assessmentImpList[room]);
  })


  socket.on("updated_assessment_score_perf", (data) => {
    const {room, assessmentScorePerf } = data
    assessmentScorePerfList[room] = assessmentScorePerf;
    io.to(room).emit('assessment_score_perf', assessmentScorePerfList[room]);
  })


  socket.on("updated_completion_time", (data) => {
    const {room, completionTime } = data
    completionTimeList[room] = completionTime;
    io.to(room).emit('completion_time', completionTimeList[room]);
  })


  socket.on("updated_confidence_level", (data) => {
    const {room, confidenceLevel } = data
    confidenceLevelList[room] = confidenceLevel;
    io.to(room).emit('confidence_level', confidenceLevelList[room]);
  })


  socket.on("updated_over_all_performance", (data) => {
    const {room, overAllPerformance } = data
    overAllPerformanceList[room] = overAllPerformance;
    io.to(room).emit('over_all_performance', overAllPerformanceList[room]);
  })


  socket.on("updated_assessment_count_more_than_one", (data) => {
    const {room, assessmentCountMoreThanOne } = data
    assessmentCountMoreThanOneList[room] = assessmentCountMoreThanOne;
    io.to(room).emit('assessment_count_more_than_one', assessmentCountMoreThanOneList[room]);
  })


  socket.on("updated_show_analysis", (data) => {
    const {room, showAnalysis } = data
    showAnalysisList[room] = showAnalysis;
    io.to(room).emit("show_analysis", showAnalysisList[room])
  })




  socket.on("updated_show_assessment", (data) => {
    const {room, showAssessment } = data
    showAssessmentList[room] = showAssessment;
    io.to(room).emit("show_assessment", showAssessmentList[room])
  })


  socket.on("updated_show_texts", (data) => {
    const {room, showTexts } = data
    showTextsList[room] = showTexts;
    io.to(room).emit("show_texts", showTextsList[room])
  })

  socket.on("updated_show_submitted_answer_modal", (data) => {
    const {room, showSubmittedAnswerModal } = data
    showSubmittedAnswerModalList[room] = showSubmittedAnswerModal;
    io.to(room).emit("show_submitted_answer_modal", showSubmittedAnswerModalList[room])
  })
  

  socket.on("updated_isAssessment_done", (data) => {
    const {room, isAssessmentDone } = data
    isAssessmentDoneList[room] = isAssessmentDone;
    io.to(room).emit("isAssessment_done", isAssessmentDoneList[room])
  })
  
  socket.on("updated_running", (data) => {
    const {room, isRunning } = data
    isRunningList[room] = isRunning;
    io.to(room).emit("is_running", isRunningList[room])
  })
  
  
  socket.on("updated_isSubmitted_assess", (data) => {
    const {room, isSubmittedChar } = data
    isSubmittedAssess[room] = isSubmittedChar;
    io.to(room).emit("isSubmitted_assess", isSubmittedAssess[room])
  })

  socket.on('updated_id_of_who_submitted', (data) => {
    const { room, idOfWhoSubmitted } = data;

    idOfWhoSubmittedPerson[room] = idOfWhoSubmitted;
    io.to(room).emit('id_of_who_submitted', idOfWhoSubmittedPerson[room]);

  });

  socket.on('updated_username_of_who_submitted', (data) => {
    const { room, usernameOfWhoSubmitted } = data;

    usernameOfWhoSubmittedPerson[room] = usernameOfWhoSubmitted;
    io.to(room).emit('username_of_who_submitted', usernameOfWhoSubmittedPerson[room]);

  });



  
  socket.on("updated_score", (data) => {
    const {room, assessmentScore } = data
    assessmentScores[room] = assessmentScore;
    io.to(room).emit("assessment_score", assessmentScores[room])
  })
  
  socket.on("update_time", (data) => {
    const {room, timeDurationVal } = data
    setSeconds[room] = timeDurationVal;
    io.to(room).emit("updated_time", setSeconds[room])
  })
  


  socket.on("updated_answers", (data) => {
    const {assessementRoom, selectedAssessmentAnswers } = data

    ioSelectedAssessmentAnswers[assessementRoom] = selectedAssessmentAnswers;
    io.to(assessementRoom).emit("selected_assessment_answers", ioSelectedAssessmentAnswers[assessementRoom])
  })


  socket.on('submitted_button_clicked', (data) => {
    const { room, isAnswersSubmitted } = data;

    isSubmittedButtonClicked[room] = isAnswersSubmitted;
    io.to(room).emit('submitted_button_response', isSubmittedButtonClicked[room]);

  });





  socket.on('join_discussion_room', (data) => {
    const {
      room,
      username,
      userId,
    } = data;
  
    socket.join(room);
  
    if (!discussionRoomList[room]) {
      discussionRoomList[room] = [];
    }

    if (!discussionCreatedRoomsList[room]) {
      discussionCreatedRoomsList[room] = [];
    } else {
      io.to(room).emit('discussion_rooms_list', discussionCreatedRoomsList[room]);
    }

  
    // Check if the user is already in the room
    const existingUser = discussionRoomList[room].find(user => user.socketId === socket.id);
    
    if (!existingUser) {
      // Add user to the room's user list
      discussionRoomList[room].push({ socketId: socket.id, username, userId });
  
      // Emit the updated user list and current turn to all clients in the room
      io.to(room).emit('discussion_room_list', discussionRoomList[room]);
      
    }
  }); 

  
  
  
  socket.on('created_discussion_forum', (data) => {
    const {
      room,
      roomName,
      username,
      userId,
      roomCategory,
      roomDescription,
      discussionForumRoom
    } = data;
    
    socket.join(room);
    
    if (!discussionCreatedRoomsList[discussionForumRoom]) {
      discussionCreatedRoomsList[discussionForumRoom] = [];
    }

    if (!discussionCreatedRoomsList[discussionForumRoom][room]) {
      discussionCreatedRoomsList[discussionForumRoom][room] = [];
    }
    
    
    
    
    discussionCreatedRoomsList[discussionForumRoom].push({ socketId: socket.id, room, roomName, roomCategory, roomDescription, users: [{ socketId: socket.id, userId, username}], messages: [] });
    
    
    // Emit the updated user list and current turn to all clients in the room
    io.to(discussionForumRoom).emit('discussion_rooms_list', discussionCreatedRoomsList[discussionForumRoom]);
    // io.to(room).emit('discussion_user_list', discussionCreatedRoomsList[room]);

    
  }); 
  
  
  socket.on('join_created_room', (data) => {
    const {
      room,
      username,
      userId,
      discussionForumRoom,
      users,
      index
    } = data;
    
    socket.join(room);
    
    
    // Update the users array
    discussionCreatedRoomsList[discussionForumRoom][index].users.push({ socketId: socket.id, userId, username });
    
    // Emit the updated user list and current turn to all clients in the room
    io.to(discussionForumRoom).emit('discussion_rooms_list', discussionCreatedRoomsList[discussionForumRoom]);
    // io.to(room).emit('discussion_user_list', discussionCreatedRoomsList[room]);
    
  });
  
  
  socket.on('message_joined_created_room', (data) => {
    const {
      room,
      username,
      userId,
      discussionForumRoom,
      message,
      time,
      index
    } = data;
    
    socket.join(room);
    
    // Ensure the room and messages array are initialized
    if (!discussionCreatedRoomsList[discussionForumRoom][index].messages) {
      discussionCreatedRoomsList[discussionForumRoom][index].messages = [];
    }
    
    // Update the users array
    discussionCreatedRoomsList[discussionForumRoom][index].messages.push({
      socketId: socket.id,
      userId,
      username,
      message,
      time
    });
  
    // Emit the updated user list and current turn to all clients in the room
    io.to(discussionForumRoom).emit('discussion_rooms_list', discussionCreatedRoomsList[discussionForumRoom]);
    
  });
  
  
  
  
  socket.on('leave-discussion-forum-room', ({ room, roomList }) => {
    if (discussionCreatedRoomsList[room]) {
      // Update the created room list
      discussionCreatedRoomsList[room] = roomList;
      
      // Emit the updated list to all clients in the room
      io.to(room).emit('discussion_rooms_list', discussionCreatedRoomsList[room]);
      console.log(discussionCreatedRoomsList[room]);
    } else {
      console.log(`Room ${room} not found in discussionCreatedRoomsList.`);
    }
  });
  
  
  
  

  socket.on('disconnect', () => {
    // Find the user index in the room
    Object.keys(rooms).forEach((room) => {
      handleUserDisconnectReviewer(room, socket.id)
    });
  
  
    // Find and remove the user from all assessment rooms
    Object.keys(assessmentRoomList).forEach((assessmentRoom) => {
      handleUserDisconnectAssessment(assessmentRoom, socket.id)
    });

      
    // Find and remove the user from all assessment rooms
    Object.keys(discussionRoomList).forEach((discussionRoom) => {
      // Check if the discussion room exists and is an array
      if (Array.isArray(discussionRoomList[discussionRoom])) {
        const userIndex = discussionRoomList[discussionRoom].findIndex(user => user.socketId === socket.id);

        console.log(userIndex);
        
        if (userIndex !== -1) {
          discussionRoomList[discussionRoom].splice(userIndex, 1);
          
          // Remove the discussion room if there are no users in it
          if (discussionRoomList[discussionRoom].length === 0) {
            delete discussionRoomList[discussionRoom];
            discussionCreatedRoomsList[discussionRoom] = []
          }
          
          io.to(discussionRoom).emit('discussion_room_list', discussionRoomList[discussionRoom]);
        }
      }
    });


    // Find and remove the user from all assessment rooms
    Object.keys(discussionCreatedRoomsList).forEach((disRoom) => {
      if (Array.isArray(discussionCreatedRoomsList[disRoom])) {
        // Assuming roomName is the key for individual rooms
        Object.keys(discussionCreatedRoomsList[disRoom]).forEach((roomName) => {
          // Check if the room has a 'users' array
          if (discussionCreatedRoomsList[disRoom][roomName].users) {
            const userIndex = discussionCreatedRoomsList[disRoom][roomName].users.findIndex(user => user.socketId === socket.id);
    
            if (userIndex !== -1) {
              discussionCreatedRoomsList[disRoom][roomName].users.splice(userIndex, 1);
    
              if (discussionCreatedRoomsList[disRoom][roomName].users.length === 0) {
                // Remove the room if there are no users in it
                delete discussionCreatedRoomsList[disRoom][roomName];
    
                  // Filter out rooms with no users dynamically
                  const roomsWithUsers = Object.keys(discussionCreatedRoomsList[disRoom])
                  .filter(roomName => discussionCreatedRoomsList[disRoom][roomName]?.users && discussionCreatedRoomsList[disRoom][roomName]?.users.length > 0);
          
                // Update the room list
                io.to(disRoom).emit('discussion_rooms_list', roomsWithUsers);
    
              } else {
    
                // Emit the updated room list
                io.to(disRoom).emit('discussion_rooms_list', discussionCreatedRoomsList[disRoom]);
              }
    
            }
    
          }
        });
    
      }
    });

    

  });
  
  
  



  
  
});





// Routers
const tasksRouter = require('./routes/Tasks');
const userRouter = require('./routes/User');
const quesAnsRouter = require('./routes/QuesAns');
const quesRevRouter = require('./routes/QuesRev');
const quesAnsChoicesRouter = require('./routes/QuesAnsChoices');
const studyMaterialRouter = require('./routes/StudyMaterials');
const studyMaterialCategoryRouter = require('./routes/StudyMaterialsCategory');
const studyGroupRouter = require('./routes/StudyGroup');
const studyGroupMembersRouter = require('./routes/StudyGroupMembers');
const DashForPersonalAndGroup = require('./routes/DashForPersonalAndGroup');
const { fail } = require('assert');

app.use('/tasks', tasksRouter);
app.use('/users', userRouter);
app.use('/quesAns', quesAnsRouter);
app.use('/quesRev', quesRevRouter);
app.use('/studyMaterial', studyMaterialRouter);
app.use('/quesAnsChoices', quesAnsChoicesRouter);
app.use('/studyMaterialCategory', studyMaterialCategoryRouter);
app.use('/studyGroup', studyGroupRouter);
app.use('/studyGroupMembers', studyGroupMembersRouter);
app.use('/DashForPersonalAndGroup', DashForPersonalAndGroup);

// Serve the React app for all routes except the API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Sync the Sequelize models with the database and start the server
db.sequelize.sync().then(() => {
  server.listen(3001, () => {
    console.log('Server is running on port 3001');
  });
});
