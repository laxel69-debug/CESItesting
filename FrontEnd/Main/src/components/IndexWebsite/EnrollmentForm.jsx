import React, { useState } from "react";
import { TUITION_FEES } from "../../config/tuitionConfig";
import "../IndexWebsiteCSS/EnrollmentForm.css";

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

  /* -------------------- PARENT / GUARDIAN INFO -------------------- */
  const [fatherName, setFatherName] = useState("");
  const [fatherContact, setFatherContact] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");

  const [motherName, setMotherName] = useState("");
  const [motherContact, setMotherContact] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");

  const [guardianName, setGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("");

  // honeypot
  const [website, setWebsite] = useState("");

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

  /* -------------------- PH MOBILE NORMALIZE -------------------- */
  const normalizePHMobile = (number) => {
    if (!number) return null;

    // remove spaces + dashes + parentheses
    const cleaned = String(number).replace(/[\s\-()]/g, "");

    // 09xxxxxxxxx -> +639xxxxxxxxx
    if (/^09\d{9}$/.test(cleaned)) return "+63" + cleaned.slice(1);

    // +639xxxxxxxxx already
    if (/^\+639\d{9}$/.test(cleaned)) return cleaned;

    return null;
  };

  /* -------------------- BIRTHDATE VALIDATION -------------------- */
  const calcAge = (yyyyMMdd) => {
    if (!yyyyMMdd) return null;
    const bd = new Date(yyyyMMdd + "T00:00:00");
    const today = new Date();

    let age = today.getFullYear() - bd.getFullYear();
    const m = today.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;

    return age;
  };

  const validateBirthDate = (yyyyMMdd) => {
    if (!yyyyMMdd) return true; // optional

    const bd = new Date(yyyyMMdd + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bd >= today) return "Birth date must be in the past.";

    const age = calcAge(yyyyMMdd);

    // align with your backend: 3 to 18
    if (age < 3) return "Student must be at least 3 years old.";
    if (age > 18) return "Student age exceeds allowed school range.";

    return true;
  };

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ honeypot quick block (optional front-end)
    if (website && website.trim()) {
      alert("Invalid submission.");
      return;
    }

    // ✅ birthdate validation
    const bdCheck = validateBirthDate(birthDate);
    if (bdCheck !== true) {
      alert(bdCheck);
      return;
    }

    // ✅ PH mobile validation
    const normalizedMobile = normalizePHMobile(mobile);
    if (!normalizedMobile) {
      alert("Invalid PH mobile number.\nUse 09XXXXXXXXX or +639XXXXXXXXX format.");
      return;
    }
      const getCurrentAcademicYear = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth(); // 0 = Jan, 5 = June

      // School year starts June (month 5)
      if (month >= 5) {
        return `${year}-${year + 1}`;
      } else {
        return `${year - 1}-${year}`;
      }
    };
    const payload = {
      student_type: studentType,
      education_level: educationLevel,
      grade_level: gradeLevel,
      academic_year:  getCurrentAcademicYear(),

      // ✅ honeypot field (normally empty)
      website: website,

      lrn: lrn,
      last_name: lastName,
      first_name: firstName,
      middle_name: middleName,
      birth_date: birthDate || null,
      gender: gender,

      email: email,
      address: address,
      religion: religion,
      telephone_number: telephone,
      mobile_number: normalizedMobile,
      parent_facebook: parentFacebook,

      payment_mode: paymentMode,
      remarks: "",

      parent_info: {
        father_name: fatherName,
        father_contact: fatherContact,
        father_occupation: fatherOccupation,

        mother_name: motherName,
        mother_contact: motherContact,
        mother_occupation: motherOccupation,

        guardian_name: guardianName,
        guardian_contact: guardianContact,
        guardian_relationship: guardianRelationship,
      },
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/enrollments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error("Submission Error:", data);
        alert("Error: " + JSON.stringify(data));
        return;
      }

      await response.json();
      alert("Enrollment submitted successfully!");
      if (onClose) onClose();
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error. Check if Backend is running.");
    }
  };

  const maxBirthDate = new Date().toISOString().split("T")[0];

  return (
    <div className="enrollment-container">
      <h2>📄 Enrollment Form</h2>

      <form onSubmit={handleSubmit} className="enrollment-form">
        {/* ================= ACADEMIC INFO ================= */}
        <h3>🎓 Academic Information</h3>

        {/* honeypot (hidden) */}
        <div style={{ display: "none" }}>
          <input
            type="text"
            name="website"
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>LRN</label>
            <input value={lrn} onChange={(e) => setLrn(e.target.value)} />
          </div>

  
          <div className="form-group">
            <label>Student Type</label>
            <select value={studentType} onChange={(e) => setStudentType(e.target.value)}>
              <option value="">Select</option>
              <option value="new">New / Transferee</option>
              <option value="old">Old Student</option>
            </select>
          </div>

          <div className="form-group">
            <label>Education Level</label>
            <select
              value={educationLevel}
              onChange={(e) => {
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
              onChange={(e) => setGradeLevel(e.target.value)}
            >
              <option value="">Select</option>
              {gradeOptions.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ================= STUDENT INFO ================= */}
        <h3>👤 Student Information</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Last Name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>First Name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Middle Name</label>
            <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Birth Date</label>
            <input
              type="date"
              value={birthDate}
              max={maxBirthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
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
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Religion</label>
            <input value={religion} onChange={(e) => setReligion(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Telephone</label>
            <input value={telephone} onChange={(e) => setTelephone(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="09XXXXXXXXX or +639XXXXXXXXX"
            />
          </div>

          <div className="form-group">
            <label>Parent Facebook</label>
            <input value={parentFacebook} onChange={(e) => setParentFacebook(e.target.value)} />
          </div>
        </div>

        {/* ================= PARENT / GUARDIAN INFO ================= */}
        <h3>👨‍👩‍👧 Parent / Guardian Information</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Father Name</label>
            <input value={fatherName} onChange={(e) => setFatherName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Father Contact</label>
            <input value={fatherContact} onChange={(e) => setFatherContact(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Father Occupation</label>
            <input value={fatherOccupation} onChange={(e) => setFatherOccupation(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Mother Name</label>
            <input value={motherName} onChange={(e) => setMotherName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Mother Contact</label>
            <input value={motherContact} onChange={(e) => setMotherContact(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Mother Occupation</label>
            <input value={motherOccupation} onChange={(e) => setMotherOccupation(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Guardian Name</label>
            <input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Guardian Contact</label>
            <input value={guardianContact} onChange={(e) => setGuardianContact(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Guardian Relationship</label>
            <input value={guardianRelationship} onChange={(e) => setGuardianRelationship(e.target.value)} />
          </div>
        </div>

        {/* ================= PAYMENT ================= */}
        <h3>💰 Payment Information</h3>

        <div className="form-group">
          <label>Payment Mode</label>
          <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
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