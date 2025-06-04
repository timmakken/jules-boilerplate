// videogen.ai/src/app/vision-board/types.ts
export type BoardItem =
  | { id: string; type: 'text'; content: string; }
  | { id:string; type: 'image'; src: string; alt: string; }
  | { id: string; type: 'video'; src: string; title: string; }
  | { id: string; type: 'document'; url: string; name: string; }
  | { id: string; type: 'music'; src: string; title: string; };
// Add other types as needed

// Ensure ChatMessageType is also robust, potentially move it here too
// For now, we assume ChatMessageType from ChatMessage.tsx is fine
