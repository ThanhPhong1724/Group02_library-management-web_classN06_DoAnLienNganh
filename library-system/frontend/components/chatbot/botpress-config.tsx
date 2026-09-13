"use client";

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';

declare global {
  interface Window {
    botpressWebchat: any;
    botpress?: {
      init?: () => void;
    };
  }
}

export default function BotpressConfig() {
  const { user } = useAuth();
  const userPayloadSent = useRef<string | null>(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds max wait time

    const welcomeMsg = user?.email
      ? `Xin chào ${user.full_name || 'bạn'}! Tôi là trợ lý AI Thư viện. Bạn có thể hỏi tôi vị trí kệ sách, kiểm tra hạn trả/tiền phạt cho tài khoản (${user.email}), hoặc yêu cầu mượn sách trực tiếp ngay trong khung chat này!`
      : "Xin chào! Tôi là trợ lý AI của Thư viện. Tôi có thể giúp bạn tra cứu sách, tìm vị trí kệ sách, kiểm tra hạn trả sách/tiền phạt hoặc mượn sách trực tiếp. Bạn cần hỗ trợ gì?";

    const initBotpress = () => {
      if (window.botpressWebchat && typeof window.botpressWebchat.init === 'function') {
        try {
          window.botpressWebchat.init({
            composerPlaceholder: user?.email ? `Hỏi sách, vị trí kệ hoặc mượn sách (${user.email})...` : "Nhập câu hỏi của bạn...",
            botName: "Thư viện AI",
            botAvatar: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
            showPoweredBy: false,
            enableConversationDeletion: true,
            enableReset: true,
            enableTranscriptDownload: true,
            enableConversationClear: true,
            styles: {
              primaryColor: "#2563eb",
              secondaryColor: "#f3f4f6",
              textColor: "#1f2937",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              fontFamily: "Inter, sans-serif",
            },
            messages: {
              welcome: welcomeMsg,
              goodbye: "Cảm ơn bạn đã sử dụng dịch vụ! Chúc bạn một ngày tốt lành!",
              error: "Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ quầy thủ thư.",
            },
            features: {
              enableReset: true,
              enableTranscriptDownload: true,
              enableConversationClear: true,
            }
          });

          // Gửi thông tin user vào context của phiên chat nếu có
          if (user?.email && userPayloadSent.current !== user.email) {
            userPayloadSent.current = user.email;
            setTimeout(() => {
              try {
                if (window.botpressWebchat?.sendPayload) {
                  window.botpressWebchat.sendPayload({
                    type: 'session_user',
                    email: user.email,
                    fullName: user.full_name,
                    role: user.role
                  });
                }
              } catch (e) {
                // Ignore silent payload error
              }
            }, 1200);
          }
        } catch (error) {
          console.error('Error initializing Botpress:', error);
        }
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(initBotpress, 100);
      } else {
        console.warn('Botpress failed to load after maximum retries');
      }
    };

    setTimeout(initBotpress, 1000);
  }, [user]);

  return null;
}
