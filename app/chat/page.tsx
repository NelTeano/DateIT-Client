import React from 'react'
import ChatRoom from '../components/chat-room/chat'
import { SocketProvider } from '../context/SocketContext'

export default function ChatPage() {
  return (
    // <SocketProvider userId={currentUserId}>
        <ChatRoom />
    // </SocketProvider>
  )
}
