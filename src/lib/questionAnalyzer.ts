import { Question, TopicInsight } from '@/types';

export function analyzeQuestions(questions: Question[]): TopicInsight[] {
  const conceptMap = new Map<string, {
    questions: Question[];
    frequency: number;
  }>();

  questions.forEach(question => {
    if (question.concepts) {
      question.concepts.forEach(concept => {
        if (!conceptMap.has(concept)) {
          conceptMap.set(concept, { questions: [], frequency: 0 });
        }
        conceptMap.get(concept)!.questions.push(question);
        conceptMap.get(concept)!.frequency++;
      });
    }
  });

  return Array.from(conceptMap.entries())
    .map(([concept, data]) => {
      const difficulties = data.questions.map(q => q.difficulty || 'beginner');
      const primaryDifficulty = getMostFrequent(difficulties) as 'beginner' | 'intermediate' | 'advanced';
      
      const commonQuestions = data.questions
        .slice(0, 3)
        .map(q => q.content);

      return {
        concept: formatConcept(concept),
        frequency: data.frequency,
        difficulty: primaryDifficulty,
        commonQuestions,
        suggestedIntroduction: generateIntroductionSuggestion(concept, primaryDifficulty, data.frequency)
      };
    })
    .sort((a, b) => b.frequency - a.frequency);
}

export function categorizeQuestion(question: string, theme: string): {
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  concepts: string[];
} {
  const questionLower = question.toLowerCase();
  
  let category = 'General';
  let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  const concepts: string[] = [];

  if (theme === 'pure-math') {
    if (questionLower.includes('derivative') || questionLower.includes('integral')) {
      category = 'Calculus';
      concepts.push('calculus');
      if (questionLower.includes('partial') || questionLower.includes('multiple')) {
        difficulty = 'advanced';
      } else if (questionLower.includes('chain rule') || questionLower.includes('substitution')) {
        difficulty = 'intermediate';
      }
    } else if (questionLower.includes('matrix') || questionLower.includes('vector')) {
      category = 'Linear Algebra';
      concepts.push('linear-algebra');
      if (questionLower.includes('eigenvalue') || questionLower.includes('determinant')) {
        difficulty = 'advanced';
      } else if (questionLower.includes('multiply') || questionLower.includes('inverse')) {
        difficulty = 'intermediate';
      }
    } else if (questionLower.includes('equation') || questionLower.includes('solve')) {
      category = 'Algebra';
      concepts.push('algebra');
      if (questionLower.includes('quadratic') || questionLower.includes('polynomial')) {
        difficulty = 'intermediate';
      }
    } else if (questionLower.includes('prime') || questionLower.includes('divisible')) {
      category = 'Number Theory';
      concepts.push('number-theory');
      if (questionLower.includes('theorem') || questionLower.includes('proof')) {
        difficulty = 'advanced';
      }
    }
  } else if (theme === 'quantum-computing') {
    if (questionLower.includes('qubit') || questionLower.includes('quantum bit')) {
      category = 'Qubits';
      concepts.push('qubits');
      if (questionLower.includes('superposition') || questionLower.includes('entanglement')) {
        difficulty = 'intermediate';
      }
    } else if (questionLower.includes('gate') || questionLower.includes('circuit')) {
      category = 'Quantum Gates';
      concepts.push('quantum-gates');
      if (questionLower.includes('cnot') || questionLower.includes('hadamard')) {
        difficulty = 'intermediate';
      }
    } else if (questionLower.includes('algorithm') || questionLower.includes('shor') || questionLower.includes('grover')) {
      category = 'Quantum Algorithms';
      concepts.push('quantum-algorithms');
      difficulty = 'advanced';
    } else if (questionLower.includes('superposition')) {
      category = 'Superposition';
      concepts.push('superposition');
      difficulty = 'intermediate';
    } else if (questionLower.includes('entanglement')) {
      category = 'Entanglement';
      concepts.push('entanglement');
      difficulty = 'intermediate';
    } else if (questionLower.includes('error') || questionLower.includes('correction')) {
      category = 'Error Correction';
      concepts.push('error-correction');
      difficulty = 'advanced';
    }
  } else if (theme === 'applied-math') {
    if (questionLower.includes('probability') || questionLower.includes('random')) {
      category = 'Probability';
      concepts.push('probability');
      if (questionLower.includes('distribution') || questionLower.includes('bayesian')) {
        difficulty = 'advanced';
      }
    } else if (questionLower.includes('statistics') || questionLower.includes('mean') || questionLower.includes('median')) {
      category = 'Statistics';
      concepts.push('statistics');
      if (questionLower.includes('regression') || questionLower.includes('hypothesis')) {
        difficulty = 'intermediate';
      }
    }
  }

  // Determine difficulty based on keywords
  if (questionLower.includes('prove') || questionLower.includes('theorem') || questionLower.includes('abstract')) {
    difficulty = 'advanced';
  } else if (questionLower.includes('why') || questionLower.includes('explain') || questionLower.includes('derive')) {
    difficulty = 'intermediate';
  } else if (questionLower.includes('what') || questionLower.includes('define') || questionLower.includes('basic')) {
    difficulty = 'beginner';
  }

  return { category, difficulty, concepts };
}

function getMostFrequent<T>(items: T[]): T {
  const counts = new Map<T, number>();
  items.forEach(item => counts.set(item, (counts.get(item) || 0) + 1));
  
  let maxCount = 0;
  let mostFrequent = items[0];
  
  counts.forEach((count, item) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = item;
    }
  });
  
  return mostFrequent;
}

function formatConcept(concept: string): string {
  return concept
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateIntroductionSuggestion(concept: string, difficulty: string, frequency: number): string {
  const baseIntros = {
    'calculus': {
      beginner: 'Start with the concept of limits and rates of change. Use visual examples like velocity and slopes.',
      intermediate: 'Build on derivatives by exploring the fundamental theorem of calculus and integration techniques.',
      advanced: 'Introduce multivariable calculus concepts and advanced integration methods like Green\'s theorem.'
    },
    'algebra': {
      beginner: 'Begin with basic equation solving and variable manipulation using concrete examples.',
      intermediate: 'Introduce polynomial operations and factoring with real-world applications.',
      advanced: 'Explore abstract algebraic structures and advanced equation solving techniques.'
    },
    'linear-algebra': {
      beginner: 'Start with vectors as arrows in 2D/3D space and basic vector operations.',
      intermediate: 'Introduce matrices as transformations and explore matrix operations.',
      advanced: 'Cover eigenvalues, eigenvectors, and advanced matrix decomposition techniques.'
    },
    'probability': {
      beginner: 'Use simple examples like coin flips and dice rolls to introduce basic probability.',
      intermediate: 'Explore conditional probability and introduce common probability distributions.',
      advanced: 'Cover advanced topics like Bayesian inference and stochastic processes.'
    },
    'statistics': {
      beginner: 'Start with descriptive statistics using real datasets and visualizations.',
      intermediate: 'Introduce hypothesis testing and confidence intervals with practical examples.',
      advanced: 'Cover advanced statistical modeling and machine learning concepts.'
    },
    'qubits': {
      beginner: 'Start with classical bits vs quantum bits, introducing the concept of superposition with simple analogies.',
      intermediate: 'Explore qubit states using Bloch sphere representation and basic quantum measurements.',
      advanced: 'Cover multi-qubit systems, quantum state manipulation, and decoherence effects.'
    },
    'quantum-gates': {
      beginner: 'Introduce basic single-qubit gates (X, Y, Z, H) using circuit diagrams and simple operations.',
      intermediate: 'Cover two-qubit gates like CNOT and explore how gates create quantum circuits.',
      advanced: 'Discuss universal gate sets, gate decomposition, and quantum circuit optimization.'
    },
    'superposition': {
      beginner: 'Use analogies like spinning coins to explain quantum superposition concepts.',
      intermediate: 'Introduce mathematical formalism with |0⟩ + |1⟩ states and measurement probabilities.',
      advanced: 'Cover superposition in multi-qubit systems and interference effects.'
    },
    'entanglement': {
      beginner: 'Explain quantum entanglement using simple two-particle examples and correlations.',
      intermediate: 'Introduce Bell states and explore non-local correlations in quantum systems.',
      advanced: 'Cover entanglement measures, quantum teleportation, and applications in quantum protocols.'
    },
    'quantum-algorithms': {
      beginner: 'Start with simple quantum algorithms like Deutsch\'s algorithm to show quantum advantage.',
      intermediate: 'Introduce Grover\'s search algorithm and its quadratic speedup over classical search.',
      advanced: 'Cover Shor\'s factoring algorithm, quantum Fourier transform, and complexity theory implications.'
    }
  };

  const conceptKey = concept.toLowerCase().replace(' ', '-');
  const intro = baseIntros[conceptKey as keyof typeof baseIntros]?.[difficulty as keyof typeof baseIntros['calculus']];
  
  if (intro) {
    const frequencyNote = frequency > 10 ? ' This topic appears frequently in student questions, so consider dedicating extra time to it.' :
                         frequency > 5 ? ' Students show moderate interest in this topic.' :
                         ' This topic comes up occasionally - consider it as an advanced or optional topic.';
    return intro + frequencyNote;
  }

  return `Based on ${frequency} student questions, consider introducing ${concept} with ${difficulty}-level explanations and plenty of examples.`;
}