import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import {
  Activity,
  Bell,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  LineChart,
  Lock,
  LogOut,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
} from "lucide-react"
import {
  type Account,
  type Appointment,
  type ClinicState,
  type Page,
  type Patient,
  type PatientDocument,
  type Role,
  type Status,
  type Theme,
  initialClinicState,
} from "./fakeDb"
import "./styles.css"

const roleLabels: Record<Role, string> = {
  secretary: "Secretary",
  dentist: "Dentist",
  manager: "Manager",
  patient: "Patient",
}

const rolePages: Record<Role, Page[]> = {
  secretary: ["dashboard", "patients", "appointments", "finance", "notifications", "settings"],
  dentist: ["dentist", "patients", "appointments", "notifications", "settings"],
  manager: ["reports", "finance", "patients", "notifications", "settings"],
  patient: ["portal", "notifications", "settings"],
}

const pageLabels: Record<Page, string> = {
  dashboard: "Secretary Dashboard",
  patients: "Patients",
  appointments: "Appointments",
  dentist: "Dentist Panel",
  finance: "Finance",
  reports: "Manager Reports",
  portal: "Patient Portal",
  notifications: "Notifications",
  settings: "Profile Settings",
}

const pageIcons: Record<Page, React.ReactNode> = {
  dashboard: <ClipboardList size={21} />,
  patients: <Users size={21} />,
  appointments: <CalendarDays size={21} />,
  dentist: <Stethoscope size={21} />,
  finance: <CreditCard size={21} />,
  reports: <LineChart size={21} />,
  portal: <User size={21} />,
  notifications: <Bell size={21} />,
  settings: <Settings size={21} />,
}

type ScreenProps = {
  state: ClinicState
  setState: (state: ClinicState) => void
  setToast: (message: string) => void
  account: Account
}

function App() {
  const [account, setAccount] = useState<Account | null>(null)
  const [authView, setAuthView] = useState<"landing" | "login" | "signup">("landing")
  const [page, setPage] = useState<Page>("dashboard")
  const [pageTrail, setPageTrail] = useState<Page[]>(["dashboard"])
  const [menuOpen, setMenuOpen] = useState(false)
  const [state, setState] = useState<ClinicState>(initialClinicState)
  const [selectedPatientId, setSelectedPatientId] = useState("p2")
  const [toast, setToast] = useState("")
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("dentos-theme")
    return saved === "dark" || saved === "ocean" || saved === "light" ? saved : "light"
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem("dentos-theme", theme)
  }, [theme])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(""), 3600)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    function syncMenuMode() {
      setMenuOpen(window.matchMedia("(min-width: 1101px)").matches)
    }
    syncMenuMode()
    window.addEventListener("resize", syncMenuMode)
    return () => window.removeEventListener("resize", syncMenuMode)
  }, [])

  function navigatePage(nextPage: Page) {
    setPage(nextPage)
    setPageTrail((trail) => trail[trail.length - 1] === nextPage ? trail : [...trail.filter((item) => item !== nextPage), nextPage].slice(-5))
    setMenuOpen(false)
    window.location.hash = `/app/${nextPage}`
  }

  function login(nextAccount: Account) {
    setAccount(nextAccount)
    const firstPage = rolePages[nextAccount.role][0]
    setPage(firstPage)
    setPageTrail([firstPage])
    window.location.hash = `/app/${firstPage}`
    setToast(`Logged in as ${nextAccount.name}`)
  }

  function signup(form: SignupFormData) {
    const patientId = makeId("p")
    const accountId = makeId("u")
    const patient: Patient = {
      id: patientId,
      name: form.name,
      email: form.email,
      phone: form.phone,
      nationalId: form.nationalId || "Pending",
      fileNo: `D-${1000 + state.patients.length + 1}`,
      dateOfBirth: form.dateOfBirth || "1995-01-01",
      age: 31,
      address: "Not provided",
      emergencyContact: "Not provided",
      alert: form.medicalNotes || "No alert",
      conditions: form.medicalNotes ? [form.medicalNotes] : [],
      allergies: [],
      insurance: { provider: "Not provided", policyNo: "-", coveragePercent: 0 },
      balance: 0,
      history: [`${today()} — Patient account created.`],
      prescriptions: [],
      documents: [],
      archived: false,
    }
    const newAccount: Account = {
      id: accountId,
      email: form.email,
      password: form.password,
      role: "patient",
      name: form.name,
      phone: form.phone,
      patientId,
    }
    setState({ ...state, patients: [patient, ...state.patients], accounts: [newAccount, ...state.accounts] })
    setSelectedPatientId(patientId)
    login(newAccount)
  }

  if (!account && authView === "landing") return <LandingPage onLogin={() => setAuthView("login")} />
  if (!account && authView === "signup") return <SignupScreen onBack={() => setAuthView("login")} onSignup={signup} />
  if (!account) return <LoginScreen accounts={state.accounts} onLogin={login} onBack={() => setAuthView("landing")} onSignup={() => setAuthView("signup")} />

  const selectedPatient = state.patients.find((patient) => patient.id === selectedPatientId) ?? state.patients[0]

  return (
    <div className="app-shell">
      <button className="drawer-backdrop" data-open={menuOpen} type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
      <Sidebar
        role={account.role}
        page={page}
        pages={rolePages[account.role]}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onPage={navigatePage}
        onLogout={() => { setAccount(null); setAuthView("login"); setMenuOpen(false) }}
      />
      <main className="main">
        <Topbar account={account} theme={theme} onTheme={setTheme} onMenu={() => setMenuOpen(true)} onNotifications={() => navigatePage("notifications")} onSettings={() => navigatePage("settings")} />
        <Breadcrumbs role={account.role} page={page} trail={pageTrail} onNavigate={navigatePage} onBack={() => window.history.back()} />
        {page === "dashboard" && <SecretaryDashboard state={state} setState={setState} setToast={setToast} account={account} setPage={navigatePage} setSelectedPatientId={setSelectedPatientId} />}
        {page === "patients" && <Patients state={state} setState={setState} setToast={setToast} account={account} selectedPatient={selectedPatient} setSelectedPatientId={setSelectedPatientId} />}
        {page === "appointments" && <Appointments state={state} setState={setState} setToast={setToast} account={account} />}
        {page === "dentist" && <DentistPanel state={state} setState={setState} setToast={setToast} account={account} selectedPatient={selectedPatient} setSelectedPatientId={setSelectedPatientId} />}
        {page === "finance" && <Finance state={state} setState={setState} setToast={setToast} account={account} />}
        {page === "reports" && <Reports state={state} setState={setState} setToast={setToast} account={account} />}
        {page === "portal" && <Portal state={state} setState={setState} setToast={setToast} account={account} />}
        {page === "notifications" && <Notifications state={state} setState={setState} setToast={setToast} account={account} />}
        {page === "settings" && <SettingsPage state={state} setState={setState} setToast={setToast} account={account} setAccount={setAccount} />}
      </main>
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  )
}

function LandingPage({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="landing-screen">
      <header className="landing-nav">
        <div className="brand landing-brand">
          <div className="logo"><Activity /></div>
          <div><strong>DentOS</strong><span>Clinic operations</span></div>
        </div>
        <button className="landing-login" onClick={onLogin}><Lock size={18} /> Sign in</button>
      </header>
      <main className="landing-hero">
        <section className="landing-copy">
          <div className="landing-badge"><ShieldCheck size={16} /> Secure clinic workspace</div>
          <p className="eyebrow">Dental Clinic Management System</p>
          <h1>Coordinated appointments, patient records, billing, and clinical care.</h1>
          <p className="muted">DentOS connects secretaries, dentists, managers, and patients through a clear role-based workflow.</p>
          <div className="landing-actions"><button className="login-submit" onClick={onLogin}><Lock size={20} /> Enter system</button></div>
        </section>
        <section className="landing-preview">
          <div className="preview-top"><span /><span /><span /></div>
          <div className="preview-grid">
            <div className="preview-card wide preview-heading"><small>Operational command center</small><b>Secretary dashboard</b></div>
            <div className="preview-card wide"><small>Today’s patients</small><strong>24</strong></div>
            <div className="preview-card"><small>Income</small><strong>5.95M</strong></div>
            <div className="preview-card queue"><b>Live queue</b><p>09:45 Sara Ahmadi — Completed</p><p>10:30 Arman Nouri — In Room</p><p>11:00 Mina Rahimi — Waiting</p></div>
          </div>
        </section>
      </main>
    </div>
  )
}

function LoginScreen({ accounts, onLogin, onBack, onSignup }: { accounts: Account[]; onLogin: (account: Account) => void; onBack: () => void; onSignup: () => void }) {
  const [email, setEmail] = useState("secretary@dentos.test")
  const [password, setPassword] = useState("1234")
  const [error, setError] = useState("")

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const found = accounts.find((item) => item.email === email.trim().toLowerCase() && item.password === password)
    if (!found) {
      setError("Invalid email or password.")
      return
    }
    setError("")
    onLogin(found)
  }

  return (
    <div className="login-screen">
      <section className="login-card">
        <button className="back-link" type="button" onClick={onBack}>← Back</button>
        <div className="logo large"><Activity /></div>
        <p className="eyebrow">DentOS Secure Access</p>
        <h1>Sign in to the clinic workspace</h1>
        <form className="login-form" onSubmit={submit}>
          <label>Email address<input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@dentos.test" /></label>
          <label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" /></label>
          {error && <div className="login-error">{error}</div>}
          <button className="login-submit" type="submit"><Lock size={20} /> Sign in</button>
        </form>
        <button className="signup-link" type="button" onClick={onSignup}>New patient? Create a portal account</button>
        <div className="demo-accounts">
          {accounts.slice(0, 4).map((user) => (
            <button key={user.email} type="button" onClick={() => { setEmail(user.email); setPassword(user.password); setError("") }}>
              <strong>{user.name}</strong><span>{user.email} · {roleLabels[user.role]}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

type SignupFormData = {
  name: string
  email: string
  phone: string
  nationalId: string
  dateOfBirth: string
  password: string
  medicalNotes: string
}

function SignupScreen({ onBack, onSignup }: { onBack: () => void; onSignup: (form: SignupFormData) => void }) {
  const [form, setForm] = useState<SignupFormData>({ name: "", email: "", phone: "", nationalId: "", dateOfBirth: "", password: "", medicalNotes: "" })
  function update(field: keyof SignupFormData, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }
  function submit() {
    if (!form.name || !form.email || !form.phone || !form.password) return
    onSignup(form)
  }
  return (
    <div className="login-screen">
      <section className="login-card">
        <button className="back-link" type="button" onClick={onBack}>← Back to login</button>
        <div className="logo large"><User /></div>
        <p className="eyebrow">Patient Portal Signup</p>
        <h1>Create your DentOS account</h1>
        <div className="login-form">
          <label>Full name<input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Patient full name" /></label>
          <label>Email address<input value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="patient@email.com" /></label>
          <label>Phone number<input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="0912 000 0000" /></label>
          <label>National ID<input value={form.nationalId} onChange={(event) => update("nationalId", event.target.value)} placeholder="10 digits" /></label>
          <label>Date of birth<input value={form.dateOfBirth} onChange={(event) => update("dateOfBirth", event.target.value)} placeholder="YYYY-MM-DD" /></label>
          <label>Password<input value={form.password} onChange={(event) => update("password", event.target.value)} type="password" placeholder="Create password" /></label>
          <label>Medical notes<input value={form.medicalNotes} onChange={(event) => update("medicalNotes", event.target.value)} placeholder="Allergies, diabetes, heart condition..." /></label>
          <button className="login-submit" type="button" onClick={submit}><User size={20} /> Create account and enter portal</button>
        </div>
      </section>
    </div>
  )
}

function Sidebar({ role, page, pages, open, onClose, onPage, onLogout }: { role: Role; page: Page; pages: Page[]; open: boolean; onClose: () => void; onPage: (page: Page) => void; onLogout: () => void }) {
  return (
    <aside className="sidebar" data-open={open}>
      <div className="brand">
        <div className="logo"><Activity /></div>
        <div><strong>DentOS</strong><span>Clinic operations</span></div>
        <button className="drawer-close" type="button" onClick={onClose}>×</button>
      </div>
      <nav>{pages.map((item) => <button key={item} className={page === item ? "active" : ""} onClick={() => onPage(item)}>{pageIcons[item]}{pageLabels[item]}</button>)}</nav>
      <div className="sidebar-footer">
        <div className="role-pill"><ShieldCheck size={16} /> {roleLabels[role]} mode</div>
        <button className="logout" onClick={onLogout}><LogOut size={18} /> Sign out</button>
      </div>
    </aside>
  )
}

function Topbar({ account, theme, onTheme, onMenu, onNotifications, onSettings }: { account: Account; theme: Theme; onTheme: (theme: Theme) => void; onMenu: () => void; onNotifications: () => void; onSettings: () => void }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="hamburger" type="button" onClick={onMenu} aria-label="Open navigation menu"><span /><span /><span /></button>
        <div><strong>{account.name}</strong><span>{roleLabels[account.role]} workspace · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></div>
      </div>
      <div className="top-actions">
        <div className="search-mini"><Search size={17} /> Global search</div>
        <label className="theme-select">Theme<select value={theme} onChange={(event) => onTheme(event.target.value as Theme)}><option value="light">Light</option><option value="dark">Dark</option><option value="ocean">Ocean</option></select></label>
        <button type="button" onClick={onNotifications} aria-label="Open notifications"><Bell size={19} /></button>
        <button type="button" onClick={onSettings} aria-label="Open settings"><Settings size={19} /></button>
      </div>
    </header>
  )
}

function Breadcrumbs({ role, page, trail, onNavigate, onBack }: { role: Role; page: Page; trail: Page[]; onNavigate: (page: Page) => void; onBack: () => void }) {
  return (
    <div className="breadcrumbs">
      <button className="crumb-back" type="button" onClick={onBack}>← Back</button>
      <span className="crumb-root">DentOS</span><span className="crumb-separator">/</span><span className="crumb-root">{roleLabels[role]}</span>
      {(trail.length ? trail : [page]).map((item, index) => index === trail.length - 1 ? <React.Fragment key={item}><span className="crumb-separator">/</span><strong className="crumb-current">{pageLabels[item]}</strong></React.Fragment> : <React.Fragment key={item}><span className="crumb-separator">/</span><button className="crumb-link" type="button" onClick={() => onNavigate(item)}>{pageLabels[item]}</button></React.Fragment>)}
    </div>
  )
}

function SecretaryDashboard({ state, setState, setToast, account, setPage, setSelectedPatientId }: ScreenProps & { setPage: (page: Page) => void; setSelectedPatientId: (id: string) => void }) {
  const todayAppointments = state.appointments.filter((item) => item.date === today())
  const requests = state.appointments.filter((item) => item.status === "Requested")
  const income = state.appointments.reduce((sum, item) => sum + item.paid, 0)
  function addWalkIn() {
    const patientId = makeId("p")
    const patient: Patient = {
      id: patientId,
      name: "Emergency Walk-in",
      email: "walkin@email.com",
      phone: "0912 000 0000",
      nationalId: "Pending",
      fileNo: `D-${1000 + state.patients.length + 1}`,
      dateOfBirth: "1990-01-01",
      age: 36,
      address: "Not provided",
      emergencyContact: "Not provided",
      alert: "Emergency pain",
      conditions: ["Emergency"],
      allergies: [],
      insurance: { provider: "Not provided", policyNo: "-", coveragePercent: 0 },
      balance: 700000,
      history: [`${today()} — Emergency walk-in file created.`],
      prescriptions: [],
      documents: [],
      archived: false,
    }
    const appointment: Appointment = { id: makeId("a"), patientId, doctorId: "d1", time: "16:00", date: today(), service: "Emergency pain relief", status: "Waiting", price: 700000, paid: 0, requestSource: "Emergency walk-in", urgency: "Emergency", reason: "Severe pain", notes: ["Added by secretary."] }
    setState({ ...state, patients: [patient, ...state.patients], appointments: [appointment, ...state.appointments] })
    setSelectedPatientId(patientId)
    setToast("Emergency patient added to today’s queue.")
  }
  return (
    <PageFrame title="Secretary Dashboard" description="Manage patient intake, appointment requests, visit status, payments, and notices." action={<PrimaryButton onClick={addWalkIn}><Plus size={18} /> Emergency patient</PrimaryButton>}>
      <MetricGrid>
        <Metric label="Today’s patients" value={todayAppointments.length} icon={<Users />} />
        <Metric label="Requests" value={requests.length} icon={<CalendarDays />} />
        <Metric label="Income" value={formatMoneyShort(income)} icon={<CreditCard />} />
        <Metric label="Unread notices" value={state.notifications.filter((item) => !item.read).length} icon={<Bell />} />
      </MetricGrid>
      <TwoColumn>
        <Card title="Live appointment queue"><QueueList state={state} onOpen={(id) => { setSelectedPatientId(id); setPage("patients") }} /></Card>
        <Card title="Requests needing secretary confirmation">
          <div className="stack">{requests.map((appointment) => <div className="soft-row" key={appointment.id}><span><strong>{patientNameById(state, appointment.patientId)}</strong><small>{appointment.date} · {doctorNameById(state, appointment.doctorId)} · {appointment.service}</small></span><StatusBadge status={appointment.status} /></div>)}</div>
          {!requests.length && <p className="muted">No pending appointment requests.</p>}
        </Card>
      </TwoColumn>
    </PageFrame>
  )
}

function Patients({ state, setState, setToast, selectedPatient, setSelectedPatientId }: ScreenProps & { selectedPatient: Patient; setSelectedPatientId: (id: string) => void }) {
  const [query, setQuery] = useState("")
  const [docType, setDocType] = useState("Clinical Note")
  const patients = state.patients.filter((patient) => `${patient.name} ${patient.phone} ${patient.fileNo} ${patient.nationalId}`.toLowerCase().includes(query.toLowerCase()))
  function addDocument() {
    const document: PatientDocument = { id: makeId("doc"), patientId: selectedPatient.id, type: docType as PatientDocument["type"], title: `${docType} for ${selectedPatient.name}`, date: today(), author: "Clinic staff", status: "Ready", fileName: `${docType.replace(/\s+/g, "-")}-${selectedPatient.fileNo}.pdf`, summary: "Added to patient archive." }
    setState({ ...state, patients: state.patients.map((patient) => patient.id === selectedPatient.id ? { ...patient, documents: [document, ...patient.documents] } : patient) })
    setToast(`Document ${document.id} added.`)
  }
  return (
    <PageFrame title="Patients" description="Search records and open complete patient files with documents, alerts, payments, and archived history.">
      <TwoColumn>
        <Card title="Patient directory">
          <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone, file number, or national ID..." />
          <div className="stack">{patients.map((patient) => <button key={patient.id} className="person-row" onClick={() => setSelectedPatientId(patient.id)}><span className="avatar"><User size={19} /></span><span><strong>{patient.name}</strong><small>{patient.phone} · {patient.fileNo} · {patient.nationalId}</small></span><em>{patient.alert}</em></button>)}</div>
        </Card>
        <Card title={`Patient file: ${selectedPatient.name}`}>
          <p className="alert">Medical alert: {selectedPatient.alert}</p>
          <div className="detail-grid">
            <span>File No.</span><strong>{selectedPatient.fileNo}</strong>
            <span>National ID</span><strong>{selectedPatient.nationalId}</strong>
            <span>DOB</span><strong>{selectedPatient.dateOfBirth}</strong>
            <span>Phone</span><strong>{selectedPatient.phone}</strong>
            <span>Insurance</span><strong>{selectedPatient.insurance.provider} · {selectedPatient.insurance.coveragePercent}%</strong>
            <span>Balance</span><strong>{formatMoney(selectedPatient.balance)}</strong>
          </div>
          {selectedPatient.xrayUrl && <img className="xray-image" src={selectedPatient.xrayUrl} alt={`${selectedPatient.name} dental X-ray`} />}
          <h3>Documents</h3>
          <div className="inline-form"><select className="input" value={docType} onChange={(event) => setDocType(event.target.value)}>{state.documentTypes.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select><PrimaryButton onClick={addDocument}>Add document</PrimaryButton></div>
          <DocumentList documents={selectedPatient.documents} />
          <h3>History archive</h3>
          <div className="stack">{selectedPatient.history.map((item) => <div className="soft-row" key={item}>{item}</div>)}</div>
        </Card>
      </TwoColumn>
    </PageFrame>
  )
}

function Appointments({ state, setState, setToast }: ScreenProps) {
  const [selectedDate, setSelectedDate] = useState(today())
  const appointments = state.appointments.filter((item) => item.date === selectedDate)
  function updateStatus(id: string, status: Status) {
    const appointment = state.appointments.find((item) => item.id === id)
    const cancellationNotice = appointment && status === "Cancelled"
      ? [{
        id: makeId("n"),
        patientId: appointment.patientId,
        channel: "SMS" as const,
        subject: "Appointment cancelled",
        text: `Your ${appointment.service} appointment on ${appointment.date} at ${appointment.time} has been cancelled. Please contact the clinic to reschedule.`,
        sent: true,
        read: false,
        createdAt: nowStamp(),
      }]
      : []
    setState({
      ...state,
      appointments: state.appointments.map((item) => item.id === id ? { ...item, status } : item),
      notifications: [...cancellationNotice, ...state.notifications],
    })
    setToast(status === "Cancelled" ? "Appointment cancelled and patient notified." : "Appointment status updated.")
  }
  return (
    <PageFrame title="Appointments" description="Secretary confirms patient requests after checking doctor availability; doctors see their confirmed schedules.">
      <TwoColumn>
        <Card title="Calendar">
          <input className="input" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} placeholder="YYYY-MM-DD" />
          <div className="calendar-grid">
            {state.doctors.map((doctor) => (
              <section className="calendar-column" key={doctor.id}>
                <h3>{doctor.name}</h3>
                <small>{doctor.specialty}</small>
                {doctor.slots.map((slot) => {
                  const appointment = appointments.find((item) => item.doctorId === doctor.id && item.time === slot)
                  return (
                    <div className={appointment ? "calendar-slot booked" : "calendar-slot"} key={`${doctor.id}-${slot}`}>
                      <strong>{slot}</strong>
                      {appointment ? <span>{patientNameById(state, appointment.patientId)} · {appointment.service}</span> : <span>Free</span>}
                    </div>
                  )
                })}
              </section>
            ))}
          </div>
        </Card>
        <Card title="Appointment controls">
          <div className="stack">
            {state.appointments.map((appointment) => (
              <div className="appointment-row" key={appointment.id}>
                <strong>{appointment.time}</strong>
                <span><b>{patientNameById(state, appointment.patientId)}</b><small>{appointment.date} · {doctorNameById(state, appointment.doctorId)} · {appointment.service}</small></span>
                <StatusBadge status={appointment.status} />
                <select className="small-select" value={appointment.status} onChange={(event) => updateStatus(appointment.id, event.target.value as Status)}>
                  {["Requested", "Confirmed", "Waiting", "In Room", "Completed", "Cancelled"].map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
            ))}
          </div>
        </Card>
      </TwoColumn>
    </PageFrame>
  )
}

function DentistPanel({ state, setState, setToast, account, selectedPatient, setSelectedPatientId }: ScreenProps & { selectedPatient: Patient; setSelectedPatientId: (id: string) => void }) {
  const doctor = state.doctors.find((item) => item.name === account.name) ?? state.doctors[0]
  const [note, setNote] = useState("")
  const [prescription, setPrescription] = useState("")
  const doctorAppointments = state.appointments.filter((appointment) => appointment.doctorId === doctor.id)
  function saveClinicalNote() {
    if (!note && !prescription) {
      setToast("Write a treatment note or prescription first.")
      return
    }
    const documents: PatientDocument[] = []
    if (note) documents.push({ id: makeId("doc"), patientId: selectedPatient.id, type: "Clinical Note", title: "Clinical note", date: today(), author: doctor.name, status: "Ready", fileName: `NOTE-${selectedPatient.fileNo}-${today()}.pdf`, summary: note })
    if (prescription) documents.push({ id: makeId("doc"), patientId: selectedPatient.id, type: "Prescription", title: "Prescription", date: today(), author: doctor.name, status: "Ready", fileName: `RX-${selectedPatient.fileNo}-${today()}.pdf`, summary: prescription })
    setState({
      ...state,
      patients: state.patients.map((patient) => patient.id === selectedPatient.id ? {
        ...patient,
        history: note ? [`${today()} — ${note}`, ...patient.history] : patient.history,
        prescriptions: prescription ? [prescription, ...patient.prescriptions] : patient.prescriptions,
        documents: [...documents, ...patient.documents],
      } : patient),
      notifications: prescription ? [{ id: makeId("n"), patientId: selectedPatient.id, channel: "In-app", subject: "Prescription ready", text: "Your prescription is ready in the patient portal.", sent: true, read: false, createdAt: nowStamp() }, ...state.notifications] : state.notifications,
    })
    setNote("")
    setPrescription("")
    setToast("Clinical record saved to patient archive.")
  }
  return (
    <PageFrame title="Dentist Panel" description="Review schedule, patient alerts, X-rays, history, notes, and prescriptions.">
      <MetricGrid>
        <Metric label="My appointments" value={doctorAppointments.length} icon={<CalendarDays />} />
        <Metric label="Confirmed" value={doctorAppointments.filter((item) => item.status === "Confirmed").length} icon={<ClipboardList />} />
        <Metric label="In room" value={doctorAppointments.filter((item) => item.status === "In Room").length} icon={<Activity />} />
        <Metric label="Documents" value={selectedPatient.documents.length} icon={<FileText />} />
      </MetricGrid>
      <TwoColumn>
        <Card title="Chair schedule">
          <div className="stack">{doctorAppointments.map((appointment) => <button key={appointment.id} className="appointment-row" onClick={() => setSelectedPatientId(appointment.patientId)}><strong>{appointment.time}</strong><span>{patientNameById(state, appointment.patientId)}<small>{appointment.service}</small></span><StatusBadge status={appointment.status} /></button>)}</div>
        </Card>
        <Card title={`Active chart: ${selectedPatient.name}`}>
          <p className="alert">{selectedPatient.alert}</p>
          {selectedPatient.xrayUrl && <img className="xray-image" src={selectedPatient.xrayUrl} alt={`${selectedPatient.name} dental X-ray`} />}
          <textarea className="textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Treatment notes, diagnosis, performed service..." />
          <textarea className="textarea" value={prescription} onChange={(event) => setPrescription(event.target.value)} placeholder="Prescription instructions" />
          <PrimaryButton onClick={saveClinicalNote}>Save clinical note <FileText size={18} /></PrimaryButton>
          <DocumentList documents={selectedPatient.documents} />
        </Card>
      </TwoColumn>
    </PageFrame>
  )
}

function Finance({ state, setState, setToast }: ScreenProps) {
  const unpaid = state.appointments.filter((item) => item.price > item.paid)
  const income = state.appointments.reduce((sum, item) => sum + item.paid, 0)
  const outstanding = state.appointments.reduce((sum, item) => sum + Math.max(item.price - item.paid, 0), 0)
  function recordPayment(id: string) {
    const appointment = state.appointments.find((item) => item.id === id)
    if (!appointment) return
    const receipt: PatientDocument = { id: makeId("doc"), patientId: appointment.patientId, appointmentId: id, type: "Payment Receipt", title: `Receipt for ${appointment.service}`, date: today(), author: "Secretary", status: "Ready", fileName: `RCPT-${id}.pdf`, summary: `Paid ${formatMoney(appointment.price)} by credit card.` }
    setState({
      ...state,
      appointments: state.appointments.map((item) => item.id === id ? { ...item, paid: item.price, status: "Completed" } : item),
      patients: state.patients.map((patient) => patient.id === appointment.patientId ? { ...patient, balance: 0, documents: [receipt, ...patient.documents] } : patient),
    })
    setToast("Payment recorded and receipt archived.")
  }
  return (
    <PageFrame title="Finance" description="Record payments, insurance coverage, receipts, outstanding balances, and claims.">
      <MetricGrid>
        <Metric label="Daily income" value={formatMoneyShort(income)} icon={<CreditCard />} />
        <Metric label="Outstanding" value={formatMoneyShort(outstanding)} icon={<FileText />} />
        <Metric label="Insurance claims" value={state.payments.filter((item) => item.insuranceProvider).length} icon={<ShieldCheck />} />
      </MetricGrid>
      <TwoColumn>
        <Card title="Payment records"><div className="stack">{state.payments.map((payment) => <div className="payment-row" key={payment.id}><span><strong>{patientNameById(state, payment.patientId)}</strong><small>{payment.method} · {payment.insuranceProvider ?? "No insurance"} · {payment.claimStatus ?? "No claim"}</small></span><em>{formatMoney(payment.paid)}</em></div>)}</div></Card>
        <Card title="Outstanding balances"><div className="stack">{unpaid.map((appointment) => <button className="soft-row button-row" key={appointment.id} onClick={() => recordPayment(appointment.id)}>Pay {patientNameById(state, appointment.patientId)} — {formatMoney(appointment.price - appointment.paid)}</button>)}</div></Card>
      </TwoColumn>
    </PageFrame>
  )
}

function Reports({ state, setState, setToast }: ScreenProps) {
  const income = state.appointments.reduce((sum, item) => sum + item.paid, 0)
  function toggleStaff(id: string) {
    setState({ ...state, staff: state.staff.map((staff) => staff.id === id ? { ...staff, active: !staff.active } : staff) })
    setToast("Staff access updated.")
  }
  return (
    <PageFrame title="Manager Reports" description="Review clinic revenue, patient flow, services, staff access, insurance claims, and outstanding balances.">
      <MetricGrid>
        <Metric label="Monthly revenue" value={formatMoneyShort(income * 22)} icon={<LineChart />} />
        <Metric label="Completed visits" value={state.appointments.filter((item) => item.status === "Completed").length} icon={<ClipboardList />} />
        <Metric label="Patients" value={state.patients.length} icon={<Users />} />
      </MetricGrid>
      <TwoColumn>
        <Card title="Monthly income trend"><div className="chart"><span style={{ height: "38%" }} /><span style={{ height: "64%" }} /><span style={{ height: "92%" }} /></div></Card>
        <Card title="Staff and access controls"><div className="stack">{state.staff.map((staff) => <button className="soft-row button-row" key={staff.id} onClick={() => toggleStaff(staff.id)}>{staff.name} — {staff.active ? "Active" : "Disabled"}</button>)}</div></Card>
      </TwoColumn>
    </PageFrame>
  )
}

function Portal({ state, setState, setToast, account }: ScreenProps) {
  const patient = state.patients.find((item) => item.id === account.patientId) ?? state.patients[0]
  const [service, setService] = useState(state.services[0]?.id ?? "")
  const [date, setDate] = useState("2026-06-25")
  const [doctorId, setDoctorId] = useState(state.doctors[0]?.id ?? "")
  const [slot, setSlot] = useState("")
  const [urgency, setUrgency] = useState<Appointment["urgency"]>("Routine")
  const selectedDoctor = state.doctors.find((doctor) => doctor.id === doctorId) ?? state.doctors[0]
  const availableSlots = selectedDoctor.slots.filter((time) => !state.appointments.some((appointment) => appointment.doctorId === doctorId && appointment.date === date && appointment.time === time && appointment.status !== "Cancelled"))
  const myAppointments = state.appointments.filter((appointment) => appointment.patientId === patient.id)

  function requestAppointment() {
    const appointmentSlot = slot || availableSlots[0]
    if (!service || !date || !doctorId || !appointmentSlot) {
      setToast("Choose service, doctor, date, and available time first.")
      return
    }
    const appointment: Appointment = { id: makeId("a"), patientId: patient.id, doctorId, time: appointmentSlot, date, service, status: "Requested", price: 1000000, paid: 0, requestSource: "Patient portal", urgency, reason: `${urgency} patient request`, notes: ["Waiting for secretary confirmation."] }
    setState({
      ...state,
      appointments: [appointment, ...state.appointments],
      notifications: [
        { id: makeId("n"), patientId: patient.id, channel: "Email", subject: "Appointment request received", text: `Your request for ${service} was sent to the secretary for confirmation.`, sent: true, read: false, createdAt: nowStamp() },
        { id: makeId("n"), role: "secretary", patientId: patient.id, channel: "In-app", subject: "New appointment request", text: `${patient.name} requested ${service} with ${doctorNameById(state, doctorId)}.`, sent: true, read: false, createdAt: nowStamp() },
        ...state.notifications,
      ],
    })
    setToast("Request sent to secretary for confirmation.")
  }

  function cancelAppointment(id: string) {
    const appointment = state.appointments.find((item) => item.id === id)
    if (!appointment) return
    setState({
      ...state,
      appointments: state.appointments.map((item) => item.id === id ? { ...item, status: "Cancelled" } : item),
      notifications: [
        { id: makeId("n"), patientId: patient.id, role: "secretary", channel: "In-app", subject: "Patient cancelled appointment", text: `${patient.name} cancelled ${appointment.service} on ${appointment.date} at ${appointment.time}.`, sent: true, read: false, createdAt: nowStamp() },
        ...state.notifications,
      ],
    })
    setToast("Appointment cancelled and clinic notified.")
  }

  return (
    <PageFrame title="Patient Portal" description="Request appointments, review clinic confirmations, download documents, and track visit history.">
      <TwoColumn>
        <Card title="Choose a doctor">
          <div className="doctor-grid">
            {state.doctors.map((doctor) => (
              <button key={doctor.id} className={doctor.id === doctorId ? "doctor-card active" : "doctor-card"} onClick={() => { setDoctorId(doctor.id); setSlot("") }}>
                <strong>{doctor.name}</strong>
                <span>{doctor.specialty}</span>
                <small>{doctor.experience} · {doctor.room} · {doctor.emergency ? "Emergency care" : "Routine care"}</small>
              </button>
            ))}
          </div>
          <select className="input" value={service} onChange={(event) => setService(event.target.value)}>{state.services.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
          <input className="input" value={date} onChange={(event) => setDate(event.target.value)} placeholder="YYYY-MM-DD" />
          <select className="input" value={urgency} onChange={(event) => setUrgency(event.target.value as Appointment["urgency"])}><option>Routine</option><option>Soon</option><option>Emergency</option></select>
          <select className="input" value={slot} onChange={(event) => setSlot(event.target.value)}>
            <option value="">First available slot</option>
            {availableSlots.map((item) => <option key={item}>{item}</option>)}
          </select>
          <p className="hint">Requests go to the secretary before final confirmation, so the clinic can handle conflicts and emergencies safely.</p>
          <PrimaryButton onClick={requestAppointment}>Send appointment request <CalendarDays size={18} /></PrimaryButton>
        </Card>
        <Card title="My archive">
          <p className="muted">Signed in as {patient.name}. Balance: {formatMoney(patient.balance)}</p>
          <h3>Appointments</h3>
          <div className="stack">{myAppointments.map((appointment) => <div className="appointment-row" key={appointment.id}><strong>{appointment.time}</strong><span>{appointment.date} · {doctorNameById(state, appointment.doctorId)}<small>{appointment.service}</small></span><StatusBadge status={appointment.status} />{appointment.status !== "Cancelled" && appointment.status !== "Completed" && <button className="mini-action" type="button" onClick={() => cancelAppointment(appointment.id)}>Cancel</button>}</div>)}</div>
          <h3>Documents</h3>
          <DocumentList documents={patient.documents} />
        </Card>
      </TwoColumn>
    </PageFrame>
  )
}

function Notifications({ state, setState, setToast, account }: ScreenProps) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const visibleNotifications = account.role === "patient"
    ? state.notifications.filter((notification) => notification.patientId === account.patientId)
    : state.notifications.filter((notification) => !notification.role || notification.role === account.role || account.role === "manager")
  function markSent(id: string) {
    setState({ ...state, notifications: state.notifications.map((item) => item.id === id ? { ...item, sent: true, read: true } : item) })
    setToast("Notification updated.")
  }
  function sendManualNotice() {
    if (!subject || !message) return
    setState({ ...state, notifications: [{ id: makeId("n"), role: "patient", channel: "In-app", subject, text: message, sent: true, read: false, createdAt: nowStamp() }, ...state.notifications] })
    setSubject("")
    setMessage("")
    setToast("Notice sent to patient portal.")
  }
  return (
    <PageFrame title="Notifications" description={account.role === "patient" ? "Clinic messages about appointments, payments, prescriptions, and follow-up." : "Send notices and manage reminder, cancellation, payment, and appointment messages."}>
      <TwoColumn>
        <Card title={account.role === "patient" ? "My notifications" : "Notification queue"}>
          <div className="stack">
            {visibleNotifications.map((notification) => <button key={notification.id} className="notification-row" onClick={() => markSent(notification.id)}><Bell /><span><strong>{notification.subject}</strong><small>{notification.text}</small></span><em>{notification.sent ? notification.channel : "Queued"}</em></button>)}
            {!visibleNotifications.length && <div className="soft-row">No notifications yet.</div>}
          </div>
        </Card>
        {account.role !== "patient" && (
          <Card title="Manual notice">
            <input className="input" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Subject" />
            <textarea className="textarea" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Notice text" />
            <PrimaryButton onClick={sendManualNotice}>Send notice <Bell size={18} /></PrimaryButton>
          </Card>
        )}
      </TwoColumn>
    </PageFrame>
  )
}

function SettingsPage({ state, setState, setToast, account, setAccount }: ScreenProps & { setAccount: (account: Account) => void }) {
  const [name, setName] = useState(account.name)
  const [phone, setPhone] = useState(account.phone ?? "")
  function save() {
    const updated = { ...account, name, phone }
    setState({
      ...state,
      accounts: state.accounts.map((item) => item.id === account.id ? updated : item),
      patients: account.patientId ? state.patients.map((patient) => patient.id === account.patientId ? { ...patient, name, phone } : patient) : state.patients,
    })
    setAccount(updated)
    setToast("Profile updated.")
  }
  return (
    <PageFrame title="Profile Settings" description="Update contact and account information used across the clinic workflow.">
      <Card title="Personal information">
        <div className="form-stack">
          <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />
          <input className="input" value={account.email} disabled />
          <input className="input" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" />
          <PrimaryButton onClick={save}>Save changes</PrimaryButton>
        </div>
      </Card>
    </PageFrame>
  )
}

function PageFrame({ title, description, action, children }: { title: string; description: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <><section className="page-head"><div><h1>{title}</h1><p>{description}</p></div>{action}</section>{children}</>
}

function MetricGrid({ children }: { children: React.ReactNode }) {
  return <section className="metrics">{children}</section>
}

function Metric({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong><i>{icon}</i></div>
}

function TwoColumn({ children }: { children: React.ReactNode }) {
  return <section className="two-column">{children}</section>
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="card"><h2>{title}</h2>{children}</section>
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button className="primary" onClick={onClick}>{children}</button>
}

function QueueList({ state, onOpen }: { state: ClinicState; onOpen: (patientId: string) => void }) {
  return <div className="stack">{state.appointments.filter((item) => item.date === today()).map((appointment) => <button className="queue-row" key={appointment.id} onClick={() => onOpen(appointment.patientId)}><strong>{appointment.time}</strong><span>{patientNameById(state, appointment.patientId)}<small>{doctorNameById(state, appointment.doctorId)} · {appointment.service}</small></span><StatusBadge status={appointment.status} /></button>)}</div>
}

function DocumentList({ documents }: { documents: PatientDocument[] }) {
  return (
    <div className="stack">
      {documents.map((document) => <div className="soft-row document-row" key={document.id}><FileText size={18} /><span><strong>{document.title}</strong><small>ID: {document.id} · {document.type} · {document.date} · {document.fileName}</small></span><button type="button" onClick={() => downloadDocument(document)}>Download</button></div>)}
      {!documents.length && <div className="soft-row">No documents archived yet.</div>}
    </div>
  )
}

function StatusBadge({ status }: { status: Status }) {
  return <em className={`status ${status.toLowerCase().replace(" ", "-")}`}>{status}</em>
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null
  return <div className="toast" role="status"><div><strong>System update</strong><span>{message}</span></div><button type="button" onClick={onClose}>×</button></div>
}

function patientNameById(state: ClinicState, id: string) {
  return state.patients.find((patient) => patient.id === id)?.name ?? "Unknown patient"
}

function doctorNameById(state: ClinicState, id: string) {
  return state.doctors.find((doctor) => doctor.id === id)?.name ?? "Unknown doctor"
}

function downloadDocument(document: PatientDocument) {
  const blob = new Blob([`${document.title}\n${document.summary}\nDocument ID: ${document.id}`], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const anchor = window.document.createElement("a")
  anchor.href = url
  anchor.download = document.fileName.replace(/\.[^.]+$/, ".txt")
  anchor.click()
  URL.revokeObjectURL(url)
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function today() {
  return "2026-06-24"
}

function nowStamp() {
  return `${today()} 09:00`
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US")
}

function formatMoneyShort(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(value % 1000000 ? 2 : 0)}M`
  return formatMoney(value)
}

createRoot(document.getElementById("root")!).render(<App />)
