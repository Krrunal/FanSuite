export const SAMPLE_TEXTS_LINE1 = [
    'I reviewed the creative brief and the revised timeline you submitted.',
    'The export files have finished processing and are ready for download.',
    'Could you confirm the color grade and lighting balance on shot 4?',
    'The client approved the initial storyboard and requested two small adjustments.',
    'I synced the audio tracks and resolved the background noise issue.',
    'Let me know if we need to adjust the delivery deadline for this batch.',
    'The high-resolution render is compiling on the staging workstation.',
    'We received the latest batch of camera raw footage from the shoot.',
];

export const SAMPLE_TEXTS_LINE2 = [
    'Let me know when you have 5 minutes so we can run through the final checklist together.',
    'Please inspect the artifacts around the edges and verify the audio sync before we publish.',
    'I uploaded the full sequence to the shared drive along with the original project files.',
    'Feel free to leave notes on any frame markers that still require color correction.',
    'We can schedule a quick review call once everyone wraps up their current milestones.',
    'Ping me as soon as you review the notes so we can finalize the handoff.',
];

export interface ChatItem {
    id: string;
    name: string;
    username: string;
    lastMessage: string;
    time: string;
    timestamp: number;
    unreadCount?: number;
}

export const BASE_CHATS: ChatItem[] = [
    { id: '1', name: 'Prakash Kumar', username: '@prakash123', lastMessage: 'Lorem ipsum dolor sit am...', time: '', timestamp: 0 },
    { id: '2', name: 'Sarah Jenkins', username: '@s_jenkins', lastMessage: 'Lorem ipsum dolor sit am...', time: '', timestamp: 0 },
    { id: '3', name: 'Alex Rivera', username: '@arivera', lastMessage: 'No messages yet', time: '', timestamp: 0 },
    { id: '4', name: 'Elena Rostova', username: '@elena_r', lastMessage: 'No messages yet', time: '', timestamp: 0 },
    { id: '5', name: 'Marcus Chen', username: '@mchen_dev', lastMessage: 'No messages yet', time: '', timestamp: 0 },
    { id: '6', name: 'Devon Vance', username: '@dvance', lastMessage: 'No messages yet', time: '', timestamp: 0 },
    { id: '7', name: 'Clara Oswald', username: '@clara_o', lastMessage: 'No messages yet', time: '', timestamp: 0 },
    { id: '8', name: 'Liam Gallagher', username: '@liam_g', lastMessage: 'No messages yet', time: '', timestamp: 0 },
    { id: '9', name: 'Zack Taylor', username: '@ztaylor', lastMessage: 'No messages yet', time: '', timestamp: 0 },
    { id: '10', name: 'Aaliyah Khan', username: '@akhan', lastMessage: 'No messages yet', time: '', timestamp: 0 },
    { id: '11', name: 'Noah Miller', username: '@nmiller', lastMessage: 'No messages yet', time: '', timestamp: 0 },
    { id: '12', name: 'Sophia Loren', username: '@sloren', lastMessage: 'No messages yet', time: '', timestamp: 0 },
];