import React from 'react';
import { Check } from 'lucide-react';
import { Member, TaskPriority, TaskStatus } from '../types';
import { getStatusLabel } from '../utils/taskHelpers';

interface TaskCheckboxProps {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
}

export const TaskCheckbox: React.FC<TaskCheckboxProps> = ({ checked, onChange, ariaLabel }) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`group relative flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[6px] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 ${
        checked
          ? 'bg-[#6D28D9] border border-[#6D28D9] text-white scale-100 active:scale-90'
          : 'bg-white border-[1.5px] border-[#C4B5FD] hover:border-[#6D28D9] hover:bg-[#F5F3FF] active:scale-90'
      }`}
    >
      <Check
        className={`h-3 w-3 stroke-[2.75] transition-transform duration-150 ${
          checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      />
    </button>
  );
};

interface PriorityChipProps {
  priority: TaskPriority;
  compact?: boolean;
}

export const PriorityChip: React.FC<PriorityChipProps> = ({ priority, compact = false }) => {
  const styles: Record<TaskPriority, { bg: string; text: string; dot: string; label: string }> = {
    high: {
      bg: 'bg-[#FFE4E6]',
      text: 'text-[#BE123C]',
      dot: 'bg-[#F43F5E]',
      label: 'High',
    },
    medium: {
      bg: 'bg-[#FEF3C7]',
      text: 'text-[#B45309]',
      dot: 'bg-[#F59E0B]',
      label: 'Medium',
    },
    low: {
      bg: 'bg-[#D1FAE5]',
      text: 'text-[#047857]',
      dot: 'bg-[#10B981]',
      label: 'Low',
    },
  };

  const current = styles[priority];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap shrink-0 ${current.bg} ${current.text} ${
        compact ? 'px-2 py-0.5 text-[11px] leading-4' : 'px-2.5 py-1 text-[12px] leading-4'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} aria-hidden="true" />
      <span>{current.label}</span>
    </span>
  );
};

interface StatusTextProps {
  status: TaskStatus;
}

export const StatusText: React.FC<StatusTextProps> = ({ status }) => {
  const colorMap: Record<TaskStatus, string> = {
    backlog: 'text-[#71717A]',
    in_progress: 'text-[#5300B7]',
    in_review: 'text-[#003E89]',
    done: 'text-[#047857]',
  };
  return (
    <span className={`text-xs font-medium whitespace-nowrap ${colorMap[status]}`}>
      {getStatusLabel(status)}
    </span>
  );
};

interface MemberAvatarProps {
  member?: Member;
  size?: 'sm' | 'md';
}

export const MemberAvatar: React.FC<MemberAvatarProps> = ({ member, size = 'sm' }) => {
  if (!member) return null;
  const dims = size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-7 w-7 text-[11px]';
  return (
    <span
      title={`${member.name} · ${member.role}`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight ring-1 ring-white ${dims}`}
      style={{ backgroundColor: member.avatarBg, color: member.avatarText }}
    >
      {member.initials}
    </span>
  );
};
