'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Theme } from '@/types';

interface ThemeSelectorProps {
  themes?: Theme[];
  selectedTheme?: string;
  onThemeChange: (themeId: string) => void;
}

const defaultThemes: Theme[] = [
  {
    id: 'pure-math',
    name: 'Pure Mathematics',
    description: 'Algebra, Calculus, Number Theory, Abstract Algebra',
    concepts: ['algebra', 'calculus', 'linear-algebra', 'number-theory', 'abstract-algebra'],
    color: '#3b82f6'
  },
  {
    id: 'applied-math',
    name: 'Applied Mathematics',
    description: 'Statistics, Probability, Discrete Math, Operations Research',
    concepts: ['statistics', 'probability', 'discrete-math', 'optimization'],
    color: '#10b981'
  },
  {
    id: 'physics',
    name: 'Physics',
    description: 'Classical Mechanics, Thermodynamics, Quantum Physics',
    concepts: ['mechanics', 'thermodynamics', 'electromagnetism', 'quantum-physics'],
    color: '#8b5cf6'
  },
  {
    id: 'quantum-computing',
    name: 'Quantum Computing',
    description: 'Qubits, Quantum Gates, Algorithms, Error Correction',
    concepts: ['qubits', 'quantum-gates', 'superposition', 'entanglement', 'quantum-algorithms'],
    color: '#f59e0b'
  }
];

export function ThemeSelector({ themes = defaultThemes, selectedTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="w-full max-w-sm">
      <label htmlFor="theme-select" className="block text-sm font-medium mb-2">
        Select Learning Theme
      </label>
      <Select value={selectedTheme} onValueChange={onThemeChange}>
        <SelectTrigger id="theme-select">
          <SelectValue placeholder="Choose a theme" />
        </SelectTrigger>
        <SelectContent>
          {themes.map((theme) => (
            <SelectItem key={theme.id} value={theme.id}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: theme.color }}
                />
                <div>
                  <div className="font-medium">{theme.name}</div>
                  <div className="text-sm text-muted-foreground">{theme.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}