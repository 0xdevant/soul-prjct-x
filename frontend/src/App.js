//import logo from './logo.svg';
import { useContext } from "react";
import "./App.css";
import Alert from "./components/Alert";
import Intro from "./components/Intro";
import Socials from "./components/Socials";
import Team from "./components/Team";
import Video from "./components/Video";
import { Web3Context } from "./components/Web3Context";

function App() {
  const {
    ethers,
    provider,
    contract,
    account,
    alert,
    alertType,
    _connectWallet,
    _dismissError,
    _resetState,
  } = useContext(Web3Context);

  return (
    <div className="App bg-black text-white pb-8">
      {alert && (
        <Alert type={alertType} message={alert} dismiss={_dismissError} />
      )}
      <Intro />
      <Video />
      <Team />
      <Socials />
    </div>
  );
}

export default App;
