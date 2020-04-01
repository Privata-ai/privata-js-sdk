import * as firebase from 'firebase'

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: 'AIzaSyDwAIdHtTi94JiG4NDhyRgXrz3dk3RIT8E',
  authDomain: 'blockbird-data-apps-local-dev.firebaseapp.com',
  databaseURL: 'https://blockbird-data-apps-local-dev.firebaseio.com',
  projectId: 'blockbird-data-apps-local-dev',
  storageBucket: 'blockbird-data-apps-local-dev.appspot.com',
  messagingSenderId: '962487972446',
  appId: '1:962487972446:web:f4ef453b612892f3603acf',
  measurementId: 'G-6QK9PY1TF5',
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

export async function initialize(dbId: string, dbSecret: string) {
  dbId = dbId + '@blockbird.ventures'
  await firebase
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

export async function getIdToken(): Promise<string> {
  return await firebase.auth().currentUser.getIdToken()
}
