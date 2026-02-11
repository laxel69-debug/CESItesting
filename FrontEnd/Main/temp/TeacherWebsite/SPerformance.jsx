import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import "../TeacherWebsiteCSS/SPerformance.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const SPerformance = () => {
  const [selectedGrade, setSelectedGrade] = useState("Grade 1 - Einstein");

  const grades = [
    "Grade 1 - Einstein",
    "Grade 2 - Newton",
    "Grade 3 - Galileo",
    "Grade 4 - Pascal",
    "Grade 5 - Darwin",
    "Grade 6 - Atom",
  ];

  // Bar Chart: Grade Distribution
  const barData = {
    labels: ["75-80", "81-85", "86-90", "91-95", "96-100"],
    datasets: [
      {
        label: "Students",
        data: [4, 8, 15, 10, 3],
        backgroundColor: "#0077b6",
        borderRadius: 6,
      },
    ],
  };

  // Doughnut Chart: Passing Rate
  const doughnutData = {
    labels: ["Passed", "Failed"],
    datasets: [
      {
        data: [36, 4],
        backgroundColor: ["#198754", "#dc3545"],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 12, font: { size: 11 } },
      },
    },
  };

  const topPerformers = [
    { r: 1, n: "Sofia Rodriguez", g: "96.2%", s: "With Honors" },
    { r: 2, n: "Liam Johnson", g: "94.8%", s: "With Honors" },
    { r: 3, n: "Emma Watson", g: "93.5%", s: "With Honors" },
    { r: 4, n: "Noah Brown", g: "92.1%", s: "With Honors" },
    { r: 5, n: "Lucas Garcia", g: "91.7%", s: "Passed" },
  ];

  const atRisk = [
    { n: "John Michael Smith", g: "74.2%", a: "75%", i: "Low Exam Scores" },
    { n: "Sarah Jane Miller", g: "73.5%", a: "60%", i: "Chronic Absences" },
    { n: "Robert Wilson", g: "74.8%", a: "82%", i: "Missing Projects" },
    { n: "Grace Davis", g: "72.1%", a: "90%", i: "Low Performance Tasks" },
  ];

  return (
    <div className="sp">
      {/* Header */}
      <header className="sp__header">
        <div className="sp__headerLeft">
          <h2 className="sp__title">Student Performance</h2>
          <p className="sp__subtitle">Analysis Dashboard • A.Y. 2025-2026</p>
        </div>

        <select
          className="sp__select"
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
        >
          {grades.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </header>

      {/* Top Cards */}
      <section className="sp__cards">
        <div className="spCard spCard--primary">
          <div className="spCard__icon" aria-hidden="true">🧮</div>
          <div>
            <div className="spCard__label">CLASS AVERAGE</div>
            <div className="spCard__value">88.5%</div>
          </div>
        </div>

        <div className="spCard spCard--success">
          <div className="spCard__icon" aria-hidden="true">🏆</div>
          <div>
            <div className="spCard__label">TOP PERFORMER</div>
            <div className="spCard__value">96.2%</div>
          </div>
        </div>

        <div className="spCard spCard--danger">
          <div className="spCard__icon" aria-hidden="true">⚠️</div>
          <div>
            <div className="spCard__label">UNDERPERFORMING</div>
            <div className="spCard__value">
              4 <span className="spCard__valueSub">Students</span>
            </div>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="sp__charts">
        <div className="spPanel">
          <div className="spPanel__title">Grade Distribution Frequency</div>
          <div className="spPanel__chart">
            <Bar data={barData} options={commonOptions} />
          </div>
        </div>

        <div className="spPanel">
          <div className="spPanel__title">Passing Rate Status</div>
          <div className="spPanel__chart">
            <Doughnut data={doughnutData} options={commonOptions} />
          </div>
        </div>
      </section>

      {/* Ranking table */}
      <section className="spBlock">
        <div className="spBlock__head spBlock__head--dark">
          <h6 className="spBlock__headTitle">Ranking Top Performers</h6>
          <span className="spPill spPill--primary">Top 5 Students</span>
        </div>

        <div className="spTableWrap">
          <table className="spTable">
            <thead>
              <tr>
                <th className="spTh">RANK</th>
                <th className="spTh spTh--left">STUDENT NAME</th>
                <th className="spTh">GWA</th>
                <th className="spTh">REMARKS</th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.map((s) => (
                <tr className="spTr" key={s.r}>
                  <td className="spTd">
                    <span className={"rankDot " + (s.r === 1 ? "rankDot--gold" : "rankDot--muted")}>
                      {s.r}
                    </span>
                  </td>
                  <td className="spTd spTd--left spName">{s.n}</td>
                  <td className="spTd spGwa">{s.g}</td>
                  <td className="spTd">
                    <span className={"spPill " + (s.s === "With Honors" ? "spPill--success" : "spPill--info")}>
                      {s.s}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Underperforming table */}
      <section className="spBlock spBlock--mb">
        <div className="spBlock__head spBlock__head--danger">
          <h6 className="spBlock__headTitle">Students At Risk / Underperforming</h6>
          <span className="spPill spPill--lightDanger">Action Required</span>
        </div>

        <div className="spTableWrap">
          <table className="spTable">
            <thead>
              <tr>
                <th className="spTh spTh--left">STUDENT NAME</th>
                <th className="spTh">GWA</th>
                <th className="spTh">ATTENDANCE</th>
                <th className="spTh">PRIMARY ISSUE</th>
                <th className="spTh">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {atRisk.map((s, idx) => {
                const attNum = parseInt(s.a, 10) || 0;
                return (
                  <tr className="spTr" key={idx}>
                    <td className="spTd spTd--left spRiskName">{s.n}</td>
                    <td className="spTd spDark">{s.g}</td>

                    <td className="spTd">
                      <div className="spProg">
                        <div
                          className={"spProg__bar " + (attNum < 75 ? "spProg__bar--danger" : "spProg__bar--warn")}
                          style={{ width: s.a }}
                        />
                      </div>
                      <div className="spTiny">{s.a} Attendance</div>
                    </td>

                    <td className="spTd">
                      <span className="spPill spPill--dangerSoft">{s.i}</span>
                    </td>

                    <td className="spTd">
                      <button className="spBtnDanger" type="button">
                        ✉️ Notify Parent
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default SPerformance;
