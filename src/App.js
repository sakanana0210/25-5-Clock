import './App.css';
import React, { useEffect } from 'react';
import { createStore } from 'redux';
import { Provider, useSelector, useDispatch} from 'react-redux';

// redux
const initialState = {
  running: false,
  break: 300,
  session: 1500,
  time: 1500,
  display: "Session"
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "TIME":
        if (state.time > 0){
          return { ...state, time: state.time - 1};
        } else if (state.time === 0 && state.display === "Session"){
          return { ...state, time: state.break, display:  "Break"};
        } else if (state.time === 0 && state.display === "Break"){
          return { ...state, time: state.session, display:  "Session"};
        } else {
          return { ...state};
        }

    case "START_STOP":
      return { ...state, running: !state.running};

    case "RESET":
      return initialState;

    case "SESSION_END":
      return { ...state, sessionEnd: true, display: "Break", time: state.break};

    case "BREAK_END":
      return { ...state, sessionEnd: false, display: "Session", time: state.session};

    case "SESSION_UP":
      if (state.running === false && state.session < 3600 && state.display === "Session"){
        return { ...state, session: state.session + 60, time: state.session + 60};
      } else if (state.running === false && state.session < 3600 && state.display === "Break"){
        return { ...state, session: state.session + 60};
      } else {
        return { ...state}
      }
    case "SESSION_DOWN":
      if (state.running === false && state.session > 60 && state.display === "Session") {
        return { ...state, session: state.session - 60, time: state.session - 60 };
      } else if (state.running === false && state.session > 60 && state.display === "Break"){
        return { ...state, session: state.session - 60};
      } else {
        return { ...state}
      }
    case "BREAK_UP":
      if (state.running === false && state.break < 3600 && state.display === "Session") {
        return { ...state, break: state.break + 60 };
      } else if (state.running === false && state.break < 3600 && state.display === "Break"){
        return { ...state, break: state.break + 60 , time: state.break + 60};
      } else {
        return { ...state}
      }
    case "BREAK_DOWN":
      if (state.running === false && state.break > 60 && state.display === "Session") {
        return { ...state, break: state.break - 60 };
      } else if (state.running === false && state.break > 0 && state.display === "Break"){
        return { ...state, break: state.break - 60 , time: state.break - 60};
      } else {
        return { ...state}
      }
    default:
      return state;
}
};

const store = createStore(reducer);

// react
function Timer() {
  const dispatch = useDispatch();
  const time = useSelector(state => state.time);
  const sessionTime = useSelector(state => state.session);
  const breakTime = useSelector(state => state.break);
  const display = useSelector(state => state.display);
  const running = useSelector(state => state.running);
  const audio = document.getElementById("beep");

  useEffect(() => {
    let timerInterval;
    timerInterval = setInterval(() => {
      if (running ) {
        dispatch({ type: "TIME" });
      }}, 1000);
    return () => {
      clearInterval(timerInterval);
    };
  }, [running, dispatch]);

  useEffect(() => {
    if (time === 0) {
      audio.play().catch(error => {
        console.error("播放失敗", error);
      });
    }
  }, [time, audio]);

  const StartStop = () => {
    dispatch({ type: "START_STOP"});
  };

  const Reset = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    dispatch({ type: "RESET"});
  };

  const breakUp = () => {
    dispatch({ type: "BREAK_UP"});
  };
  const breakDown = () => {
    dispatch({ type: "BREAK_DOWN"});
  };
  const sessionUp = () => {
    dispatch({ type: "SESSION_UP"});
  };
  const sessionDown = () => {
    dispatch({ type: "SESSION_DOWN"});
  };
  
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");
  const formattedTime = `${formattedMinutes}:${formattedSeconds}`;
  const formattedSessionTime = Math.floor(sessionTime / 60);
  const formattedBreakTime = Math.floor(breakTime / 60);



  return (
    <div className="App">
      <h1>25 + 5 Clock</h1>
      <div className="top-controls">
        <div className="length-control">
          <div id="break-label">Break Length</div>
          <button onClick={breakUp} className="btn" id="break-increment">
            <i class="fa-solid fa-caret-up">
            </i>
          </button>
          <div id="break-length">{formattedBreakTime}</div>
          <button onClick={breakDown} className="btn" id="break-decrement">
            <i class="fa-solid fa-caret-down">
            </i>
          </button>
        </div>
        <div className="length-control">
          <div id="session-label">Session Length</div>
          <button onClick={sessionUp} className="btn" id="session-increment">
            <i class="fa-solid fa-caret-up">
            </i>
          </button>
          <div id="session-length">{formattedSessionTime}</div>
          <button onClick={sessionDown} className="btn" id="session-decrement">
            <i class="fa-solid fa-caret-down">
            </i>
          </button>
        </div>
      </div>
      <div className="bottom-controls">
        <div className="timer">
          <div id="timer-label">{display}</div>  
          <div id="time-left">{formattedTime}</div>
          <button onClick={StartStop} className="btn" id="start_stop">
            <i class="fa-solid fa-play"></i>
            <i class="fa-solid fa-pause"></i></button>
          <button onClick={Reset} className="btn" id="reset">
            <i class="fa-solid fa-rotate-right"></i>
          </button>
        </div>
      </div>
      <audio id="beep">
        <source src="/audio/sound.mp3" type="audio/mp3" />
      </audio>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Timer />
    </Provider>
  );
}

export default App;
