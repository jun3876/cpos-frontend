"use client";

import { useEffect, useState } from "react";

export default function WishlistPage() {

  const [courses, setCourses] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("전체");

  /* 로그인 정보 불러오기 */
  useEffect(() => {

    const token = localStorage.getItem("token");
    const studentData = localStorage.getItem("student");

    if (!token) {

      window.location.href = "/login";
      return;

    }

    if (studentData) {

      setStudent(JSON.parse(studentData));

    }

  }, []);

  /* 강의 불러오기 */
  const fetchCourses = async () => {

    try {

      const res = await fetch(
        "http://localhost:5000/api/courses"
      );

      const data = await res.json();

      setCourses(data);

    } catch (err) {

      console.log(err);

    }

  };

  /* 장바구니 불러오기 */
  const fetchWishlist = async () => {

    try {

      if (!student) return;

      const res = await fetch(
        `http://localhost:5000/api/wishlist/${student.student_id}`
      );

      const data = await res.json();

      setWishlist(data);

    } catch (err) {

      console.log(err);

    }

  };

  /* 장바구니 추가 */
  const addWishlist = async (course: any) => {

    try {

      const res = await fetch(
        "http://localhost:5000/api/wishlist",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            student_id: student.student_id,
            lec_id: course.LEC_ID,
            division: course.DIVISION,
          }),
        }
      );

      const data = await res.json();

      alert(data.message);

      fetchWishlist();

    } catch (err) {

      console.log(err);

    }

  };

  /* 장바구니 삭제 */
  const removeWishlist = async (course: any) => {

    try {

      const res = await fetch(
        "http://localhost:5000/api/wishlist",
        {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            student_id: student.student_id,
            lec_id: course.LEC_ID,
            division: course.DIVISION,
          }),
        }
      );

      const data = await res.json();

      alert(data.message);

      fetchWishlist();

    } catch (err) {

      console.log(err);

    }

  };

  /* 우선순위 이동 */
  const moveUp = (index: number) => {

    if (index === 0) return;

    const newList = [...wishlist];

    [newList[index - 1], newList[index]] =
      [newList[index], newList[index - 1]];

    setWishlist(newList);

  };

  const moveDown = (index: number) => {

    if (index === wishlist.length - 1) return;

    const newList = [...wishlist];

    [newList[index + 1], newList[index]] =
      [newList[index], newList[index + 1]];

    setWishlist(newList);

  };

  /* 최초 실행 */
  useEffect(() => {

    fetchCourses();

  }, []);

  /* 학생 정보 불러온 뒤 장바구니 조회 */
  useEffect(() => {

    if (student) {

      fetchWishlist();

    }

  }, [student]);

  /* 필터 */
  const filteredCourses = courses.filter((course) => {

    const searchMatch =
      course.LEC_NAME?.includes(search) ||
      course.PROFESSOR_NAME?.includes(search);

    const gradeMatch =
      gradeFilter === "전체" ||
      String(course.LEC_LEVEL) === gradeFilter;

    return searchMatch && gradeMatch;

  });

  return (
    <div className="min-h-screen bg-slate-950 text-white flex p-5 gap-5">

      {/* LEFT */}
      <div className="flex-1 bg-slate-900 rounded-3xl border border-slate-800 p-5 overflow-y-auto">

        <div className="flex justify-between items-center mb-6">

          <div>

            <h1 className="text-3xl font-bold">
              수강 꾸러미
            </h1>

            <p className="text-slate-400 mt-2">
              희망 과목 우선순위 관리
            </p>

          </div>

          <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-2xl text-sm">
            실시간 DB 연동
          </div>

        </div>

        {/* 학생 정보 */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 mb-6">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-xl font-bold">
              {student?.student_name?.[0] || "학"}
            </div>

            <div>

              <div className="text-xl font-bold">
                {student?.student_name || "학생"}
              </div>

              <div className="text-slate-400 text-sm mt-1">
                {student?.department || "학과 정보 없음"}
              </div>

            </div>

          </div>

          <div className="grid grid-cols-3 gap-4 mt-5">

            <div className="bg-slate-900 rounded-2xl p-4 text-center">

              <div className="text-slate-400 text-sm">
                학년
              </div>

              <div className="text-2xl font-bold mt-2 text-cyan-400">
                {student?.student_level || "-"}학년
              </div>

            </div>

            <div className="bg-slate-900 rounded-2xl p-4 text-center">

              <div className="text-slate-400 text-sm">
                장바구니
              </div>

              <div className="text-2xl font-bold mt-2 text-green-400">
                {wishlist.length}개
              </div>

            </div>

            <div className="bg-slate-900 rounded-2xl p-4 text-center">

              <div className="text-slate-400 text-sm">
                총 학점
              </div>

              <div className="text-2xl font-bold mt-2 text-yellow-400">
                {wishlist.reduce(
                  (sum, item) =>
                    sum + Number(item.CREDIT || 0),
                  0
                )}학점
              </div>

            </div>

          </div>

        </div>

        {/* 검색 */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 mb-6">

          <input
            type="text"
            placeholder="강의명 / 교수명 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
          />

          <div className="flex gap-3 mt-4 flex-wrap">

            {["전체", "1", "2", "3", "4"].map((grade) => (

              <button
                key={grade}
                onClick={() => setGradeFilter(grade)}
                className={`px-5 py-2 rounded-xl transition font-semibold ${
                  gradeFilter === grade
                    ? "bg-blue-500 text-white"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                {grade === "전체"
                  ? "전체"
                  : `${grade}학년`}
              </button>

            ))}

          </div>

        </div>

        {/* 강의 목록 */}
        <div className="space-y-4">

          {filteredCourses.map((course, index) => (

            <div
              key={index}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-5 hover:border-blue-500 transition"
            >

              <div className="flex justify-between items-start">

                <div>

                  <h3 className="text-xl font-bold">
                    {course.LEC_NAME}
                  </h3>

                  <p className="text-slate-400 mt-1">
                    {course.PROFESSOR_NAME || "교수 미정"}
                  </p>

                </div>

                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-xl text-sm">
                  잔여{" "}
                  {course.MAX_CAPACITY -
                    course.CUR_CAPACITY}석
                </div>

              </div>

              <div className="flex gap-3 mt-4 flex-wrap">

                <div className="bg-slate-900 px-3 py-2 rounded-xl text-sm">
                  {course.CREDIT}학점
                </div>

                <div className="bg-slate-900 px-3 py-2 rounded-xl text-sm">
                  {course.LEC_TIME}
                </div>

                <div className="bg-slate-900 px-3 py-2 rounded-xl text-sm">
                  {course.LEC_LEVEL}학년
                </div>

              </div>

              <button
                onClick={() => addWishlist(course)}
                className="mt-5 bg-blue-500 hover:bg-blue-600 transition px-5 py-3 rounded-2xl font-semibold"
              >
                꾸러미 담기
              </button>

            </div>

          ))}

        </div>

      </div>

      {/* RIGHT */}
      <div className="w-[420px] bg-slate-900 rounded-3xl border border-slate-800 p-5 overflow-y-auto">

        <div className="flex justify-between items-center mb-6">

          <div>

            <h2 className="text-2xl font-bold">
              장바구니
            </h2>

            <p className="text-slate-400 mt-1 text-sm">
              우선순위 설정 가능
            </p>

          </div>

          <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-xl text-sm">
            {wishlist.length}개 과목
          </div>

        </div>

        <div className="space-y-4">

          {wishlist.length === 0 && (

            <div className="bg-slate-800 rounded-2xl p-10 text-center text-slate-400">
              담긴 과목이 없습니다.
            </div>

          )}

          {wishlist.map((course, index) => (

            <div
              key={index}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-5"
            >

              <div className="flex justify-between items-start">

                <div className="flex gap-4">

                  <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>

                  <div>

                    <h3 className="font-bold text-lg">
                      {course.LEC_NAME}
                    </h3>

                    <p className="text-slate-400 text-sm mt-1">
                      {course.PROFESSOR_NAME}
                    </p>

                    <p className="text-cyan-400 text-sm mt-2">
                      {course.LEC_TIME}
                    </p>

                  </div>

                </div>

              </div>

              <div className="flex gap-2 mt-5">

                <button
                  onClick={() => moveUp(index)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 transition py-2 rounded-xl"
                >
                  ↑ 우선
                </button>

                <button
                  onClick={() => moveDown(index)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 transition py-2 rounded-xl"
                >
                  ↓ 뒤로
                </button>

                <button
                  onClick={() => removeWishlist(course)}
                  className="bg-red-500 hover:bg-red-600 transition px-4 rounded-xl"
                >
                  삭제
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );

}