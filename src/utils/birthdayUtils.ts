import confetti from 'canvas-confetti';
import { StudentProfile } from '../types';
import { soundEngine } from './soundEffects';

/**
 * Checks if a given dateOfBirth (YYYY-MM-DD) matches today's month and day.
 */
export function isTodayBirthday(dateOfBirth?: string, refDate: Date = new Date()): boolean {
  if (!dateOfBirth || typeof dateOfBirth !== 'string') return false;

  const trimmed = dateOfBirth.trim();
  if (!trimmed) return false;

  try {
    const currentMonth = refDate.getMonth() + 1; // 1 - 12
    const currentDay = refDate.getDate(); // 1 - 31

    // Split by - or /
    const parts = trimmed.split(/[-/]/).map((p) => parseInt(p, 10));
    if (parts.length < 2 || parts.some((p) => isNaN(p))) return false;

    let birthMonth = 0;
    let birthDay = 0;

    if (parts[0] > 1900) {
      // YYYY-MM-DD
      birthMonth = parts[1];
      birthDay = parts[2];
    } else if (parts[2] > 1900) {
      // DD-MM-YYYY or MM-DD-YYYY
      if (parts[0] > 12) {
        // Must be DD-MM-YYYY
        birthDay = parts[0];
        birthMonth = parts[1];
      } else {
        // Assume DD-MM-YYYY default for Indian academic hubs
        birthDay = parts[0];
        birthMonth = parts[1];
      }
    } else {
      // MM-DD
      birthMonth = parts[0];
      birthDay = parts[1];
    }

    return birthMonth === currentMonth && birthDay === currentDay;
  } catch {
    return false;
  }
}

/**
 * Filters approved students whose birthday is today.
 */
export function getStudentsWithBirthdayToday(
  students: StudentProfile[],
  refDate: Date = new Date()
): StudentProfile[] {
  if (!Array.isArray(students)) return [];
  return students.filter(
    (student) =>
      student.status === 'APPROVED' &&
      student.dateOfBirth &&
      isTodayBirthday(student.dateOfBirth, refDate)
  );
}

/**
 * Formats a birthday date string nicely (e.g., "16 October", "24 April 2006").
 */
export function formatBirthdayDate(dateOfBirth?: string, includeYear: boolean = false): string {
  if (!dateOfBirth) return '';
  try {
    const parts = dateOfBirth.split(/[-/]/).map((p) => parseInt(p, 10));
    if (parts.length < 2 || parts.some((p) => isNaN(p))) return dateOfBirth;

    let year = 0;
    let month = 0;
    let day = 0;

    if (parts[0] > 1900) {
      year = parts[0];
      month = parts[1];
      day = parts[2];
    } else if (parts[2] > 1900) {
      year = parts[2];
      day = parts[0];
      month = parts[1];
    } else {
      month = parts[0];
      day = parts[1];
    }

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const monthName = months[month - 1] || `Month ${month}`;

    if (includeYear && year > 0) {
      return `${day} ${monthName} ${year}`;
    }
    return `${day} ${monthName}`;
  } catch {
    return dateOfBirth;
  }
}

/**
 * Calculates current age from dateOfBirth (YYYY-MM-DD).
 */
export function calculateAge(dateOfBirth?: string, refDate: Date = new Date()): number | null {
  if (!dateOfBirth) return null;
  try {
    const parts = dateOfBirth.split(/[-/]/).map((p) => parseInt(p, 10));
    if (parts.length < 3 || parts.some((p) => isNaN(p))) return null;

    let birthYear = 0;
    let birthMonth = 0;
    let birthDay = 0;

    if (parts[0] > 1900) {
      birthYear = parts[0];
      birthMonth = parts[1];
      birthDay = parts[2];
    } else if (parts[2] > 1900) {
      birthYear = parts[2];
      birthDay = parts[0];
      birthMonth = parts[1];
    }

    if (birthYear === 0) return null;

    let age = refDate.getFullYear() - birthYear;
    const m = refDate.getMonth() + 1 - birthMonth;
    if (m < 0 || (m === 0 && refDate.getDate() < birthDay)) {
      age--;
    }
    return age > 0 && age < 120 ? age : null;
  } catch {
    return null;
  }
}

/**
 * Returns zodiac sign and emoji symbol for DOB.
 */
export function getZodiacSign(dateOfBirth?: string): { sign: string; emoji: string } | null {
  if (!dateOfBirth) return null;
  try {
    const parts = dateOfBirth.split(/[-/]/).map((p) => parseInt(p, 10));
    let month = parts[0] > 1900 ? parts[1] : parts[1];
    let day = parts[0] > 1900 ? parts[2] : parts[0];

    if (!month || !day) return null;

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { sign: 'Aries', emoji: '♈' };
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { sign: 'Taurus', emoji: '♉' };
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { sign: 'Gemini', emoji: '♊' };
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { sign: 'Cancer', emoji: '♋' };
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { sign: 'Leo', emoji: '♌' };
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { sign: 'Virgo', emoji: '♍' };
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { sign: 'Libra', emoji: '♎' };
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { sign: 'Scorpio', emoji: '♏' };
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { sign: 'Sagittarius', emoji: '♐' };
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { sign: 'Capricorn', emoji: '♑' };
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { sign: 'Aquarius', emoji: '♒' };
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return { sign: 'Pisces', emoji: '♓' };

    return null;
  } catch {
    return null;
  }
}

/**
 * Triggers full celebration animation:
 * - Canvas confetti explosions (dual-side cannons + star bursts)
 * - Synthesized birthday fanfare audio
 */
export function triggerBirthdayCelebration(playTune: boolean = true) {
  if (typeof window === 'undefined') return;

  if (playTune) {
    soundEngine.playBirthdayFanfare();
  }

  // 1. Center burst
  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#f9c74f', '#f47b5c', '#4cc9f0', '#9d4edd', '#ff007f', '#ffffff'],
    ticks: 240,
    gravity: 0.8,
  });

  // 2. Left and right cannons
  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.7 },
      colors: ['#f9c74f', '#f47b5c', '#ffffff', '#4cc9f0'],
      ticks: 260,
    });
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.7 },
      colors: ['#f9c74f', '#f47b5c', '#ffffff', '#9d4edd'],
      ticks: 260,
    });
  }, 350);

  // 3. Falling confetti rain
  setTimeout(() => {
    confetti({
      particleCount: 45,
      spread: 120,
      origin: { y: 0.1 },
      colors: ['#f9c74f', '#f47b5c', '#4cc9f0', '#9d4edd'],
      ticks: 300,
      scalar: 1.2,
    });
  }, 800);
}
