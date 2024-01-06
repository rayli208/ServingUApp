export class Message {
    channelId: string;
    to: string;
    type: string;
    content: {
        text: string;
    }
}