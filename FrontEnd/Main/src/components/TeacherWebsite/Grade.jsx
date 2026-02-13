import React, { useState, useEffect, useCallback } from "react";
import { Plus, X, Edit2, Trash2, Save, ChevronDown, Settings } from "lucide-react";
import "../TeacherWebsiteCSS/Grade.css";
import { apiFetch } from "../api/apiFetch";

const API = "";

const GRADE_LEVELS = [
  { value: 0, label: "Kinder" },
  { value: 1, label: "Grade 1" },
  { value: 2, label: "Grade 2" },
  { value: 3, label: "Grade 3" },
  { value: 4, label: "Grade 4" },
  { value: 5, label: "Grade 5" },
  { value: 6, label: "Grade 6" },
];

const QUARTERS = [1, 2, 3, 4];

const CATEGORIES = [
  { key: "ACTIVITY", label: "Activities", color: "#3b82f6" },
  { key: "QUIZ", label: "Quizzes", color: "#8b5cf6" },
  { key: "EXAM", label: "Exams", color: "#ef4444" },
];

/* ═══════════════════════════════════════════════════ */

const Grade = () => {
  // ── core state ──
  const [gradeLevel, setGradeLevel] = useState(0);
  const [quarter, setQuarter] = useState(1);
  const [teacherSubject, setTeacherSubject] = useState(null); // {subject_id, subject_name, subject_code}

  // ── data ──
  const [items, setItems] = useState([]);       // GradeItems for selected quarter + grade
  const [students, setStudents] = useState([]);  // students in selected grade
  const [scores, setScores] = useState([]);      // all scores for this quarter
  const [classStandings, setClassStandings] = useState([]); // class standing scores
  const [weights, setWeights] = useState({
    activity_weight: 40, quiz_weight: 20, exam_weight: 20, class_standing_weight: 20,
  });

  // ── UI state ──
  const [showAddItem, setShowAddItem] = useState(null);  // category string or null
  const [newItem, setNewItem] = useState({ title: "", description: "", date_given: "", due_date: "", total_score: 100 });
  const [showWeights, setShowWeights] = useState(false);
  const [tempWeights, setTempWeights] = useState({ ...weights });
  const [scoreModal, setScoreModal] = useState(null); // {student, item} or null
  const [scoreValue, setScoreValue] = useState("");
  const [csModal, setCsModal] = useState(null); // {student} for class standing
  const [csValue, setCsValue] = useState("");
  const [editItem, setEditItem] = useState(null); // grade item being edited
  const [editForm, setEditForm] = useState({});

  // ─── fetch teacher info on mount ───
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`${API}/api/grades/teacher-info/`);
        if (res.ok) {
          const data = await res.json();
          setTeacherSubject(data);
        }
      } catch (e) { console.error(e); }
    })();
  }, []);

  // ─── fetch items + students + scores + weights when filters change ───
  const fetchAll = useCallback(async () => {
    if (!teacherSubject) return;
    const subj = teacherSubject.subject_id;

    const [itemsRes, studentsRes, scoresRes, csRes, wRes] = await Promise.all([
      apiFetch(`${API}/api/grades/items/?subject=${subj}&grade_level=${gradeLevel}&quarter=${quarter}`),
      apiFetch(`${API}/api/grades/students/${gradeLevel}/`),
      apiFetch(`${API}/api/grades/scores/?subject=${subj}&grade_level=${gradeLevel}&quarter=${quarter}`),
      apiFetch(`${API}/api/grades/class-standing/?subject=${subj}&quarter=${quarter}`),
      apiFetch(`${API}/api/grades/weights/${subj}/`),
    ]);

    if (itemsRes.ok) setItems(await itemsRes.json());
    if (studentsRes.ok) setStudents(await studentsRes.json());
    if (scoresRes.ok) setScores(await scoresRes.json());
    if (csRes.ok) setClassStandings(await csRes.json());
    if (wRes.ok) {
      const wd = await wRes.json();
      setWeights(wd);
      setTempWeights(wd);
    }
  }, [teacherSubject, gradeLevel, quarter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── helpers ───
  const itemsByCategory = (cat) => items.filter((i) => i.category === cat);

  const getScore = (studentId, itemId) => {
    const s = scores.find((sc) => sc.student === studentId && sc.grade_item === itemId);
    return s ? s.score : null;
  };

  const getCS = (studentId) => {
    const c = classStandings.find((cs) => cs.student === studentId);
    return c ? c.score : null;
  };

  // Compute category average for a student (percentage)
  const categoryAvg = (studentId, cat) => {
    const catItems = itemsByCategory(cat);
    if (!catItems.length) return null;
    let totalEarned = 0, totalPossible = 0, hasAny = false;
    catItems.forEach((item) => {
      const s = getScore(studentId, item.id);
      if (s !== null) {
        totalEarned += Number(s);
        totalPossible += item.total_score;
        hasAny = true;
      }
    });
    if (!hasAny) return null;
    return totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
  };

  // Compute weighted quarter grade
  const quarterGrade = (studentId) => {
    const actAvg = categoryAvg(studentId, "ACTIVITY");
    const quizAvg = categoryAvg(studentId, "QUIZ");
    const examAvg = categoryAvg(studentId, "EXAM");
    const cs = getCS(studentId);

    const parts = [];
    if (actAvg !== null) parts.push({ avg: actAvg, w: weights.activity_weight });
    if (quizAvg !== null) parts.push({ avg: quizAvg, w: weights.quiz_weight });
    if (examAvg !== null) parts.push({ avg: examAvg, w: weights.exam_weight });
    if (cs !== null) parts.push({ avg: Number(cs), w: weights.class_standing_weight });

    if (!parts.length) return null;
    const totalW = parts.reduce((s, p) => s + p.w, 0);
    if (totalW === 0) return null;
    return parts.reduce((s, p) => s + (p.avg * p.w), 0) / totalW;
  };

  // ─── Add grade item ───
  const handleAddItem = async (category) => {
    if (!teacherSubject) return;
    const catItems = itemsByCategory(category);
    const body = {
      subject: teacherSubject.subject_id,
      grade_level: gradeLevel,
      quarter,
      category,
      title: newItem.title || `${category.charAt(0) + category.slice(1).toLowerCase()} ${catItems.length + 1}`,
      description: newItem.description,
      date_given: newItem.date_given || null,
      due_date: newItem.due_date || null,
      total_score: newItem.total_score || 100,
      order: catItems.length,
    };
    try {
      const res = await apiFetch(`${API}/api/grades/items/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowAddItem(null);
        setNewItem({ title: "", description: "", date_given: "", due_date: "", total_score: 100 });
        fetchAll();
      }
    } catch (e) { console.error(e); }
  };

  // ─── Delete grade item ───
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Delete this item and all its scores?")) return;
    try {
      await apiFetch(`${API}/api/grades/items/${itemId}/`, { method: "DELETE" });
      fetchAll();
    } catch (e) { console.error(e); }
  };

  // ─── Edit grade item ───
  const openEditItem = (item) => {
    setEditItem(item);
    setEditForm({
      title: item.title,
      description: item.description || "",
      date_given: item.date_given || "",
      due_date: item.due_date || "",
      total_score: item.total_score,
    });
  };

  const handleEditItem = async () => {
    if (!editItem) return;
    try {
      const body = { ...editForm };
      if (!body.date_given) body.date_given = null;
      if (!body.due_date) body.due_date = null;
      await apiFetch(`${API}/api/grades/items/${editItem.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setEditItem(null);
      fetchAll();
    } catch (e) { console.error(e); }
  };

  // ─── Save score ───
  const handleSaveScore = async () => {
    if (!scoreModal) return;
    try {
      await apiFetch(`${API}/api/grades/scores/upsert/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: scoreModal.student.id,
          grade_item: scoreModal.item.id,
          score: parseFloat(scoreValue),
        }),
      });
      setScoreModal(null);
      setScoreValue("");
      fetchAll();
    } catch (e) { console.error(e); }
  };

  // ─── Save class standing ───
  const handleSaveCS = async () => {
    if (!csModal || !teacherSubject) return;
    try {
      await apiFetch(`${API}/api/grades/class-standing/upsert/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: csModal.student.id,
          subject: teacherSubject.subject_id,
          quarter,
          score: parseFloat(csValue),
        }),
      });
      setCsModal(null);
      setCsValue("");
      fetchAll();
    } catch (e) { console.error(e); }
  };

  // ─── Save weights ───
  const handleSaveWeights = async () => {
    if (!teacherSubject) return;
    try {
      await apiFetch(`${API}/api/grades/weights/${teacherSubject.subject_id}/update/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tempWeights),
      });
      setShowWeights(false);
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const weightTotal = tempWeights.activity_weight + tempWeights.quiz_weight + tempWeights.exam_weight + tempWeights.class_standing_weight;

  // ─── Render ───
  if (!teacherSubject) {
    return (
      <div className="ge">
        <div className="ge__empty">
          <p>No subject assigned. Please contact an administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ge">
      {/* ════ Header ════ */}
      <header className="ge__header">
        <h2 className="ge__title">Grade Encoding</h2>
        <p className="ge__subtitle">
          <span className="ge__subjectTag">{teacherSubject.subject_name}</span>
          {" · "}
          <span className="ge__classTag">{GRADE_LEVELS.find((g) => g.value === gradeLevel)?.label}</span>
          {" · "}
          <span className="ge__quarterTag">Quarter {quarter}</span>
        </p>
      </header>

      {/* ════ Toolbar ════ */}
      <div className="ge__toolbar">
        <select className="ge__select" value={gradeLevel} onChange={(e) => setGradeLevel(Number(e.target.value))}>
          {GRADE_LEVELS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
        <div className="ge__quarterTabs">
          {QUARTERS.map((q) => (
            <button key={q} className={`ge__qTab ${quarter === q ? "ge__qTab--active" : ""}`} onClick={() => setQuarter(q)}>
              Q{q}
            </button>
          ))}
        </div>
        <button className="ge__weightsBtn" onClick={() => setShowWeights(true)} title="Adjust weights">
          <Settings size={14} /> Weights
        </button>
      </div>

      {/* ════ Weight display bar ════ */}
      <div className="ge__weightBar">
        <span className="ge__weightChip ge__weightChip--act">Activities {weights.activity_weight}%</span>
        <span className="ge__weightChip ge__weightChip--quiz">Quizzes {weights.quiz_weight}%</span>
        <span className="ge__weightChip ge__weightChip--exam">Exams {weights.exam_weight}%</span>
        <span className="ge__weightChip ge__weightChip--cs">Class Standing {weights.class_standing_weight}%</span>
      </div>

      {/* ════ Grade Items Planner (top section) ════ */}
      <section className="ge__planner">
        {CATEGORIES.map(({ key, label, color }) => {
          const catItems = itemsByCategory(key);
          return (
            <div className="ge__catSection" key={key}>
              <div className="ge__catHeader" style={{ borderLeftColor: color }}>
                <h3 className="ge__catTitle">{label} <span className="ge__catCount">{catItems.length}</span></h3>
                <button className="ge__addBtn" onClick={() => { setShowAddItem(key); setNewItem({ title: "", description: "", date_given: "", due_date: "", total_score: 100 }); }}>
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className="ge__catCards">
                {catItems.length === 0 && <p className="ge__catEmpty">No {label.toLowerCase()} yet.</p>}
                {catItems.map((item) => (
                  <div className="ge__itemCard" key={item.id}>
                    <div className="ge__itemTop">
                      <strong>{item.title}</strong>
                      <span className="ge__itemMax">/{item.total_score}</span>
                    </div>
                    {item.description && <p className="ge__itemDesc">{item.description}</p>}
                    <div className="ge__itemMeta">
                      {item.date_given && <span>Given: {item.date_given}</span>}
                      {item.due_date && <span>Due: {item.due_date}</span>}
                    </div>
                    <div className="ge__itemActions">
                      <button className="ge__iconBtn ge__iconBtn--edit" onClick={() => openEditItem(item)} title="Edit"><Edit2 size={14} /></button>
                      <button className="ge__iconBtn ge__iconBtn--del" onClick={() => handleDeleteItem(item.id)} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* ════ Student Scores Table (bottom section) ════ */}
      <section className="ge__card">
        <h3 className="ge__tableTitle">Student Scores — Q{quarter}</h3>
        <div className="ge__tableWrap">
          <table className="ge__table">
            <thead>
              <tr>
                <th className="ge__th ge__th--left ge__th--sticky">Student Name</th>
                {CATEGORIES.map(({ key, label }) =>
                  itemsByCategory(key).map((item) => (
                    <th key={item.id} className="ge__th ge__th--score" title={`${label}: ${item.title} (/${item.total_score})`}>
                      <span className={`ge__thCat ge__thCat--${key.toLowerCase()}`}>{key[0]}</span>
                      <span className="ge__thTitle">{item.title.length > 8 ? item.title.slice(0, 8) + "…" : item.title}</span>
                      <span className="ge__thMax">/{item.total_score}</span>
                    </th>
                  ))
                )}
                <th className="ge__th ge__th--score">CS</th>
                <th className="ge__th">Quarter Grade</th>
                <th className="ge__th">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr><td className="ge__td" colSpan={items.length + 4}>No students enrolled in this grade level.</td></tr>
              )}
              {students.map((stu) => {
                const qg = quarterGrade(stu.id);
                return (
                  <tr className="ge__tr" key={stu.id}>
                    <td className="ge__td ge__td--left ge__td--sticky">
                      <div className="ge__name">{stu.student_name}</div>
                    </td>
                    {CATEGORIES.map(({ key }) =>
                      itemsByCategory(key).map((item) => {
                        const sc = getScore(stu.id, item.id);
                        return (
                          <td key={item.id} className="ge__td ge__td--clickable" onClick={() => { setScoreModal({ student: stu, item }); setScoreValue(sc !== null ? String(sc) : ""); }}>
                            {sc !== null ? <span className="ge__scoreVal">{sc}</span> : <span className="ge__scoreEmpty">—</span>}
                          </td>
                        );
                      })
                    )}
                    <td className="ge__td ge__td--clickable" onClick={() => { setCsModal({ student: stu }); setCsValue(getCS(stu.id) !== null ? String(getCS(stu.id)) : ""); }}>
                      {getCS(stu.id) !== null ? <span className="ge__scoreVal">{getCS(stu.id)}</span> : <span className="ge__scoreEmpty">—</span>}
                    </td>
                    <td className="ge__td">
                      {qg !== null
                        ? <span className={`ge__final ${qg < 75 ? "ge__final--bad" : "ge__final--good"}`}>{qg.toFixed(1)}</span>
                        : <span className="ge__scoreEmpty">—</span>}
                    </td>
                    <td className="ge__td">
                      {qg !== null
                        ? <span className={`ge__badge ${qg >= 75 ? "ge__badge--pass" : "ge__badge--fail"}`}>{qg >= 75 ? "PASSED" : "FAILED"}</span>
                        : <span className="ge__scoreEmpty">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ════ Add Item Modal ════ */}
      {showAddItem && (
        <div className="ge__overlay" onClick={() => setShowAddItem(null)}>
          <div className="ge__modal" onClick={(e) => e.stopPropagation()}>
            <div className="ge__modalHeader">
              <h3>Add {showAddItem.charAt(0) + showAddItem.slice(1).toLowerCase()}</h3>
              <button className="ge__modalClose" onClick={() => setShowAddItem(null)}><X size={18} /></button>
            </div>
            <div className="ge__modalBody">
              <label>Title</label>
              <input className="ge__input" placeholder={`${showAddItem.charAt(0) + showAddItem.slice(1).toLowerCase()} ${itemsByCategory(showAddItem).length + 1}`}
                value={newItem.title} onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))} />
              <label>Description / Instructions</label>
              <textarea className="ge__input ge__textarea" rows={3} value={newItem.description} onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))} />
              <div className="ge__modalRow">
                <div><label>Date Given</label><input type="date" className="ge__input" value={newItem.date_given} onChange={(e) => setNewItem((p) => ({ ...p, date_given: e.target.value }))} /></div>
                <div><label>Due Date</label><input type="date" className="ge__input" value={newItem.due_date} onChange={(e) => setNewItem((p) => ({ ...p, due_date: e.target.value }))} /></div>
              </div>
              <label>Total Score</label>
              <input type="number" className="ge__input" min={1} value={newItem.total_score} onChange={(e) => setNewItem((p) => ({ ...p, total_score: parseInt(e.target.value) || 100 }))} />
            </div>
            <div className="ge__modalFooter">
              <button className="ge__btnCancel" onClick={() => setShowAddItem(null)}>Cancel</button>
              <button className="ge__btnSave" onClick={() => handleAddItem(showAddItem)}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ Edit Item Modal ════ */}
      {editItem && (
        <div className="ge__overlay" onClick={() => setEditItem(null)}>
          <div className="ge__modal" onClick={(e) => e.stopPropagation()}>
            <div className="ge__modalHeader">
              <h3>Edit {editItem.category.charAt(0) + editItem.category.slice(1).toLowerCase()}</h3>
              <button className="ge__modalClose" onClick={() => setEditItem(null)}><X size={18} /></button>
            </div>
            <div className="ge__modalBody">
              <label>Title</label>
              <input className="ge__input" value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} />
              <label>Description / Instructions</label>
              <textarea className="ge__input ge__textarea" rows={3} value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} />
              <div className="ge__modalRow">
                <div><label>Date Given</label><input type="date" className="ge__input" value={editForm.date_given} onChange={(e) => setEditForm((p) => ({ ...p, date_given: e.target.value }))} /></div>
                <div><label>Due Date</label><input type="date" className="ge__input" value={editForm.due_date} onChange={(e) => setEditForm((p) => ({ ...p, due_date: e.target.value }))} /></div>
              </div>
              <label>Total Score</label>
              <input type="number" className="ge__input" min={1} value={editForm.total_score} onChange={(e) => setEditForm((p) => ({ ...p, total_score: parseInt(e.target.value) || 100 }))} />
            </div>
            <div className="ge__modalFooter">
              <button className="ge__btnCancel" onClick={() => setEditItem(null)}>Cancel</button>
              <button className="ge__btnSave" onClick={handleEditItem}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ Score Entry Modal ════ */}
      {scoreModal && (
        <div className="ge__overlay" onClick={() => setScoreModal(null)}>
          <div className="ge__modal ge__modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="ge__modalHeader">
              <h3>Enter Score</h3>
              <button className="ge__modalClose" onClick={() => setScoreModal(null)}><X size={18} /></button>
            </div>
            <div className="ge__modalBody">
              <p className="ge__scoreInfo">
                <strong>{scoreModal.student.student_name}</strong><br />
                {scoreModal.item.title} <span className="ge__scoreMeta">(max {scoreModal.item.total_score})</span>
              </p>
              <input type="number" className="ge__input ge__inputScore" min={0} max={scoreModal.item.total_score} autoFocus
                value={scoreValue} onChange={(e) => setScoreValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveScore()} />
            </div>
            <div className="ge__modalFooter">
              <button className="ge__btnCancel" onClick={() => setScoreModal(null)}>Cancel</button>
              <button className="ge__btnSave" onClick={handleSaveScore} disabled={!scoreValue}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ Class Standing Modal ════ */}
      {csModal && (
        <div className="ge__overlay" onClick={() => setCsModal(null)}>
          <div className="ge__modal ge__modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="ge__modalHeader">
              <h3>Class Standing</h3>
              <button className="ge__modalClose" onClick={() => setCsModal(null)}><X size={18} /></button>
            </div>
            <div className="ge__modalBody">
              <p className="ge__scoreInfo">
                <strong>{csModal.student.student_name}</strong><br />
                Q{quarter} Class Standing <span className="ge__scoreMeta">(out of 100)</span>
              </p>
              <input type="number" className="ge__input ge__inputScore" min={0} max={100} autoFocus
                value={csValue} onChange={(e) => setCsValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveCS()} />
            </div>
            <div className="ge__modalFooter">
              <button className="ge__btnCancel" onClick={() => setCsModal(null)}>Cancel</button>
              <button className="ge__btnSave" onClick={handleSaveCS} disabled={!csValue}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ Weights Config Modal ════ */}
      {showWeights && (
        <div className="ge__overlay" onClick={() => setShowWeights(false)}>
          <div className="ge__modal" onClick={(e) => e.stopPropagation()}>
            <div className="ge__modalHeader">
              <h3>Grade Weights — {teacherSubject.subject_name}</h3>
              <button className="ge__modalClose" onClick={() => setShowWeights(false)}><X size={18} /></button>
            </div>
            <div className="ge__modalBody">
              <p className="ge__weightNote">Adjust how much each category contributes to the quarter grade. Total must equal 100%.</p>
              {[
                { key: "activity_weight", label: "Activities", color: "#3b82f6" },
                { key: "quiz_weight", label: "Quizzes", color: "#8b5cf6" },
                { key: "exam_weight", label: "Exams", color: "#ef4444" },
                { key: "class_standing_weight", label: "Class Standing", color: "#10b981" },
              ].map(({ key, label, color }) => (
                <div className="ge__weightRow" key={key}>
                  <span className="ge__weightLabel" style={{ color }}>{label}</span>
                  <input type="number" className="ge__input ge__inputWeight" min={0} max={100}
                    value={tempWeights[key]} onChange={(e) => setTempWeights((p) => ({ ...p, [key]: parseInt(e.target.value) || 0 }))} />
                  <span className="ge__weightPct">%</span>
                </div>
              ))}
              <div className={`ge__weightTotal ${weightTotal !== 100 ? "ge__weightTotal--bad" : ""}`}>
                Total: {weightTotal}% {weightTotal !== 100 && "(must be 100%)"}
              </div>
            </div>
            <div className="ge__modalFooter">
              <button className="ge__btnCancel" onClick={() => setShowWeights(false)}>Cancel</button>
              <button className="ge__btnSave" onClick={handleSaveWeights} disabled={weightTotal !== 100}>Save Weights</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grade;
