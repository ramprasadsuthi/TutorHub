import React, { useState, useEffect } from "react";
import { Sparkles, Send, Brain, AlertCircle, BookOpen, ChevronRight, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { Course, QuizQuestion } from "../types";

interface AiStudyAssistantProps {
  currentCourse?: Course;
}

export default function AiStudyAssistant({ currentCourse }: AiStudyAssistantProps) {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: currentCourse 
        ? `Hello! I am your AI Study Companion for "${currentCourse.title}". How can I support your study today? Feel free to ask technical concepts or generate a practice test.`
        : "Hello! I am your TutorHub Study Companion. Select a course or describe a topic, and I will help break down complex subjects or generate customized practice questions."
    }
  ]);
  const [input, setInput] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(false);

  // Quiz generator state
  const [quizTopic, setQuizTopic] = useState(currentCourse ? currentCourse.title : "Data Structures");
  const [quizLength, setQuizLength] = useState(3);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizError, setQuizError] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: "user" as const, text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoadingMsg(true);

    try {
      const response = await fetch("/api/gemini/study-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ text: m.text, role: m.sender === "user" ? "user" : "model" })),
          currentCourse: currentCourse?.title
        })
      });

      if (!response.ok) throw new Error("Assistant is adjusting algorithms. Try again soon.");
      const data = await response.json();
      setMessages((prev) => [...prev, { sender: "ai", text: data.text }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Offline model activated: The study assistant is currently running in local fallback. Please ensure your GEMINI_API_KEY is configured in the Secrets panel to enable real-time interactive answers.`
        }
      ]);
    } finally {
      setLoadingMsg(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setLoadingQuiz(true);
    setQuizError("");
    setGeneratedQuiz([]);
    setUserAnswers({});
    setQuizSubmitted(false);

    try {
      const response = await fetch("/api/gemini/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: quizTopic,
          numberOfQuestions: quizLength
        })
      });

      if (!response.ok) throw new Error("Could not construct custom quiz questions.");
      const data = await response.json();
      setGeneratedQuiz(data);
    } catch (err: any) {
      setQuizError(err.message || "An unexpected error occurred");
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSelectAnswer = (qId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optionIndex }));
  };

  const calculateQuizScore = () => {
    let score = 0;
    generatedQuiz.forEach((q) => {
      if (userAnswers[q.id] === q.correctOptionIndex) {
        score++;
      }
    });
    return score;
  };

  return (
    <div id="ai-study-assistant-wrapper" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Interactive AI Chat */}
      <div className="bg-white border border-slate-100 rounded-2xl flex flex-col h-[550px] shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500 p-1.5 rounded-lg">
              <Brain size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm">AI Study Companion</h3>
              <p className="text-3xs text-indigo-200">Active Course: {currentCourse ? currentCourse.title : "General Chat"}</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-3xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-bold">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
            GEMINI FLASH 3.5
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-slate-900 text-white rounded-br-none"
                    : "bg-slate-50 text-slate-800 border border-slate-100 rounded-bl-none"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loadingMsg && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-none p-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2">
          <input
            type="text"
            placeholder="Ask anything (e.g., Explain options pricing in basic English...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* AI Practice Quiz Generator */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[550px] overflow-y-auto">
        <div>
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <Sparkles size={20} className="text-indigo-600" />
            <h3 className="text-lg font-bold">Dynamic Quiz Engine</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1 text-left">
              <label className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Quiz Topic</label>
              <input
                type="text"
                placeholder="e.g., Python algorithms, financial math"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Number of Questions</label>
              <select
                value={quizLength}
                onChange={(e) => setQuizLength(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={2}>2 Questions</option>
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={loadingQuiz}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
          >
            {loadingQuiz ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Custom Quiz...
              </>
            ) : (
              <>
                <BookOpen size={14} />
                Generate AI Quiz Assessment
              </>
            )}
          </button>

          {quizError && (
            <p className="text-red-500 text-xs mt-2 text-left">{quizError}</p>
          )}

          {/* Render Quiz */}
          {generatedQuiz.length > 0 && (
            <div className="mt-6 space-y-5 text-left border-t border-slate-100 pt-4">
              {generatedQuiz.map((q, qIdx) => (
                <div key={q.id || qIdx} className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">
                    Q{qIdx + 1}: {q.question}
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = userAnswers[q.id] === oIdx;
                      const isCorrect = q.correctOptionIndex === oIdx;
                      let optionStyle = "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-700";

                      if (quizSubmitted) {
                        if (isCorrect) {
                          optionStyle = "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium";
                        } else if (isSelected && !isCorrect) {
                          optionStyle = "bg-red-50 border-red-200 text-red-800";
                        }
                      } else if (isSelected) {
                        optionStyle = "bg-indigo-50 border-indigo-200 text-indigo-800 font-medium";
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={quizSubmitted}
                          onClick={() => handleSelectAnswer(q.id, oIdx)}
                          className={`w-full border rounded-lg px-3 py-2 text-xs text-left transition flex items-center justify-between ${optionStyle}`}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && (
                            <span className="text-emerald-600 text-3xs font-bold">✓ Correct</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted && q.explanation && (
                    <p className="text-3xs text-indigo-700 bg-indigo-50/50 p-2 rounded border border-indigo-100/30 italic">
                      💡 Insight: {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {generatedQuiz.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            {!quizSubmitted ? (
              <button
                onClick={() => setQuizSubmitted(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Submit Answers
              </button>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-slate-700">
                  Your Score: {calculateQuizScore()} / {generatedQuiz.length}
                </span>
                <button
                  onClick={handleGenerateQuiz}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                >
                  Retry New Quiz
                </button>
              </div>
            )}
          </div>
        )}

        {generatedQuiz.length === 0 && !loadingQuiz && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
            <HelpCircle size={32} className="opacity-30 mb-2" />
            <p className="text-xs">No active quiz. Enter a topic and generate a smart assessment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
