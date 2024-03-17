import React, { useState } from "react";
import { useForm } from "react-hook-form";
import MessageModel from "../../../Models/MessageModel";
import maleAvatar from "../../../Assets/MaleAvatar.png";
import femaleAvatar from "../../../Assets/FemaleAvatar.png";
import socketService from "../../../Services/SocketService";
import "./Chat.css";

function Chat(): JSX.Element {
    const { register, handleSubmit, formState: { errors } } = useForm<MessageModel>();
    const [messages, setMessages] = useState<MessageModel[]>([]);
    const [nickname, setNickname] = useState<string>("");
    const [gender, setGender] = useState<string>("");
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    // Function to handle nickname change
    const handleNicknameChange = (newNickname: string): void => {
        // Clear the error when the nickname changes
        if (newNickname.toLowerCase() !== 'system') {
            setError("");
        }
        // Update the nickname state
        setNickname(newNickname);
    };

    function connect(): void {
        // Check if the nickname is not "System"
        if (nickname.toLowerCase() === 'system') {
            // Show an error message
            setError("Nickname cannot be 'System'. Please choose a different nickname.");
            return;
        }

        // Check if the nickname is not "System"
        if (nickname.length > 15 || nickname.length < 3) {
            // Show an error message
            setError("Nickname must be between 3 and 15 characters long.");
            return;
        }

        // Check if the nickname is not "System"
        if (!gender) {
            // Show an error message
            setError("Please select a gender.");
            return;
        }

        socketService.connect((message: MessageModel) => {
            setMessages(arr => [...arr, message]);
        });

        // Send a system message when a user connects
        const systemMessage: MessageModel = {
            nickname: 'System',
            gender: 'other',
            text: `${nickname} has connected to the chat`,
        };

        socketService.send(systemMessage);
        setMessages(arr => [...arr]);
        setIsConnected(true);
        setError(""); // Clear any previous error messages
    }

    function sendMessage(message: MessageModel): void {
        socketService.send({ ...message, nickname, gender });
        
        // Clear the text input
        const textInput = document.querySelector(".textInput") as HTMLInputElement;
        textInput.value = "";
    
        // Scroll down to the validation message
        const validationMessage = document.querySelector(".validationMessage");
        validationMessage?.scrollIntoView({ behavior: "smooth" });
    }

    function disconnect(): void {
        // Send a system message when a user disconnects
        const disconnectMessage: MessageModel = {
            nickname: "System",
            gender: "other",
            text: `${nickname} has disconnected from the chat`,
        };

        // Send the disconnect message
        socketService.send(disconnectMessage);

        // Disconnect the user
        socketService.disconnect();

        // Set isConnected to false
        setIsConnected(false);
    }

    return (
        <div className="Chat">
            <div className="Navbar">
                <h1>Dialogic</h1>
                <button
                    onClick={connect}
                    disabled={isConnected}
                    className="connectButton"
                >
                    Connect
                </button>
                <button
                    onClick={disconnect}
                    disabled={!isConnected}
                    className="disconnectButton"
                >
                    Disconnect
                </button>
                <br />
                <div className="connectForm">
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(sendMessage)(e); }}>
                        <div>
                            <label>Nickname:</label>&nbsp;
                            <input
                                type="text"
                                disabled={isConnected}
                                placeholder="Enter your nickname"
                                {...register("nickname")}
                                required
                                onChange={(e) => handleNicknameChange(e.target.value)}
                            />
                            <label>Gender:</label>&nbsp;
                            <select disabled={isConnected} {...register("gender")} onChange={(e) => setGender(e.target.value)} value={gender} required>
                                <option value="" disabled>
                                    Select Gender
                                </option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </form>
                </div>
            </div>
            <section>
                <span className="validationMessage">
                    {error && `${error} `}
                </span>
                {messages.map((m, idx) => (
                    <div
                        key={idx}
                        className={m.nickname === "System" ? "systemMessage" : m.nickname === nickname ? "currentUser" : "otherUser"}
                        style={{
                            color: "white",
                            backgroundColor:
                                m.nickname === "System" && m.text.includes("disconnected") ? "red" :
                                    m.nickname === "System" && m.text.includes("connected") ? "#3498db" :
                                        "transparent",
                        }}
                    >
                        {m.gender === "male" && <img src={maleAvatar} alt="Male Avatar" />}
                        {m.gender === "female" && <img src={femaleAvatar} alt="Female Avatar" />}
                        &nbsp;<span className="nicknameSpan">{m.nickname !== "System" ? `${m.nickname}:` : ""}</span>&nbsp;
                        <span className="textSpan">{m.text}</span>
                    </div>
                ))}
            </section>
            <form onSubmit={handleSubmit(sendMessage)}>
                <div>
                    <input
                        type="text"
                        className="textInput"
                        disabled={!isConnected}
                        placeholder={isConnected ? "Please write your message here" : "Have to be connected to write"}
                        {...register("text", { maxLength: 1000 })}
                        required
                    />
                    &nbsp;<button disabled={!isConnected} className="sendButton">Send</button>
                </div>
                {errors.text?.type === "maxLength" && (
                    <span className="validationMessage">Message must be under 1000 characters.</span>
                )}
            </form>
        </div>
    );
}

export default Chat;
