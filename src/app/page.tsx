'use client';

import { useState } from 'react';
import { ThemeSelector } from '@/components/ThemeSelector';
import { ChatInterface } from '@/components/ChatInterface';
import { QuestionAnalytics } from '@/components/QuestionAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Question, TopicInsight } from '@/types';
import { analyzeQuestions, categorizeQuestion } from '@/lib/questionAnalyzer';
import { MessageSquare, BarChart3, Brain } from 'lucide-react';

export default function Home() {
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentView, setCurrentView] = useState<'chat' | 'analytics'>('chat');
  const [provider, setProvider] = useState<'openai' | 'gemini'>('openai');

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    setQuestions([]); // Reset questions when theme changes
  };

  const handleQuestionSubmit = (questionContent: string) => {
    const analysis = categorizeQuestion(questionContent, selectedTheme);
    
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      content: questionContent,
      userId: 'student-1',
      timestamp: new Date(),
      theme: selectedTheme,
      category: analysis.category,
      difficulty: analysis.difficulty,
      concepts: analysis.concepts
    };

    setQuestions(prev => [...prev, newQuestion]);
  };

  const insights: TopicInsight[] = questions.length > 0 ? analyzeQuestions(questions) : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Student Chat Analytics</h1>
                <p className="text-muted-foreground">AI-powered learning insights for educators</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">AI Provider:</label>
                <select 
                  value={provider} 
                  onChange={(e) => setProvider(e.target.value as 'openai' | 'gemini')}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Gemini</option>
                </select>
              </div>
              <ThemeSelector
                selectedTheme={selectedTheme}
                onThemeChange={handleThemeChange}
              />
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={currentView === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('chat')}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </Button>
                <Button
                  variant={currentView === 'analytics' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('analytics')}
                  className="flex items-center gap-2"
                  disabled={questions.length === 0}
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics ({questions.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!selectedTheme ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-2">Welcome to Student Chat Analytics</CardTitle>
              <p className="text-muted-foreground text-lg">
                Select a learning theme to get started. Students can chat with AI, and you&apos;ll get insights
                on how to better introduce topics based on their questions.
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center">
                <ThemeSelector
                  selectedTheme={selectedTheme}
                  onThemeChange={handleThemeChange}
                />
              </div>
            </CardContent>
          </Card>
        ) : currentView === 'chat' ? (
          <div className="max-w-4xl mx-auto">
            <ChatInterface
              theme={selectedTheme}
              onQuestionSubmit={handleQuestionSubmit}
              provider={provider}
            />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">Learning Analytics Dashboard</h2>
              <p className="text-muted-foreground">
                Insights based on {questions.length} student questions about {selectedTheme}
              </p>
            </div>
            <QuestionAnalytics questions={questions} insights={insights} />
          </div>
        )}
      </main>
    </div>
  );
}
