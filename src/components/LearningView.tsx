import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Terminal,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';
import { LearningCourse, LearningLesson, QuizQuestion } from '../types';
import { LEARNING_COURSES } from '../data/learningData';

interface LearningViewProps {
  language: 'auto' | 'en' | 'bn';
}

export const LearningView: React.FC<LearningViewProps> = ({ language }) => {
  const isBengali = language === 'bn';

  const [courses, setCourses] = useState<LearningCourse[]>(LEARNING_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<LearningCourse>(courses[0]);
  const [selectedLesson, setSelectedLesson] = useState<LearningLesson>(courses[0].lessons[0]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const handleSelectLesson = (course: LearningCourse, lesson: LearningLesson) => {
    setSelectedCourse(course);
    setSelectedLesson(lesson);
    setSelectedAnswers({});
    setShowQuizResults(false);
    setShowSolution(false);
  };

  const handleMarkComplete = (lessonId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCourse.id) return c;
        const exists = c.completedLessonIds.includes(lessonId);
        const updated = exists
          ? c.completedLessonIds.filter((id) => id !== lessonId)
          : [...c.completedLessonIds, lessonId];
        return { ...c, completedLessonIds: updated };
      })
    );
  };

  const isCompleted = selectedCourse.completedLessonIds.includes(selectedLesson.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-pink-400" />
            {isBengali ? 'সাইবার সিকিউরিটি লার্নিং সেন্টার' : 'Cybersecurity Learning Academy'}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isBengali
              ? 'স্টেপ-বাই-স্টেপ শিক্ষণীয় পাঠ, কুইজ এবং নিরাপদ ল্যাব অনুশীলন।'
              : 'Interactive cybersecurity modules, protocol mechanics, defensive guides, and quizzes.'}
          </p>
        </div>
      </div>

      {/* Course Cards Ribbon */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {courses.map((course) => {
          const isSelected = selectedCourse.id === course.id;
          return (
            <button
              key={course.id}
              onClick={() => handleSelectLesson(course, course.lessons[0])}
              className={`p-3 rounded-xl border text-left whitespace-nowrap transition-all flex items-center gap-2.5 shrink-0 ${
                isSelected
                  ? 'bg-pink-500/15 border-pink-500 text-pink-300 shadow-md'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-pink-400 shrink-0" />
              <div>
                <div className="font-bold text-xs">{isBengali ? course.titleBn : course.title}</div>
                <div className="text-[10px] text-zinc-500">
                  {course.category} · {course.level}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Lesson View */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-xl">
        {/* Lesson Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/30 uppercase">
                {selectedLesson.level}
              </span>
              <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {selectedLesson.readTimeMin} min read
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 mt-1">
              {isBengali && selectedLesson.titleBn ? selectedLesson.titleBn : selectedLesson.title}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isBengali && selectedLesson.summaryBn ? selectedLesson.summaryBn : selectedLesson.summary}
            </p>
          </div>

          <button
            onClick={() => handleMarkComplete(selectedLesson.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isCompleted ? (isBengali ? 'সম্পন্ন হয়েছে' : 'Completed') : isBengali ? 'সম্পন্ন হিসেবে চিহ্নিত করুন' : 'Mark as Done'}</span>
          </button>
        </div>

        {/* Content Body (English & Bengali) */}
        <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
          <div className="whitespace-pre-line bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
            {selectedLesson.content}
          </div>

          {selectedLesson.contentBn && (
            <div className="p-4 rounded-xl bg-pink-950/10 border border-pink-500/20 text-xs text-pink-200/90 whitespace-pre-line">
              <div className="font-bold text-pink-400 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                বাংলা সারসংক্ষেপ ও ব্যাখ্যা:
              </div>
              {selectedLesson.contentBn}
            </div>
          )}
        </div>

        {/* Command Examples */}
        {selectedLesson.commandExamples.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block">
              {isBengali ? 'ব্যবহারিক কমান্ড উদাহরণ:' : 'Practical Command Examples:'}
            </span>
            <div className="space-y-2">
              {selectedLesson.commandExamples.map((ex, i) => (
                <div key={i} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="text-xs text-zinc-400">
                    {isBengali && ex.descriptionBn ? ex.descriptionBn : ex.description}
                  </div>
                  <code className="text-xs font-mono text-cyan-300 block bg-zinc-900 p-2 rounded">
                    {ex.command}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Quiz */}
        {selectedLesson.quiz.length > 0 && (
          <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                {isBengali ? 'জ্ঞাতব্য কুইজ যাচাই:' : 'Knowledge Check Quiz:'}
              </span>
            </div>

            {selectedLesson.quiz.map((q, qIndex) => {
              const selectedOpt = selectedAnswers[qIndex];
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div key={qIndex} className="space-y-2 text-xs">
                  <p className="font-semibold text-zinc-200">
                    {qIndex + 1}. {isBengali && q.questionBn ? q.questionBn : q.question}
                  </p>
                  <div className="space-y-1.5">
                    {q.options.map((opt, optIndex) => {
                      let style = 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800';
                      if (showQuizResults) {
                        if (optIndex === q.correctIndex) {
                          style = 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold';
                        } else if (selectedOpt === optIndex) {
                          style = 'bg-red-950/40 border-red-500 text-red-300';
                        }
                      } else if (selectedOpt === optIndex) {
                        style = 'bg-pink-500/20 border-pink-500 text-pink-300 font-semibold';
                      }

                      return (
                        <button
                          key={optIndex}
                          onClick={() => {
                            if (!showQuizResults) {
                              setSelectedAnswers({ ...selectedAnswers, [qIndex]: optIndex });
                            }
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between ${style}`}
                        >
                          <span>{opt}</span>
                          {showQuizResults && optIndex === q.correctIndex && (
                            <Check className="w-4 h-4 text-emerald-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {showQuizResults && (
                    <div className="p-3 rounded-lg bg-zinc-900 text-[11px] text-zinc-300 border border-zinc-800 mt-2">
                      <strong className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                        {isCorrect ? (isBengali ? 'সঠিক উত্তর!' : 'Correct!') : isBengali ? 'ভুল উত্তর' : 'Incorrect.'}{' '}
                      </strong>
                      {isBengali && q.explanationBn ? q.explanationBn : q.explanation}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowQuizResults(!showQuizResults)}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-semibold"
              >
                {showQuizResults ? (isBengali ? 'কুইজ পুনরায় দিন' : 'Retry Quiz') : isBengali ? 'উত্তর যাচাই করুন' : 'Verify Answers'}
              </button>
            </div>
          </div>
        )}

        {/* Safe Exercise & Solution */}
        {selectedLesson.safeExercise && (
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
            <span className="font-semibold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Terminal className="w-3.5 h-3.5" />
              {isBengali ? 'নিরাপদ হ্যান্ডস-অন অনুশীলন:' : 'Safe Hands-On Exercise:'}
            </span>
            <p className="text-zinc-300">
              {isBengali && selectedLesson.safeExercise.objectiveBn
                ? selectedLesson.safeExercise.objectiveBn
                : selectedLesson.safeExercise.objective}
            </p>
            <p className="text-zinc-500 italic">Hint: {selectedLesson.safeExercise.hint}</p>

            <div className="pt-2">
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="text-xs text-cyan-400 hover:underline"
              >
                {showSolution ? (isBengali ? 'সমাধান লুকান' : 'Hide Solution') : isBengali ? 'সমাধান দেখুন' : 'Show Solution'}
              </button>
              {showSolution && (
                <code className="text-xs font-mono text-emerald-300 block bg-zinc-900 p-2 rounded mt-2 border border-zinc-800">
                  {selectedLesson.safeExercise.solution}
                </code>
              )}
            </div>
          </div>
        )}

        {/* Glossary Terms */}
        {selectedLesson.glossary.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              {isBengali ? 'গুরুত্বপূর্ণ পরিভাষা (Glossary):' : 'Key Cybersecurity Terms:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedLesson.glossary.map((term, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
                  <span className="font-bold text-pink-400 block mb-0.5">{term.term}</span>
                  <span className="text-zinc-400 leading-snug">{term.definition}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
