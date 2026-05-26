"use client";

import { collectRoutesUsingEdgeRuntime } from "next/dist/build/utils";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

export default function CourseRegistrationPOS() {

  const router = useRouter();

  const [courses, setCourses] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [timetableCourses, setTimetableCourses] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [serverTime, setServerTime] = useState("");

  /* 추가 기능 */
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedDay, setSelectedDay] = useState("전체");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

  const socket = io("https://cpos-backend-dvke.onrender.com");

  socket.on("courseUpdated", () => {

    fetch("https://cpos-backend-dvke.onrender.com")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
      });

  });

  return () => {
    socket.disconnect();
  };

}, []);

  /* 서버 시간 */
  useEffect(() => {

    const updateTime = () => {

      const now = new Date();

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const date = String(now.getDate()).padStart(2, "0");

      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");

      setServerTime(
        `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`
      );

    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);

  }, []);

  /* 로그인 체크 */
  useEffect(() => {

    const token = sessionStorage.getItem("token");
    const studentData = sessionStorage.getItem("student");

    if (!token || !studentData) {

      router.replace("/login");
      return;

    }

    setStudent(JSON.parse(studentData));

  }, []);

  /* 30분 미사용 자동 로그아웃 */
  useEffect(() => {

    let timeout: NodeJS.Timeout;

    const resetTimer = () => {

      clearTimeout(timeout);

      timeout = setTimeout(() => {

        alert("30분 동안 활동이 없어 자동 로그아웃 됩니다.");

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("student");

        router.replace("/login");

      }, 30 * 60 * 1000); // 30분

    };

    /* 최초 시작 */
    resetTimer();

    /* 사용자 활동 감지 */
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    return () => {

      clearTimeout(timeout);

      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);

    };

  }, []);

  /* 신청 과목 불러오기 */
  useEffect(() => {

    if (!student) return;

    fetch(
      `https://cpos-backend-dvke.onrender.com/api/enrollment/${student.student_id}`
    )
      .then((res) => res.json())
      .then((data) => {

        setTimetableCourses(data);

      })
      .catch((err) => {
        console.log(err);
      });

  }, [student]);

  /* 강의 조회 + 실시간 경쟁률 반영 */
  useEffect(() => {

    const fetchCourses = () => {

      fetch("https://cpos-backend-dvke.onrender.com/api/courses")
        .then((res) => res.json())
        .then((data) => {

          setCourses(data);

        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setIsLoading(false);
        });

    };

    fetchCourses();

    /* 3초마다 새로고침 */
    const interval =
      setInterval(fetchCourses, 3000);

    return () => clearInterval(interval);

  }, []);

  /* 시간 문자열 분석 */
  const parseCourseTime = (time: string) => {

    const result: any[] = [];

    if (!time) return result;

    const regex =
      /(월|화|수|목|금|토)\s*([0-9]+(?:,[0-9]+)*)/g;

    let match;

    while ((match = regex.exec(time)) !== null) {

      const day = match[1];

      const periods =
        match[2]
          .split(",")
          .map((v: string) => Number(v.trim()))
          .sort((a: number, b: number) => a - b);

      result.push({
        day,
        start: periods[0],
        end: periods[periods.length - 1],
        periods
      });

    }

    return result;

  };

  /* 시간표 기본 */
  const timetable = Array(9).fill(null).map(() =>
    ["", "", "", "", "", ""]
  );

  /* 숫자 교시 */
  const numberPeriods = [
    {
      label: "1교시",
      time: "09:00 ~ 10:00"
    },
    {
      label: "2교시",
      time: "10:00 ~ 11:00"
    },
    {
      label: "3교시",
      time: "11:00 ~ 12:00"
    },
    {
      label: "4교시",
      time: "12:00 ~ 13:00"
    },
    {
      label: "5교시",
      time: "13:00 ~ 14:00"
    },
    {
      label: "6교시",
      time: "14:00 ~ 15:00"
    },
    {
      label: "7교시",
      time: "15:00 ~ 16:00"
    },
    {
      label: "8교시",
      time: "16:00 ~ 17:00"
    },
    {
      label: "9교시",
      time: "17:00 ~ 18:00"
    },
  ];

  /* 영어 교시 */
  const englishPeriods = [
    {
      label: "A교시",
      time: "09:00 ~ 10:15"
    },
    {
      label: "B교시",
      time: "10:15 ~ 11:30"
    },
    {
      label: "C교시",
      time: "11:30 ~ 12:45"
    },
    {
      label: "D교시",
      time: "12:45 ~ 14:00"
    },
    {
      label: "E교시",
      time: "14:00 ~ 15:15"
    },
    {
      label: "F교시",
      time: "15:15 ~ 16:30"
    },
    {
      label: "G교시",
      time: "16:30 ~ 17:45"
    },
    {
      label: "H교시",
      time: "17:45 ~ 19:00"
    },
    {
      label: "I교시",
      time: "19:00 ~ 20:15"
    },
  ];

  /* 시간표 셀 클릭 */
  const openTimePopup = (
    day: string,
    period: number
  ) => {

    const matchedCourses = courses.filter((course: any) => {

      const time = course.LEC_TIME || "";

      return (
        time.includes(day) &&
        time.includes(String(period))
      );

    });

    setSelectedCell({
      day,
      period,
      courses: matchedCourses,
    });

    setShowPopup(true);

  };

  /* 검색 필터 */
  const filteredCourses = useMemo(() => {

    return courses.filter((course: any) => {

      const keyword =
        course.LEC_NAME?.toLowerCase().includes(search.toLowerCase()) ||
        course.PROFESSOR_NAME?.toLowerCase().includes(search.toLowerCase());

      const category =
        selectedCategory === "전체"
          ? true
          : course.TYPE === selectedCategory;

      const day =
        selectedDay === "전체"
          ? true
          : course.LEC_TIME?.includes(selectedDay);

      return keyword && category && day;

    });

  }, [courses, search, selectedCategory, selectedDay]);

  /* 장바구니 추가 */
  const addToCart = (course: any) => {

    const exists = cart.find(
      (item) =>
        item.LEC_ID === course.LEC_ID &&
        item.DIVISION === course.DIVISION
    );

    if (exists) {
      alert("이미 장바구니에 담긴 과목입니다.");
      return;
    }

    setCart([...cart, course]);

    alert("장바구니에 추가되었습니다.");

  };

  /* 장바구니 삭제 */
  const removeFromCart = (course: any) => {

    setCart(
      cart.filter(
        (item) =>
          !(
            item.LEC_ID === course.LEC_ID &&
            item.DIVISION === course.DIVISION
          )
      )
    );

  };

  /* 로그아웃 */
  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("student");

    router.push("/login");

  };

  /* 전체 수강신청 */
  const registerAllCourses = async () => {

    for (const course of cart) {
      await registerCourse(course);
    }

  };

  /* 수강신청 */
  const registerCourse = async (course: any) => {

    try {

      if (!student) {
        alert("로그인 정보가 없습니다.");
        return;
      }

      const alreadyExists = timetableCourses.find(
        (item) =>
          item.LEC_ID === course.LEC_ID &&
          item.DIVISION === course.DIVISION
      );

      if (alreadyExists) {
        alert("이미 신청한 과목입니다.");
        return;
      }

      const res = await fetch(
        "https://cpos-backend-dvke.onrender.com/api/enroll",
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

      if (res.ok) {

        alert("수강신청 성공!");

        setTimetableCourses([
          ...timetableCourses,
          course,
        ]);

        setCourses((prev) =>
          prev.map((item) => {

            if (
              item.LEC_ID === course.LEC_ID &&
              item.DIVISION === course.DIVISION
            ) {

              return {
                ...item,
                CUR_CAPACITY:
                  item.CUR_CAPACITY + 1,
              };

            }

            return item;

          })
        );

        setCart(
          cart.filter(
            (item) =>
              !(
                item.LEC_ID === course.LEC_ID &&
                item.DIVISION === course.DIVISION
              )
          )
        );

      } else {

        alert(data.message);

      }

    } catch (err) {

      console.log(err);
      alert("서버 오류");

    }

  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex justify-center overflow-x-auto">

      {/* LEFT SIDEBAR */}
      <div className="w-[320px] min-w-[320px] bg-slate-900 border-r border-slate-800 p-5 flex flex-col overflow-y-auto">

        <div>
          <h1 className="text-2xl font-bold">
            C POS
          </h1>

          <p className="text-slate-400 mt-1 text-sm">
            수강신청 포스기 - 컴공버스를 탄 경영
          </p>

          <div className="mt-4 bg-slate-800 border border-slate-700 rounded-2xl p-4">

            <div className="text-xs text-slate-400 mb-1">
              현재 시간
            </div>

            <div className="text-lg font-bold text-cyan-400 tracking-wide">
              {serverTime}
            </div>

          </div>
        </div>

        <div className="mt-8 bg-slate-800 rounded-2xl p-4">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center font-bold text-lg">
              {student?.student_name?.[0] || "오"}
            </div>

            <div>

              <h2 className="font-semibold">
                {student?.student_name || "학생"}
              </h2>

              <p className="text-sm text-slate-400">
                {student?.department || "학과 정보 없음"}
              </p>

            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-slate-400">
                현재 신청 과목
              </span>

              <span>
                {timetableCourses.length}개
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">
                장바구니
              </span>

              <span>
                {cart.length}개
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">
                학년
              </span>

              <span>
                {student?.student_level || "-"}학년
              </span>
            </div>

          </div>
        </div>

        {/* 추가 기능 */}
        <div className="mt-6 bg-slate-800 rounded-2xl p-4 border border-slate-700">

          <h3 className="font-bold mb-3">
            빠른 검색
          </h3>

          <input
            type="text"
            placeholder="과목명 / 교수명 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <div className="grid grid-cols-2 gap-2 mt-3">

            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value)
              }
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
            >
              <option>전체</option>
              <option>전공</option>
              <option>교양</option>
            </select>

            <select
              value={selectedDay}
              onChange={(e) =>
                setSelectedDay(e.target.value)
              }
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
            >
              <option>전체</option>
              <option>월</option>
              <option>화</option>
              <option>수</option>
              <option>목</option>
              <option>금</option>
              <option>토</option>
            </select>

          </div>

        </div>

        <div className="mt-8 space-y-3">

          <button className="w-full bg-blue-500 hover:bg-blue-600 transition rounded-xl py-3 font-semibold">
            시간표
          </button>

          <button
            className="w-full bg-slate-800 hover:bg-slate-700 transition rounded-xl py-3"
            onClick={() => router.push("/wishlist")}
          >
            장바구니
          </button>

          <button className="w-full bg-slate-800 hover:bg-slate-700 transition rounded-xl py-3">
            필수 과목
          </button>

        </div>

        <div className="mt-10 grid grid-cols-2 gap-3">

          <button
            className="w-full bg-gradient-to-r from-lime-400 to-green-500
            hover:scale-105 hover:shadow-lg transition-all duration-200
            rounded-2xl py-8 font-bold text-white text-lg"
          >
            전공
          </button>

          <button
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500
            hover:scale-105 hover:shadow-lg transition-all duration-200
            rounded-2xl py-8 font-bold text-white text-lg"
          >
            교양
          </button>

        </div>

        <div className="mt-6 bg-slate-800 rounded-2xl p-4 border border-slate-700">

          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">
              신청 학점
            </span>

            <span className="font-bold text-cyan-400">
              {timetableCourses.reduce(
                (sum, item) => sum + Number(item.CREDIT || 0),
                0
              )}학점
            </span>
          </div>

          <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full"
              style={{
                width: `${Math.min(
                  (timetableCourses.reduce(
                    (sum, item) => sum + Number(item.CREDIT || 0),
                    0
                  ) / 21) * 100,
                  100
                )}%`
              }}
            />
          </div>

        </div>

        <div className="mt-auto pt-10">

          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 transition rounded-xl py-3 font-semibold"
          >
            로그아웃
          </button>

        </div>
      </div>

      {/* MIDDLE TIMETABLE */}
      <div className="w-[760px] min-w-[760px] max-w-[760px] border-r border-slate-800 bg-slate-950 overflow-y-auto p-4">

        {/* Top */}
        <div className="flex justify-between items-center mb-6">

          <div>

            <h2 className="text-2xl font-bold">
              2026학년도 1학기
            </h2>

            <p className="text-slate-400 mt-1 text-sm">
              수강신청 기간: 2026-02-20 10:00 ~
              2026-02-22 18:00
            </p>

          </div>

          <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-2xl border border-green-500/30 text-sm animate-pulse">
            신청 가능 상태
          </div>

        </div>

        {/* Timetable */}
        <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 shadow-2xl overflow-x-auto">

          <div className="flex justify-between items-center mb-4">

            <h3 className="text-xl font-bold">
              현재 신청 과목
            </h3>

            <div className="text-slate-400 text-xs">
              실시간 반영
            </div>

          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-[90px_repeat(6,minmax(70px,1fr))_110px] gap-1 mb-1">

            <div></div>

            {["월", "화", "수", "목", "금", "토"].map((day) => (
              <div
                key={day}
                className="text-center font-semibold py-2 bg-slate-800 rounded-lg text-sm"
              >
                {day}
              </div>
            ))}

            <div className="text-center font-semibold py-2 bg-cyan-900 rounded-lg border border-cyan-700 text-sm">
              영어교시
            </div>

          </div>

          {/* 시간표 */}
{timetable.map((row, rowIndex) => (

  <div
    key={rowIndex}
    className="grid grid-cols-[90px_repeat(6,minmax(70px,1fr))_110px] gap-1 mb-1"
  >

    {/* 숫자교시 */}
    <div className="w-full h-24 bg-slate-800 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold border border-slate-700">

      <div>
        {numberPeriods[rowIndex].label}
      </div>

      <div className="text-[9px] text-slate-400 mt-1 text-center px-1">
        {numberPeriods[rowIndex].time}
      </div>

    </div>

    {/* 요일 */}
    {["월", "화", "수", "목", "금", "토"].map((day, colIndex) => {

      const currentPeriod = rowIndex + 1;

      const coursesInCell =
      
        timetableCourses.filter((course: any) => {
          const isEmpty =
  coursesInCell.length === 0;


          const parsed =
            parseCourseTime(course.LEC_TIME);

          return parsed.some((p: any) => {

            return (
              p.day === day &&
              p.periods.includes(currentPeriod)
            );

          });

        });

      const startCourses =
        coursesInCell.filter((course: any) => {
          

          const parsed =
            parseCourseTime(course.LEC_TIME);

          return parsed.some((p: any) => {

            return (
              p.day === day &&
              p.start === currentPeriod
            );

          });

        });

        const isEmpty =
  coursesInCell.length === 0;

      return (

        <div
    key={colIndex}
    className={`relative h-24 border rounded-lg overflow-hidden transition-all
    ${isEmpty
      ? "bg-emerald-950/40 border-emerald-800 hover:bg-emerald-900/40"
      : "bg-slate-800 border-slate-700"
    }`}
  >

          {/* 클릭영역 */}
          <button
            onClick={() =>
              openTimePopup(
                day,
                currentPeriod
              )
            }
            className="absolute inset-0 z-10 hover:bg-blue-500/10 transition"
          />

          {/* 수업 렌더링 */}
          {startCourses.map((course: any, idx: number) => {

            const parsed =
              parseCourseTime(course.LEC_TIME)
                .find((p: any) =>
                  p.day === day
                );

            if (!parsed) return null;

            const height =
              parsed.periods.length * 96;

            const overlap =
              startCourses.length > 1;

            return (

              <div
                key={idx}
                className={`absolute left-0 right-0 rounded-xl p-2 text-[10px] font-bold border z-20
                ${overlap
                    ? "bg-red-500 border-red-400"
                    : "bg-blue-500 border-blue-400"
                  }`}
                style={{
                  height: `${height - 4}px`,
                  top: 0,
                  width: overlap
                    ? "48%"
                    : "100%",
                  left: overlap
                    ? idx % 2 === 0
                      ? "0%"
                      : "52%"
                    : "0%"
                }}
              >

                <div className="leading-tight">
                  {course.LEC_NAME}
                </div>

                <div className="text-[9px] opacity-80 mt-1">
                  {course.LEC_TIME}
                </div>

              </div>

            );

          })}

        </div>

      );

    })}

    {/* 영어교시 */}
    <div
      className="h-24 rounded-lg border transition-all text-xs p-2 flex flex-col items-center justify-center text-center font-medium overflow-hidden bg-cyan-900/30 border-cyan-700"
    >

      <div className="font-bold text-cyan-300">
        {englishPeriods[rowIndex].label}
      </div>

      <div className="text-[10px] text-cyan-200 mt-1">
        {englishPeriods[rowIndex].time}
      </div>

    </div>

  </div>

))}

        </div>

      </div>

      {/* RIGHT AREA */}
      <div className="w-[700px] min-w-[700px] max-w-[700px] overflow-y-auto p-6 bg-slate-950">

        <div className="grid grid-cols-1 gap-6">

          {/* Available Courses */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">

            <div className="flex justify-between items-center mb-5">

              <h3 className="text-xl font-bold">
                신청 가능 수업
              </h3>

              <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm">
                DB 연동 완료
              </div>

            </div>

            {/* 추가 */}
            <div className="mb-4 flex justify-between items-center">

              <div className="text-sm text-slate-400">
                총 {filteredCourses.length}개 강의
              </div>

              <div className="text-xs text-cyan-400">
                실시간 조회중
              </div>

            </div>

            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">

              {isLoading && (
                <div className="bg-slate-800 rounded-2xl p-10 text-center text-slate-400">
                  강의 데이터를 불러오는 중...
                </div>
              )}

              {!isLoading && filteredCourses.map((course: any, index) => (

                <div
                  key={index}
                  className="bg-slate-800 rounded-2xl p-5 border border-slate-700 hover:border-blue-500 transition"
                >

                  <div className="flex justify-between items-start">

                    <div>

                      <h4 className="text-lg font-bold">
                        {course.LEC_NAME}
                      </h4>

                      <p className="text-slate-400 text-sm mt-1">
                        {course.PROFESSOR_NAME ||
                          "교수 미정"}
                      </p>

                    </div>

                    <div
                      className={`px-3 py-1 rounded-lg text-sm ${course.MAX_CAPACITY -
                        course.CUR_CAPACITY <=
                        1
                        ? "bg-red-500/20 text-red-400"
                        : "bg-green-500/20 text-green-400"
                        }`}
                    >

                      잔여{" "}
                      {course.MAX_CAPACITY -
                        course.CUR_CAPACITY}
                      석

                    </div>
                    <div className="text-[11px] mt-1 opacity-70">
                      경쟁률 {(course.CUR_CAPACITY / course.MAX_CAPACITY * 100).toFixed(0)}%
                    </div>

                  </div>

                  <div className="mt-3 flex gap-2 flex-wrap">

                    <div className="text-sm text-slate-400">
                      분반: {course.DIVISION}
                    </div>

                    <div className="bg-slate-700 text-xs px-2 py-1 rounded-lg">
                      {course.TYPE || "전공"}
                    </div>

                  </div>

                  <div className="mt-4 flex justify-between items-center">

                    <div className="text-sm text-slate-400">
                      {course.LEC_TIME} ·{" "}
                      {course.CREDIT}학점
                    </div>

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          addToCart(course)
                        }
                        className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl text-sm"
                      >
                        담기
                      </button>

                      <button
                        onClick={() =>
                          registerCourse(course)
                        }
                        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl text-sm font-semibold"
                      >
                        바로 신청
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>
          </div>

          {/* Cart */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">

            <div className="flex justify-between items-center mb-5">

              <h3 className="text-xl font-bold">
                장바구니
              </h3>

              <div className="text-slate-400 text-sm">
                우선순위 설정 가능
              </div>

            </div>

            <div className="space-y-4">

              {cart.length === 0 && (

                <div className="bg-slate-800 rounded-2xl p-8 text-center text-slate-400">
                  담긴 과목이 없습니다.
                </div>

              )}

              {cart.map((course: any, index) => (

                <div
                  key={index}
                  className="bg-slate-800 rounded-2xl p-5 border border-slate-700"
                >

                  <div className="flex justify-between items-center">

                    <div>

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>

                        <div>

                          <h4 className="font-semibold">
                            {course.LEC_NAME}
                          </h4>

                          <p className="text-sm text-slate-400">
                            {course.LEC_TIME}
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          registerCourse(course)
                        }
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30 px-4 py-2 rounded-xl text-sm"
                      >
                        신청
                      </button>

                      <button
                        onClick={() =>
                          removeFromCart(course)
                        }
                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-xl text-sm"
                      >
                        삭제
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

            <button
              onClick={registerAllCourses}
              className="w-full mt-6 bg-green-500 hover:bg-green-600 transition rounded-2xl py-4 font-bold text-lg shadow-lg"
            >
              수강신청 실행
            </button>

          </div>

        </div>

        {/* AI */}
        <div className="mt-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-3xl p-5">

          <div className="flex justify-between items-center">

            <div>

              <h3 className="text-xl font-bold">
                자동 추천 시간표
              </h3>

              <p className="text-slate-300 mt-2 text-sm">
                졸업 필수 과목과 공강 최소화를 기준으로 추천합니다.
              </p>

            </div>

            <button className="bg-white text-slate-900 px-5 py-3 rounded-2xl font-bold hover:scale-105 transition">
              자동 생성
            </button>

          </div>

          <div className="grid grid-cols-3 gap-4 mt-5">

            <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-700">

              <h4 className="font-bold">
                공강 최소화
              </h4>

              <p className="text-xs text-slate-400 mt-2">
                이동 시간과 빈 시간을 최소화합니다.
              </p>

            </div>

            <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-700">

              <h4 className="font-bold">
                금 공강 시간표
              </h4>

              <p className="text-xs text-slate-400 mt-2">
                월~목 집중 시간표 추천.
              </p>

            </div>

            <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-700">

              <h4 className="font-bold">
                난 늦잠쟁이에요
              </h4>

              <p className="text-xs text-slate-400 mt-2">
                오전 수업 없애기.
              </p>

            </div>

          </div>
        </div>

      </div>
      {/* 시간표 팝업 */}
      {showPopup && selectedCell && (

        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-10">

          <div className="w-full max-w-6xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden">

            {/* 헤더 */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-700">

              <div>

                <h2 className="text-2xl font-bold">
                  {selectedCell.day}요일 {selectedCell.period}교시
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  해당 시간 수업 조회
                </p>

              </div>

              <button
                onClick={() => setShowPopup(false)}
                className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl font-bold"
              >
                닫기
              </button>

            </div>

            {/* 내용 */}
            <div className="grid grid-cols-2 gap-6 p-6">

              {/* 장바구니 */}
              <div>

                <h3 className="text-xl font-bold mb-4">
                  장바구니
                </h3>

                <div className="space-y-3 max-h-[500px] overflow-y-auto">

                  {cart.map((course: any, index) => (

                    <div
                      key={index}
                      className="bg-slate-800 border border-slate-700 rounded-2xl p-4"
                    >

                      <div className="font-bold">
                        {course.LEC_NAME}
                      </div>

                      <div className="text-sm text-slate-400 mt-1">
                        {course.LEC_TIME}
                      </div>

                    </div>

                  ))}

                </div>

              </div>

              {/* 해당 시간 수업 */}
              <div>

                <h3 className="text-xl font-bold mb-4">
                  신청 가능한 수업
                </h3>

                <div className="space-y-3 max-h-[500px] overflow-y-auto">

                  {selectedCell.courses.map((course: any, index: number) => (

                    <div
                      key={index}
                      className="bg-slate-800 border border-slate-700 rounded-2xl p-4"
                    >

                      <div className="flex justify-between">

                        <div>

                          <div className="font-bold">
                            {course.LEC_NAME}
                          </div>

                          <div className="text-sm text-slate-400 mt-1">
                            {course.PROFESSOR_NAME}
                          </div>

                        </div>

                        <div className="text-sm text-cyan-400">
                          {course.CREDIT}학점
                        </div>

                      </div>

                      <div className="mt-3 flex justify-between items-center">

                        <div className="text-sm text-slate-400">
                          {course.LEC_TIME}
                        </div>

                        <div className="flex gap-2">

                          <button
                            onClick={() => addToCart(course)}
                            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl text-sm"
                          >
                            담기
                          </button>

                          <button
                            onClick={() => registerCourse(course)}
                            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl text-sm"
                          >
                            신청
                          </button>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}