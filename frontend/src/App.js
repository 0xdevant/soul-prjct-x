//import logo from './logo.svg';
import "./App.css";
import Intro from "./components/Intro";
import Socials from "./components/Socials";
import Team from "./components/Team";
import Video from "./components/Video";

function App() {
  return (
    <div className="App bg-black text-white pb-8">
      <Intro />
      <Video />
      <Team />
      <Socials />
    </div>
  );
}

export default App;
