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
var database = firebase.database();

// ***************************************************************//

// variables declaration
// need to clean up data
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
var local_key; // not used
var remote_key; // not used
var wins = 0;
var losses = 0;
var remote_id;
statsUpdate = false;
var random;
var player = "offline";

// ***************************************************************//

$("document").ready(function() {


    for (var z=4; z < 7; z++) {
                $("#" + z).css("opacity", 0.2);
            }

    // localStorage.clear();
    // will force new game

    // check local storage for player
    // if (localStorage.getItem("random") !== null) {
    //     console.log("random in local storage: " + localStorage.getItem("random"));
    //     // newPlayer();
    //     checkPlayer();
    // } else {
    //     console.log("local storage is empty");
    //     newPlayer();
    // }

    // window close or refresh resets game
    window.addEventListener("beforeunload", function() {
        database.ref('/players/' + random).remove();
        database.ref('/message/').remove();
        database.ref("players/" + "reset").update({
            reset: true,
        });
    });

    // start game    
    newPlayer();

    // generate player id randomly
    function newPlayer() {
    // if (reset) {
        random = Math.round(Math.random() * 10000);
        console.log("random: " + random);
        // create local player database file with generated random id
        database.ref("players/" + random).update({
            random: random,
            wins: 0,
            losses: 0,
            choice: "",
            player: "online",
        });
        // tracks reset via refresh or disconnection
        database.ref("players/" + "reset").update({
            reset: false,
        });

        // stores generated random id in local storage
        localStorage.clear();
            localStorage.setItem("random", random);
            console.log("stored random: " + localStorage.getItem("random"));
        // reset = false;
        
    // }
}   // end new player 

    // ***************************************************************//

    // listening to button click and storing user choice
    $(".iconActive").on("click", function() {
        $("#rps").html("Selected Image: " + $(this).data("icon"));

        if (!madeChoice) {
            choice = $(this).data("icon");
            console.log("my selection: " + choice);

        // @@@@@ highlight as icon is selected
        for (i=1; i < 4; i++) {
            if (i == choice) {
                $("#" + i).css("opacity", 1);    // change to border highlight 
                // $("#" + i).css({box-shadow: 1px 1px #91FF8B};
            } else {
                $("#" + i).css("opacity", 0.5);    // change to border highlight 
            }
        }   // @@@@@ end of high-light icon for loop

        } else {
            choice = "";
            console.log("not recording onclick: " + choice);
            console.log("my selection: " + choice);
            return
        }
    }); // end .icon on-click

    // user submits selection
    $("#submit").on("click", function() {
        if (localCount == 1) {
            console.log("you already played");
        } else

        // 
        if (choice == 1 || choice == 2 || choice == 3) {

            // displays user choice in window
            $("#thisPlayer").html("Your choice: " + choice);

        // @@@@@ highlight user selection, fades away other choices
        for (i=1; i < 4; i++) {
            if (i == choice) {
                $("#" + i).css("opacity", 1);
            } else {
                $("#" + i).css("opacity", 0);    // fade out only 
            }
        }   // end highlight for loop

            // prevents change of choice value for the duration of this match
            madeChoice = true;

            localCount++;
            // Note: firt assign local_choice, otherwise local_choice is undefined until data or page refresh
            local_choice = choice;
            console.log("first assign local choice: " + local_choice);
            console.log("localCount: " + localCount);
            // console.log("choice sent to database: " + choice);

            // go-to update remote database
            saveRemote();
        } else {
            console.log("selection is blank");
            return
        }
    });

    // ***************************************************************//   
    // ***************************************************************//

    // updating database
    function saveRemote() {

        database.ref("/players/" + random).update({
            random: random,
            localCount: localCount,
            choice: choice,
            wins: wins,
            losses: losses,
        });

        choice = "";

    }

    // window.addEventListener("beforeunload", function() {
    //     database.ref("players/" + "reset").update({
    //         reset: false,
    //     });
    //     // store id in localstorage
    // });
    // ***************************************************************//   
    // ***************************************************************//
    // ***************************************************************//
    // reading database, adding user choices to array as they are submitted by user via input click

    database.ref('/players/').on("child_changed", function(childSnapshot) {
        
        // reset if disconnected or refresh
        reset = childSnapshot.val().reset;
        console.log("reset child changed: " + reset);
        if (reset) {
            $("#chat-field").html("");
            wins = 0;
            losses = 0;
            localStorage.clear();
            $("#wins").html("Wins: " + wins);
            $("#losses").html("Losses: " + losses);
            $("#winner").html("");            
        } else {
            console.log("on child change no reset button");
        }

        // updates array containing choices made by users
        if (madeChoice) {
            choiceArr.push(childSnapshot.val().choice);
            console.log("pushed to choice array: " + childSnapshot.val().choice);
            console.log("choiceArr: " + choiceArr);
            count++;
            console.log("count/number-of-entries: " + count);

            // count is 2 when both made their choice
            if (count == 2) {
                console.log("both played");
                madeChoice = false;
                // go-to who's who in game for window display 
                identity();
            }   // end count if statement
        } else {
            return
        }

    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    }); // end of childSnapshot


    // ***************************************************************// 

    // check who is local-player and who is remote-player, shows data if both played
    function identity() {
        console.log("count value is: " + count);
        console.log("local_choice: " + local_choice);
        
        if (local_choice == choiceArr[0]) {
            remote_choice = choiceArr[1];
            console.log("identity remote choice: " + remote_choice);
            $("#thisPlayer").html("Your choice: " + choiceArr[0]);
            $("#otherPlayer").html("Other player: " + choiceArr[1]);

        // highlights opponent's choice
        for (var i=4; i < 7; i++) {
            if (i - 3 == remote_choice) {
                $("#" + i).css("opacity", 1);
            } else {
                $("#" + i).css("opacity", 0); 
            }
        } // end highlight opponent's choice
        }
        outcome();

    } // end identity function
    // ***************************************************************// 

    function outcome() {

        madeChoice = false;
        console.log("local choice: " + local_choice);
        console.log("remote choice: " + remote_choice);

        if (local_choice == remote_choice) {
            $("#winner").html("Match is a tie");
        } else if (  
            (local_choice == "3" && remote_choice == "1") ||
            (local_choice == "1" && remote_choice == "2") ||
            (local_choice == "2" && remote_choice == "3")
        ) {
            wins++;
            database.ref("/players/" + random).update({
            wins: wins,
            });
            
            console.log("local wins");
            $("#wins").html("Wins: " + wins);
            $("#winner").html("Victory!!!");
        } else if (
            (local_choice == "1" && remote_choice == "3") ||
            (local_choice == "2" && remote_choice == "1") ||
            (local_choice == "3" && remote_choice == "2")
        ){
            losses++;
            database.ref("/players/" + random).update({
            losses: losses,
            });
            $("#losses").html("Losses: " + losses);
            $("#winner").html("You loss...");
        } 
 
        var pauseGame = setTimeout(clearData, 5000);
    } // end outcome function


    
    // ***************************************************************//   
    // ***************************************************************//
    // ***************************************************************//
    // ***************************************************************//

    // code not working yet

function checkPlayer() {
var query = database.ref('/players/').orderByKey();
    query.once("value")
        .then(function(playedCheck) {
                playedCheck.forEach(function(childSnapshot) {
                        console.log("*****************");
                        // var user_id =childSnapshot.val().random;   
                        // console.log("user_id: " + user_id);
                        // var user_id_local = localStorage.getItem("random");
                        // console.log("user_id_local: " + user_id_local);
                        if (childSnapshot.child("random").exists()){
                            var user_id =childSnapshot.val().random;   
                            console.log("user_id: " + user_id);
                            var user_id_local = localStorage.getItem("random");
                            console.log("user_id_local: " + user_id_local);
                            if (user_id == user_id_local) {
                                console.log("user exists");
                            }
                        } else {
                            newPlayer();
                            console.log("new player")
                        }
}); // end for each
});   // end playcheck
}

    
    // ***************************************************************//   
    // ***************************************************************//
    // ***************************************************************//
    // ***************************************************************//

    // ***************************************************************//
    // ***************************************************************//
    // if using clearData add a timer

    function clearData() {

        madeChoice = false;
        count = 0;
        localCount = 0;
        choiceArr = [];
        check = 0;
        local_choice = "";
        remote_choice = "";

        $("#thisPlayer").html("Your choice: " + "None selected");
        $("#otherPlayer").html("Other player: " + "None selected");
        $("#winner").html("Select and Submit");

        for (var z=4; z < 7; z++) {
                $("#" + z).css("opacity", 0.2);
            }

        for (var m = 1; m < 4; m++) {
            $("#" + m).css("opacity", 1);  
        } // end for loop

        saveRemote();
        
    } // end clear data function


    // ***************************************************************//
    // ***************************************************************//
    // ***************************************************************//
    // chatroom 

    $("#chat").on("click", function() {
        var message = $("#message").val().trim();
        name = $("#name").val().trim();

        // if name is empty, player name is generated id number
        if (name == "") {
            name = random;
        }


        // check for empty message
        if (message !== "") {
            database.ref('/message/').push({
                name: name,
                message: message,
                dateAdded: firebase.database.ServerValue.TIMESTAMP
            });
            $("#message").val("");
            
        } // end on click chat button
        return false;
    }); // end of #chat onclick

    // chat snapshot
    database.ref('/message/').orderByChild("dateAdded").limitToLast(15)
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

    // clear chat field button
    // $("#reset").on("click", function() {
    //     database.ref("players/" + "reset").update({
    //         reset: true,
    //     });
    //     // wins = 0;
    //     // losses = 0;
    //     // clearData();
    // });

    // ***************************************************************// 
    // ***************************************************************// 
    // ***************************************************************//

});
