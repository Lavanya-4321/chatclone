import "./ChatWindow.css";
import { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
    const { prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat, prevChats } =
        useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const getReply = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setNewChat(false);

        try {
            const res = await fetch("http://localhost:8080/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: prompt, threadId: currThreadId }),
            });
            const data = await res.json();
            setReply(data.reply);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (prompt && reply) {
            setPrevChats((prev) => [
                ...prev,
                { role: "user", content: prompt },
                { role: "assistant", content: reply },
            ]);
        }
        setPrompt("");
    }, [reply]);

    const handleProfileClick = () => setIsOpen(!isOpen);

    const renderMessage = (text) => {
        const codeBlock = text.match(/```([\s\S]*?)```/);
        if (codeBlock) {
            const code = codeBlock[1];
            const before = text.split("```")[0];
            const after = text.split("```")[2];
            return (
                <div>
                    {before && <p>{before}</p>}
                    <pre className="codeBlock"><code>{code}</code></pre>
                    {after && <p>{after}</p>}
                </div>
            );
        }
        return text.split("\n").map((line, i) => <p key={i}>{line}</p>);
    };

    return (
        <div className="chatWindow">
            <div className="navbar">
                <span className="brand">SigmaGPT <i className="fa-solid fa-chevron-down"></i></span>
                <div className="userIconDiv" onClick={handleProfileClick}>
                    <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                </div>
            </div>

            {isOpen && (
                <div className="dropDown">
                    <div className="dropDownItem"><i className="fa-solid fa-gear"></i> Settings</div>
                    <div className="dropDownItem"><i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan</div>
                    <div className="dropDownItem"><i className="fa-solid fa-arrow-right-from-bracket"></i> Log out</div>
                </div>
            )}

            <div className="chatMessagesContainer">
                {prevChats.length === 0 && <div className="info">Start chatting...</div>}
                {prevChats.map((msg, idx) => (
                    <div
                        key={idx}
                        className={msg.role === "user" ? "userMessage" : "assistantMessage"}
                    >
                        <strong>{msg.role === "user" ? "You:" : "SigmaGPT:"}</strong>
                        <div className="messageContent">{renderMessage(msg.content)}</div>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="loaderWrapper">
                    <ScaleLoader color="#fff" loading={loading} />
                </div>
            )}

            <div className="chatInput">
                <div className="inputBox">
                    <input
                        placeholder="Ask anything..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && getReply()}
                    />
                    <div id="submit" onClick={getReply}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </div>
                </div>
                <p className="info">
                    SigmaGPT can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;
