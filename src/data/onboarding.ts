import { OnboardingAnswers } from '../types';

export type QuizOption = {
  value: string;
  label: string;
  sub?: string;
  emoji: string;
};

export type QuizStep = {
  /** key on OnboardingAnswers this step writes */
  key: keyof OnboardingAnswers;
  title: string;
  subtitle?: string;
  type: 'single' | 'multi';
  options: QuizOption[];
};

/**
 * Quiz steps shown one-by-one. Single-select advances automatically;
 * multi-select shows a Continue button.
 */
export const QUIZ_STEPS: QuizStep[] = [
  {
    key: 'gender',
    title: 'What is your gender?',
    subtitle: "We'll tailor your plan to your body.",
    type: 'single',
    options: [
      { value: 'male', label: 'Male', emoji: '👨' },
      { value: 'female', label: 'Female', emoji: '👩' },
      { value: 'other', label: 'Prefer not to say', emoji: '🙂' },
    ],
  },
  {
    key: 'goal',
    title: "What's your main goal?",
    subtitle: 'Choose the result you want most.',
    type: 'single',
    options: [
      { value: 'lose_weight', label: 'Lose weight', sub: 'Burn fat & lean out', emoji: '⚖️' },
      { value: 'build_muscle', label: 'Build muscle', sub: 'Get stronger & bigger', emoji: '💪' },
      { value: 'get_shredded', label: 'Get shredded', sub: 'Define & sculpt', emoji: '🔥' },
      { value: 'stay_fit', label: 'Stay fit', sub: 'Maintain & feel great', emoji: '✨' },
    ],
  },
  {
    key: 'level',
    title: 'How fit are you right now?',
    subtitle: 'Be honest — we start where you are.',
    type: 'single',
    options: [
      { value: 'beginner', label: 'Beginner', sub: 'New to working out', emoji: '🌱' },
      { value: 'intermediate', label: 'Intermediate', sub: 'Train sometimes', emoji: '⚡' },
      { value: 'advanced', label: 'Advanced', sub: 'Train consistently', emoji: '🏆' },
    ],
  },
  {
    key: 'bodyType',
    title: 'Which body type fits you best?',
    type: 'single',
    options: [
      { value: 'lean', label: 'Lean', sub: 'Slim build', emoji: '🧍' },
      { value: 'average', label: 'Average', sub: 'Balanced build', emoji: '🧑' },
      { value: 'heavy', label: 'Heavy', sub: 'Larger build', emoji: '🧔' },
    ],
  },
  {
    key: 'targetAreas',
    title: 'Which areas to focus on?',
    subtitle: 'Pick as many as you like.',
    type: 'multi',
    options: [
      { value: 'chest', label: 'Chest', emoji: '🫀' },
      { value: 'arms', label: 'Arms', emoji: '💪' },
      { value: 'back', label: 'Back', emoji: '🔙' },
      { value: 'core', label: 'Abs & Core', emoji: '🧱' },
      { value: 'legs', label: 'Legs', emoji: '🦵' },
      { value: 'fullbody', label: 'Full body', emoji: '🔥' },
    ],
  },
  {
    key: 'equipment',
    title: 'What equipment do you have?',
    type: 'single',
    options: [
      { value: 'none', label: 'None', sub: 'Bodyweight only', emoji: '🤸' },
      { value: 'minimal', label: 'Minimal', sub: 'Bar / bands / bench', emoji: '🏋️' },
      { value: 'full_gym', label: 'Full gym', sub: 'All the machines', emoji: '🏟️' },
    ],
  },
  {
    key: 'daysPerWeek',
    title: 'How many days per week?',
    subtitle: 'Consistency beats intensity.',
    type: 'single',
    options: [
      { value: '2', label: '2 days', sub: 'Easy start', emoji: '🟢' },
      { value: '3', label: '3 days', sub: 'Recommended', emoji: '🔵' },
      { value: '4', label: '4 days', sub: 'Committed', emoji: '🟣' },
      { value: '5', label: '5 days', sub: 'All in', emoji: '🔴' },
    ],
  },
  {
    key: 'ageRange',
    title: "What's your age range?",
    type: 'single',
    options: [
      { value: '18-29', label: '18 – 29', emoji: '🧑' },
      { value: '30-39', label: '30 – 39', emoji: '🧑‍🦱' },
      { value: '40-49', label: '40 – 49', emoji: '🧔' },
      { value: '50+', label: '50 +', emoji: '🧓' },
    ],
  },
];
