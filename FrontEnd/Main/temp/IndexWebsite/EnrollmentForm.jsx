import React, { useState } from "react";
import { TUITION_FEES } from "../../config/tuitionConfig";
import "../IndexWebsiteCSS/EnrollmentForm.css"; // create this CSS file

const EnrollmentForm = ({ onClose }) => {
  /* -------------------- BASIC STATES -------------------- */
  const [studentType, setStudentType] = useState(""); // new | old
  const [educationLevel, setEducationLevel] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [paymentMode, setPaymentMode] = useState("");

  /* -------------------- STUDENT INFO -------------------- */
  const [lrn, setLrn] = useState("");
  const [studentNumber, setStudentNumber] = useState("");

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");

  /* -------------------- CONTACT INFO -------------------- */
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [religion, setReligion] = useState("");
  const [telephone, setTelephone] = useState("");
  const [mobile, setMobile] = useState("");
  const [parentFacebook, setParentFacebook] = useState("");

  const getTuitionKey = (grade) => {
  switch (grade) {
    case "prek":
      return "prek";
    case "kinder":
      return "kinder";
    case "grade1":
    case "grade2":
    case "grade3":
      return "grade1-3";
    case "grade4":
    case "grade5":
      return "grade4-5";
    case "grade6":
      return "grade6";
    default:
      return null;
  }
};

const tuitionKey = getTuitionKey(gradeLevel);
const tuition = tuitionKey ? TUITION_FEES[tuitionKey] : null;

/* -------------------- GRADE OPTIONS -------------------- */
const gradeOptions =
  educationLevel === "preschool"
    ? [
        { value: "prek", label: "Pre-Kinder" },
        { value: "kinder", label: "Kinder" },
      ]
    : educationLevel === "elementary"
    ? [
        { value: "grade1", label: "Grade 1" },
        { value: "grade2", label: "Grade 2" },
        { value: "grade3", label: "Grade 3" },
        { value: "grade4", label: "Grade 4" },
        { value: "grade5", label: "Grade 5" },
        { value: "grade6", label: "Grade 6" },
      ]
    : [];


  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      // academic
      lrn,
      student_number: studentNumber,
      student_type: studentType,
      education_level: educationLevel,
      grade_level: gradeLevel,

      // personal
      last_name: lastName,
      first_name: firstName,
      middle_name: middleName,
      birth_date: birthDate,
      gender,

      // contact
      email,
      address,
      religion,
      telephone_number: telephone,
      mobile_number: mobile,
      parent_facebook: parentFacebook,

      // payment
      payment_mode: paymentMode,
      status: "pending",
    };

    console.log("SUBMITTED:", payload);
    alert("Enrollment submitted! Status: Pending");
  };

  return (
    <div className="enrollment-container">
      <h2>📄 Enrollment Form</h2>

      <form onSubmit={handleSubmit} className="enrollment-form">

        {/* ================= ACADEMIC INFO ================= */}
        <h3>🎓 Academic Information</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>LRN</label>
            <input value={lrn} onChange={e => setLrn(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Student Number</label>
            <input value={studentNumber} onChange={e => setStudentNumber(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Student Type</label>
            <select value={studentType} onChange={e => setStudentType(e.target.value)}>
              <option value="">Select</option>
              <option value="new">New / Transferee</option>
              <option value="old">Old Student</option>
            </select>
          </div>

          <div className="form-group">
            <label>Education Level</label>
            <select
              value={educationLevel}
              onChange={e => {
                setEducationLevel(e.target.value);
                setGradeLevel("");
              }}
            >
              <option value="">Select</option>
              <option value="preschool">Preschool</option>
              <option value="elementary">Elementary</option>
            </select>
          </div>

          <div className="form-group">
            <label>Grade Level</label>
            <select
              value={gradeLevel}
              disabled={!educationLevel}
              onChange={e => setGradeLevel(e.target.value)}
            >
              <option value="">Select</option>
              {gradeOptions.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ================= STUDENT INFO ================= */}
        <h3>👤 Student Information</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Last Name</label>
            <input value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>First Name</label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Middle Name</label>
            <input value={middleName} onChange={e => setMiddleName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Birth Date</label>
            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value)}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        {/* ================= CONTACT INFO ================= */}
        <h3>📞 Contact Information</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Religion</label>
            <input value={religion} onChange={e => setReligion(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Telephone</label>
            <input value={telephone} onChange={e => setTelephone(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input value={mobile} onChange={e => setMobile(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Parent Facebook</label>
            <input value={parentFacebook} onChange={e => setParentFacebook(e.target.value)} />
          </div>
        </div>

        {/* ================= PAYMENT ================= */}
        <h3>💰 Payment Information</h3>

        <div className="form-group">
          <label>Payment Mode</label>
          <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
            <option value="">Select</option>
            <option value="cash">Cash</option>
            <option value="installment">Installment</option>
          </select>
        </div>

        {/* ================= TUITION SUMMARY ================= */}
        {tuition && (
          <div className="tuition-box">
            <h3>📊 Tuition Breakdown</h3>

            {paymentMode === "cash" && (
              <>
                <div className="tuition-row">
                  <span>Tuition Fee (Cash)</span>
                  <span>₱{tuition.cash.toLocaleString()}</span>
                </div>
                <div className="tuition-row">
                  <span>Miscellaneous (August)</span>
                  <span>₱{tuition.misc_aug.toLocaleString()}</span>
                </div>
                <div className="tuition-row">
                  <span>Miscellaneous (November)</span>
                  <span>₱{tuition.misc_nov.toLocaleString()}</span>
                </div>
                {studentType === "new" && (
                  <div className="tuition-row">
                    <span>Assessment Fee</span>
                    <span>₱{tuition.assessment.toLocaleString()}</span>
                  </div>
                )}
                <div className="tuition-total">
                  <strong>Total (Cash)</strong>
                  <strong>
                    ₱{(
                      tuition.total_cash + (studentType === "new" ? tuition.assessment : 0)
                    ).toLocaleString()}
                  </strong>
                </div>
              </>
            )}

            {paymentMode === "installment" && (
              <>
                <div className="tuition-row">
                  <span>Tuition Fee (Installment)</span>
                  <span>₱{tuition.installment.toLocaleString()}</span>
                </div>
                <div className="tuition-row">
                  <span>Initial Payment</span>
                  <span>₱{tuition.initial.toLocaleString()}</span>
                </div>
                <div className="tuition-row">
                  <span>Reservation Fee</span>
                  <span>₱2,000</span>
                </div>
                <div className="tuition-row">
                  <span>Monthly Payment</span>
                  <span>₱{tuition.monthly.toLocaleString()}</span>
                </div>
                <div className="tuition-row">
                  <span>Miscellaneous (August)</span>
                  <span>₱{tuition.misc_aug.toLocaleString()}</span>
                </div>
                <div className="tuition-row">
                  <span>Miscellaneous (November)</span>
                  <span>₱{tuition.misc_nov.toLocaleString()}</span>
                </div>
                {studentType === "new" && (
                  <div className="tuition-row">
                    <span>Assessment Fee</span>
                    <span>₱{tuition.assessment.toLocaleString()}</span>
                  </div>
                )}
                <div className="tuition-total">
                  <strong>Total (Installment)</strong>
                  <strong>
                    ₱{(
                      tuition.total_installment + (studentType === "new" ? tuition.assessment : 0)
                    ).toLocaleString()}
                  </strong>
                </div>
              </>
            )}
          </div>
        )}



        {/* ================= ACTIONS ================= */}
        <div className="form-actions">
          <button type="submit">Submit Enrollment</button>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnrollmentForm;
