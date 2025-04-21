import { useState } from 'react';
import { analyzeAnswer } from '../../utils/nlpProcessor';
import RetortGenerator from './RetortGenerator';
import ProgressBar from '../ui/ProgressBar';

const QuestionController = ({ session, setSession }) => {
  const [currentAnswer, setCurrentAnswer] = useState('');

  const handleAnswer = async () => {
    if (!currentAnswer.trim()) return;

    try {
      const analysis = analyzeAnswer(
        currentAnswer,
        session.questions[session.currentQuestion]
      );

      const nextQuestion = await RetortGenerator.generate(
        currentAnswer,
        analysis,
        session
      );

      setSession(prev => ({
        ...prev,
        userAnswers: [...prev.userAnswers, currentAnswer],
        questions: nextQuestion ? 
          [...prev.questions, { 
            text: nextQuestion,
            isFollowUp: true 
          }] : prev.questions,
        currentQuestion: prev.currentQuestion + 1
      }));

      setCurrentAnswer('');

    } catch (error) {
      console.error('Erro ao processar resposta:', error);
    }
  };

  return (
    <div className="interview-container">
      <ProgressBar 
        current={session.currentQuestion + 1} 
        total={session.questions.length} 
      />
      
      <div className="question-card">
        <h3>{session.questions[session.currentQuestion]?.text}</h3>
        
        <textarea
          autoFocus
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAnswer()}
          placeholder="Digite sua resposta..."
        />
        
        <button 
          onClick={handleAnswer}
          disabled={!currentAnswer.trim()}
        >
          {session.currentQuestion < session.questions.length - 1 ? 
            'Próxima Pergunta' : 'Finalizar Entrevista'}
        </button>
      </div>
    </div>
  );
};

export default QuestionController;