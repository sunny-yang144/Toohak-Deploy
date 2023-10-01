```javascript
let data = {
    // TODO: insert your data structure that contains 
    // users + quizzes here


    // Draft of what a 'user' object would be like

    /*
        || ATTRIBUTES OF USER ||

    attribute                               type

    username:                               string        
    userId:                                 int
    nameFirst:                              string
    nameLast:                               string
    email:                                  string
    bio:                                    string
    ownedQuizzes:                           int[]  "number array, containing quizIds"
    quizzesCreated:                         int
    quizzesPlayed:                          int
    numSuccessfulLogins:                    int
    numFailedPasswordsSinceLastLogin:       int

    */

   users: [
    {
        username: "jimster", 
        userId: 1, 
        nameFirst: "Jimmy", 
        nameLast: "Stanley",
        email:  "jimmy.stan68@gmail.com",
        bio: "I like marvel comics",
        ownedQuizzes: [1,2,3],
        quizzesCreated: 3,
        quizzesPlayed: 109,
        numSuccessfulLogins: 3,
        numFailedPasswordsSinceLastLogin: 1,
    },
   ],


    // Draft of what a 'quiz' object would be like

    /*
        || ATTRIBUTES OF QUIZ ||

    quizName:           string  
    description:        string
    quizId:             int
    creatorName:        string
    questionCount:      int
    playCount:          int
    rating:             double
    favourited:         int
    tags:               string
    timeCreated:        int
    timeLastEdited:     int


    */

    quizzes: [
        {
        quizName: "Iron Man", 
        description:    "Iron Man's biggest secrets revealed!", 
        quizId: 2, 
        creatorName:    "jimster",
        questionCount:  21,
        playCount:  65,
        rating: 3.76, 
        favourited: 7,
        tags:   "#marvel, #iron, #man, #ironman",
        timeCreate: 1683125870,
        timeLastEdited: 1683125871,
        },
    ],
}
```

[Optional] short description: 
