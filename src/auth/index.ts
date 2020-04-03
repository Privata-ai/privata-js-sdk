import * as firebase from 'firebase'

var firebaseConfigSandBox  = {
  apiKey: "AIzaSyDO-JXjcrO9x5sSX30mLQdSpu3_r7yI9gY",
  authDomain: "blockbird-data-apps-staging.firebaseapp.com",
  databaseURL: "https://blockbird-data-apps-staging.firebaseio.com",
  projectId: "blockbird-data-apps-staging",
  storageBucket: "blockbird-data-apps-staging.appspot.com",
  messagingSenderId: "930371487629",
  appId: "1:930371487629:web:0161868047c691df75dfc4",
  measurementId: "G-PNK4RC89T6"
}

firebase.initializeApp(firebaseConfigSandBox, 'sandbox')
//firebase.initializeApp(firebaseConfigProduction, 'production')

export async function initialize(dbId: string, dbSecret: string, sandbox: boolean) {
  dbId = dbId + '@blockbird.ventures'
  await firebase
    .app(sandbox ? 'sandbox' : 'production')
    .auth()
    .signInWithEmailAndPassword(dbId, dbSecret)
    .catch(function (error) {
      var errorCode = error.code
      var errorMessage = error.message
      console.error('Errors: ' + errorCode + ': ' + errorMessage)
      return
    })
  return
}

export async function getIdToken(sandbox: boolean): Promise<string> {
   return await firebase.app(sandbox ? 'sandbox' : 'production').auth().currentUser.getIdToken()
}
