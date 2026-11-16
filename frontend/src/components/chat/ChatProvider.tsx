import React from 'react';
import { ChatContext } from '../../hooks/chat/chatContext';
import { useChatCenter } from '../../hooks/chat/useChatCenter';
import { ChatDrawer } from './ChatDrawer';

interface ChatProviderProps {
  readonly children: React.ReactNode;
}

/** 채팅 창·안 읽은 수를 앱(레이아웃) 전체에 제공하고, 채팅 창을 한 곳에 그린다. */
export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const value = useChatCenter();
  return (
    <ChatContext.Provider value={value}>
      {children}
      <ChatDrawer chat={value} />
    </ChatContext.Provider>
  );
};

export default ChatProvider;
