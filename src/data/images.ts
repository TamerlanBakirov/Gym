/**
 * Curated imagery (Unsplash CDN), mirrored from the backend seed so the bundled
 * offline catalog shows media too. UI falls back to a gradient if an image fails.
 */
const IMG = (id: string) => `https://images.unsplash.com/${id}?w=800&q=70&auto=format&fit=crop`;

export const MUSCLE_IMAGE: Record<string, string> = {
  chest: IMG('photo-1571019613454-1cb2f99b2d8b'),
  back: IMG('photo-1534438327276-14e5300c3a48'),
  shoulders: IMG('photo-1532029837206-abbe2b7620e3'),
  arms: IMG('photo-1581009146145-b5ef050c2e1e'),
  legs: IMG('photo-1434608519344-49d77a699e1d'),
  core: IMG('photo-1550345332-09e3ac987658'),
  cardio: IMG('photo-1538805060514-97d9cc17730c'),
  fullbody: IMG('photo-1517836357463-d25dfeac3438'),
};

export const WORKOUT_IMAGE: Record<string, string> = {
  'full-body-burn': IMG('photo-1517836357463-d25dfeac3438'),
  'upper-power': IMG('photo-1571019613454-1cb2f99b2d8b'),
  'core-crusher': IMG('photo-1550345332-09e3ac987658'),
  'leg-day': IMG('photo-1434608519344-49d77a699e1d'),
  'hiit-shred': IMG('photo-1538805060514-97d9cc17730c'),
  'morning-flow': IMG('photo-1594737625785-a6cbdabd333c'),
};
