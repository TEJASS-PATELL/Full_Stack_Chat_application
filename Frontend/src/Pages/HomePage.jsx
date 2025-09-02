import { useChatStore } from "../Store/useChatStore";
import Sidebar from "../Components/Sidebar.jsx";
import NoChatSelected from "../Components/NoChatSelected.jsx";
import ChatContainer from "../Components/ChatContainer.jsx";
import "../styles/HomePage.css"; 

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <>
    <div className="home-container">
      <div className="chat-box">
        <Sidebar />
        <div className="chat-content">
          {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
        </div>
      </div>
    </div>
    </>
  );
};

export default HomePage;
