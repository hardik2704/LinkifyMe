import React from 'react';

export interface FeatureCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  image?: string;
  className?: string;
  variant?: 'default' | 'dark' | 'brand';
}

export interface StoryCardProps {
  category: string;
  title: string;
  actionText: string;
  image: string;
}