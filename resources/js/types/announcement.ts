export type PublicAnnouncement = {
    id: number;
    recipient: string;
    sender: string;
    subject: string;
    body: string;
    signature: string;
    published_label: string | null;
};

export type DiscordStatus = 'not_sent' | 'sending' | 'sent' | 'failed';

export type ManagedAnnouncement = PublicAnnouncement & {
    is_published: boolean;
    author: string | null;
    discord_status: DiscordStatus;
    discord_error: string | null;
    discord_sent_label: string | null;
};