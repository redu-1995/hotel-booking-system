'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header, NavPage } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { HOTEL_INFO } from '../../data/hotelData';
import { Inquiry } from '../../types/types';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Users,
  CalendarRange,
  Building2,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  Bed,
  Calendar,
  User,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

/**
 * Django REST Framework API Data Contract for Hotel Inquiries
 * Ready to connect directly to `POST /api/inquiries/`
 */
export interface DjangoInquiryPayload {
  full_name: string;
  phone_number: string;
  email?: string;
  preferred_room_type?: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  request_message: string;
}

export interface DjangoInquiryResponse {
  id: string;
  reference_number: string;
  full_name: string;
  phone_number: string;
  email?: string;
  preferred_room_type: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  request_message: string;
  status: 'pending' | 'in_review' | 'contacted';
  created_at: string;
}

interface InquiryPageProps {
  onNavigate: (page: NavPage) => void;
  onOpenDesignSystem?: () => void;
  onAddInquiry?: (inquiry: Omit<Inquiry, 'id' | 'referenceNumber' | 'createdAt'>) => void;
  initialRoomType?: string;
}

// Available room options as specified in the brief
const ROOM_TYPE_OPTIONS = [
  'Any Room',
  'Standard Room',
  'Superior Single Room',
  'Deluxe King Room',
  'Family Suite',
  'Executive Suite',
  'Presidential Penthouse Suite',
];

export const InquiryPage: React.FC<InquiryPageProps> = ({
  onNavigate,
  onOpenDesignSystem,
  onAddInquiry,
  initialRoomType,
}) => {
  // Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [preferredRoomType, setPreferredRoomType] = useState(initialRoomType || 'Any Room');
  
  // Date calculation defaults: Tomorrow and 3 days later
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const defaultCheckoutStr = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];
  
  const [checkInDate, setCheckInDate] = useState(tomorrowStr);
  const [checkOutDate, setCheckOutDate] = useState(defaultCheckoutStr);
  const [numberOfGuests, setNumberOfGuests] = useState<number>(2);
  const [requestMessage, setRequestMessage] = useState('');

  // UI State: 'idle' | 'submitting' | 'success' | 'error'
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<DjangoInquiryResponse | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  // Quick categories for special inquiries
  const specialCategories = [
    {
      id: 'group-stay',
      title: 'Group Stay',
      description: 'Multiple rooms for families, teams, tour groups, or company delegations.',
      icon: Users,
      badge: '5+ Guests',
      templatePrompt: 'We are organizing a group stay for approximately [X] people needing [Y] rooms. We would like information on group rates and dining packages.',
    },
    {
      id: 'extended-stay',
      title: 'Extended Stay',
      description: 'Longer accommodation requirements exceeding 7 nights with tailored weekly rates.',
      icon: CalendarRange,
      badge: '7+ Nights',
      templatePrompt: 'I am planning an extended stay of [X] weeks/months and would like to learn about long-stay executive suites, housekeeping schedules, and laundry arrangements.',
    },
    {
      id: 'events-meetings',
      title: 'Events & Meetings',
      description: 'Executive boardrooms, private banquets, celebration dinners, or conferences.',
      icon: Building2,
      badge: 'Conferences & Galas',
      templatePrompt: 'We are planning a conference / private dinner for [X] attendees on [Date]. We require audiovisual equipment, catering, and guest room block-outs.',
    },
    {
      id: 'special-requirements',
      title: 'Special Requirements',
      description: 'Accessible accommodations, quiet top-floor suites, anniversary setup, or dietary requests.',
      icon: Sparkles,
      badge: 'Tailored Touch',
      templatePrompt: 'I have a special request for our upcoming stay: [e.g. Accessible roll-in shower / Quiet high-floor room / Complimentary anniversary champagne arrangement].',
    },
  ];

  // How the inquiry works steps
  const processSteps = [
    {
      step: '1',
      title: 'Submit Your Request',
      description: 'Tell us your prospective dates, requirements, preferences, or questions.',
    },
    {
      step: '2',
      title: 'Our Team Reviews It',
      description: 'Hotel reservations & concierge staff thoroughly review room availability and custom options.',
    },
    {
      step: '3',
      title: 'We Contact You',
      description: 'Our team responds promptly with bespoke pricing, confirmed availability, and tailored guidance.',
    },
  ];

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter a valid full name (minimum 2 characters).';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required so our team can reach you.';
    } else if (phoneNumber.trim().length < 7) {
      newErrors.phoneNumber = 'Please enter a valid telephone number with area code.';
    }

    if (emailAddress.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailAddress.trim())) {
        newErrors.emailAddress = 'Please enter a valid email address (e.g. name@example.com).';
      }
    }

    if (!checkInDate) {
      newErrors.checkInDate = 'Check-in date is required.';
    }

    if (!checkOutDate) {
      newErrors.checkOutDate = 'Check-out date is required.';
    } else if (checkInDate && checkOutDate <= checkInDate) {
      newErrors.checkOutDate = 'Check-out date must be strictly after the check-in date.';
    }

    if (!numberOfGuests || numberOfGuests < 1) {
      newErrors.numberOfGuests = 'Please select at least 1 guest.';
    }

    if (!requestMessage.trim()) {
      newErrors.requestMessage = 'Please describe your request or questions for our team.';
    } else if (requestMessage.trim().length < 10) {
      newErrors.requestMessage = 'Please provide a little more detail (at least 10 characters) so we can best assist you.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submission handler with Django REST Framework API structure
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      // Smooth scroll to top of form to show validation errors
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setSubmitStatus('submitting');

    // Django API compatible payload
    const payload: DjangoInquiryPayload = {
      full_name: fullName.trim(),
      phone_number: phoneNumber.trim(),
      email: emailAddress.trim() || undefined,
      preferred_room_type: preferredRoomType,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      number_of_guests: Number(numberOfGuests),
      request_message: requestMessage.trim(),
    };

    try {
      // Simulate / ready for real Django REST API endpoint: POST /api/inquiries/
      // In production with backend running, this uses:
      // const res = await fetch('/api/inquiries/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });
      
      await new Promise((resolve) => setTimeout(resolve, 850));

      const generatedRef = `INQ-${Math.floor(100000 + Math.random() * 900000)}`;
      const responseData: DjangoInquiryResponse = {
        id: `django-inq-${Date.now()}`,
        reference_number: generatedRef,
        full_name: payload.full_name,
        phone_number: payload.phone_number,
        email: payload.email,
        preferred_room_type: payload.preferred_room_type || 'Any Room',
        check_in_date: payload.check_in_date,
        check_out_date: payload.check_out_date,
        number_of_guests: payload.number_of_guests,
        request_message: payload.request_message,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      // Notify parent app state
      if (onAddInquiry) {
        onAddInquiry({
          guestName: responseData.full_name,
          phone: responseData.phone_number,
          email: responseData.email || '',
          roomType: responseData.preferred_room_type,
          checkIn: responseData.check_in_date,
          checkOut: responseData.check_out_date,
          guests: responseData.number_of_guests,
          status: 'pending',
          message: responseData.request_message,
        });
      }

      setSuccessData(responseData);
      setSubmitStatus('success');
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err: any) {
      setSubmitStatus('error');
      setErrorMessage(
        err?.message || 'Unable to submit your inquiry at this moment. Please verify your connection or contact our front desk directly.'
      );
    }
  };

  const handleCopyReference = () => {
    if (successData?.reference_number) {
      navigator.clipboard.writeText(successData.reference_number);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2200);
    }
  };

  const handleResetForm = () => {
    setFullName('');
    setPhoneNumber('');
    setEmailAddress('');
    setPreferredRoomType('Any Room');
    setCheckInDate(tomorrowStr);
    setCheckOutDate(defaultCheckoutStr);
    setNumberOfGuests(2);
    setRequestMessage('');
    setErrors({});
    setErrorMessage(null);
    setSuccessData(null);
    setSubmitStatus('idle');
    setSelectedCategory(null);
  };

  const handleSelectCategory = (cat: typeof specialCategories[0]) => {
    setSelectedCategory(cat.id);
    if (!requestMessage || requestMessage.trim().length === 0) {
      setRequestMessage(cat.templatePrompt);
    } else {
      setRequestMessage((prev) => `${prev}\n\n[${cat.title} Note]: ${cat.templatePrompt}`);
    }
    // Scroll to form smoothly
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#1F2937]">
      {/* 1. HEADER - Matching global header, clearly highlighting 'Inquiry' */}
      <Header
        currentPage="inquiry"
        onNavigate={onNavigate}
        onBookNowClick={() => onNavigate('booking')}
        onOpenInquiryClick={() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        onOpenDesignSystemClick={onOpenDesignSystem}
      />

      <main className="flex-grow">
        {/* 2. COMPACT HERO SECTION */}
        <section
          id="inquiry-hero-section"
          className="relative bg-[#12355B] text-white py-14 sm:py-20 lg:py-24 overflow-hidden border-b border-[#E5E7EB]/20"
        >
          {/* Refined subtle hotel interior / lobby image with dark navy overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80"
              alt="The Grandview Hotel Lobby & Concierge"
              className="w-full h-full object-cover object-center scale-105 filter brightness-[0.72] contrast-105"
            />
            {/* Sophisticated dual navy overlay for soft contrast and readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#12355B]/95 via-[#12355B]/88 to-[#12355B]/80" />
            <div className="absolute inset-0 bg-[#12355B]/30 backdrop-blur-[0.5px]" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Small Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs sm:text-sm text-[#D4A853] mb-4 font-medium tracking-wide"
            >
              <button
                onClick={() => onNavigate('home')}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                Home
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-white/50" />
              <span className="text-white font-semibold">Inquiry</span>
            </nav>

            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#D4A853] text-xs font-semibold uppercase tracking-wider mb-3.5 border border-white/15 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
                Concierge & Guest Inquiries
              </span>

              {/* Exact Requested Heading */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
                Have a Special Request?
              </h1>

              {/* Exact Requested Supporting Text */}
              <p className="text-base sm:text-lg text-white/90 leading-relaxed font-sans font-light">
                Tell us what you need and our team will help arrange a comfortable stay tailored to your requirements.
              </p>
            </div>
          </div>
        </section>

        {/* 3. MAIN INQUIRY SECTION (Two-column layout on desktop, single-column on mobile) */}
        <section
          ref={formRef}
          id="main-inquiry-section"
          className="py-12 sm:py-16 lg:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT SIDE — INQUIRY FORM (inside clean white card with subtle shadow) */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 sm:p-8 lg:p-10 transition-all">
                
                {/* SUCCESS STATE */}
                {submitStatus === 'success' && successData ? (
                  <div
                    id="inquiry-success-card"
                    className="py-6 text-center animate-in fade-in zoom-in-95 duration-300"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 text-[#16A34A] flex items-center justify-center mx-auto mb-5 shadow-sm">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#12355B] mb-2.5">
                      Inquiry Sent Successfully
                    </h2>

                    <p className="text-[#6B7280] text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed">
                      Thank you for contacting The Grandview Hotel & Suites. Our team has received your request and will contact you shortly.
                    </p>

                    {/* Prominent Reference Display Box */}
                    <div className="bg-[#F8F7F4] border border-[#E5E7EB] rounded-lg p-5 max-w-md mx-auto mb-8 text-left">
                      <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-[#E5E7EB]">
                        <div>
                          <span className="text-xs uppercase font-semibold text-[#6B7280] tracking-wider block">
                            Inquiry Reference
                          </span>
                          <span className="font-mono text-xl sm:text-2xl font-bold text-[#12355B]">
                            {successData.reference_number}
                          </span>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCopyReference}
                          className="shrink-0 flex items-center gap-1.5 text-xs"
                        >
                          {copiedRef ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-green-700 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#12355B]" />
                              <span>Copy Reference</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Summary of submitted request */}
                      <div className="text-xs sm:text-sm text-[#4B5563] space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-[#6B7280]">Guest Name:</span>
                          <span className="font-medium text-[#1F2937]">{successData.full_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B7280]">Phone:</span>
                          <span className="font-medium text-[#1F2937]">{successData.phone_number}</span>
                        </div>
                        {successData.email && (
                          <div className="flex justify-between">
                            <span className="text-[#6B7280]">Email:</span>
                            <span className="font-medium text-[#1F2937]">{successData.email}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-[#6B7280]">Dates:</span>
                          <span className="font-medium text-[#1F2937]">
                            {successData.check_in_date} to {successData.check_out_date}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B7280]">Room Choice:</span>
                          <span className="font-medium text-[#1F2937]">{successData.preferred_room_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B7280]">Guests:</span>
                          <span className="font-medium text-[#1F2937]">{successData.number_of_guests} guest(s)</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons as specified in prompt */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                      <Button
                        variant="primary"
                        onClick={() => onNavigate('home')}
                        className="w-full sm:w-auto"
                      >
                        Return to Home
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => onNavigate('rooms')}
                        className="w-full sm:w-auto"
                      >
                        Explore Rooms
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleResetForm}
                        className="w-full sm:w-auto text-[#12355B]"
                      >
                        Send Another Inquiry
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* DEFAULT & VALIDATION FORM STATE */
                  <div>
                    {/* Header */}
                    <div className="mb-8 pb-5 border-b border-[#E5E7EB]">
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#12355B] tracking-tight mb-2">
                        Send Us an Inquiry
                      </h2>
                      <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
                        Share your travel details and request. Our team will review your inquiry and contact you with the appropriate information or options.
                      </p>
                    </div>

                    {/* Error Banner if API or unexpected fault occurs */}
                    {submitStatus === 'error' && errorMessage && (
                      <div
                        id="inquiry-error-banner"
                        className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm animate-in fade-in"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-red-800">Submission Notice</p>
                          <p className="mt-0.5">{errorMessage}</p>
                        </div>
                        <button
                          onClick={() => setSubmitStatus('idle')}
                          className="text-xs text-red-700 hover:text-red-900 font-semibold underline"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="space-y-6">
                      {/* Row 1: Full Name & Phone Number (Both Required) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* 1. Full Name */}
                        <div>
                          <label
                            htmlFor="inquiry-full-name"
                            className="block text-sm font-semibold text-[#1F2937] mb-1.5"
                          >
                            Full Name <span className="text-[#DC2626]">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                              <User className="w-4 h-4 text-[#12355B]" />
                            </div>
                            <input
                              id="inquiry-full-name"
                              type="text"
                              value={fullName}
                              onChange={(e) => {
                                setFullName(e.target.value);
                                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                              }}
                              disabled={submitStatus === 'submitting'}
                              className={`w-full bg-white border ${
                                errors.fullName
                                  ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
                                  : 'border-[#E5E7EB] focus:border-[#12355B] focus:ring-[#12355B]/20'
                              } text-[#1F2937] placeholder-[#9CA3AF] text-sm rounded-lg transition-colors py-2.5 pl-10 pr-3.5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                              placeholder="e.g. Eleanor Vance"
                            />
                          </div>
                          {errors.fullName && (
                            <p className="mt-1.5 text-xs text-[#DC2626] flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {errors.fullName}
                            </p>
                          )}
                        </div>

                        {/* 2. Phone Number */}
                        <div>
                          <label
                            htmlFor="inquiry-phone-number"
                            className="block text-sm font-semibold text-[#1F2937] mb-1.5"
                          >
                            Phone Number <span className="text-[#DC2626]">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                              <Phone className="w-4 h-4 text-[#12355B]" />
                            </div>
                            <input
                              id="inquiry-phone-number"
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => {
                                setPhoneNumber(e.target.value);
                                if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: '' }));
                              }}
                              disabled={submitStatus === 'submitting'}
                              className={`w-full bg-white border ${
                                errors.phoneNumber
                                  ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
                                  : 'border-[#E5E7EB] focus:border-[#12355B] focus:ring-[#12355B]/20'
                              } text-[#1F2937] placeholder-[#9CA3AF] text-sm rounded-lg transition-colors py-2.5 pl-10 pr-3.5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                              placeholder="e.g. +1 (555) 234-5678"
                            />
                          </div>
                          {errors.phoneNumber && (
                            <p className="mt-1.5 text-xs text-[#DC2626] flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {errors.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Email Address (Optional) & Preferred Room Type (Optional Dropdown) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* 3. Email Address (Optional) */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label
                              htmlFor="inquiry-email-address"
                              className="block text-sm font-semibold text-[#1F2937]"
                            >
                              Email Address
                            </label>
                            <span className="text-xs text-[#6B7280] font-normal">Optional</span>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                              <Mail className="w-4 h-4 text-[#12355B]" />
                            </div>
                            <input
                              id="inquiry-email-address"
                              type="email"
                              value={emailAddress}
                              onChange={(e) => {
                                setEmailAddress(e.target.value);
                                if (errors.emailAddress) setErrors((prev) => ({ ...prev, emailAddress: '' }));
                              }}
                              disabled={submitStatus === 'submitting'}
                              className={`w-full bg-white border ${
                                errors.emailAddress
                                  ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
                                  : 'border-[#E5E7EB] focus:border-[#12355B] focus:ring-[#12355B]/20'
                              } text-[#1F2937] placeholder-[#9CA3AF] text-sm rounded-lg transition-colors py-2.5 pl-10 pr-3.5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                              placeholder="e.g. eleanor@example.com"
                            />
                          </div>
                          {errors.emailAddress && (
                            <p className="mt-1.5 text-xs text-[#DC2626] flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {errors.emailAddress}
                            </p>
                          )}
                        </div>

                        {/* 4. Preferred Room Type (Optional Dropdown) */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label
                              htmlFor="inquiry-preferred-room"
                              className="block text-sm font-semibold text-[#1F2937]"
                            >
                              Preferred Room Type
                            </label>
                            <span className="text-xs text-[#6B7280] font-normal">Optional</span>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                              <Bed className="w-4 h-4 text-[#12355B]" />
                            </div>
                            <select
                              id="inquiry-preferred-room"
                              value={preferredRoomType}
                              onChange={(e) => setPreferredRoomType(e.target.value)}
                              disabled={submitStatus === 'submitting'}
                              className="w-full appearance-none bg-white border border-[#E5E7EB] focus:border-[#12355B] focus:ring-[#12355B]/20 text-[#1F2937] text-sm rounded-lg transition-colors py-2.5 pl-10 pr-10 focus:outline-none focus:ring-2 cursor-pointer disabled:bg-gray-100"
                            >
                              {ROOM_TYPE_OPTIONS.map((room) => (
                                <option key={room} value={room}>
                                  {room}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#6B7280]">
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Row 3: Stay Details (Check-in Date, Check-out Date, Number of Guests) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {/* 5. Check-in Date */}
                        <div>
                          <label
                            htmlFor="inquiry-checkin-date"
                            className="block text-sm font-semibold text-[#1F2937] mb-1.5"
                          >
                            Check-in Date <span className="text-[#DC2626]">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#12355B]">
                              <Calendar className="w-4 h-4 text-[#12355B]" />
                            </div>
                            <input
                              id="inquiry-checkin-date"
                              type="date"
                              min={todayStr}
                              value={checkInDate}
                              onChange={(e) => {
                                const newIn = e.target.value;
                                setCheckInDate(newIn);
                                if (errors.checkInDate) setErrors((prev) => ({ ...prev, checkInDate: '' }));
                                // Auto-adjust checkout if invalid
                                if (checkOutDate && checkOutDate <= newIn) {
                                  const nextDay = new Date(new Date(newIn).getTime() + 86400000).toISOString().split('T')[0];
                                  setCheckOutDate(nextDay);
                                }
                              }}
                              disabled={submitStatus === 'submitting'}
                              className={`w-full bg-white border ${
                                errors.checkInDate
                                  ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
                                  : 'border-[#E5E7EB] focus:border-[#12355B] focus:ring-[#12355B]/20'
                              } text-[#1F2937] text-sm rounded-lg transition-colors py-2.5 pl-10 pr-3.5 focus:outline-none focus:ring-2 cursor-pointer disabled:bg-gray-100`}
                            />
                          </div>
                          {errors.checkInDate && (
                            <p className="mt-1.5 text-xs text-[#DC2626] flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {errors.checkInDate}
                            </p>
                          )}
                        </div>

                        {/* 6. Check-out Date */}
                        <div>
                          <label
                            htmlFor="inquiry-checkout-date"
                            className="block text-sm font-semibold text-[#1F2937] mb-1.5"
                          >
                            Check-out Date <span className="text-[#DC2626]">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#12355B]">
                              <Calendar className="w-4 h-4 text-[#12355B]" />
                            </div>
                            <input
                              id="inquiry-checkout-date"
                              type="date"
                              min={checkInDate || todayStr}
                              value={checkOutDate}
                              onChange={(e) => {
                                setCheckOutDate(e.target.value);
                                if (errors.checkOutDate) setErrors((prev) => ({ ...prev, checkOutDate: '' }));
                              }}
                              disabled={submitStatus === 'submitting'}
                              className={`w-full bg-white border ${
                                errors.checkOutDate
                                  ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
                                  : 'border-[#E5E7EB] focus:border-[#12355B] focus:ring-[#12355B]/20'
                              } text-[#1F2937] text-sm rounded-lg transition-colors py-2.5 pl-10 pr-3.5 focus:outline-none focus:ring-2 cursor-pointer disabled:bg-gray-100`}
                            />
                          </div>
                          {errors.checkOutDate && (
                            <p className="mt-1.5 text-xs text-[#DC2626] flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {errors.checkOutDate}
                            </p>
                          )}
                        </div>

                        {/* 7. Number of Guests */}
                        <div>
                          <label
                            htmlFor="inquiry-guests-count"
                            className="block text-sm font-semibold text-[#1F2937] mb-1.5"
                          >
                            Number of Guests <span className="text-[#DC2626]">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#12355B]">
                              <Users className="w-4 h-4 text-[#12355B]" />
                            </div>
                            <select
                              id="inquiry-guests-count"
                              value={numberOfGuests}
                              onChange={(e) => {
                                setNumberOfGuests(Number(e.target.value));
                                if (errors.numberOfGuests) setErrors((prev) => ({ ...prev, numberOfGuests: '' }));
                              }}
                              disabled={submitStatus === 'submitting'}
                              className={`w-full appearance-none bg-white border ${
                                errors.numberOfGuests
                                  ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
                                  : 'border-[#E5E7EB] focus:border-[#12355B] focus:ring-[#12355B]/20'
                              } text-[#1F2937] text-sm rounded-lg transition-colors py-2.5 pl-10 pr-10 focus:outline-none focus:ring-2 cursor-pointer disabled:bg-gray-100`}
                            >
                              <option value={1}>1 Guest</option>
                              <option value={2}>2 Guests</option>
                              <option value={3}>3 Guests</option>
                              <option value={4}>4 Guests</option>
                              <option value={5}>5 Guests</option>
                              <option value={6}>6 Guests</option>
                              <option value={8}>8+ Guests (Group)</option>
                              <option value={12}>12+ Guests (Delegation)</option>
                              <option value={20}>20+ Guests (Event / Conference)</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#6B7280]">
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                          {errors.numberOfGuests && (
                            <p className="mt-1.5 text-xs text-[#DC2626] flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {errors.numberOfGuests}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 8. Your Request / Message (Large Textarea) */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            htmlFor="inquiry-message"
                            className="block text-sm font-semibold text-[#1F2937]"
                          >
                            Your Request / Message <span className="text-[#DC2626]">*</span>
                          </label>
                          <span className="text-xs text-[#6B7280]">
                            {requestMessage.length} characters
                          </span>
                        </div>
                        <div className="relative">
                          <textarea
                            id="inquiry-message"
                            rows={5}
                            value={requestMessage}
                            onChange={(e) => {
                              setRequestMessage(e.target.value);
                              if (errors.requestMessage) setErrors((prev) => ({ ...prev, requestMessage: '' }));
                            }}
                            disabled={submitStatus === 'submitting'}
                            className={`w-full bg-white border ${
                              errors.requestMessage
                                ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
                                : 'border-[#E5E7EB] focus:border-[#12355B] focus:ring-[#12355B]/20'
                            } text-[#1F2937] placeholder-[#9CA3AF] text-sm rounded-lg transition-colors p-3.5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                            placeholder="Please detail your travel arrangements, group size, specific room preferences, arrival times, accessibility needs, or any questions for our reservations team..."
                          />
                        </div>
                        {errors.requestMessage ? (
                          <p className="mt-1.5 text-xs text-[#DC2626] flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.requestMessage}
                          </p>
                        ) : (
                          <p className="mt-1.5 text-xs text-[#6B7280]">
                            Include any relevant timing, special services, or dietary needs.
                          </p>
                        )}
                      </div>

                      {/* Primary Button: Send Inquiry / Submitting state */}
                      <div className="pt-2">
                        <Button
                          id="inquiry-submit-btn"
                          type="submit"
                          variant="primary"
                          size="lg"
                          fullWidth
                          disabled={submitStatus === 'submitting'}
                          className="shadow-sm font-semibold"
                        >
                          {submitStatus === 'submitting' ? (
                            <span className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin text-white" />
                              Sending Inquiry...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <Send className="w-4 h-4 text-[#D4A853]" />
                              Send Inquiry
                            </span>
                          )}
                        </Button>

                        {/* Privacy / Helper Message below the button */}
                        <p className="mt-3 text-xs text-center text-[#6B7280] leading-relaxed">
                          Your information will only be used to respond to your inquiry and assist with your stay.
                        </p>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE — CONTACT/HELP CARD (Visually lighter information panel) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-6 sm:p-7 shadow-sm">
                
                {/* Heading & Supporting Text */}
                <div className="mb-6 pb-4 border-b border-[#E5E7EB]">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#12355B] bg-[#12355B]/8 px-2.5 py-1 rounded-full mb-2.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#12355B]" />
                    Direct Assistance
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#12355B] mb-2 leading-snug">
                    Need Help Planning Your Stay?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                    If you're planning a group stay, extended visit, event, or have specific requirements, our team is happy to assist.
                  </p>
                </div>

                {/* Four Concise Contact Options as requested in prompt */}
                <div className="space-y-4 mb-7">
                  {/* 1. Phone */}
                  <div className="flex items-start gap-3.5 group">
                    <div className="w-9 h-9 rounded-lg bg-[#F8F7F4] border border-[#E5E7EB] flex items-center justify-center text-[#12355B] shrink-0 group-hover:border-[#12355B] transition-colors">
                      <Phone className="w-4 h-4 text-[#12355B]" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-[#12355B] uppercase tracking-wider">
                        Phone
                      </span>
                      <p className="text-xs text-[#6B7280] mb-0.5">
                        Speak with our reservations team
                      </p>
                      <a
                        href={`tel:${HOTEL_INFO.phone}`}
                        className="text-sm font-semibold text-[#12355B] hover:text-[#D4A853] transition-colors block"
                      >
                        {HOTEL_INFO.phone}
                      </a>
                    </div>
                  </div>

                  {/* 2. Email */}
                  <div className="flex items-start gap-3.5 group">
                    <div className="w-9 h-9 rounded-lg bg-[#F8F7F4] border border-[#E5E7EB] flex items-center justify-center text-[#12355B] shrink-0 group-hover:border-[#12355B] transition-colors">
                      <Mail className="w-4 h-4 text-[#12355B]" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-[#12355B] uppercase tracking-wider">
                        Email
                      </span>
                      <p className="text-xs text-[#6B7280] mb-0.5">
                        Send us your accommodation requirements
                      </p>
                      <a
                        href={`mailto:${HOTEL_INFO.inquiryEmail || HOTEL_INFO.email}`}
                        className="text-xs sm:text-sm font-semibold text-[#12355B] hover:text-[#D4A853] transition-colors break-all block"
                      >
                        {HOTEL_INFO.inquiryEmail || HOTEL_INFO.email}
                      </a>
                    </div>
                  </div>

                  {/* 3. Location */}
                  <div className="flex items-start gap-3.5 group">
                    <div className="w-9 h-9 rounded-lg bg-[#F8F7F4] border border-[#E5E7EB] flex items-center justify-center text-[#12355B] shrink-0 group-hover:border-[#12355B] transition-colors">
                      <MapPin className="w-4 h-4 text-[#12355B]" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-[#12355B] uppercase tracking-wider">
                        Location
                      </span>
                      <p className="text-xs text-[#6B7280] mb-0.5">
                        Visit The Grandview Hotel & Suites
                      </p>
                      <span className="text-xs text-[#4B5563] leading-relaxed block">
                        {HOTEL_INFO.address}
                      </span>
                    </div>
                  </div>

                  {/* 4. Response Time */}
                  <div className="flex items-start gap-3.5 group">
                    <div className="w-9 h-9 rounded-lg bg-[#F8F7F4] border border-[#E5E7EB] flex items-center justify-center text-[#12355B] shrink-0 group-hover:border-[#12355B] transition-colors">
                      <Clock className="w-4 h-4 text-[#12355B]" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-[#12355B] uppercase tracking-wider">
                        Response Time
                      </span>
                      <p className="text-xs text-[#6B7280] mb-0.5">
                        We'll review your request and get back to you as soon as possible
                      </p>
                      <span className="text-xs font-semibold text-[#16A34A] flex items-center gap-1 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                        Average reply within 2–4 hours
                      </span>
                    </div>
                  </div>
                </div>

                {/* Secondary Button: Book a Room (Takes guest to direct booking page) */}
                <div className="pt-4 border-t border-[#E5E7EB]">
                  <Button
                    id="inquiry-book-room-btn"
                    variant="secondary"
                    fullWidth
                    size="md"
                    onClick={() => onNavigate('booking')}
                    className="font-semibold border-[#12355B] text-[#12355B] hover:bg-[#12355B] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Book a Room</span>
                    <ArrowRight className="w-4 h-4 text-[#D4A853]" />
                  </Button>
                  <p className="mt-2 text-[11px] text-center text-[#6B7280]">
                    Need immediate room confirmation? Reserve online instantly.
                  </p>
                </div>
              </div>

              {/* Direct Booking vs. Inquiry Clarification Note */}
              <div className="bg-[#12355B]/5 border border-[#12355B]/15 rounded-xl p-5 text-xs text-[#4B5563]">
                <div className="flex items-center gap-2 font-semibold text-[#12355B] mb-1.5">
                  <MessageSquare className="w-4 h-4 text-[#D4A853]" />
                  <span>Booking vs. Inquiries</span>
                </div>
                <p className="leading-relaxed">
                  <strong>Direct Booking</strong> is intended for guests ready to immediately reserve an available room at our best rate. <strong>Inquiries</strong> are designed for custom requirements, delegations, and requests requiring staff review.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 4. SPECIAL REQUEST CATEGORIES SECTION ("What Can We Help You With?") */}
        <section
          id="special-request-categories"
          className="py-12 sm:py-16 bg-white border-y border-[#E5E7EB]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4A853] block mb-2">
                Tailored Accommodations
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#12355B]">
                What Can We Help You With?
              </h2>
              <p className="text-sm text-[#6B7280] mt-2">
                Click any category below to automatically tailor your message for our concierge and reservation specialists.
              </p>
            </div>

            {/* Four Elegant Cards as specified in prompt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {specialCategories.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`text-left bg-[#F8F7F4] hover:bg-white rounded-xl p-6 border transition-all duration-200 cursor-pointer group flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#12355B] shadow-md ring-2 ring-[#12355B]/20 bg-white'
                        : 'border-[#E5E7EB] hover:border-[#12355B]/40 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Top icon and badge */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#12355B] group-hover:bg-[#12355B] group-hover:text-[#D4A853] transition-colors shadow-2xs">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-semibold text-[#12355B] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">
                          {cat.badge}
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-[#12355B] mb-2 group-hover:text-[#12355B]">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
                        {cat.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E5E7EB]/80 flex items-center text-xs font-semibold text-[#12355B] group-hover:text-[#D4A853] gap-1">
                      <span>{isSelected ? 'Selected for Inquiry' : 'Use this template'}</span>
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. HOW THE INQUIRY WORKS (Three-step horizontal process) */}
        <section
          id="how-inquiry-works"
          className="py-12 sm:py-16 bg-[#F8F7F4]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4A853] block mb-1.5">
                Simple & Transparent
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#12355B]">
                How The Inquiry Works
              </h2>
            </div>

            {/* Three-step horizontal layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
              {processSteps.map((step, idx) => (
                <div
                  key={step.step}
                  className="bg-white rounded-xl p-6 sm:p-7 border border-[#E5E7EB] shadow-xs relative flex flex-col items-center text-center group hover:border-[#12355B]/40 transition-colors"
                >
                  {/* Step Number Circle */}
                  <div className="w-12 h-12 rounded-full bg-[#12355B] text-[#D4A853] font-serif font-bold text-lg flex items-center justify-center mb-4 shadow-sm border-2 border-white ring-4 ring-[#12355B]/10">
                    {step.step}
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#12355B] mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                    {step.description}
                  </p>

                  {/* Horizontal indicator arrow on desktop */}
                  {idx < processSteps.length - 1 && (
                    <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-[#D4A853]">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer
        onNavigate={onNavigate}
        onOpenInquiry={() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      />
    </div>
  );
};

export default function Page() {
  const router = useRouter();

  const handleNavigate = (page: NavPage) => {
    const pathMap: Record<string, string> = {
      home: '/',
      rooms: '/rooms',
      about: '/about',
      inquiry: '/inquiry',
      booking: '/booking',
    };

    router.push(pathMap[page] || '/');
  };

  return (
    <InquiryPage
      onNavigate={handleNavigate}
      onOpenDesignSystem={() => router.push('/')}
      onAddInquiry={() => undefined}
    />
  );
}
