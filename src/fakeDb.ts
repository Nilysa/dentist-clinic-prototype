export type Role = "secretary" | "dentist" | "manager" | "patient"
export type Page = "dashboard" | "patients" | "appointments" | "dentist" | "finance" | "reports" | "portal" | "notifications" | "settings"
export type Status = "Requested" | "Confirmed" | "Waiting" | "In Room" | "Completed" | "Cancelled"
export type Theme = "light" | "dark" | "ocean"
export type PaymentMethod = "Cash" | "Credit Card" | "Insurance" | "Mixed"
export type DocumentType = "Prescription" | "Clinical Note" | "X-ray" | "Payment Receipt" | "Insurance Claim" | "Consent Form" | "Treatment Plan"
export type NotificationChannel = "SMS" | "Email" | "In-app"

export type Account = {
  id: string
  email: string
  password: string
  role: Role
  name: string
  patientId?: string
  phone?: string
}

export type Doctor = {
  id: string
  name: string
  specialty: string
  room: string
  experience: string
  languages: string[]
  services: string[]
  bio: string
  emergency: boolean
  workDays: string[]
  slots: string[]
}

export type PatientDocument = {
  id: string
  patientId: string
  appointmentId?: string
  type: DocumentType
  title: string
  date: string
  author: string
  status: "Ready" | "Draft" | "Requested" | "Archived"
  fileName: string
  summary: string
  url?: string
}

export type Payment = {
  id: string
  patientId: string
  appointmentId: string
  amount: number
  paid: number
  method: PaymentMethod
  insuranceProvider?: string
  coveragePercent?: number
  claimStatus?: "Not submitted" | "Submitted" | "Approved" | "Rejected"
  receiptDocumentId: string
  date: string
}

export type Patient = {
  id: string
  name: string
  email: string
  phone: string
  nationalId: string
  fileNo: string
  dateOfBirth: string
  age: number
  address: string
  emergencyContact: string
  alert: string
  conditions: string[]
  allergies: string[]
  insurance: {
    provider: string
    policyNo: string
    coveragePercent: number
  }
  balance: number
  history: string[]
  prescriptions: string[]
  documents: PatientDocument[]
  xrayUrl?: string
  archived: boolean
}

export type Appointment = {
  id: string
  patientId: string
  doctorId: string
  time: string
  date: string
  service: string
  status: Status
  price: number
  paid: number
  requestSource: "Patient portal" | "Secretary" | "Emergency walk-in"
  urgency: "Routine" | "Soon" | "Emergency"
  reason: string
  notes: string[]
  paymentId?: string
}

export type Notification = {
  id: string
  patientId?: string
  role?: Role
  channel: NotificationChannel
  subject: string
  text: string
  sent: boolean
  read: boolean
  createdAt: string
}

export type Staff = {
  id: string
  name: string
  role: Role
  active: boolean
  phone: string
}

export type SelectOption = {
  id: string
  label: string
}

export type ClinicState = {
  accounts: Account[]
  patients: Patient[]
  doctors: Doctor[]
  appointments: Appointment[]
  payments: Payment[]
  notifications: Notification[]
  staff: Staff[]
  documentTypes: SelectOption[]
  medicalConditions: SelectOption[]
  services: SelectOption[]
}

const sharedXray =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='720' height='420' viewBox='0 0 720 420'%3E%3Crect width='720' height='420' fill='%23091d2b'/%3E%3Cg fill='none' stroke='%23d8f6ff' stroke-width='5' opacity='.9'%3E%3Cpath d='M141 87c44 33 54 100 43 158-8 41-14 90 17 112 29 21 62-13 70-68 9-61 17-112 52-112s44 51 52 112c8 55 41 89 70 68 31-22 25-71 17-112-11-58-1-125 43-158'/%3E%3Cpath d='M201 84c36 29 46 88 37 136M518 84c-36 29-46 88-37 136M302 178c18-14 39-14 57 0M360 178c18-14 39-14 57 0'/%3E%3C/g%3E%3Cg fill='%236adff5' opacity='.7'%3E%3Ccircle cx='252' cy='144' r='9'/%3E%3Ccircle cx='448' cy='144' r='9'/%3E%3Ccircle cx='360' cy='226' r='7'/%3E%3C/g%3E%3Ctext x='32' y='386' fill='%239bc7d8' font-family='Arial' font-size='24'%3EDental panoramic X-ray reference%3C/text%3E%3C/svg%3E"

export const initialClinicState: ClinicState = {
  accounts: [
    { id: "u1", email: "secretary@dentos.test", password: "1234", role: "secretary", name: "Sara Secretary", phone: "0912 100 4000" },
    { id: "u2", email: "dentist@dentos.test", password: "1234", role: "dentist", name: "Dr. Moradi", phone: "0912 200 4000" },
    { id: "u3", email: "manager@dentos.test", password: "1234", role: "manager", name: "Clinic Manager", phone: "0912 300 4000" },
    { id: "u4", email: "patient@dentos.test", password: "1234", role: "patient", name: "Sara Ahmadi", patientId: "p1", phone: "0912 448 2190" },
  ],
  doctors: [
    {
      id: "d1",
      name: "Dr. Moradi",
      specialty: "Endodontics and restorative dentistry",
      room: "Room 1",
      experience: "12 years",
      languages: ["English", "Persian"],
      services: ["Root canal", "Composite restoration", "Emergency pain relief"],
      bio: "Focuses on root canal follow-ups, restorations, and complex tooth pain cases.",
      emergency: true,
      workDays: ["2026-06-24", "2026-06-25", "2026-06-26"],
      slots: ["09:00", "09:45", "10:30", "11:15", "13:30", "14:15", "15:00", "16:00"],
    },
    {
      id: "d2",
      name: "Dr. Sadeghi",
      specialty: "Periodontics and preventive care",
      room: "Room 2",
      experience: "9 years",
      languages: ["Persian"],
      services: ["Scaling", "Gum evaluation", "Pediatric checkup"],
      bio: "Handles gum care, hygiene plans, and children’s dental visits.",
      emergency: false,
      workDays: ["2026-06-24", "2026-06-25"],
      slots: ["09:30", "10:15", "11:00", "12:30", "14:00", "15:30"],
    },
    {
      id: "d3",
      name: "Dr. Khosravi",
      specialty: "Oral surgery and implants",
      room: "Surgery",
      experience: "15 years",
      languages: ["English", "Persian"],
      services: ["Implant consultation", "Wisdom tooth extraction", "Surgical review"],
      bio: "Available for surgical consultations and implant planning.",
      emergency: true,
      workDays: ["2026-06-25", "2026-06-27"],
      slots: ["10:00", "11:30", "13:00", "14:30", "16:30"],
    },
  ],
  patients: [
    {
      id: "p1",
      name: "Sara Ahmadi",
      email: "patient@dentos.test",
      phone: "0912 448 2190",
      nationalId: "0061122458",
      fileNo: "D-1001",
      dateOfBirth: "1994-03-12",
      age: 32,
      address: "Tehran, Valiasr St.",
      emergencyContact: "Ali Ahmadi · 0912 111 8844",
      alert: "Penicillin allergy",
      conditions: ["Drug allergy"],
      allergies: ["Penicillin"],
      insurance: { provider: "Dena Insurance", policyNo: "DN-44891", coveragePercent: 65 },
      balance: 0,
      history: ["2026-06-21 — Root canal follow-up, tooth 11, completed.", "2026-06-08 — X-ray review, prescription issued."],
      prescriptions: ["Ibuprofen 400mg after meals", "Chlorhexidine mouthwash for 7 days"],
      xrayUrl: sharedXray,
      archived: false,
      documents: [
        { id: "doc-1001", patientId: "p1", appointmentId: "a1", type: "Prescription", title: "Root canal follow-up prescription", date: "2026-06-21", author: "Dr. Moradi", status: "Ready", fileName: "RX-D-1001-20260621.pdf", summary: "Pain control and mouthwash instructions." },
        { id: "doc-1002", patientId: "p1", appointmentId: "a1", type: "Payment Receipt", title: "Receipt for root canal follow-up", date: "2026-06-21", author: "Sara Secretary", status: "Ready", fileName: "RCPT-D-1001-20260621.pdf", summary: "Paid by credit card with insurance coverage applied." },
        { id: "doc-1003", patientId: "p1", type: "X-ray", title: "Panoramic X-ray", date: "2026-06-08", author: "Radiography Center", status: "Ready", fileName: "XRAY-D-1001.svg", summary: "Panoramic dental image for doctor review.", url: sharedXray },
      ],
    },
    {
      id: "p2",
      name: "Arman Nouri",
      email: "arman.nouri@email.com",
      phone: "0935 221 8044",
      nationalId: "0084472210",
      fileNo: "D-1002",
      dateOfBirth: "1998-11-02",
      age: 28,
      address: "Tehran, Shariati St.",
      emergencyContact: "Mina Nouri · 0935 117 0002",
      alert: "High anxiety",
      conditions: ["Dental anxiety"],
      allergies: [],
      insurance: { provider: "No active insurance", policyNo: "-", coveragePercent: 0 },
      balance: 450000,
      history: ["2026-06-24 — Composite restoration, tooth 16, pending payment split.", "2026-05-26 — Treatment plan created."],
      prescriptions: [],
      xrayUrl: sharedXray,
      archived: false,
      documents: [
        { id: "doc-2001", patientId: "p2", appointmentId: "a2", type: "Clinical Note", title: "Composite restoration note", date: "2026-06-24", author: "Dr. Moradi", status: "Draft", fileName: "NOTE-D-1002-20260624.pdf", summary: "Restoration in progress; patient prefers extra explanation time." },
      ],
    },
    {
      id: "p3",
      name: "Mina Rahimi",
      email: "mina.rahimi@email.com",
      phone: "0919 702 3316",
      nationalId: "0049827101",
      fileNo: "D-1003",
      dateOfBirth: "1982-06-20",
      age: 44,
      address: "Karaj, Azimieh",
      emergencyContact: "Reza Rahimi · 0919 333 1212",
      alert: "Diabetes",
      conditions: ["Diabetes"],
      allergies: [],
      insurance: { provider: "Salamat", policyNo: "SL-77102", coveragePercent: 50 },
      balance: 950000,
      history: ["2026-06-24 — Scaling appointment confirmed.", "2026-04-14 — Periodontal examination."],
      prescriptions: ["Continue physician-approved antibiotics if needed"],
      archived: false,
      documents: [
        { id: "doc-3001", patientId: "p3", type: "Treatment Plan", title: "Periodontal care plan", date: "2026-04-14", author: "Dr. Sadeghi", status: "Ready", fileName: "PLAN-D-1003-20260414.pdf", summary: "Two-step gum care and scaling schedule." },
      ],
    },
    {
      id: "p4",
      name: "Kian Moradi",
      email: "parent.moradi@email.com",
      phone: "0901 117 5532",
      nationalId: "0107702214",
      fileNo: "D-1004",
      dateOfBirth: "2017-08-18",
      age: 9,
      address: "Tehran, Saadat Abad",
      emergencyContact: "Parent · 0901 117 5532",
      alert: "Parent consent required",
      conditions: ["Minor patient"],
      allergies: [],
      insurance: { provider: "Iran Insurance", policyNo: "IR-90214", coveragePercent: 40 },
      balance: 850000,
      history: ["2026-06-24 — Pediatric checkup confirmed.", "2026-03-03 — Fluoride therapy."],
      prescriptions: [],
      archived: false,
      documents: [
        { id: "doc-4001", patientId: "p4", type: "Consent Form", title: "Parent consent form", date: "2026-06-24", author: "Sara Secretary", status: "Requested", fileName: "CONSENT-D-1004.pdf", summary: "Parent signature required before treatment." },
      ],
    },
  ],
  appointments: [
    { id: "a1", patientId: "p1", doctorId: "d1", time: "09:45", date: "2026-06-24", service: "Root canal follow-up", status: "Completed", price: 3200000, paid: 3200000, requestSource: "Secretary", urgency: "Routine", reason: "Follow-up after previous procedure", notes: ["Receipt and prescription are ready."], paymentId: "pay1" },
    { id: "a2", patientId: "p2", doctorId: "d1", time: "10:30", date: "2026-06-24", service: "Composite restoration", status: "In Room", price: 1800000, paid: 1350000, requestSource: "Secretary", urgency: "Soon", reason: "Broken restoration", notes: ["Patient has anxiety; explain steps carefully."], paymentId: "pay2" },
    { id: "a3", patientId: "p3", doctorId: "d2", time: "11:00", date: "2026-06-24", service: "Scaling", status: "Waiting", price: 950000, paid: 0, requestSource: "Patient portal", urgency: "Routine", reason: "Gum bleeding", notes: ["Diabetes alert should be shown to doctor."] },
    { id: "a4", patientId: "p4", doctorId: "d2", time: "12:30", date: "2026-06-24", service: "Pediatric checkup", status: "Confirmed", price: 850000, paid: 0, requestSource: "Patient portal", urgency: "Routine", reason: "Child checkup", notes: ["Parent consent pending."] },
    { id: "a5", patientId: "p1", doctorId: "d3", time: "14:30", date: "2026-06-25", service: "Implant consultation", status: "Requested", price: 1500000, paid: 0, requestSource: "Patient portal", urgency: "Soon", reason: "Patient requested surgery consultation", notes: ["Secretary must confirm or suggest another slot."] },
  ],
  payments: [
    { id: "pay1", patientId: "p1", appointmentId: "a1", amount: 3200000, paid: 3200000, method: "Credit Card", insuranceProvider: "Dena Insurance", coveragePercent: 65, claimStatus: "Approved", receiptDocumentId: "doc-1002", date: "2026-06-24" },
    { id: "pay2", patientId: "p2", appointmentId: "a2", amount: 1800000, paid: 1350000, method: "Mixed", claimStatus: "Not submitted", receiptDocumentId: "doc-2002", date: "2026-06-24" },
  ],
  notifications: [
    { id: "n1", patientId: "p3", channel: "SMS", subject: "Appointment reminder", text: "Your scaling appointment is today at 11:00 with Dr. Sadeghi.", sent: false, read: false, createdAt: "2026-06-24 08:00" },
    { id: "n2", patientId: "p2", channel: "Email", subject: "Payment summary", text: "Your treatment payment summary is ready. Outstanding balance: 450,000.", sent: true, read: false, createdAt: "2026-06-24 10:45" },
    { id: "n3", patientId: "p1", role: "secretary", channel: "In-app", subject: "Online request", text: "Sara Ahmadi requested an implant consultation with Dr. Khosravi.", sent: true, read: false, createdAt: "2026-06-24 12:05" },
  ],
  staff: [
    { id: "s1", name: "Sara Secretary", role: "secretary", active: true, phone: "0912 100 4000" },
    { id: "s2", name: "Dr. Moradi", role: "dentist", active: true, phone: "0912 200 4000" },
    { id: "s3", name: "Dr. Sadeghi", role: "dentist", active: true, phone: "0912 200 5000" },
    { id: "s4", name: "Clinic Manager", role: "manager", active: true, phone: "0912 300 4000" },
  ],
  documentTypes: [
    { id: "Prescription", label: "Prescription" },
    { id: "Clinical Note", label: "Clinical Note" },
    { id: "X-ray", label: "X-ray / OPG" },
    { id: "Payment Receipt", label: "Payment Receipt" },
    { id: "Insurance Claim", label: "Insurance Claim" },
    { id: "Consent Form", label: "Consent Form" },
    { id: "Treatment Plan", label: "Treatment Plan" },
  ],
  medicalConditions: [
    { id: "none", label: "No special condition" },
    { id: "diabetes", label: "Diabetes" },
    { id: "heart", label: "Heart disease" },
    { id: "blood-pressure", label: "High blood pressure" },
    { id: "drug-allergy", label: "Drug allergy" },
    { id: "anxiety", label: "Dental anxiety" },
    { id: "pregnancy", label: "Pregnancy" },
  ],
  services: [
    { id: "Initial examination", label: "Initial examination" },
    { id: "Emergency pain relief", label: "Emergency pain relief" },
    { id: "Root canal", label: "Root canal" },
    { id: "Composite restoration", label: "Composite restoration" },
    { id: "Scaling", label: "Scaling" },
    { id: "Implant consultation", label: "Implant consultation" },
    { id: "Pediatric checkup", label: "Pediatric checkup" },
  ],
}
