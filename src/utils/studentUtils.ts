import { StudentProfile, StudentRole, BatchType } from '../types';

export function getBatchFromRoll(roll: number): BatchType {
  if (roll <= 22) return 'BATCH_1';
  if (roll <= 43) return 'BATCH_2';
  return 'BATCH_3';
}

export function getRoleLabel(role: StudentRole): string {
  switch (role) {
    case 'DEVELOPER_ADMIN':
      return 'DEVELOPER / ADMIN';
    case 'CR_BOYS':
      return 'Class Rep (Boys)';
    case 'CR_GIRLS':
      return 'Class Rep (Girls)';
    case 'BR1_BOYS':
      return 'Batch 1 Rep (Boys)';
    case 'BR1_GIRLS':
      return 'Batch 1 Rep (Girls)';
    case 'BR2_BOYS':
      return 'Batch 2 Rep (Boys)';
    case 'BR2_GIRLS':
      return 'Batch 2 Rep (Girls)';
    case 'BR3_BOYS':
      return 'Batch 3 Rep (Boys)';
    case 'BR3_GIRLS':
      return 'Batch 3 Rep (Girls)';
    default:
      return 'IT Engineer';
  }
}

export function getRoleBadgeStyle(role: StudentRole): {
  bg: string;
  text: string;
  border: string;
  icon: string;
} {
  if (role === 'DEVELOPER_ADMIN') {
    return {
      bg: 'bg-black text-[#FFE600]',
      text: 'text-[#FFE600]',
      border: 'border-2 border-[#FFE600] shadow-[2px_2px_0px_#000]',
      icon: '⚡',
    };
  }
  if (role === 'CR_BOYS' || role === 'CR_GIRLS') {
    return {
      bg: 'bg-[#FFE600]',
      text: 'text-black',
      border: 'border-2 border-black shadow-[2px_2px_0px_#000]',
      icon: '👑',
    };
  }
  if (role.startsWith('BR1')) {
    return {
      bg: 'bg-[#38BDF8]',
      text: 'text-black',
      border: 'border-2 border-black shadow-[2px_2px_0px_#000]',
      icon: '⚡',
    };
  }
  if (role.startsWith('BR2')) {
    return {
      bg: 'bg-[#4ADE80]',
      text: 'text-black',
      border: 'border-2 border-black shadow-[2px_2px_0px_#000]',
      icon: '⭐',
    };
  }
  if (role.startsWith('BR3')) {
    return {
      bg: 'bg-[#C084FC]',
      text: 'text-black',
      border: 'border-2 border-black shadow-[2px_2px_0px_#000]',
      icon: '💎',
    };
  }
  return {
    bg: 'bg-white',
    text: 'text-black',
    border: 'border-2 border-black shadow-[2px_2px_0px_#000]',
    icon: '💻',
  };
}

/**
 * Sorts student profiles strictly by roll number in ascending order:
 * - First visible profile is 1, then 2, then 3, then 4, and so on.
 * - In Batch 1 (Roll 1-22): 1, 2, 3, ... 22
 * - In Batch 2 (Roll 23-43): 23, 24, 25, ... 43
 * - In Batch 3 (Roll 44-63): 44, 45, 46, ... 63
 */
export function sortAndFilterStudents(
  students: StudentProfile[],
  filter: 'ALL' | 'BATCH_1' | 'BATCH_2' | 'BATCH_3'
): StudentProfile[] {
  // Only consider approved students
  const approved = students.filter((s) => s.status === 'APPROVED');

  let list = approved;
  if (filter === 'BATCH_1') {
    list = approved.filter((s) => Number(s.rollNumber) >= 1 && Number(s.rollNumber) <= 22);
  } else if (filter === 'BATCH_2') {
    list = approved.filter((s) => Number(s.rollNumber) >= 23 && Number(s.rollNumber) <= 43);
  } else if (filter === 'BATCH_3') {
    list = approved.filter((s) => Number(s.rollNumber) >= 44 && Number(s.rollNumber) <= 63);
  }

  // Strictly sort according to roll numbers in ascending order: 1, 2, 3, 4, etc.
  return [...list].sort((a, b) => Number(a.rollNumber) - Number(b.rollNumber));
}

/**
 * Checks whether a given birthDate (e.g. "2006-10-16" or "10-16") is today.
 * Matches current Month and Day.
 */
export function isBirthdayToday(birthDate?: string | null): boolean {
  if (!birthDate || typeof birthDate !== 'string') return false;
  const trimmed = birthDate.trim();
  if (!trimmed) return false;

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentDay = now.getDate(); // 1-31

  // Handle YYYY-MM-DD or MM-DD or DD/MM/YYYY
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    if (parts.length === 3) {
      // YYYY-MM-DD
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      return month === currentMonth && day === currentDay;
    } else if (parts.length === 2) {
      // MM-DD
      const month = parseInt(parts[0], 10);
      const day = parseInt(parts[1], 10);
      return month === currentMonth && day === currentDay;
    }
  } else if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      // DD/MM/YYYY
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      return month === currentMonth && day === currentDay;
    }
  }

  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.getMonth() + 1 === currentMonth && d.getDate() === currentDay;
  }

  return false;
}

export function formatBirthdayDisplay(birthDate?: string | null, includeYear = true): string {
  if (!birthDate) return '';
  const trimmed = birthDate.trim();
  if (!trimmed) return '';

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (monthIdx >= 0 && monthIdx < 12) {
        return includeYear ? `${day} ${MONTH_NAMES[monthIdx]} ${year}` : `${day} ${MONTH_NAMES[monthIdx]}`;
      }
    }
  }

  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return includeYear
      ? `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
      : `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
  }

  return trimmed;
}

