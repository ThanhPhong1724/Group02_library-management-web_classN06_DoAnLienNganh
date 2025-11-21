"use client";

import { useEffect } from 'react';

declare global {
  interface Window {
    botpressWebchat: any;
    botpress?: {
      init?: () => void;
    };
  }
}

export default function BotpressConfig() {
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds max wait time

    // Wait for Botpress to load
    const initBotpress = () => {
      // Check if botpressWebchat is available and has init method
      if (window.botpressWebchat && typeof window.botpressWebchat.init === 'function') {
        try {
          // Configure chatbot appearance and behavior
          window.botpressWebchat.init({
            composerPlaceholder: "Nhập câu hỏi của bạn...",
            botName: "Thư viện AI",
            botAvatar: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
            showPoweredBy: false,
            enableConversationDeletion: true,
            enableReset: true,
            enableTranscriptDownload: true,
            enableConversationClear: true,
            // Custom styling
            styles: {
              primaryColor: "#2563eb", // Blue color
              secondaryColor: "#f3f4f6", // Light gray
              textColor: "#1f2937", // Dark gray
              backgroundColor: "#ffffff", // White
              borderRadius: "12px",
              fontFamily: "Inter, sans-serif",
            },
            // Custom messages
            messages: {
              welcome: "Xin chào! Tôi là trợ lý thông minh của Thư viện. Tôi có thể giúp bạn tìm sách, kiểm tra tồn kho, hướng dẫn vị trí kệ sách và trả lời các câu hỏi về thư viện. Bạn cần hỗ trợ gì?",
              goodbye: "Cảm ơn bạn đã sử dụng dịch vụ! Chúc bạn một ngày tốt lành!",
              error: "Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ quầy thủ thư.",
            },
            // Enable features
            features: {
              enableReset: true,
              enableTranscriptDownload: true,
              enableConversationClear: true,
            }
          });
        } catch (error) {
          console.error('Error initializing Botpress:', error);
        }
      } else if (retryCount < maxRetries) {
        // Retry after 100ms if Botpress not loaded yet
        retryCount++;
        setTimeout(initBotpress, 100);
      } else {
        console.warn('Botpress failed to load after maximum retries');
      }
    };

    // Initialize after a delay to ensure scripts are loaded
    // Wait longer to ensure config script has loaded
    setTimeout(initBotpress, 1000);
  }, []);

  return null;
}
