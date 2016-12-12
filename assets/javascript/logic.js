
// Initialize Firebase
var config = {
    apiKey: "AIzaSyD-T5JrEesXd4Ce9mIaROEGlM9nq0BkOw0",
    authDomain: "rps-fb-79d30.firebaseapp.com",
    databaseURL: "https://rps-fb-79d30.firebaseio.com",
    storageBucket: "rps-fb-79d30.appspot.com",
    messagingSenderId: "846523676204"
};
firebase.initializeApp(config);

// Reference to the database service
var fireDatabase = firebase.database();

// ***************************************************************//

var iconArr = ["s", "p", "r"]; // player options
var choice = ""; // players choice/selection
var madeChoice = false; // keeps track if user submitted a choice
var count = 0; // track number of entries
var name; // user name
var message; // message chat area
var localCount = 0; // checks if user played
var choiceArr = []; // stores choices from both players
var reset = true; // access random id generator
var local_choice; // when reloading choice
var remote_choice; // when reloading choice
var local_key;  // not used
var remote_key; // not used
var wins = 0;
var losses = 0;

// ***************************************************************//

// generate player id randomly, accessed only if reset is true
if (reset) {
    var random = Math.round(Math.random() * 10000);
    console.log("random: " + random);
    reset = false;
}

// ***************************************************************//
// listening to button click and storing user choice
$(".icon").on("click", function() {
    $("#rps").html("Selected Image: " + $(this).data("icon"));
    if (!madeChoice) {
        choice = $(this).data("icon");
        console.log("my selection: " + choice);
    } else {
        choice = "";
        console.log("not recording onclick: " + choice);
        console.log("my selection: " + choice);
        return
    }
}); // end .icon on-click

$("#submit").on("click", function() {
    if (localCount == 1) {
        console.log("you already played");
    } else

    if (choice.match(/[rps]/)) {

        // store local player id
        localStorage.clear();
        localStorage.setItem("random", random);
        console.log("stored random: " + localStorage.getItem("random"));

        // displays user choice in window
        $("#thisPlayer").html("Your choice: " + choice);

        // prevents change of choice value for the duration of this match
        madeChoice = true;
        // go-to update remote database
        saveChoice();
    } else {
        console.log("selection is blank");
        return
    }
});

// ***************************************************************//   
// ***************************************************************//

// updating database

function saveChoice() {


    localCount++;
    // Note: firt assign local_choice, otherwise local_choice is undefined until data or page refresh
    local_choice = choice;
    console.log("first assign local choice: " + local_choice);
    console.log("localCount: " + localCount);
    // console.log("choice sent to database: " + choice);


    // "/players/" + random
    fireDatabase.ref("/players/").push({
        random: random,
        localCount: localCount, // keep - used line 130 snapshot
        choice: choice,
        wins: wins,
        losses: losses, // important - keep
    });

    choice = "";
}

// ***************************************************************//   
// ***************************************************************//
// ***************************************************************//
// reading database, adding user choices to array as they are sent by user via input click

fireDatabase.ref('/players/').on("child_added", function(childSnapshot) {
    // pushes choices in database to choices array
    // increments count variable by one everytime a choice has been pushed into database
    // once count = 2, no more count entries allowed

    choiceArr.push(childSnapshot.val().choice);
    console.log("pushed to choice array: " + childSnapshot.val().choice);
    count++;

    // console.log("count/number-of-entries: " + count);
    console.log("choiceArr: " + choiceArr)

    // go-to who's who in game for window display 
    if (count == 2) {
        console.log("both played");
        identity();
    }

}, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
}); // end of childSnapshot

// ***************************************************************// 

// check who is local-player and who is remote-player, shows data if both played
function identity() {
    console.log("count value is: " + count);
    console.log("local_choice: " + local_choice);
    // if (count == 2) {    
    // console.log("both played");
    if (local_choice == choiceArr[0]) {
        remote_choice = choiceArr[1];
        $("#thisPlayer").html("Your choice: " + choiceArr[0]);
        $("#otherPlayer").html("Other player: " + choiceArr[1]);     // do not show local player

        // highlighting corresponding image
        for (var j = 0; j < iconArr.length; j++) {
            if (choiceArr[0] !== iconArr[j]) {
                var fade_icon = "#" + iconArr[j] + 1;
                console.log("# + iconArr[j] + 1: " + fade_icon);
                $(fade_icon).fadeTo(250, 0.1);
            }
            if (choiceArr[1] !== iconArr[j]) {
                var fade_icon = "#" + iconArr[j] + 2;
                console.log("# + iconArr[j] + 2: " + fade_icon);
                $(fade_icon).fadeTo(250, 0.1);
            }
        } // end for loop

    } else if (local_choice == choiceArr[1]) {
        remote_choice = choiceArr[0];
        $("#thisPlayer").html("Your choice: " + choiceArr[1]);
        $("#otherPlayer").html("Other player: " + choiceArr[0]);     // do not show local player

        // highlighting corresponding image
        for (var k = 0; k < iconArr.length; k++) {
            if (choiceArr[1] !== iconArr[k]) {
                var fade_icon = "#" + iconArr[k] + 1;
                console.log("# + iconArr[k] + 1: " + fade_icon);
                $(fade_icon).css("opacity", 0.1);
            }
            if (choiceArr[0] !== iconArr[k]) {
                var fade_icon = "#" + iconArr[k] + 2;
                console.log("# + iconArr[k] + 2: " + fade_icon);
                $(fade_icon).css("opacity", 0.1);
            }
        } // end for loop
    }
    // }   // end if count == 2
    outcome();

} // end identity function
// ***************************************************************// 

function outcome() {

    console.log("local choice: " + local_choice);
    console.log("remote choice: " + remote_choice);




    if (local_choice == remote_choice) {
        console.log("is a tie");
        $("#winner").html("Match is a tie");
    } else if (
        (local_choice == "r" && remote_choice == "s") || 
        (local_choice == "s" && remote_choice == "p") ||
        (local_choice == "p" && remote_choice == "r")
        ) {
        wins++;
        fireDatabase.ref('/stats/').update({
            wins: wins,
            random: random,
            losses: losses,
        })
        console.log("local wins");
        $("#wins").html("Wins: " + wins);
        $("#winner").html("Victory!!!");

    }   else {
        losses++;
            $("#losses").html("Losses: " + losses);
            $("#winner").html("You loss...");
    }


    var pauseGame = setTimeout(clearData, 7000);
    // clearData()
} // end outcome function


// ***************************************************************//
// read once
// firebase.database().ref(1011).once('value').then(function(snapshot) {
//   var choice = snapshot.val().choice;
//   console.log("1011: " + choice);
// });
// ***************************************************************//

// accessed only @ refresh or on return after exiting the browser
// check local storage choice against database choice value
var check = 0;
var query = fireDatabase.ref('/players/').orderByKey();
query.once("value")
    .then(function(playedCheck) {
            playedCheck.forEach(function(childSnapshot) {
                    console.log("*****************");
                    // playTemp stores choice value from database
                    var user_id = childSnapshot.val().random;
                    var user_id_local = localStorage.getItem("random");
                    console.log("user_id: " + user_id);

                    var choice_key = childSnapshot.val().choice;
                    console.log("choice_key: " + choice_key);

                    // if localstorage "played" match database, check is positive
                    // first check if player exists
                    if (localStorage.getItem("random") == user_id) {
                        wins = childSnapshot.val().wins;
                        $("#wins").html("Wins: " + wins);
                        losses = childSnapshot.val().losses;
                        $("#losses").html("Losses: " + losses);
                        // then retrieve choice
                        if (choice_key.match(/[rps]/)) {
                            check++;
                            local_choice = choice_key;
                            local_key = childSnapshot.key;
                            console.log("local_choice:" + choice_key);
                            console.log("local_key: " + local_key);
                            $("#thisPlayer").html("Your choice: " + choice_key);
                            madeChoice = true;
                        } // end choice_key

                    } else {
                        wins = childSnapshot.val().losses;
                        $("#wins").html("Wins: " + wins);
                        losses = childSnapshot.val().wins;
                        $("#losses").html("Losses: " + losses);
                        remote_choice = choice_key
                        remote_key = childSnapshot.key;
                        console.log("remote_choice: " + remote_choice)
                        console.log("remote_key: " + remote_key)
                    }
                    // identity();
                }) // end forEach function(childSnapshot)

            if (check > 0) {
                console.log("already played");
            } else {
                console.log("did not play");
            }
        } // end then function(playCheck)
        ,
        function(errorObject) {
            console.log("Errors handled: " + errorObject.code);
        });

// retrieving lost stats

fireDatabase.ref("stats").once('value').then(function(snapshot) {
    var wins_key = snapshot.val().wins;
    var user_id = snapshot.val().random;
    console.log("stats random: " + user_id);
    console.log("local random: " + localStorage.getItem("random"));
    console.log("wins retrieve: " + wins_key);
    if (localStorage.getItem("random") == user_id) { // ???????????
        wins = snapshot.val().wins;
        $("#wins").html("Wins: " + wins);
        losses = snapshot.val().losses;
        $("#losses").html("Losses: " + losses);
    } // end choice_key
    else {
        wins = snapshot.val().losses;
        $("#wins").html("Wins: " + wins);
        losses = snapshot.val().wins;
        $("#losses").html("Losses: " + losses);
    }

});
// ***************************************************************//   
// ***************************************************************//
// ***************************************************************//
// ***************************************************************//


// ***************************************************************//
// ***************************************************************//
// ***************************************************************//
// if using clearData add a timer

function clearData() {

    fireDatabase.ref('/players/').remove();

    madeChoice = false;
    count = 0;
    localCount = 0;
    choiceArr = [];
    check = 0;
    local_choice = "";
    remote_choice = "";

    $("#thisPlayer").html("Your choice: " + "None selected");
    $("#otherPlayer").html("Other player: " + "None selected");
    $("#winner").html("");
    for (var m = 0; m < iconArr.length; m++) {
        $("#" + iconArr[m] + 1).css("opacity", 1);
        $("#" + iconArr[m] + 2).css("opacity", 1);
    } // end for loop

} // end clear data function


// ***************************************************************//
// ***************************************************************//
// ***************************************************************//
// chat

// working block 

$("#chat").on("click", function() {
    var message = $("#message").val().trim();
    name = $("#name").val().trim();

    // gets me the post key for each addition
    //  newPostKey = firebase.database().ref().child('name').push().key;
    // console.log("newPostKey: " + newPostKey);

    if (message !== "") {
        fireDatabase.ref('/message/').push({
            name: name,
            message: message,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });

        return false;
    } // end on click chat button

}); // end of #chat onclick

// chat snapshot
fireDatabase.ref('/message/').orderByChild("dateAdded").limitToLast(15)
    .on("child_added", function(childSnapshot) {

        // Change the HTML to reflect
        console.log(childSnapshot.val().name);
        console.log(childSnapshot.val().message);

        // if (childSnapshot.val().name !== "") {
        //     name = random;
        // } else { 
            name = childSnapshot.val().name;
        // }

        message = childSnapshot.val().message;

        if (message !== "") {     
            $("#chat-field").append('<p>' + name + ": " + message + '</p>');
            $('#chat-field').animate({ scrollTop: 1000000 });
        }
    });


// fireDatabase.ref().onDisconnect.update({
//   onlineState: false,
//   status: "I'm offline."
// });


// clear chat field button
$("#reset").on("click", function() {

    fireDatabase.ref('/message/').remove();
    $("#chat-field").html("");
    fireDatabase.ref('/stats/').remove();
    clearData();
    location.reload();
    reset = false;
    localStorage.clear();
});

// ***************************************************************// 
// ***************************************************************// 
// ***************************************************************//
