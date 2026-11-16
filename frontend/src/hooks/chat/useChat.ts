import { useContext } from 'react';
import { ChatContext, type ChatContextValue } from './chatContext';

/** 채팅 창 열기·안 읽은 수. ChatProvider 안에서만 쓸 수 있다. */
export const useChat = (): ChatContextValue => {
  const value = useContext(ChatContext);
  if (!value) throw new Error('useChat은 ChatProvider 안에서 사용해야 합니다.');
  return value;
};
