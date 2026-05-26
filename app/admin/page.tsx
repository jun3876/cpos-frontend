"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {

  const [courses, setCourses] = useState<any[]>([]);

  const [semester, setSemester] =
    useState("2026-1학기");

  const [startDate, setStartDate] =
    useState("2026-02-20 10:00");

  const [endDate, setEndDate] =
    useState("2026-02-22 18:00");

  useEffect(() => {

    fetch("http://localhost:5000/api/courses")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
      });

  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      <h1 className="text-4xl font-bold">
        관리자 페이지
      </h1>

      <p className="text-slate-400 mt-2">
        수강신청 및 과목 관리
      </p>

      {/* 기간 관리 */}
      <div className="mt-8 bg-slate-900 rounded-3xl p-6 border border-slate-800">

        <h2 className="text-2xl font-bold mb-5">
          수강신청 기간 관리
        </h2>

        <div className="grid grid-cols-3 gap-4">

          <input
            value={semester}
            onChange={(e) =>
              setSemester(e.target.value)
            }
            className="bg-slate-800 rounded-2xl px-4 py-3"
          />

          <input
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
            className="bg-slate-800 rounded-2xl px-4 py-3"
          />

          <input
            value={endDate}
            onChange={(e) =>
              setEndDate(e.target.value)
            }
            className="bg-slate-800 rounded-2xl px-4 py-3"
          />

        </div>

        <button className="mt-5 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-2xl font-bold">
          저장
        </button>

      </div>

      {/* 과목 관리 */}
      <div className="mt-8 bg-slate-900 rounded-3xl p-6 border border-slate-800">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            과목 관리
          </h2>

          <button className="bg-green-500 hover:bg-green-600 px-5 py-3 rounded-2xl font-bold">
            과목 추가
          </button>

        </div>

        <div className="space-y-4">

          {courses.map((course, index) => (

            <div
              key={index}
              className="bg-slate-800 rounded-2xl p-5 border border-slate-700"
            >

              <div className="flex justify-between items-center">

                <div>

                  <h3 className="text-xl font-bold">
                    {course.LEC_NAME}
                  </h3>

                  <p className="text-slate-400 mt-1">
                    {course.PROFESSOR_NAME}
                  </p>

                  <p className="text-sm text-slate-500 mt-2">
                    {course.LEC_TIME}
                  </p>

                </div>

                <div className="flex gap-3">

                  <button className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-xl">
                    수정
                  </button>

                  <button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl">
                    삭제
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}