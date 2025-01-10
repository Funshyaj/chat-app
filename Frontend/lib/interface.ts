export interface User {
    id: string;
    name: string;
    email: string;
    number: string;
    online: boolean;
    unread?: string | number
}

export interface Chat {
    text: string
    receiver_id?: string
    sender_id?: string
    sender_name?: string
    receiver_name?: string
    time: string;

}

// Chat history is an object that 
export type ChatSessions = {
    [chatId: string]: Chat[];
}

export type sessionWallpapers = {
    [chatId: string]: string | ArrayBuffer | null
}