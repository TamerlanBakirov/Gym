import { Workout } from '../types';
import { EXERCISES } from './exercises';

const e = EXERCISES;

/** Curated workouts. Each pulls exercises from the shared library. */
export const WORKOUTS: Workout[] = [
  {
    id: 'full-body-burn',
    title: 'Full Body Burn',
    subtitle: 'Total-body conditioning',
    muscle: 'fullbody',
    level: 'beginner',
    durationMin: 24,
    kcal: 240,
    gradient: 'primary',
    emoji: '🔥',
    exercises: [e.jumpingJack, e.squat, e.pushup, e.plank, e.lunge, e.mountainClimber],
  },
  {
    id: 'upper-power',
    title: 'Upper Power',
    subtitle: 'Chest, back & arms',
    muscle: 'chest',
    level: 'intermediate',
    durationMin: 28,
    kcal: 280,
    gradient: 'violet',
    emoji: '💪',
    exercises: [e.pushup, e.pullup, e.dip, e.invertedRow, e.pike, e.chinup],
  },
  {
    id: 'core-crusher',
    title: 'Core Crusher',
    subtitle: 'Carve your abs',
    muscle: 'core',
    level: 'beginner',
    durationMin: 18,
    kcal: 170,
    gradient: 'sky',
    emoji: '🧱',
    exercises: [e.plank, e.hollowHold, e.legRaise, e.mountainClimber, e.highKnees],
  },
  {
    id: 'leg-day',
    title: 'Leg Day',
    subtitle: 'Quads, glutes & hamstrings',
    muscle: 'legs',
    level: 'intermediate',
    durationMin: 26,
    kcal: 260,
    gradient: 'amber',
    emoji: '🦵',
    exercises: [e.squat, e.lunge, e.gluteBridge, e.highKnees, e.plank],
  },
  {
    id: 'hiit-shred',
    title: 'HIIT Shred',
    subtitle: 'Max calorie burn',
    muscle: 'cardio',
    level: 'advanced',
    durationMin: 22,
    kcal: 320,
    gradient: 'coral',
    emoji: '⚡',
    exercises: [e.burpee, e.mountainClimber, e.jumpingJack, e.highKnees, e.squat, e.pushup],
  },
  {
    id: 'morning-flow',
    title: 'Morning Flow',
    subtitle: 'Wake up & mobilize',
    muscle: 'fullbody',
    level: 'beginner',
    durationMin: 14,
    kcal: 110,
    gradient: 'sky',
    emoji: '🌅',
    exercises: [e.jumpingJack, e.gluteBridge, e.inclinePushup, e.plank],
  },
];

export const getWorkout = (id: string) => WORKOUTS.find((w) => w.id === id);
