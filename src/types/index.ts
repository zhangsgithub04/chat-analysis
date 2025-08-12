export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  userId: string;
  image?: string;
}

export interface Question {
  id: string;
  content: string;
  userId: string;
  timestamp: Date;
  theme: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  concepts?: string[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  joinedAt: Date;
}

export interface ChatSession {
  id: string;
  studentId: string;
  theme: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TopicInsight {
  concept: string;
  frequency: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  commonQuestions: string[];
  suggestedIntroduction: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  concepts: string[];
  color: string;
}