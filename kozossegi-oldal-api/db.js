const models = require('./models');
const { User, Note, Notification, Comment, Survey, SurvQuestion, PosSurvAnswer, UsrSurvAnswer, Quiz, QuizQuestion, QuizScore, Chat, ChatMessage } = models;
const bcrypt = require("bcryptjs");

(async () => {
    await models.sequelize.sync({ force: true });

    let admin = await User.create({
        firstName: 'Admin',
        lastName: 'Teszt',
        email: 'admin@teszt.hu',
        password: bcrypt.hashSync('admin', 8),
        school: 'ELTE',
        birth_date: new Date('1997/09/26'),
        role: 'admin',
        status: 'active',
        gender: 'female',
        avatar: '/avatars/1/admin.jpg'
    });

    let user1 = await User.create({
        firstName: 'User1',
        lastName: 'Teszt',
        email: 'user1@teszt.hu',
        password: bcrypt.hashSync('user', 8),
        school: 'BGE',
        birth_date: new Date('2001/04/11'),
        avatar: '/avatars/2/3840x2160-2616061-kylo-ren-hd-wallpaper-desktop.jpg',
        role: 'user',
        status: 'active',
        gender: 'male'
    });

    let user2 = await User.create({
        firstName: 'User2',
        lastName: 'Teszt',
        email: 'user2@teszt.hu',
        password: bcrypt.hashSync('user', 8),
        school: 'ELTE',
        birth_date: new Date('1996/12/24'),
        role: 'user',
        status: 'active',
        gender: 'female'
    });

    let user3 = await User.create({
        firstName: 'User3',
        lastName: 'Teszt',
        email: 'user3@teszt.hu',
        password: bcrypt.hashSync('user', 8),
        school: 'CEU',
        birth_date: new Date('2000/02/14'),
        role: 'user',
        status: 'active',
        gender: 'other'
    });

    let user4 = await User.create({
        firstName: 'User4',
        lastName: 'Teszt',
        email: 'user4@teszt.hu',
        password: bcrypt.hashSync('user', 8),
        school: 'BME',
        birth_date: new Date('1998/11/03'),
        role: 'user',
        status: 'active',
        gender: 'male'
    });

    let user5 = await User.create({
        firstName: 'User5',
        lastName: 'Teszt',
        email: 'user5@teszt.hu',
        password: bcrypt.hashSync('user', 8),
        school: 'BGE',
        birth_date: new Date('1999/06/29'),
        role: 'user',
        status: 'active',
        gender: 'female'
    });

    let pendingUser = await User.create({
        firstName: 'Pending',
        lastName: 'Teszt',
        email: 'pending.user@teszt.hu',
        password: bcrypt.hashSync('pending', 8),
        school: 'ELTE',
        birth_date: new Date('1997/01/22'),
        role: 'user',
        status: 'pending',
        gender: 'female'
    })

    let note = await Note.create({
        name: 'Teszt Jegyzet',
        category: 'Informatika',
        path: '/notes/1/jegyzet.pdf',
        visibility: 'public'
    })

    let note2 = await Note.create({
        name: 'Teszt-kép jegyzet',
        category: 'Analízis',
        path: '/notes/2/teszt.jpg',
        visibility: 'public'
    })

    let note3 = await Note.create({
        name: 'Még több teszt jegyzet',
        category: 'Informatika',
        path: '/notes/3/teszt.pdf',
        visibility: 'friends'
    })
    let note4 = await Note.create({
        name: 'Teszt Note',
        category: 'Matematika',
        path: '/notes/4/jegyzet-teszt.pdf',
        visibility: 'friends'
    })

    let notification = await Notification.create({
        senderId: 3,
        receiverId: 1,
        type: "friendRequest"
    });

    let notification2 = await Notification.create({
        senderId: 2,
        receiverId: 1,
        type: "requestAccept"
    })

    let comment1 = await Comment.create({
        text: 'Ez egy komment'
    })

    let comment2 = await Comment.create({
        text: 'Ez egy másik komment'
    })

    let comment3 = await Comment.create({
        text: 'Ez egy harmadik komment'
    })

    let comment4 = await Comment.create({
        text: 'Ez egy negyedik komment'
    })

    let comment5 = await Comment.create({
        text: 'Ez egy ötödik komment'
    })

    await admin.addFriend(user1);
    await user1.addFriend(admin);

    await admin.addFriend(user4);
    await user4.addFriend(admin);

    await admin.addIncRequest(user2);
    await user2.addSentRequest(admin);

    await admin.addSentRequest(user3);
    await user3.addIncRequest(admin);

    await admin.addNotes([note, note3]);
    await note.setUser(admin);
    await note3.setUser(admin);

    await user1.addNote(note2);
    await note2.setUser(user1);

    await user4.addNote(note4);
    await note4.setUser(user4);

    await note4.addComments([comment1, comment2, comment3]);
    await note.addComment([comment4, comment5]);

    await note4.addLikers([admin, user1]);
    await admin.addLikedNote(note4);
    await user1.addLikedNote(note4);

    await comment1.setNote(note4);
    await comment2.setNote(note4);
    await comment3.setNote(note4);

    await comment4.setNote(note);
    await comment5.setNote(note);

    await user2.addComments([comment1, comment2]);
    await user1.addComment(comment5);
    await admin.addComments([comment3, comment4]);

    await comment1.setUser(user2);
    await comment2.setUser(user2);

    await comment5.setUser(user1);
    await comment3.setUser(admin);
    await comment4.setUser(admin);


    //Surveys
    let survey1 = await Survey.create({
        name: 'Teszt kérdőív',
        category: 'Teszt',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        public: true,
    });
    await user1.addSurvey(survey1);
    await survey1.setUser(user1);


    //Első
    let question1 = await SurvQuestion.create({
        question: 'Mi az Ön neme?',
        type: 'choice'
    });
    let answer1 = await PosSurvAnswer.create({
        answer: 'Férfi'
    });
    let answer2 = await PosSurvAnswer.create({
        answer: 'Nő'
    });

    let usrAnswer1 = await UsrSurvAnswer.create({
        answer: 'Nő'
    });

    await question1.addPosAnswers([answer1, answer2]);
    await question1.addUsrAnswer(usrAnswer1);
    await admin.addSurveyAnswer(usrAnswer1);
    await usrAnswer1.setQuestion(question1);
    await usrAnswer1.setUser(admin);
    await answer1.setQuestion(question1);
    await answer2.setQuestion(question1);
    await question1.setSurvey(survey1);

    //Második
    let question2 = await SurvQuestion.create({
        question: 'Mi a foglalkozása?',
        type: 'simple_text'
    });
    let answer3 = await PosSurvAnswer.create({
        answer: ''
    });

    let usrAnswer2 = await UsrSurvAnswer.create({
        answer: 'Pék'
    });

    await question2.addPosAnswers(answer3);
    await question2.addUsrAnswer(usrAnswer2);
    await admin.addSurveyAnswer(usrAnswer2);
    await usrAnswer2.setQuestion(question2);
    await usrAnswer2.setUser(admin);
    await answer3.setQuestion(question2);
    await question2.setSurvey(survey1);


    //Harmadik
    let question3 = await SurvQuestion.create({
        question: 'Járt-e általános iskolába?',
        type: 'checkbox'
    });
    let answer4 = await PosSurvAnswer.create({
        answer: ''
    });

    let usrAnswer3 = await UsrSurvAnswer.create({
        answer: 'checked'
    });

    await question3.addPosAnswers(answer4);
    await question3.addUsrAnswer(usrAnswer3);
    await admin.addSurveyAnswer(usrAnswer3);
    await usrAnswer3.setQuestion(question3);
    await usrAnswer3.setUser(admin);
    await answer4.setQuestion(question3);
    await question3.setSurvey(survey1);

    //Negyedik
    let question4 = await SurvQuestion.create({
        question: 'Adjon egy rövid leírást a kedvent hobbijairól!',
        type: 'multiline_text'
    });
    let answer5 = await PosSurvAnswer.create({
        answer: ''
    });

    let usrAnswer4 = await UsrSurvAnswer.create({
        answer: 'Nagyon sok kedvenc hobbim van...'
    });

    await question4.addPosAnswers(answer5);
    await question4.addUsrAnswer(usrAnswer4);
    await admin.addSurveyAnswer(usrAnswer4);
    await usrAnswer4.setQuestion(question4);
    await usrAnswer4.setUser(admin);
    await answer5.setQuestion(question4);
    await question4.setSurvey(survey1);

    //Ötödik
    let question5 = await SurvQuestion.create({
        question: 'Pontozzon egytől ötig!',
        type: 'points_1-5'
    });
    let answer6 = await PosSurvAnswer.create({
        answer: ''
    });

    let usrAnswer5 = await UsrSurvAnswer.create({
        answer: '3'
    });

    await question5.addPosAnswers(answer6);
    await question5.addUsrAnswer(usrAnswer5);
    await admin.addSurveyAnswer(usrAnswer5);
    await usrAnswer5.setQuestion(question5);
    await usrAnswer5.setUser(admin);
    await answer6.setQuestion(question5);
    await question5.setSurvey(survey1);

    //Hatodik
    let question6 = await SurvQuestion.create({
        question: 'Pontozzon egytől tízig!',
        type: 'points_1-10'
    });
    let answer7 = await PosSurvAnswer.create({
        answer: ''
    });

    let usrAnswer6 = await UsrSurvAnswer.create({
        answer: '8'
    });

    await question6.addPosAnswers(answer7);
    await question6.addUsrAnswer(usrAnswer6);
    await admin.addSurveyAnswer(usrAnswer6);
    await usrAnswer6.setQuestion(question6);
    await usrAnswer6.setUser(admin);
    await answer7.setQuestion(question6);
    await question6.setSurvey(survey1);

    await survey1.addQuestions([question1, question2, question3, question4, question5, question6]);

    let survey2 = await Survey.create({
        name: 'Felmérés',
        category: 'Pszichológia',
        description: '',
        public: true,
    });
    await admin.addSurvey(survey2);
    await survey2.setUser(admin);


    //Első
    let question7 = await SurvQuestion.create({
        question: 'Mi a neme?',
        type: 'choice'
    });
    let answer8 = await PosSurvAnswer.create({
        answer: 'Férfi'
    });
    let answer9 = await PosSurvAnswer.create({
        answer: 'Nő'
    });
    let answer10 = await PosSurvAnswer.create({
        answer: 'Egyéb'
    });

    let usrAnswer7 = await UsrSurvAnswer.create({
        answer: 'Férfi'
    });

    await question7.addPosAnswers([answer8, answer9, answer10]);
    await question7.addUsrAnswer(usrAnswer7);
    await user1.addSurveyAnswer(usrAnswer7);
    await usrAnswer7.setQuestion(question7);
    await usrAnswer7.setUser(user1);
    await answer8.setQuestion(question7);
    await answer9.setQuestion(question7);
    await answer10.setQuestion(question7);
    await question7.setSurvey(survey2);

    //Második
    let question8 = await SurvQuestion.create({
        question: 'Mit reggelizett?',
        type: 'simple_text'
    });
    let answer11 = await PosSurvAnswer.create({
        answer: ''
    });

    let usrAnswer8 = await UsrSurvAnswer.create({
        answer: 'Vajas kenyeret'
    });

    await question8.addPosAnswers(answer11);
    await question8.addUsrAnswer(usrAnswer8);
    await user1.addSurveyAnswer(usrAnswer8);
    await usrAnswer8.setQuestion(question8);
    await usrAnswer8.setUser(user1);
    await answer11.setQuestion(question8);
    await question8.setSurvey(survey2);


    //Harmadik
    let question9 = await SurvQuestion.create({
        question: 'Sportolt-e gyermekkorában?',
        type: 'checkbox'
    });
    let answer12 = await PosSurvAnswer.create({
        answer: ''
    });

    let usrAnswer9 = await UsrSurvAnswer.create({
        answer: 'checked'
    });

    await question9.addPosAnswers(answer12);
    await question9.addUsrAnswer(usrAnswer9);
    await user1.addSurveyAnswer(usrAnswer9);
    await usrAnswer9.setQuestion(question9);
    await usrAnswer9.setUser(user1);
    await answer12.setQuestion(question9);
    await question9.setSurvey(survey2);

    //Negyedik
    let question10 = await SurvQuestion.create({
        question: 'Mit álmodott tegnap este?',
        type: 'multiline_text'
    });
    let answer13 = await PosSurvAnswer.create({
        answer: ''
    });

    let usrAnswer10 = await UsrSurvAnswer.create({
        answer: 'Már nem emlékszem.'
    });

    await question10.addPosAnswers(answer13);
    await question10.addUsrAnswer(usrAnswer10);
    await user1.addSurveyAnswer(usrAnswer10);
    await usrAnswer10.setQuestion(question10);
    await usrAnswer10.setUser(user1);
    await answer13.setQuestion(question10);
    await question10.setSurvey(survey2);

    //Ötödik
    let question11 = await SurvQuestion.create({
        question: 'Pontozza a kérdőívet egytől ötig!',
        type: 'points_1-5'
    });
    let answer14 = await PosSurvAnswer.create({
        answer: ''
    });

    let usrAnswer11 = await UsrSurvAnswer.create({
        answer: '4'
    });

    await question11.addPosAnswers(answer14);
    await question11.addUsrAnswer(usrAnswer11);
    await user1.addSurveyAnswer(usrAnswer11);
    await usrAnswer11.setQuestion(question11);
    await usrAnswer11.setUser(user1);
    await answer14.setQuestion(question11);
    await question11.setSurvey(survey2);

    //Hatodik
    let question12 = await SurvQuestion.create({
        question: 'Pontozza a kérdőívet egytől tízig!',
        type: 'points_1-10'
    });
    let answer15 = await PosSurvAnswer.create({
        answer: ''
    });

    let usrAnswer12 = await UsrSurvAnswer.create({
        answer: '7'
    });

    await question12.addPosAnswers(answer15);
    await question12.addUsrAnswer(usrAnswer12);
    await user1.addSurveyAnswer(usrAnswer12);
    await usrAnswer12.setQuestion(question12);
    await usrAnswer12.setUser(user1);
    await answer15.setQuestion(question12);
    await question12.setSurvey(survey2);

    await survey2.addQuestions([question7, question8, question9, question10, question11, question12]);


    let quiz1 = await Quiz.create({
        name: "Teszt kvíz 1",
        category: "Teszt kategória",
        public: true
    });
    let quizQuestion1 = await QuizQuestion.create({
        question: "Első kérdés",
        ans1: "Teszt 1",
        ans2: "Teszt 2",
        ans3: "Teszt 3",
        ans4: "Teszt 4",
        correct: "Teszt 2",
    })
    let quizQuestion2 = await QuizQuestion.create({
        question: "Teszt kérdés",
        ans1: "Első válasz",
        ans2: "Második válasz",
        ans3: "Harmadik válasz",
        ans4: "Negyedik válasz",
        correct: "Harmadik válasz",
    })
    let quizQuestion3 = await QuizQuestion.create({
        question: "Mi a kérdés?",
        ans1: "A válasz",
        ans2: "A kérdés",
        ans3: "Semmi",
        ans4: "Mindkettő",
        correct: "A válasz",
    });

    await quiz1.addQuestions([quizQuestion1, quizQuestion2, quizQuestion3]);
    await quizQuestion1.setQuiz(quiz1);
    await quizQuestion2.setQuiz(quiz1);
    await quizQuestion3.setQuiz(quiz1);
    await admin.addQuiz(quiz1);
    await quiz1.setUser(admin);


    let quiz2 = await Quiz.create({
        name: "Teszt kvíz 2",
        category: "Matematika",
        public: true
    });
    let quizQuestion4 = await QuizQuestion.create({
        question: "Mennyi 2+2?",
        ans1: "4",
        ans2: "22",
        ans3: "2",
        ans4: "Kevés",
        correct: "4",
    })
    let quizQuestion5 = await QuizQuestion.create({
        question: "Mennyi 2x2?",
        ans1: "4",
        ans2: "Sok",
        ans3: "Néha 5",
        ans4: "2",
        correct: "Néha 5",
    })
    let quizQuestion6 = await QuizQuestion.create({
        question: "Melyik a helyes válasz?",
        ans1: "Ez",
        ans2: "Az első",
        ans3: "Nem a második",
        ans4: "Egyik sem",
        correct: "Nem a második",
    })

    await quiz2.addQuestions([quizQuestion4, quizQuestion5, quizQuestion6]);
    await quizQuestion4.setQuiz(quiz2);
    await quizQuestion5.setQuiz(quiz2);
    await quizQuestion6.setQuiz(quiz2);
    await quiz2.setUser(user1);
    await user1.addQuiz(quiz2);

    let score1 = await QuizScore.create({
        full: 3,
        correct: 1
    });

    await quiz2.addScore(score1);
    await score1.setQuiz(quiz2);
    await admin.addScore(score1);
    await score1.setUser(admin);

    let score2 = await QuizScore.create({
        full: 3,
        correct: 2
    });

    await quiz2.addScore(score2);
    await score2.setQuiz(quiz2);
    await user1.addScore(score2);
    await score2.setUser(user1);

    let score3 = await QuizScore.create({
        full: 3,
        correct: 1
    });

    await quiz2.addScore(score3);
    await score3.setQuiz(quiz2);
    await user2.addScore(score3);
    await score3.setUser(user2);

    let score4 = await QuizScore.create({
        full: 3,
        correct: 3
    });

    await quiz2.addScore(score4);
    await score4.setQuiz(quiz2);
    await user3.addScore(score4);
    await score4.setUser(user3);

    let score5 = await QuizScore.create({
        full: 3,
        correct: 2
    });

    await quiz1.addScore(score5);
    await score5.setQuiz(quiz1);
    await admin.addScore(score5);
    await score5.setUser(admin);

    let score6 = await QuizScore.create({
        full: 3,
        correct: 3
    });

    await quiz1.addScore(score6);
    await score6.setQuiz(quiz1);
    await user4.addScore(score6);
    await score6.setUser(user4);

    let score7 = await QuizScore.create({
        full: 3,
        correct: 0
    });

    await quiz1.addScore(score7);
    await score7.setQuiz(quiz1);
    await user5.addScore(score7);
    await score7.setUser(user5);

    let adminChat1 = await Chat.create({
        userId: 1,
        friendId: 2,
        seen: true,
        friendSeen: false,
    });
    let adminChat2 = await Chat.create({
        userId: 1,
        friendId: 5,
        seen: true,
        friendSeen: false,
    });

    let user1Chat = await Chat.create({
        userId: 2,
        friendId: 1,
        seen: false,
        friendSeen: true,
        seenAt: new Date(),
    });

    let user4Chat = await Chat.create({
        userId: 5,
        friendId: 1,
        seen: false,
        friendSeen: true,
        seenAt: new Date(),
    });

    let msg1 = await ChatMessage.create({
        senderId: 1,
        receiverId: 2,
        message: "Szia!"
    })
    let msg2 = await ChatMessage.create({
        senderId: 2,
        receiverId: 1,
        message: "Helló!"
    })
    let msg3 = await ChatMessage.create({
        senderId: 1,
        receiverId: 2,
        message: "Mi újság?"
    });


    let msg4 = await ChatMessage.create({
        senderId: 5,
        receiverId: 1,
        message: "Boldog születésnapot!"
    })
    let msg5 = await ChatMessage.create({
        senderId: 1,
        receiverId: 5,
        message: "Köszi!"
    });

    await adminChat1.addMessages([msg1, msg2, msg3]);
    await user1Chat.addMessages([msg1, msg2, msg3]);
    await msg1.addChats([adminChat1, user1Chat]);
    await msg2.addChats([adminChat1, user1Chat]);
    await msg3.addChats([adminChat1, user1Chat]);

    await adminChat2.addMessages([msg4, msg5]);
    await user4Chat.addMessages([msg4, msg5]);
    await msg4.addChats([adminChat2, user4Chat]);
    await msg5.addChats([adminChat2, user4Chat]);
})();