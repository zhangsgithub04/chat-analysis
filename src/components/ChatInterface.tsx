'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, ImagePlus, X } from 'lucide-react';
import { Message } from '@/types';

interface ChatInterfaceProps {
  theme: string;
  onQuestionSubmit: (question: string) => void;
  provider?: 'openai' | 'gemini';
}

export function ChatInterface({ theme, onQuestionSubmit, provider = 'openai' }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: input || 'Image uploaded',
      role: 'user',
      timestamp: new Date(),
      userId: 'student-1',
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Call the prop function to track the question
    onQuestionSubmit(input);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input || 'Analyze this image',
          theme,
          provider,
          image: selectedImage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
        userId: 'assistant'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
        userId: 'assistant'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
      removeImage();
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Chat Assistant - {theme} ({provider.toUpperCase()})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <ScrollArea className="flex-1 p-4 border rounded-lg max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Start asking questions about {theme} to begin your learning session!
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.image && (
                      <img 
                        src={message.image} 
                        alt="Uploaded" 
                        className="max-w-full h-auto rounded mb-2 max-h-48 object-contain"
                      />
                    )}
                    <div className="text-sm max-h-32 overflow-y-auto whitespace-pre-wrap">{message.content}</div>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground animate-pulse" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSubmit} className="space-y-2">
          {selectedImage && (
            <div className="relative inline-block">
              <img 
                src={selectedImage} 
                alt="Selected" 
                className="max-h-32 rounded border"
              />
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 p-0"
                onClick={removeImage}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask a question about ${theme}...`}
              className="min-h-[60px] resize-none flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={isLoading}
              >
                <ImagePlus className="w-4 h-4" />
              </Button>
              <Button type="submit" size="lg" disabled={isLoading || (!input.trim() && !selectedImage)}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

