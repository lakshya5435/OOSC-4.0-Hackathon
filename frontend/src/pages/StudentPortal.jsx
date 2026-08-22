import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { saveOfflineAssessment } from '../utils/offlineSync';

export default function StudentPortal() {
  const navigate = useNavigate();
  
  const [language, setLanguage] = useState('en'); 
  const [journalText, setJournalText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  
  const [answers, setAnswers] = useState(Array(9).fill(0));
  const [crisisMode, setCrisisMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // NEW: State to track if the assessment was saved offline
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);

  const textUI = {
    en: { title: "Wellbeing Check-in", subtitle: "Express yourself freely. You can type or use your voice.", speak: "Tap to Speak", stop: "Stop Recording", submit: "Analyze & Submit Securely" },
    hi: { title: "स्वास्थ्य जांच (Wellbeing Check-in)", subtitle: "स्वतंत्र रूप से अपनी बात कहें। आप टाइप कर सकते हैं या बोल सकते हैं।", speak: "बोलने के लिए टैप करें", stop: "रिकॉर्डिंग रोकें", submit: "सुरक्षित रूप से जमा करें" }
  };

  let recognition;
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
  }

  const toggleRecording = () => {
    if (!recognition) return alert("Your browser doesn't support voice recording.");
    
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.start();
      setIsRecording(true);
      
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setJournalText(prev => prev + ' ' + transcript);
      };
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsOfflineSaved(false); // Reset offline state on new submission
    try {
      if (!navigator.onLine) throw new Error("Offline");
      
      await apiClient.post('/assessments', { answers, journal: journalText });
      
      if (journalText) {
        const aiRes = await apiClient.post('/ai/analyze', { text: journalText, language });
        
        if (aiRes.data.crisisFlag) {
          setCrisisMode(true);
          setIsSubmitting(false);
          return;
        }
        setAiFeedback(aiRes.data);
      }
      
      setIsSubmitted(true);
    } catch (error) {
      saveOfflineAssessment({ answers, journal: journalText });
      
      // REMOVED THE ANNOYING ALERT()
      // Now we just set this state to true so the UI can handle it beautifully
      setIsOfflineSaved(true); 
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (crisisMode) {
    return (
      <div className="p-10 bg-[#fff0f0] text-center rounded-[2rem] border-4 border-red-300 shadow-2xl max-w-2xl mx-auto mt-10">
        <h2 className="text-3xl font-extrabold text-red-700 mb-6">You are not alone. Help is available right now.</h2>
        <div className="text-4xl font-black text-red-600 mb-8 bg-white py-4 rounded-xl shadow-inner tracking-widest">14416</div>
        <p className="font-bold text-gray-500 mb-6">Toll-Free Tele-MANAS Helpline</p>
        <button onClick={() => setCrisisMode(false)} className="px-8 py-3 bg-gray-300 font-bold rounded-full">Close</button>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="p-10 bg-white text-center rounded-[2rem] border-t-8 border-[#819E8E] shadow-2xl max-w-2xl mx-auto mt-16 animate-fade-in-up">
        <div className="w-20 h-20 bg-[#E9D3C8] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#4A5D53]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-3xl font-extrabold text-[#4A5D53] mb-4">Assessment Complete</h2>
        
        {/* NEW: Beautiful Offline Warning Banner */}
        {isOfflineSaved && (
          <div className="bg-[#FFF8E7] p-4 rounded-xl mb-8 border border-[#E4C7B0] flex items-start gap-4 text-left shadow-sm">
            <div className="text-2xl mt-1">📡</div>
            <div>
              <p className="font-extrabold text-[#4A5D53]">Offline Mode Active</p>
              <p className="text-sm text-[#819E8E] font-medium mt-1">You are currently disconnected from the network. Your responses have been safely encrypted and saved locally. They will automatically sync to the clinic once your connection is restored.</p>
            </div>
          </div>
        )}

        {/* AI Personalized Resource Section */}
        {aiFeedback && aiFeedback.recommendations && !isOfflineSaved && (
          <div className="bg-[#F7F0E6] p-6 rounded-2xl mb-8 border border-[#E9D3C8] text-left">
            <h3 className="font-bold text-[#4A5D53] mb-3 flex items-center gap-2">
              ✨ AI Recommended Resources for You:
            </h3>
            <ul className="list-disc pl-5 text-[#819E8E] font-medium">
              {aiFeedback.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
            </ul>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button onClick={() => window.location.reload()} className="px-8 py-4 bg-[#F7F0E6] text-[#4A5D53] border-2 border-[#B7C7BC] font-bold rounded-xl hover:bg-[#E9D3C8] transition-colors">New Session</button>
          <button onClick={handleLogout} className="px-8 py-4 bg-[#819E8E] text-white font-bold rounded-xl hover:bg-[#4A5D53] transition-colors">Sign Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 bg-white shadow-2xl rounded-[2rem] mt-6 border-t-8 border-[#B7C7BC]">
      <div className="flex justify-end mb-4">
        <div className="bg-[#F7F0E6] p-1 rounded-lg flex border border-[#B7C7BC]">
          <button onClick={() => setLanguage('en')} className={`px-4 py-1 rounded-md font-bold text-sm ${language === 'en' ? 'bg-[#819E8E] text-white' : 'text-[#4A5D53]'}`}>English</button>
          <button onClick={() => setLanguage('hi')} className={`px-4 py-1 rounded-md font-bold text-sm ${language === 'hi' ? 'bg-[#819E8E] text-white' : 'text-[#4A5D53]'}`}>हिंदी (Hindi)</button>
        </div>
      </div>

      <div className="mb-8 border-b-2 border-[#E9D3C8] pb-6">
        <h2 className="text-3xl font-extrabold mb-3 text-[#4A5D53]">{textUI[language].title}</h2>
        <p className="text-[#819E8E] text-lg font-medium">{textUI[language].subtitle}</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-8 p-6 rounded-2xl bg-[#F7F0E6] border border-[#E9D3C8] shadow-sm">
          <textarea 
            rows="4"
            className="w-full p-4 rounded-xl border border-[#B7C7BC] bg-white text-[#4A5D53] focus:ring-2 focus:ring-[#819E8E] focus:outline-none mb-4"
            placeholder={language === 'en' ? "How are you feeling today?" : "आज आप कैसा महसूस कर रहे हैं?"}
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
          ></textarea>
          
          <button 
            type="button" 
            onClick={toggleRecording}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-[#E4C7B0] text-[#4A5D53] hover:bg-[#E9D3C8]'}`}
          >
            {isRecording ? (
              <><span>🔴</span> {textUI[language].stop}</>
            ) : (
              <><span>🎤</span> {textUI[language].speak}</>
            )}
          </button>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[#4A5D53] text-[#F7F0E6] py-5 rounded-2xl font-extrabold text-xl hover:bg-[#819E8E] hover:shadow-lg disabled:bg-[#B7C7BC] transition-all"
        >
          {isSubmitting ? 'Processing AI Analysis...' : textUI[language].submit}
        </button>
      </form>
    </div>
  );
}