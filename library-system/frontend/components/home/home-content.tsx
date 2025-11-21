"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function HomePageContent() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Gradient animation for text
  const gradientText = {
    background: "linear-gradient(270deg, #ff6ec4, #7873f5, #42e695, #ff6ec4)",
    backgroundSize: "800% 800%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: "gradientMove 8s ease-in-out infinite",
  };

  return (
    <div className={
      "min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors " +
      (isDark
        ? "bg-gradient-to-br from-[#181c24] to-[#23283a]"
        : "bg-gradient-to-br from-blue-50 to-indigo-100")
    }>
      {/* Animated background blobs */}
      <motion.div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 opacity-30 blur-3xl z-0"
        animate={{ scale: [1, 1.15, 1], rotate: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div
        className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-green-300 via-blue-300 to-purple-400 opacity-20 blur-2xl z-0"
        animate={{ scale: [1, 1.1, 1], x: [0, 40, 0] }}
        transition={{ duration: 14, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[200px] bg-gradient-to-r from-indigo-400 via-pink-300 to-yellow-200 opacity-10 blur-2xl z-0 rounded-full"
        animate={{ scaleX: [1, 1.08, 1], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
      />
      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center w-full px-4">
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold text-center mb-8 select-none"
          style={gradientText as any}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          Chào mừng đến với<br />
          <span className="block mt-2">Thư viện trực tuyến</span>
        </motion.h1>
        <motion.p
          className="text-lg md:text-2xl text-center max-w-2xl mx-auto font-medium text-gray-700 dark:text-gray-200 mb-10 select-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          Nơi lưu giữ tri thức, kết nối cộng đồng yêu sách và khám phá thế giới qua từng trang sách.
        </motion.p>
        <motion.div
          className="w-full flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
        >
          <div className="h-1 w-32 bg-gradient-to-r from-pink-400 via-indigo-400 to-green-300 rounded-full animate-pulse" />
        </motion.div>
      </main>
      {/* Gradient text animation keyframes */}
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
