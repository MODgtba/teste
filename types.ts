export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  channelAvatarUrl: string;
  views: string;
  uploadedAt: string;
  duration: string;
  description?: string;
  category?: string;
}

export interface Comment {
  id: string;
  author: string;
  avatarUrl: string;
  content: string;
  likes: number;
  timeAgo: string;
}

export interface VideoDetail extends Video {
  subscribers: string;
  likes: string;
  comments: Comment[];
}

export type Category = 'All' | 'Gaming' | 'Music' | 'Live' | 'Computers' | 'Programming' | 'AI' | 'News' | 'Podcasts';
