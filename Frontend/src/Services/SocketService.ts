import { Socket, io } from "socket.io-client";
import MessageModel from "../Models/MessageModel";

class SocketService {

    private socket: Socket;

    public connect(gotMessage: Function): void {
        // 2. Client connects to socket.io server:
        this.socket = io("http://localhost:4000");

        // 6. Listen to server messages: 
        this.socket.on("msg-from-server", (message: MessageModel) => {
            gotMessage(message);
        });
    }

    public send(message: MessageModel): void {
        // 3. Client send message to server:
        this.socket?.emit("msg-from-client", message);
    }

    public disconnect(): void {
        // 8. Client disconnect from server:
        this.socket.disconnect();
    }

}

const socketService = new SocketService(); // Singleton

export default socketService;
