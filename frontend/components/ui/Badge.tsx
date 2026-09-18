import React from 'react';
import { StatusType, RoomAvailability } from '../../types';
import { Clock, CheckCircle2, XCircle, CheckCheck, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  className?: string;
  id?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = true,
  className = '',
  id,
}) => {
  // Styles strictly aligned with the prompt requirements
  const badgeConfig: Record<StatusType, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
    pending: {
      label: 'Pending',
      bg: 'bg-[#FEF3C7]',
      text: 'text-[#B45309]',
      border: 'border-[#FDE68A]',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    confirmed: {
      label: 'Confirmed',
      bg: 'bg-[#DCFCE7]',
      text: 'text-[#15803D]',
      border: 'border-[#BBF7D0]',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-[#FEE2E2]',
      text: 'text-[#DC2626]',
      border: 'border-[#FECACA]',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    completed: {
      label: 'Completed',
      bg: 'bg-[#DBEAFE]',
      text: 'text-[#1D4ED8]',
      border: 'border-[#BFDBFE]',
      icon: <CheckCheck className="w-3.5 h-3.5" />,
    },
    responded: {
      label: 'Responded',
      bg: 'bg-[#EFF6FF]',
      text: 'text-[#2563EB]',
      border: 'border-[#BFDBFE]',
      icon: <CheckCheck className="w-3.5 h-3.5" />,
    },
  };

  const config = badgeConfig[status] || badgeConfig.pending;

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} shadow-2xs select-none transition-colors ${className}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};

interface AvailabilityBadgeProps {
  availability: RoomAvailability;
  availableRoomsLeft?: number;
  showIcon?: boolean;
  className?: string;
  id?: string;
}

export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
  availability,
  availableRoomsLeft,
  showIcon = true,
  className = '',
  id,
}) => {
  const config: Record<RoomAvailability, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
    available: {
      label: 'Available',
      bg: 'bg-[#DCFCE7]',
      text: 'text-[#15803D]',
      border: 'border-[#BBF7D0]',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    limited: {
      label: availableRoomsLeft ? `Limited (${availableRoomsLeft} left)` : 'Limited Availability',
      bg: 'bg-[#FEF3C7]',
      text: 'text-[#B45309]',
      border: 'border-[#FDE68A]',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    unavailable: {
      label: 'Unavailable',
      bg: 'bg-[#FEE2E2]',
      text: 'text-[#DC2626]',
      border: 'border-[#FECACA]',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  };

  const current = config[availability] || config.available;

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${current.border} shadow-2xs select-none transition-colors ${className}`}
    >
      {showIcon && current.icon}
      <span>{current.label}</span>
    </span>
  );
};

export type FacilityStatus =
  | 'Available'
  | 'Complimentary'
  | 'Additional Charge'
  | 'Reservation Required';

interface FacilityStatusBadgeProps {
  status: FacilityStatus;
  showIcon?: boolean;
  className?: string;
  id?: string;
}

export const FacilityStatusBadge: React.FC<FacilityStatusBadgeProps> = ({
  status,
  showIcon = true,
  className = '',
  id,
}) => {
  const badgeConfig: Record<
    FacilityStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    Available: {
      label: 'Available',
      bg: 'bg-[#DCFCE7]',
      text: 'text-[#15803D]',
      border: 'border-[#BBF7D0]',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    Complimentary: {
      label: 'Complimentary',
      bg: 'bg-[#ECFDF5]',
      text: 'text-[#047857]',
      border: 'border-[#A7F3D0]',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    'Additional Charge': {
      label: 'Additional Charge',
      bg: 'bg-[#FEF3C7]',
      text: 'text-[#B45309]',
      border: 'border-[#FDE68A]',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    'Reservation Required': {
      label: 'Reservation Required',
      bg: 'bg-[#DBEAFE]',
      text: 'text-[#1D4ED8]',
      border: 'border-[#BFDBFE]',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
  };

  const config = badgeConfig[status] || badgeConfig['Available'];

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} shadow-2xs select-none transition-colors ${className}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};

