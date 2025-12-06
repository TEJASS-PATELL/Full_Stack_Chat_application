import { useEffect, useRef } from "react"; 
export const useChatScroll = (dep) => { 
    const bottomRef = useRef(null); 
    useEffect(() => { 
        bottomRef.current?.scrollIntoView({ behavior: "smooth" }); 
    }, [dep]); 
    return bottomRef; 
};