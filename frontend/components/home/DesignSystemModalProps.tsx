import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { StatusBadge, FacilityStatusBadge } from '../ui/Badge';
import { TextInput, DatePickerInput, SelectDropdown } from '../ui/FormInputs';
import { ROOMS_DATA, FACILITIES_DATA } from '../../data/hotelData';
import { RoomCard } from '../rooms/RoomCard';
import { X, Palette, Type, Layers, Check, ExternalLink } from 'lucide-react';

interface DesignSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesignSystemModal: React.FC<DesignSystemModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'buttons' | 'inputs' | 'badges' | 'cards' | 'typography'>('buttons');

  return (
    <div
      id="design-system-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="design-system-modal"
        className="relative w-full max-w-5xl bg-white rounded-[12px] shadow-2xl border border-[#E5E7EB] overflow-hidden my-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#12355B] text-white p-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#D4A853] font-semibold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" /> Component Architecture & Specs
            </div>
            <h2 className="font-serif font-bold text-2xl mt-1">
              Figma Component Library & Variants
            </h2>
            <p className="text-xs text-white/80 mt-0.5">
              Reusable UI atoms, inputs, status badges, and card variants aligned with hotel design tokens.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-3 bg-[#F8F7F4] border-b border-[#E5E7EB] overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('buttons')}
            className={`px-4 py-2 rounded-[6px] text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'buttons' ? 'bg-[#12355B] text-white shadow-2xs' : 'text-[#6B7280] hover:text-[#12355B]'
            }`}
          >
            Buttons & CTAs
          </button>
          <button
            onClick={() => setActiveTab('inputs')}
            className={`px-4 py-2 rounded-[6px] text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'inputs' ? 'bg-[#12355B] text-white shadow-2xs' : 'text-[#6B7280] hover:text-[#12355B]'
            }`}
          >
            Form Inputs
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 rounded-[6px] text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'badges' ? 'bg-[#12355B] text-white shadow-2xs' : 'text-[#6B7280] hover:text-[#12355B]'
            }`}
          >
            Status Badges
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 rounded-[6px] text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'cards' ? 'bg-[#12355B] text-white shadow-2xs' : 'text-[#6B7280] hover:text-[#12355B]'
            }`}
          >
            Cards & Navigation
          </button>
          <button
            onClick={() => setActiveTab('typography')}
            className={`px-4 py-2 rounded-[6px] text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'typography' ? 'bg-[#12355B] text-white shadow-2xs' : 'text-[#6B7280] hover:text-[#12355B]'
            }`}
          >
            Colors & Typography
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-8">
          {activeTab === 'buttons' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#12355B] mb-1">
                  1. Primary Button Variants (Deep Navy #12355B, 8px radius)
                </h3>
                <p className="text-xs text-[#6B7280] mb-4">
                  Used for high-priority actions like &quot;Book Now&quot; and &quot;Confirm Reservation&quot;.
                </p>
                <div className="flex flex-wrap items-center gap-4 p-4 rounded-[8px] bg-[#F8F7F4] border border-[#E5E7EB]">
                  <div>
                    <div className="text-[11px] text-[#6B7280] mb-1">Default State</div>
                    <Button variant="primary">Book Now</Button>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6B7280] mb-1">Small Size</div>
                    <Button variant="primary" size="sm">Book Now</Button>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6B7280] mb-1">Large Size</div>
                    <Button variant="primary" size="lg">Book Your Stay</Button>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6B7280] mb-1">Loading State</div>
                    <Button variant="primary" isLoading>Book Now</Button>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6B7280] mb-1">Disabled State</div>
                    <Button variant="primary" disabled>Sold Out</Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-[#12355B] mb-1">
                  2. Secondary Button Variants (Navy Border, White/Transparent BG)
                </h3>
                <p className="text-xs text-[#6B7280] mb-4">
                  Used for secondary actions like &quot;View Details&quot;, &quot;Explore Rooms&quot;, &quot;Cancel&quot;.
                </p>
                <div className="flex flex-wrap items-center gap-4 p-4 rounded-[8px] bg-[#F8F7F4] border border-[#E5E7EB]">
                  <div>
                    <div className="text-[11px] text-[#6B7280] mb-1">Default State</div>
                    <Button variant="secondary">View Details</Button>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6B7280] mb-1">Small Size</div>
                    <Button variant="secondary" size="sm">View Details</Button>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6B7280] mb-1">Large Size</div>
                    <Button variant="secondary" size="lg">Explore Rooms</Button>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6B7280] mb-1">Disabled State</div>
                    <Button variant="secondary" disabled>Unavailable</Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-[#12355B] mb-1">
                  3. Gold Accent Button (Warm Gold #D4A853, Dark Text)
                </h3>
                <p className="text-xs text-[#6B7280] mb-4">
                  Used sparingly for standout highlights and premium calls to action.
                </p>
                <div className="flex flex-wrap items-center gap-4 p-4 rounded-[8px] bg-[#F8F7F4] border border-[#E5E7EB]">
                  <div>
                    <div className="text-[11px] text-[#6B7280] mb-1">Default Accent</div>
                    <Button variant="gold">Book Your Stay</Button>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6B7280] mb-1">Large Accent</div>
                    <Button variant="gold" size="lg">Book a Room</Button>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6B7280] mb-1">Disabled Accent</div>
                    <Button variant="gold" disabled>Promo Expired</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inputs' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#12355B] mb-1">
                  Form Inputs (White BG, #E5E7EB Border, 8px Radius, Navy Focus)
                </h3>
                <p className="text-xs text-[#6B7280] mb-4">
                  Clean, accessible, consistent height inputs with responsive focus rings.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 rounded-[8px] bg-[#F8F7F4] border border-[#E5E7EB]">
                  <TextInput
                    label="Guest Full Name"
                    placeholder="e.g. Eleanor Vance"
                    defaultValue="Eleanor Vance"
                    helperText="Input with clear label & placeholder"
                  />
                  <DatePickerInput
                    label="Check-In Date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    helperText="Date picker with calendar icon"
                  />
                  <SelectDropdown
                    label="Guests Selection"
                    options={[
                      { value: 1, label: '1 Guest' },
                      { value: 2, label: '2 Guests' },
                      { value: 3, label: '3 Guests' },
                    ]}
                    defaultValue={2}
                    helperText="Select dropdown with chevron"
                  />
                  <TextInput
                    label="Input with Error State"
                    defaultValue="invalid-email-address"
                    error="Please provide a valid email format."
                  />
                  <TextInput
                    label="Disabled Input"
                    defaultValue="Locked Booking ID: GV-8274"
                    disabled
                    helperText="Readonly or disabled parameter"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#12355B] mb-1">
                  Status Badges (Pill shape, small text, medium weight, padded)
                </h3>
                <p className="text-xs text-[#6B7280] mb-4">
                  Reusable across booking search, inquiry trackers, and future admin dashboards.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-[8px] bg-[#F8F7F4] border border-[#E5E7EB] text-center">
                  <div className="p-4 bg-white rounded-[8px] border border-[#E5E7EB] flex flex-col items-center gap-2">
                    <StatusBadge status="pending" />
                    <span className="text-[11px] font-mono text-[#6B7280]">Soft Yellow/Orange</span>
                    <p className="text-xs text-[#6B7280]">New inquiries awaiting concierge review</p>
                  </div>

                  <div className="p-4 bg-white rounded-[8px] border border-[#E5E7EB] flex flex-col items-center gap-2">
                    <StatusBadge status="confirmed" />
                    <span className="text-[11px] font-mono text-[#6B7280]">Soft Green</span>
                    <p className="text-xs text-[#6B7280]">Active reservations and accepted requests</p>
                  </div>

                  <div className="p-4 bg-white rounded-[8px] border border-[#E5E7EB] flex flex-col items-center gap-2">
                    <StatusBadge status="completed" />
                    <span className="text-[11px] font-mono text-[#6B7280]">Soft Blue</span>
                    <p className="text-xs text-[#6B7280]">Past stays and concluded guest inquiries</p>
                  </div>

                  <div className="p-4 bg-white rounded-[8px] border border-[#E5E7EB] flex flex-col items-center gap-2">
                    <StatusBadge status="cancelled" />
                    <span className="text-[11px] font-mono text-[#6B7280]">Soft Red</span>
                    <p className="text-xs text-[#6B7280]">Guest cancellations or expired inquiries</p>
                  </div>
                </div>
              </div>

              {/* Facility Status Badges */}
              <div>
                <h3 className="font-serif font-bold text-lg text-[#12355B] mb-1">
                  Facility & Service Badges (Pill Shape, Rounded-Full)
                </h3>
                <p className="text-xs text-[#6B7280] mb-4">
                  Specific status tags indicating access terms and booking prerequisites across hotel facilities.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-[8px] bg-[#F8F7F4] border border-[#E5E7EB] text-center">
                  <div className="p-4 bg-white rounded-[8px] border border-[#E5E7EB] flex flex-col items-center gap-2">
                    <FacilityStatusBadge status="Available" />
                    <span className="text-[11px] font-mono text-[#6B7280]">Soft Green</span>
                    <p className="text-xs text-[#6B7280]">Open to all registered guests during hours</p>
                  </div>

                  <div className="p-4 bg-white rounded-[8px] border border-[#E5E7EB] flex flex-col items-center gap-2">
                    <FacilityStatusBadge status="Complimentary" />
                    <span className="text-[11px] font-mono text-[#6B7280]">Emerald Tint</span>
                    <p className="text-xs text-[#6B7280]">Included at no additional cost</p>
                  </div>

                  <div className="p-4 bg-white rounded-[8px] border border-[#E5E7EB] flex flex-col items-center gap-2">
                    <FacilityStatusBadge status="Additional Charge" />
                    <span className="text-[11px] font-mono text-[#6B7280]">Warm Amber</span>
                    <p className="text-xs text-[#6B7280]">Premium service billed per usage</p>
                  </div>

                  <div className="p-4 bg-white rounded-[8px] border border-[#E5E7EB] flex flex-col items-center gap-2">
                    <FacilityStatusBadge status="Reservation Required" />
                    <span className="text-[11px] font-mono text-[#6B7280]">Sky Blue</span>
                    <p className="text-xs text-[#6B7280]">Requires advance coordination</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cards' && (
            <div className="space-y-6">
              <h3 className="font-serif font-bold text-lg text-[#12355B] mb-1">
                Room Card & Facility Card Structure (12px radius, subtle shadow)
              </h3>
              <p className="text-xs text-[#6B7280] mb-4">
                Structured with large top image, key amenities, bed configuration, and dual action buttons.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                <div>
                  <div className="text-xs font-semibold text-[#12355B] mb-2 uppercase tracking-wider">
                    Room Card Component
                  </div>
                  <RoomCard
                    room={ROOMS_DATA[1]}
                    onViewDetails={() => {}}
                    onBookRoom={() => {}}
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#12355B] mb-2 uppercase tracking-wider">
                    Navigation Links & States
                  </div>
                  <div className="p-6 bg-[#F8F7F4] rounded-[12px] border border-[#E5E7EB] space-y-4">
                    <div className="text-sm font-medium text-[#1F2937]">Desktop Navigation:</div>
                    <div className="flex items-center gap-4 text-sm font-medium">
                      <span className="text-[#12355B] border-b-2 border-[#12355B] pb-1">Active Link</span>
                      <span className="text-[#6B7280] hover:text-[#12355B]">Default Link</span>
                      <span className="text-[#6B7280] opacity-50">Disabled Link</span>
                    </div>

                    <div className="pt-4 border-t border-[#E5E7EB]">
                      <div className="text-sm font-medium text-[#1F2937] mb-2">Facility Card Micro-Preview:</div>
                      <div className="p-4 bg-white rounded-[8px] border border-[#E5E7EB] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[8px] bg-[#12355B]/5 flex items-center justify-center text-[#12355B]">
                          ★
                        </div>
                        <div>
                          <div className="font-serif font-semibold text-sm text-[#12355B]">{FACILITIES_DATA[0].name}</div>
                          <div className="text-xs text-[#6B7280] line-clamp-1">{FACILITIES_DATA[0].description}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="space-y-6">
              <h3 className="font-serif font-bold text-lg text-[#12355B] mb-1">
                Color Palette & Typographic Hierarchy Tokens
              </h3>

              {/* Color Swatches */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-[8px] bg-[#F8F7F4] border border-[#E5E7EB]">
                <div className="p-3 bg-white rounded-[6px] border border-[#E5E7EB]">
                  <div className="w-full h-8 rounded-[4px] bg-[#12355B] mb-2 shadow-2xs" />
                  <div className="text-xs font-semibold text-[#1F2937]">Deep Navy</div>
                  <div className="text-[11px] font-mono text-[#6B7280]">#12355B (Primary)</div>
                </div>
                <div className="p-3 bg-white rounded-[6px] border border-[#E5E7EB]">
                  <div className="w-full h-8 rounded-[4px] bg-[#D4A853] mb-2 shadow-2xs" />
                  <div className="text-xs font-semibold text-[#1F2937]">Warm Gold</div>
                  <div className="text-[11px] font-mono text-[#6B7280]">#D4A853 (Secondary)</div>
                </div>
                <div className="p-3 bg-white rounded-[6px] border border-[#E5E7EB]">
                  <div className="w-full h-8 rounded-[4px] bg-[#F8F7F4] border border-gray-300 mb-2" />
                  <div className="text-xs font-semibold text-[#1F2937]">Soft Cream</div>
                  <div className="text-[11px] font-mono text-[#6B7280]">#F8F7F4 (Main BG)</div>
                </div>
                <div className="p-3 bg-white rounded-[6px] border border-[#E5E7EB]">
                  <div className="w-full h-8 rounded-[4px] bg-[#1F2937] mb-2" />
                  <div className="text-xs font-semibold text-[#1F2937]">Dark Text</div>
                  <div className="text-[11px] font-mono text-[#6B7280]">#1F2937</div>
                </div>
              </div>

              {/* Typography Scale */}
              <div className="space-y-3 p-4 rounded-[8px] bg-white border border-[#E5E7EB]">
                <div className="flex items-baseline justify-between border-b border-gray-100 pb-2">
                  <span className="font-serif font-bold text-3xl sm:text-4xl text-[#12355B]">Hero Heading</span>
                  <span className="text-xs font-mono text-[#6B7280]">48-64px • Playfair Display Semi-bold</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-gray-100 pb-2">
                  <span className="font-serif font-bold text-2xl text-[#12355B]">Section Heading</span>
                  <span className="text-xs font-mono text-[#6B7280]">32-40px • Playfair Display Bold</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-gray-100 pb-2">
                  <span className="font-serif font-semibold text-xl text-[#12355B]">Card Heading</span>
                  <span className="text-xs font-mono text-[#6B7280]">20-24px • Playfair Display Semi-bold</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-gray-100 pb-2">
                  <span className="text-base text-[#1F2937]">Body Text Regular</span>
                  <span className="text-xs font-mono text-[#6B7280]">16px • Inter Regular</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-[#6B7280]">Small UI & Caption Text</span>
                  <span className="text-xs font-mono text-[#6B7280]">14px • Inter Regular / Medium</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        
      </div>
    </div>
  );
};
