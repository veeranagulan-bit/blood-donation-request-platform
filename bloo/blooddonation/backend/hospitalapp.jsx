import React, { useState, useMemo } from "react";
import {
  CalendarDays, Users, Stethoscope, LayoutDashboard, Building2, Receipt,
  UserPlus, Search, ClipboardList, CheckCircle2, XCircle, PlusCircle,
  BedDouble, Clock, ChevronRight, FileText, Activity
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

// ---------- Mock seed data ----------
const seedDepartments = [
  { id: "d1", name: "Cardiology", beds: 20, occupied: 14 },
  { id: "d2", name: "Orthopedics", beds: 16, occupied: 9 },
  { id: "d3", name: "Pediatrics", beds: 18, occupied: 11 },
  { id: "d4", name: "General Medicine", beds: 30, occupied: 22 },
];

const seedDoctors = [
  { id: "doc1", name: "Dr. Amara Okonjo", specialty: "Cardiology", departmentId: "d1" },
  { id: "doc2", name: "Dr. Rajiv Menon", specialty: "Orthopedics", departmentId: "d2" },
  { id: "doc3", name: "Dr. Lena Farrow", specialty: "Pediatrics", departmentId: "d3" },
  { id: "doc4", name: "Dr. Samuel Osei", specialty: "General Medicine", departmentId: "d4" },
];

const seedPatients = [
  { id: "p1", mrn: "MRN-1042", name: "Priya Nair", age: 34, gender: "Female", phone: "98765 10001",
    records: [{ date: "2026-06-02", doctor: "Dr. Amara Okonjo", note: "Routine ECG, stable rhythm. Continue current medication." }] },
  { id: "p2", mrn: "MRN-1043", name: "Arjun Verma", age: 8, gender: "Male", phone: "98765 10002",
    records: [{ date: "2026-06-20", doctor: "Dr. Lena Farrow", note: "Seasonal fever, prescribed rest and fluids." }] },
  { id: "p3", mrn: "MRN-1044", name: "Meera Iyer", age: 61, gender: "Female", phone: "98765 10003", records: [] },
];

const TODAY = "2026-07-08";
const TIME_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30"];

const seedAppointments = [
  { id: "a1", patientId: "p1", doctorId: "doc1", date: TODAY, time: "09:00", status: "scheduled", reason: "Follow-up consultation" },
  { id: "a2", patientId: "p2", doctorId: "doc3", date: TODAY, time: "09:30", status: "checked-in", reason: "Fever recheck" },
  { id: "a3", patientId: "p3", doctorId: "doc4", date: TODAY, time: "10:00", status: "scheduled", reason: "General checkup" },
];

const seedBills = [
  { id: "b1", patientId: "p1", amount: 2400, status: "paid", items: "ECG + Consultation" },
  { id: "b2", patientId: "p2", amount: 900, status: "pending", items: "Consultation" },
];

let idCounter = 100;
const nextId = (prefix) => `${prefix}${idCounter++}`;

const ROLE_META = {
  patient: { label: "Patient", icon: Users },
  receptionist: { label: "Receptionist", icon: ClipboardList },
  doctor: { label: "Doctor", icon: Stethoscope },
  admin: { label: "Admin", icon: LayoutDashboard },
};

export default function HospitalApp() {
  const [departments, setDepartments] = useState(seedDepartments);
  const [doctors] = useState(seedDoctors);
  const [patients, setPatients] = useState(seedPatients);
  const [appointments, setAppointments] = useState(seedAppointments);
  const [bills, setBills] = useState(seedBills);

  const [role, setRole] = useState("patient");
  const [currentPatientId, setCurrentPatientId] = useState("p1");
  const [currentDoctorId, setCurrentDoctorId] = useState("doc1");
  const [section, setSection] = useState("book");
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2600);
  };

  React.useEffect(() => {
    const defaults = {
      patient: "book",
      receptionist: "register",
      doctor: "schedule",
      admin: "dashboard",
    };
    setSection(defaults[role]);
  }, [role]);

  const totalBeds = departments.reduce((s, d) => s + d.beds, 0);
  const occupiedBeds = departments.reduce((s, d) => s + d.occupied, 0);
  const queueCount = appointments.filter((a) => a.date === TODAY && a.status === "checked-in").length;
  const avgWait = queueCount === 0 ? 0 : 8 + queueCount * 3;

  const doctorName = (id) => doctors.find((d) => d.id === id)?.name ?? "—";
  const patientName = (id) => patients.find((p) => p.id === id)?.name ?? "—";

  return (
    <div className="hms-root">
      <style>{`
        .hms-root {
          --bg: #F6F7F5;
          --surface: #FFFFFF;
          --ink: #1E2B29;
          --ink-muted: #5B6B67;
          --primary: #2F6F62;
          --primary-dark: #1F4F45;
          --primary-tint: #E7F0EC;
          --clay: #B96B3D;
          --clay-tint: #F6E8DE;
          --line: #E3E7E3;
          --success: #3F8A5D;
          --warning: #C17A2E;
          --danger: #B4483F;
          font-family: 'Inter', system-ui, sans-serif;
          background: var(--bg);
          color: var(--ink);
          min-height: 100%;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .hms-root * { box-sizing: border-box; }
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .hms-serif { font-family: 'Fraunces', serif; }
        .hms-mono { font-family: 'IBM Plex Mono', monospace; }

        .hms-header {
          background: var(--primary-dark);
          color: #fff;
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .hms-brand { display: flex; align-items: center; gap: 10px; }
        .hms-brand-title { font-size: 20px; letter-spacing: 0.2px; }
        .hms-brand-sub { font-size: 11px; color: #BFDACE; text-transform: uppercase; letter-spacing: 1.2px; margin-top: 1px; }

        .hms-roles { display: flex; gap: 6px; background: rgba(255,255,255,0.08); padding: 4px; border-radius: 999px; }
        .hms-role-btn {
          border: none; background: transparent; color: #DCEAE4; padding: 7px 14px; border-radius: 999px;
          font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .hms-role-btn.active { background: #fff; color: var(--primary-dark); }
        .hms-role-btn:not(.active):hover { background: rgba(255,255,255,0.14); }

        .hms-vitals {
          background: #16302A;
          color: #A9CDC0;
          padding: 8px 24px;
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          font-size: 12px;
        }
        .hms-vitals span { display: flex; align-items: center; gap: 6px; }
        .hms-pulse {
          width: 7px; height: 7px; border-radius: 50%; background: #6FE3B4; display: inline-block;
          animation: hms-blip 2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) { .hms-pulse { animation: none; } }
        @keyframes hms-blip { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

        .hms-body { display: flex; flex: 1; min-height: 560px; }
        .hms-sidebar {
          width: 208px; background: var(--surface); border-right: 1px solid var(--line);
          padding: 16px 10px; flex-shrink: 0;
        }
        .hms-nav-item {
          display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px;
          font-size: 13.5px; font-weight: 500; color: var(--ink-muted); cursor: pointer; margin-bottom: 2px;
          border: none; background: transparent; width: 100%; text-align: left;
        }
        .hms-nav-item.active { background: var(--primary-tint); color: var(--primary-dark); font-weight: 600; }
        .hms-nav-item:not(.active):hover { background: #F1F3F1; }

        .hms-main { flex: 1; padding: 22px 26px; overflow-y: auto; }
        .hms-page-title { font-size: 22px; margin: 0 0 4px 0; }
        .hms-page-sub { color: var(--ink-muted); font-size: 13.5px; margin: 0 0 20px 0; }

        .hms-card {
          background: var(--surface); border: 1px solid var(--line); border-radius: 12px;
          padding: 18px; margin-bottom: 16px;
        }
        .hms-grid { display: grid; gap: 14px; }
        .hms-grid-4 { grid-template-columns: repeat(4, 1fr); }
        .hms-grid-2 { grid-template-columns: repeat(2, 1fr); }
        @media (max-width: 900px) { .hms-grid-4 { grid-template-columns: repeat(2, 1fr); } .hms-grid-2 { grid-template-columns: 1fr; } }

        .hms-stat-label { font-size: 11.5px; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.6px; }
        .hms-stat-value { font-size: 26px; font-weight: 600; margin-top: 6px; }

        label.hms-label { display: block; font-size: 12.5px; font-weight: 600; color: var(--ink-muted); margin-bottom: 5px; margin-top: 12px; }
        .hms-input, .hms-select {
          width: 100%; padding: 9px 10px; border: 1px solid var(--line); border-radius: 8px; font-size: 13.5px;
          background: #fff; color: var(--ink); font-family: inherit;
        }
        .hms-input:focus, .hms-select:focus, button:focus-visible {
          outline: 2px solid var(--primary); outline-offset: 1px;
        }

        .hms-btn {
          background: var(--primary); color: #fff; border: none; padding: 10px 16px; border-radius: 8px;
          font-size: 13.5px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
          margin-top: 16px;
        }
        .hms-btn:hover { background: var(--primary-dark); }
        .hms-btn-ghost {
          background: transparent; color: var(--primary-dark); border: 1px solid var(--primary); padding: 6px 12px;
          border-radius: 7px; font-size: 12.5px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;
        }
        .hms-btn-ghost:hover { background: var(--primary-tint); }

        table.hms-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        table.hms-table th { text-align: left; color: var(--ink-muted); font-size: 11.5px; text-transform: uppercase;
          letter-spacing: 0.5px; padding: 8px 10px; border-bottom: 1px solid var(--line); }
        table.hms-table td { padding: 10px 10px; border-bottom: 1px solid var(--line); vertical-align: middle; }
        table.hms-table tr:last-child td { border-bottom: none; }

        .hms-badge { padding: 3px 9px; border-radius: 999px; font-size: 11px; font-weight: 600; display: inline-block; }
        .hms-badge.scheduled { background: #EAF0FE; color: #3A5BC7; }
        .hms-badge.checked-in { background: var(--clay-tint); color: var(--clay); }
        .hms-badge.completed { background: var(--primary-tint); color: var(--primary-dark); }
        .hms-badge.cancelled { background: #FBEAE8; color: var(--danger); }
        .hms-badge.paid { background: var(--primary-tint); color: var(--primary-dark); }
        .hms-badge.pending { background: #FDF1E2; color: var(--warning); }

        .hms-empty { text-align: center; padding: 30px 10px; color: var(--ink-muted); font-size: 13.5px; }
        .hms-toast {
          position: absolute; bottom: 18px; right: 18px; background: var(--primary-dark); color: #fff;
          padding: 10px 16px; border-radius: 8px; font-size: 13px; display: flex; align-items: center; gap: 8px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.18);
        }
      `}</style>

      {/* Header */}
      <div className="hms-header">
        <div className="hms-brand">
          <Activity size={22} />
          <div>
            <div className="hms-serif hms-brand-title">Meridian General</div>
            <div className="hms-brand-sub">Hospital Management</div>
          </div>
        </div>
        <div className="hms-roles">
          {Object.entries(ROLE_META).map(([key, meta]) => {
            const Icon = meta.icon;
            return (
              <button
                key={key}
                className={`hms-role-btn ${role === key ? "active" : ""}`}
                onClick={() => setRole(key)}
              >
                <Icon size={14} /> {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vitals strip — signature element */}
      <div className="hms-vitals hms-mono">
        <span><span className="hms-pulse" /> {occupiedBeds}/{totalBeds} beds occupied</span>
        <span><Clock size={12} /> {queueCount} in queue today</span>
        <span>avg wait ~{avgWait} min</span>
        <span>{TODAY}</span>
      </div>

      <div className="hms-body">
        <Sidebar role={role} section={section} setSection={setSection} />
        <div className="hms-main">
          {role === "patient" && (
            <PatientView
              section={section}
              patients={patients}
              currentPatientId={currentPatientId}
              setCurrentPatientId={setCurrentPatientId}
              doctors={doctors}
              departments={departments}
              appointments={appointments}
              setAppointments={setAppointments}
              showToast={showToast}
            />
          )}
          {role === "receptionist" && (
            <ReceptionistView
              section={section}
              patients={patients}
              setPatients={setPatients}
              appointments={appointments}
              setAppointments={setAppointments}
              doctors={doctors}
              patientName={patientName}
              doctorName={doctorName}
              showToast={showToast}
            />
          )}
          {role === "doctor" && (
            <DoctorView
              section={section}
              doctors={doctors}
              currentDoctorId={currentDoctorId}
              setCurrentDoctorId={setCurrentDoctorId}
              appointments={appointments}
              setAppointments={setAppointments}
              patients={patients}
              setPatients={setPatients}
              patientName={patientName}
              showToast={showToast}
            />
          )}
          {role === "admin" && (
            <AdminView
              section={section}
              departments={departments}
              setDepartments={setDepartments}
              doctors={doctors}
              appointments={appointments}
              bills={bills}
              setBills={setBills}
              patients={patients}
              patientName={patientName}
              showToast={showToast}
            />
          )}
        </div>
      </div>

      {toast && (
        <div className="hms-toast"><CheckCircle2 size={15} /> {toast}</div>
      )}
    </div>
  );
}

// ---------- Sidebar ----------
function Sidebar({ role, section, setSection }) {
  const NAV = {
    patient: [
      { id: "book", label: "Book appointment", icon: CalendarDays },
      { id: "appointments", label: "My appointments", icon: ClipboardList },
      { id: "records", label: "My records", icon: FileText },
    ],
    receptionist: [
      { id: "register", label: "Register patient", icon: UserPlus },
      { id: "queue", label: "Front desk queue", icon: ClipboardList },
      { id: "search", label: "Find patient", icon: Search },
    ],
    doctor: [
      { id: "schedule", label: "Today's schedule", icon: CalendarDays },
      { id: "patients", label: "My patients", icon: Users },
    ],
    admin: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "departments", label: "Departments", icon: Building2 },
      { id: "staff", label: "Staff", icon: Stethoscope },
      { id: "billing", label: "Billing", icon: Receipt },
    ],
  };
  return (
    <div className="hms-sidebar">
      {NAV[role].map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className={`hms-nav-item ${section === item.id ? "active" : ""}`}
            onClick={() => setSection(item.id)}
          >
            <Icon size={15} /> {item.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Patient view ----------
function PatientView({ section, patients, currentPatientId, setCurrentPatientId, doctors, departments, appointments, setAppointments, showToast }) {
  const [deptId, setDeptId] = useState(departments[0].id);
  const [docId, setDocId] = useState("");
  const [date, setDate] = useState(TODAY);
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  const deptDoctors = doctors.filter((d) => d.departmentId === deptId);
  const takenSlots = appointments.filter((a) => a.doctorId === docId && a.date === date && a.status !== "cancelled").map((a) => a.time);
  const availableSlots = TIME_SLOTS.filter((t) => !takenSlots.includes(t));

  const myAppointments = appointments.filter((a) => a.patientId === currentPatientId);
  const myPatient = patients.find((p) => p.id === currentPatientId);

  const bookAppointment = () => {
    if (!docId || !time || !reason.trim()) {
      showToast("Fill in doctor, time slot and reason first.");
      return;
    }
    setAppointments((prev) => [
      ...prev,
      { id: nextId("a"), patientId: currentPatientId, doctorId: docId, date, time, status: "scheduled", reason: reason.trim() },
    ]);
    setTime(""); setReason("");
    showToast("Appointment booked.");
  };

  const cancelAppointment = (id) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)));
    showToast("Appointment cancelled.");
  };

  return (
    <>
      <PatientSwitcher patients={patients} currentPatientId={currentPatientId} setCurrentPatientId={setCurrentPatientId} />

      {section === "book" && (
        <div className="hms-card" style={{ maxWidth: 480 }}>
          <h2 className="hms-page-title" style={{ fontSize: 18 }}>Book an appointment</h2>
          <p className="hms-page-sub">Choose a department, doctor, and an open slot.</p>

          <label className="hms-label">Department</label>
          <select className="hms-select" value={deptId} onChange={(e) => { setDeptId(e.target.value); setDocId(""); setTime(""); }}>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          <label className="hms-label">Doctor</label>
          <select className="hms-select" value={docId} onChange={(e) => { setDocId(e.target.value); setTime(""); }}>
            <option value="">Select a doctor</option>
            {deptDoctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          <label className="hms-label">Date</label>
          <input className="hms-input" type="date" value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} />

          <label className="hms-label">Time slot</label>
          <select className="hms-select" value={time} onChange={(e) => setTime(e.target.value)} disabled={!docId}>
            <option value="">{docId ? "Select a time" : "Select a doctor first"}</option>
            {availableSlots.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          <label className="hms-label">Reason for visit</label>
          <input className="hms-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Follow-up, new symptoms..." />

          <button className="hms-btn" onClick={bookAppointment}><CalendarDays size={14} /> Book appointment</button>
        </div>
      )}

      {section === "appointments" && (
        <div className="hms-card">
          <h2 className="hms-page-title" style={{ fontSize: 18 }}>My appointments</h2>
          {myAppointments.length === 0 ? (
            <div className="hms-empty">No appointments yet — book one to get started.</div>
          ) : (
            <table className="hms-table">
              <thead><tr><th>Date</th><th>Time</th><th>Doctor</th><th>Reason</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {myAppointments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.date}</td><td>{a.time}</td>
                    <td>{doctors.find((d) => d.id === a.doctorId)?.name}</td>
                    <td>{a.reason}</td>
                    <td><span className={`hms-badge ${a.status}`}>{a.status}</span></td>
                    <td>
                      {a.status === "scheduled" && (
                        <button className="hms-btn-ghost" onClick={() => cancelAppointment(a.id)}><XCircle size={13} /> Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {section === "records" && (
        <div className="hms-card">
          <h2 className="hms-page-title" style={{ fontSize: 18 }}>My medical records</h2>
          {(!myPatient || myPatient.records.length === 0) ? (
            <div className="hms-empty">No records on file yet.</div>
          ) : (
            <table className="hms-table">
              <thead><tr><th>Date</th><th>Doctor</th><th>Note</th></tr></thead>
              <tbody>
                {myPatient.records.map((r, i) => (
                  <tr key={i}><td>{r.date}</td><td>{r.doctor}</td><td>{r.note}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}

function PatientSwitcher({ patients, currentPatientId, setCurrentPatientId }) {
  return (
    <div style={{ marginBottom: 16, fontSize: 13 }}>
      <span style={{ color: "var(--ink-muted)" }}>Viewing as: </span>
      <select className="hms-select" style={{ width: "auto", display: "inline-block", padding: "5px 8px" }}
        value={currentPatientId} onChange={(e) => setCurrentPatientId(e.target.value)}>
        {patients.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.mrn})</option>)}
      </select>
      <span style={{ color: "var(--ink-muted)", marginLeft: 8 }}>— demo only, real login isn't wired up</span>
    </div>
  );
}

// ---------- Receptionist view ----------
function ReceptionistView({ section, patients, setPatients, appointments, setAppointments, doctors, patientName, doctorName, showToast }) {
  const [form, setForm] = useState({ name: "", age: "", gender: "Female", phone: "" });
  const [query, setQuery] = useState("");

  const registerPatient = () => {
    if (!form.name.trim() || !form.age) { showToast("Name and age are required."); return; }
    const mrn = `MRN-${1045 + patients.length}`;
    setPatients((prev) => [...prev, { id: nextId("p"), mrn, name: form.name.trim(), age: Number(form.age), gender: form.gender, phone: form.phone, records: [] }]);
    setForm({ name: "", age: "", gender: "Female", phone: "" });
    showToast(`Registered — ${mrn}`);
  };

  const checkIn = (id) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "checked-in" } : a)));
    showToast("Patient checked in.");
  };

  const todays = appointments.filter((a) => a.date === TODAY && a.status !== "cancelled").sort((a, b) => a.time.localeCompare(b.time));
  const results = query.trim() ? patients.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.mrn.toLowerCase().includes(query.toLowerCase())) : [];

  return (
    <>
      {section === "register" && (
        <div className="hms-card" style={{ maxWidth: 440 }}>
          <h2 className="hms-page-title" style={{ fontSize: 18 }}>Register a new patient</h2>
          <p className="hms-page-sub">Front-desk intake for walk-ins and new patients.</p>
          <label className="hms-label">Full name</label>
          <input className="hms-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label className="hms-label">Age</label>
          <input className="hms-input" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          <label className="hms-label">Gender</label>
          <select className="hms-select" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option>Female</option><option>Male</option><option>Other</option>
          </select>
          <label className="hms-label">Phone</label>
          <input className="hms-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="98765 00000" />
          <button className="hms-btn" onClick={registerPatient}><UserPlus size={14} /> Register patient</button>
        </div>
      )}

      {section === "queue" && (
        <div className="hms-card">
          <h2 className="hms-page-title" style={{ fontSize: 18 }}>Front desk queue — {TODAY}</h2>
          {todays.length === 0 ? <div className="hms-empty">No appointments scheduled today.</div> : (
            <table className="hms-table">
              <thead><tr><th>Time</th><th>Patient</th><th>Doctor</th><th>Reason</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {todays.map((a) => (
                  <tr key={a.id}>
                    <td>{a.time}</td><td>{patientName(a.patientId)}</td><td>{doctorName(a.doctorId)}</td><td>{a.reason}</td>
                    <td><span className={`hms-badge ${a.status}`}>{a.status}</span></td>
                    <td>{a.status === "scheduled" && <button className="hms-btn-ghost" onClick={() => checkIn(a.id)}><CheckCircle2 size={13} /> Check in</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {section === "search" && (
        <div className="hms-card">
          <h2 className="hms-page-title" style={{ fontSize: 18 }}>Find a patient</h2>
          <input className="hms-input" style={{ maxWidth: 320 }} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or MRN..." />
          {query.trim() && (
            results.length === 0 ? <div className="hms-empty">No matches found.</div> : (
              <table className="hms-table" style={{ marginTop: 14 }}>
                <thead><tr><th>MRN</th><th>Name</th><th>Age</th><th>Gender</th><th>Phone</th></tr></thead>
                <tbody>
                  {results.map((p) => (
                    <tr key={p.id}><td className="hms-mono">{p.mrn}</td><td>{p.name}</td><td>{p.age}</td><td>{p.gender}</td><td>{p.phone}</td></tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      )}
    </>
  );
}

// ---------- Doctor view ----------
function DoctorView({ section, doctors, currentDoctorId, setCurrentDoctorId, appointments, setAppointments, patients, setPatients, patientName, showToast }) {
  const [noteDraft, setNoteDraft] = useState({});

  const mine = appointments.filter((a) => a.doctorId === currentDoctorId && a.date === TODAY && a.status !== "cancelled").sort((a, b) => a.time.localeCompare(b.time));
  const myPatientIds = [...new Set(appointments.filter((a) => a.doctorId === currentDoctorId).map((a) => a.patientId))];

  const completeWithNote = (appt) => {
    const note = (noteDraft[appt.id] || "").trim();
    if (!note) { showToast("Add a consultation note first."); return; }
    setAppointments((prev) => prev.map((a) => (a.id === appt.id ? { ...a, status: "completed" } : a)));
    setPatients((prev) => prev.map((p) => p.id === appt.patientId
      ? { ...p, records: [...p.records, { date: TODAY, doctor: doctors.find((d) => d.id === currentDoctorId)?.name, note }] }
      : p));
    showToast("Visit completed and note saved.");
  };

  return (
    <>
      <div style={{ marginBottom: 16, fontSize: 13 }}>
        <span style={{ color: "var(--ink-muted)" }}>Logged in as: </span>
        <select className="hms-select" style={{ width: "auto", display: "inline-block", padding: "5px 8px" }}
          value={currentDoctorId} onChange={(e) => setCurrentDoctorId(e.target.value)}>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
        </select>
      </div>

      {section === "schedule" && (
        <div className="hms-card">
          <h2 className="hms-page-title" style={{ fontSize: 18 }}>Today's schedule — {TODAY}</h2>
          {mine.length === 0 ? <div className="hms-empty">No patients on your schedule today.</div> : (
            <div>
              {mine.map((a) => (
                <div key={a.id} style={{ borderTop: "1px solid var(--line)", padding: "12px 0", display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ width: 64, fontWeight: 600 }} className="hms-mono">{a.time}</div>
                  <div style={{ flex: "1 1 180px" }}>
                    <div style={{ fontWeight: 600 }}>{patientName(a.patientId)}</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>{a.reason}</div>
                    <span className={`hms-badge ${a.status}`} style={{ marginTop: 6, display: "inline-block" }}>{a.status}</span>
                  </div>
                  {a.status !== "completed" && (
                    <div style={{ flex: "2 1 260px" }}>
                      <textarea className="hms-input" rows={2} placeholder="Consultation note..."
                        value={noteDraft[a.id] || ""} onChange={(e) => setNoteDraft({ ...noteDraft, [a.id]: e.target.value })} />
                      <button className="hms-btn-ghost" style={{ marginTop: 6 }} onClick={() => completeWithNote(a)}>
                        <CheckCircle2 size={13} /> Complete visit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {section === "patients" && (
        <div className="hms-card">
          <h2 className="hms-page-title" style={{ fontSize: 18 }}>My patients</h2>
          {myPatientIds.length === 0 ? <div className="hms-empty">No patients yet.</div> : (
            myPatientIds.map((pid) => {
              const p = patients.find((x) => x.id === pid);
              if (!p) return null;
              return (
                <div key={pid} style={{ borderTop: "1px solid var(--line)", padding: "12px 0" }}>
                  <div style={{ fontWeight: 600 }}>{p.name} <span className="hms-mono" style={{ fontWeight: 400, color: "var(--ink-muted)", fontSize: 12 }}>{p.mrn}</span></div>
                  {p.records.filter((r) => r.doctor === doctors.find((d) => d.id === currentDoctorId)?.name).map((r, i) => (
                    <div key={i} style={{ fontSize: 12.5, color: "var(--ink-muted)", marginTop: 4 }}>{r.date} — {r.note}</div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </>
  );
}

// ---------- Admin view ----------
function AdminView({ section, departments, setDepartments, doctors, appointments, bills, setBills, patients, patientName, showToast }) {
  const [billForm, setBillForm] = useState({ patientId: patients[0]?.id || "", amount: "", items: "" });

  const chartData = departments.map((d) => ({
    name: d.name.split(" ")[0],
    appointments: appointments.filter((a) => doctors.find((doc) => doc.id === a.doctorId)?.departmentId === d.id).length,
  }));

  const revenue = bills.filter((b) => b.status === "paid").reduce((s, b) => s + b.amount, 0);
  const pendingRevenue = bills.filter((b) => b.status === "pending").reduce((s, b) => s + b.amount, 0);
  const occupancyPct = Math.round((departments.reduce((s, d) => s + d.occupied, 0) / departments.reduce((s, d) => s + d.beds, 0)) * 100);

  const updateBeds = (id, field, value) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: Math.max(0, Number(value) || 0) } : d)));
  };

  const addBill = () => {
    if (!billForm.patientId || !billForm.amount || !billForm.items.trim()) { showToast("Fill in all billing fields."); return; }
    setBills((prev) => [...prev, { id: nextId("b"), patientId: billForm.patientId, amount: Number(billForm.amount), status: "pending", items: billForm.items.trim() }]);
    setBillForm({ patientId: patients[0]?.id || "", amount: "", items: "" });
    showToast("Bill added.");
  };

  const toggleBillStatus = (id) => {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, status: b.status === "paid" ? "pending" : "paid" } : b)));
  };

  return (
    <>
      {section === "dashboard" && (
        <>
          <h2 className="hms-page-title">Overview</h2>
          <p className="hms-page-sub">Snapshot across all departments — {TODAY}</p>
          <div className="hms-grid hms-grid-4">
            <div className="hms-card"><div className="hms-stat-label">Total patients</div><div className="hms-stat-value">{patients.length}</div></div>
            <div className="hms-card"><div className="hms-stat-label">Appointments today</div><div className="hms-stat-value">{appointments.filter((a) => a.date === TODAY).length}</div></div>
            <div className="hms-card"><div className="hms-stat-label">Bed occupancy</div><div className="hms-stat-value">{occupancyPct}%</div></div>
            <div className="hms-card"><div className="hms-stat-label">Revenue collected</div><div className="hms-stat-value">₹{revenue.toLocaleString("en-IN")}</div></div>
          </div>
          <div className="hms-card" style={{ marginTop: 4 }}>
            <div className="hms-stat-label" style={{ marginBottom: 12 }}>Appointments by department</div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E7E3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#5B6B67" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#5B6B67" />
                  <Tooltip />
                  <Bar dataKey="appointments" fill="#2F6F62" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {section === "departments" && (
        <div className="hms-card">
          <h2 className="hms-page-title" style={{ fontSize: 18 }}>Departments</h2>
          <table className="hms-table">
            <thead><tr><th>Department</th><th>Total beds</th><th>Occupied</th><th>Occupancy</th></tr></thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td><input className="hms-input" style={{ width: 80 }} type="number" value={d.beds} onChange={(e) => updateBeds(d.id, "beds", e.target.value)} /></td>
                  <td><input className="hms-input" style={{ width: 80 }} type="number" value={d.occupied} onChange={(e) => updateBeds(d.id, "occupied", e.target.value)} /></td>
                  <td>{Math.round((d.occupied / d.beds) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section === "staff" && (
        <div className="hms-card">
          <h2 className="hms-page-title" style={{ fontSize: 18 }}>Staff directory</h2>
          <table className="hms-table">
            <thead><tr><th>Name</th><th>Specialty</th><th>Department</th></tr></thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d.id}><td>{d.name}</td><td>{d.specialty}</td><td>{departments.find((dep) => dep.id === d.departmentId)?.name}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="hms-page-sub" style={{ marginTop: 12 }}>Adding/removing staff can be wired up next — this view is read-only for now.</p>
        </div>
      )}

      {section === "billing" && (
        <>
          <div className="hms-grid hms-grid-2">
            <div className="hms-card"><div className="hms-stat-label">Collected</div><div className="hms-stat-value">₹{revenue.toLocaleString("en-IN")}</div></div>
            <div className="hms-card"><div className="hms-stat-label">Pending</div><div className="hms-stat-value">₹{pendingRevenue.toLocaleString("en-IN")}</div></div>
          </div>
          <div className="hms-card">
            <h2 className="hms-page-title" style={{ fontSize: 18 }}>Bills</h2>
            <table className="hms-table">
              <thead><tr><th>Patient</th><th>Items</th><th>Amount</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b.id}>
                    <td>{patientName(b.patientId)}</td><td>{b.items}</td><td>₹{b.amount.toLocaleString("en-IN")}</td>
                    <td><span className={`hms-badge ${b.status}`}>{b.status}</span></td>
                    <td><button className="hms-btn-ghost" onClick={() => toggleBillStatus(b.id)}><Receipt size={13} /> Mark {b.status === "paid" ? "pending" : "paid"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 18, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
              <div className="hms-stat-label" style={{ marginBottom: 6 }}>Add a bill</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ flex: "1 1 160px" }}>
                  <label className="hms-label" style={{ marginTop: 0 }}>Patient</label>
                  <select className="hms-select" value={billForm.patientId} onChange={(e) => setBillForm({ ...billForm, patientId: e.target.value })}>
                    {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: "1 1 160px" }}>
                  <label className="hms-label" style={{ marginTop: 0 }}>Items</label>
                  <input className="hms-input" value={billForm.items} onChange={(e) => setBillForm({ ...billForm, items: e.target.value })} placeholder="e.g. X-ray + Consultation" />
                </div>
                <div style={{ flex: "0 1 120px" }}>
                  <label className="hms-label" style={{ marginTop: 0 }}>Amount (₹)</label>
                  <input className="hms-input" type="number" value={billForm.amount} onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })} />
                </div>
                <button className="hms-btn" style={{ marginTop: 0 }} onClick={addBill}><PlusCircle size={14} /> Add bill</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
