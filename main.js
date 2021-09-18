const electron = require('electron')
const {app, Menu, Tray} = electron
const path = require('path');
var fs = require('fs');
const readline = require("readline");
var request = require('request');
var open = require("open");
const notifier = require('node-notifier');

const admin = require('firebase-admin')
const serviceAccount = require('./ServiceAccountKey.json')



admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})
const db = admin.firestore()

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var isRunning = true

const login = require("facebook-chat-api");

  // Phương thức này sẽ được gọi ra khi Electron hoàn thành
  //  khởi tạo và sẳn sàng để tạo ra các cửa sở trình duyệt.
  // Some APIs can only be used after this event occurs.
  //an: 100003736270922
  let tray = undefined;

  // Don't show the app in the doc
  app.dock.hide();

  app.on('ready', function() {
    createTray()
    startLogging()
  })

  const createTray = () => {
    tray = new Tray(path.join('trayIconSmall.png'));
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Start', click() {
            startLogging()
        }},
        {label: 'Stop', click() {
            stopLogging()
        }},
        {type: 'separator'},
        {label: 'Exit', click() {
            app.quit()
        }}
    ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
  }

  function startLogging() {
    isRunning = true
    login({email: "quangscorpio@gmail.com", password: "Galahad01227266549hn"}, (err, api) => {
        if(err) return console.error(err);

        api.setOptions({ selfListen: true, listenEvents: true, logLevel: "silent"});


        var lastSenderID = ""
        var stopListening = api.listen((err, event) => {
            if(err) return console.error(err);

            if(isRunning) {
                //#region Previous  
                /*
                switch(event.type) {
                    case "message":
                    if(event.isGroup) {return}

                            if(event.senderID === '100004584125356' || event.senderID === '100006704829169') {
                                //For message
                                if(event.attachments.length == 0) {
                                    api.sendMessage("Lockwood: " + event.body, event.threadID);
                                }
        
                                //For sticker
                                if(event.attachments.length > 0) {
                                    console.log(event.attachments[0].type)
                                    if(event.attachments[0].type == "sticker") {
                                        var msg = {sticker: event.attachments[0].ID};
                                        api.sendMessage(msg, event.threadID);
                                        api.sendMessage(event.attachments[0].description, event.threadID);
                                    }
                                    else if(event.attachments[0].type == "animated_image") {
                                        var msg = {url: event.attachments[0].url};
                                        api.sendMessage(msg, event.threadID);
                                    } 
                                }
                            }
                    case "typ":
                    if (event.isGroup) {return}
                        var isMobile = false
                        if(event.isTyping) {
                            if(event.fromMobile) {
                                isMobile = true
                            }

                            console.log(event.from)

                            api.getUserInfo(event.from, function(err, data) {
                                
                                //console.log(data)
                                if(data != undefined) {
                                    var user = data[event.from];
    
                                    var messageLink = "https://www.facebook.com/messages/t/" + event.from
    
                                    if(isMobile) { 
                                        console.log(user.name + " is typing for you... from 📱")
                                        notifier.notify(
                                            {
                                              title: 'L.I.M.B.O',
                                              message: user.name + " is typing for you... from 📱",
                                              icon: path.join(__dirname, 'notiIcon.png'), // Absolute path (doesn't work on balloons)
                                              wait: true // Wait with callback, until user action is taken against notification
                                            },
                                            function(err, response) {
                                              // Response is response from notification
                                            }
                                          );
                                          
                                          notifier.on('click', function(notifierObject, options) {
                                            open(messageLink);
                                          });
                                    }
                                    else {
                                        console.log(user.name + " is typing for you... from 🖥")
                                        notifier.notify(
                                            {
                                              title: 'L.I.M.B.O',
                                              message: user.name + " is typing for you... from 🖥",
                                              icon: path.join(__dirname, 'notiIcon'), // Absolute path (doesn't work on balloons)
                                              wait: true // Wait with callback, until user action is taken against notification
                                            },
                                            function(err, response) {
                                              // Response is response from notification
                                            }
                                          );
                                          
                                          notifier.on('click', function(notifierObject, options) {
                                            open(messageLink);
                                          });
                                    }
    
                                    if(user.isBirthday) {
                                        console.log("Happy birthday :)", user.name);
                                        let n = new Notification('L.I.M.B.O', {
                                            body: "Happy birthday :) " + user.name
                                        })
                                    }
                                }
                                
                            });
                        }
                }*/
                //#endregion

                if(event.senderID != undefined) {
                    console.log(event.senderID)
                    api.getUserInfo(event.senderID, function(err, data) {
                        if (err) return console.error(err)

                        if (data != undefined) {
                            var user = data[event.senderID];

                            var vanity = ""
                            var alternateName = ""
                            if (user.vanity != undefined) {
                                vanity = user.vanity
                            }
                            if (user.alternateName != undefined) {
                                alternateName = user.alternateName
                            }

                            const userData = {
                                userID: event.senderID,
                                userName: user.name,
                                vanity: vanity,
                                background: user.thumbSrc,
                                avatar: user.profileUrl,
                                gender: user.gender,
                                isFriend: user.isFriend,
                                isBirthday: user.isBirthday,
                                alternateName: alternateName
                            }
                            if(lastSenderID != event.senderID) {
                                lastSenderID = event.senderID
                                var docRef = db.collection('users').doc(userData.userID);
                                var setData = docRef.set(userData).then((() => {
                                    console.log("new person added/updated to data base")
                                }))

                                //db.collection('users').doc(userData.userID).set(userData)
                            }
                        }
                    })
                }
                    
                
                //#region For firebase
                //#endregion
            }
        })
    });
  }

  function stopLogging() {
      isRunning = false
  }
  
  // Thoát ra khi tất cả cửa sổ đóng lại.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
      app.quit()
  })
  
  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.