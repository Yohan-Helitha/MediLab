import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FloatingChatIcon = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [isPlaying, setIsPlaying] = useState(false);
	const hasPlayedPlayedRef = useRef(false);

	useEffect(() => {
		// Use sessionStorage to track if audio was already played during this browser session
		const hasPlayedInSession = sessionStorage.getItem("mediLabVoicePlayed");

		if (user && user.userType === "patient" && !hasPlayedPlayedRef.current && !hasPlayedInSession) {
			const playAudiosSequentially = async () => {
				const audioFiles = ["/voice/speech.mp3", "/voice/speech1.wav", "/voice/speech2.mp3"];
				hasPlayedPlayedRef.current = true;
				sessionStorage.setItem("mediLabVoicePlayed", "true");
				
				for (const file of audioFiles) {
					try {
						const audio = new Audio(file);
						setIsPlaying(true);
						
						await new Promise((resolve, reject) => {
							audio.onended = resolve;
							audio.onerror = reject;
							audio.play().catch(reject);
						});
					} catch (error) {
						console.warn(`Audio playback failed for ${file}:`, error);
						// Continue to next audio even if one fails
					}
				}
				setIsPlaying(false);
			};

			// Small delay to ensure the page has loaded
			const timeoutId = setTimeout(playAudiosSequentially, 1500);
			return () => clearTimeout(timeoutId);
		} else if (!user) {
			hasPlayedPlayedRef.current = false;
			sessionStorage.removeItem("mediLabVoicePlayed");
			setIsPlaying(false);
		}
	}, [user]);

	const handleClick = () => {
		navigate("/symptom-checker");
	};

	// Only show icon if a user is logged in and is a patient
	if (!user || user.userType !== "patient") {
		return null;
	}

	return (
		<div 
			onClick={handleClick}
			className="fixed bottom-8 right-8 z-50 cursor-pointer flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full border-2 border-teal-300 transform hover:scale-110 active:scale-95 transition-all duration-300 group animate-bounce-slow"
			style={{ 
				perspective: "1000px",
				boxShadow: "0 8px 20px -5px rgba(0, 128, 128, 0.4), 0 6px 8px -6px rgba(0, 128, 128, 0.4), inset 0 -3px 5px -1px rgba(0, 0, 0, 0.2)"
			}}
			title="AI Symptom Checker Chatbot"
		>
            {/* Ping effect background - active on hover or while playing audio */}
            <div className={`absolute inset-0 rounded-full bg-teal-400 opacity-20 pointer-events-none ${isPlaying ? 'animate-ping-fast' : 'group-hover:animate-ping'}`}></div>

			<img 
				src="/images/logo1.png" 
				alt="Chatbot" 
				className={`w-9 h-9 object-contain brightness-0 invert drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] ${isPlaying ? 'animate-ringing' : ''}`}
			/>
			<div className="absolute top-0.5 right-0.5 bg-red-500 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md"></div>
            {/* Tooltip on hover */}
            <span className="absolute right-full mr-6 bg-gray-900 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-gray-700">
                Need Help? Chat with AI 🤖
            </span>
		</div>
	);
};

export default FloatingChatIcon;