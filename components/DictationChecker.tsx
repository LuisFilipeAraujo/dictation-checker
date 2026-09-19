"use client";

import { useRef, useState } from "react";

import { DICTATIONS, DICTATION_NUMBERS } from "@/lib/dictations";
import { compareDictation, type ComparisonResult } from "@/lib/diff";

import { Card } from "./Card";
import { Field, FIELD_CLASS } from "./Field";
import { ResultsCard } from "./ResultsCard";

interface Marked {
  studentName: string;
  dictationNumber: number;
  result: ComparisonResult;
}

interface FieldErrors {
  name?: string;
  dictation?: string;
  text?: string;
}

export function DictationChecker() {
  const [studentName, setStudentName] = useState("");
  const [dictationNumber, setDictationNumber] = useState("");
  const [studentText, setStudentText] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [marked, setMarked] = useState<Marked | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  function handleCheck() {
    const name = studentName.trim();
    const text = studentText.trim();
    const number = Number(dictationNumber);

    const nextErrors: FieldErrors = {};
    if (!name) nextErrors.name = "Please enter the student name.";
    if (!dictationNumber) nextErrors.dictation = "Please select a dictation number.";
    if (!text) nextErrors.text = "Please type the dictation text.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setMarked(null);
      return;
    }

    setMarked({
      studentName: name,
      dictationNumber: number,
      result: compareDictation(DICTATIONS[number], text),
    });

    // Let React paint the results card before scrolling to it.
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function handleReset() {
    setStudentName("");
    setDictationNumber("");
    setStudentText("");
    setErrors({});
    setMarked(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <Card title="Student Info">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Student Name" htmlFor="student-name" error={errors.name}>
            <input
              id="student-name"
              type="text"
              autoComplete="off"
              placeholder="e.g. Maria Silva"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              aria-invalid={Boolean(errors.name)}
              className={FIELD_CLASS}
            />
          </Field>

          <Field label="Dictation Number" htmlFor="dictation-num" error={errors.dictation}>
            <select
              id="dictation-num"
              value={dictationNumber}
              onChange={(event) => setDictationNumber(event.target.value)}
              aria-invalid={Boolean(errors.dictation)}
              className={`${FIELD_CLASS} select-field cursor-pointer appearance-none pr-7`}
            >
              <option value="">— select —</option>
              {DICTATION_NUMBERS.map((number) => (
                <option key={number} value={number}>
                  Dictation {number}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      <Card title="Student's Dictation">
        <Field label="Type what you heard" htmlFor="student-text" error={errors.text}>
          <textarea
            id="student-text"
            placeholder="Type the dictation here exactly as you heard it…"
            value={studentText}
            onChange={(event) => setStudentText(event.target.value)}
            aria-invalid={Boolean(errors.text)}
            className={`${FIELD_CLASS} min-h-[200px] resize-y p-3.5 leading-[1.8]`}
          />
        </Field>

        <button
          type="button"
          onClick={handleCheck}
          className="font-ui bg-union-blue border-union-blue-deep hover:bg-union-blue-deep mx-auto mt-6 block cursor-pointer rounded-[2px] border px-10 py-3.5 text-sm font-semibold tracking-[0.12em] text-white uppercase shadow-[0_8px_18px_rgb(1_33_105/0.22)] transition active:scale-[0.97]"
        >
          Check Dictation
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="font-ui text-union-blue border-union-blue/25 hover:text-union-red hover:border-union-red/55 hover:bg-union-red/5 mx-auto mt-3 block cursor-pointer rounded-[2px] border bg-transparent px-5 py-2.5 text-xs tracking-[0.1em] uppercase transition"
        >
          Start Over
        </button>
      </Card>

      <div ref={resultsRef}>
        {marked ? (
          <ResultsCard
            studentName={marked.studentName}
            dictationNumber={marked.dictationNumber}
            result={marked.result}
          />
        ) : null}
      </div>
    </>
  );
}
