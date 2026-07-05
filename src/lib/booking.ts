import { z } from "zod";

export const bookingSchema = z.object({
  services: z.array(z.string()).min(1, "Select at least one service"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
  staffId: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^\+?254\d{9}$/, "Enter a valid Kenyan phone number (e.g., +254700000000)"),
  notes: z.string().max(500).optional(),
  turnstile: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  duration: number;
  price: number;
  imageUrl?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  title: string;
  image?: string;
  specialties: string[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
  staffId?: string;
  staffName?: string;
}

export type BookingStep = "services" | "staff" | "datetime" | "details" | "review" | "confirmed";

export const CATEGORIES = [
  { id: "nails", label: "Nails", icon: "M12 3c-1.5 0-3 1-3 3v5c0 1.5 1 3 3 3s3-1.5 3-3V6c0-2-1.5-3-3-3z" },
  { id: "massages", label: "Massages", icon: "M17 9a5 5 0 0 0-10 0c0 3 2.5 5.5 5 7 2.5-1.5 5-4 5-7z" },
  { id: "body", label: "Body", icon: "M12 22c-4-3-8-6-8-11 0-4 3.5-7.5 8-7.5S20 7 20 11c0 5-4 8-8 11z" },
  { id: "face", label: "Face", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" },
  { id: "piercing", label: "Piercing", icon: "M12 2v20M2 12h20" },
  { id: "packages", label: "Packages", icon: "M20 12H4M12 4v16" },
];

export const STAFF_GRADIENTS: Record<string, string> = {
  esther: "from-rose-gold-light via-champagne to-rose-gold/30",
  grace: "from-sage-light via-champagne-light to-sage-whisper/30",
  faith: "from-champagne via-soft-beige to-dusty-pink/30",
  james: "from-gold-leaf-light via-champagne to-gold-leaf/20",
};

export const STAFF_INITIALS: Record<string, string> = {
  esther: "EW",
  grace: "GM",
  faith: "FA",
  james: "JO",
};

export const STEP_LABELS: Record<BookingStep, string> = {
  services: "Services",
  staff: "Staff",
  datetime: "Date & Time",
  details: "Details",
  review: "Review",
  confirmed: "Confirmed",
};
