"use client";
import React from 'react';
import { DefaultLayout } from '@/components/layout/default-layout';
import HomePageContent from '@/components/home/home-content';

export default function HomePage() {
  return (
    <DefaultLayout>
      <HomePageContent />
    </DefaultLayout>
  );
}
