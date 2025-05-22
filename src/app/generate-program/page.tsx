import vapi from '@/lib/vapi';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react'
import {useState} from "react"

function GenerateProgram() {

  const [callActive, setCallActive] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [callEnded, setCallEnded] = useState<boolean>(false);

  const {user} = useUser();
  const router = useRouter();

  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages])

  useEffect(() => {
    if(callEnded) {
      const timer = setTimeout(() => {
        router.push("/profile");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [callEnded, router])

  useEffect(() => {
    const handleCallStart = () => {
      console.log("Call started");
      setCallActive(true);
      setConnecting(false);
      setCallEnded(false);
    }

    const handleCallEnd = () => {
      console.log("Call ended");
      setCallActive(false);
      setConnecting(false);
      setIsSpeaking(false);
      setCallEnded(true);
    }

    const handleSpeechStart = () => {
      console.log("Speech started");
      setIsSpeaking(true);
    }

    const handleSpeechEnd = () => {
      console.log("Speech ended");
      setIsSpeaking(false);
    }

    const handleMessage = (message: any) => {

    }

    const handleError = (error: any) => {
      console.log("Vapi Error:", error);
      setCallActive(false);
      setConnecting(false);
    }
    
    vapi.on("call-start", handleCallStart)
        .on("call-end", handleCallEnd)
        .on("speech-start", handleSpeechStart)
        .on("speech-end", handleSpeechEnd)
        .on("message", handleMessage)
        .on("error", handleError)
  
    return () => {
      vapi.off("call-start", handleCallStart)
          .off("call-end", handleCallEnd)
          .off("speech-start", handleSpeechStart)
          .off("speech-end", handleSpeechEnd)
          .off("message", handleMessage)
          .off("error", handleError)
    }
  }, [])
  

  return (
    <div>GenerateProgram</div>
  )
}

export default GenerateProgram