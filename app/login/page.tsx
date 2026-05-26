"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {

    try {

      const res = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            student_id: studentId,
            password: password,
          }),
        }
      );

      const data = await res.json();

      console.log(data);

      /* 로그인 성공 */
      if (data.success) {

        /* 기존 로그인 정보 제거 */
        sessionStorage.clear();

        /* 세션 저장 */
        sessionStorage.setItem(
          "token",
          data.token
        );

        sessionStorage.setItem(
          "student",
          JSON.stringify(data.student)
        );

        alert("로그인 성공");

        router.push("/");

      } else {

        alert(data.message || "로그인 실패");

      }

    } catch (err) {

      console.log(err);
      alert("서버 오류");

    }

  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white p-6">

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">

        <h1 className="text-3xl font-bold text-center">
          수강신청 포스기
        </h1>

        <p className="text-slate-400 text-center mt-2">
          학번으로 로그인하세요.
        </p>

        <div className="mt-8 space-y-5">

          <div>
            <label className="text-sm text-slate-400">
              학번
            </label>

            <input
              type="text"
              value={studentId}
              onChange={(e) =>
                setStudentId(e.target.value)
              }
              className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              placeholder="학번 입력"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400">
              비밀번호
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              placeholder="비밀번호 입력"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  login();
                }
              }}
            />
          </div>

          <button
            onClick={login}
            className="w-full bg-blue-500 hover:bg-blue-600 transition rounded-xl py-3 font-bold"
          >
            로그인
          </button>

        </div>
      </div>
    </div>
  );
}