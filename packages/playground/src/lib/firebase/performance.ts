import * as firebase from "firebase/app";
import "firebase/performance";

const firebaseConfig = {
  apiKey: "AIzaSyCSfdA8JK_-3XTaw_7vGp4F3RPmI3jxvc4",
  authDomain: "type-puzzle.firebaseapp.com",
  databaseURL: "https://type-puzzle.firebaseio.com",
  projectId: "type-puzzle",
  storageBucket: "type-puzzle.appspot.com",
  messagingSenderId: "1061064295440",
  appId: "1:1061064295440:web:fce96996a69af433"
};

firebase.initializeApp(firebaseConfig);
firebase.performance();

// The perfMetrics object is created by the code that goes in <head>.
// https://github.com/GoogleChromeLabs/first-input-delay
// @ts-ignore Cannot find name 'perfMetrics'
perfMetrics.onFirstInputDelay(function(delay, evt) {
  // @ts-ignore Cannot find name 'ga'
  ga("send", "event", {
    eventCategory: "Perf Metrics",
    eventAction: "first-input-delay",
    eventLabel: evt.type,
    eventValue: Math.round(delay),
    nonInteraction: true
  });
});
