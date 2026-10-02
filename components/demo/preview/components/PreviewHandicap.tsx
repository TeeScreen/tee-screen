'use client'

import React, { memo, useState } from 'react'

interface HandicapTeeData {
    displayedName: string
    gender: string
    par: number
    courseRating: number
    slopeRating: number
}

interface PreviewHandicapCalculatorProps {
    handicapData: HandicapTeeData[]
    onClose: () => void
}

export const PreviewHandicapCalculator = memo(function PreviewHandicapCalculator({
                                                                                     handicapData,
                                                                                     onClose,
                                                                                 }: PreviewHandicapCalculatorProps) {
    const [handicapIndex, setHandicapIndex] = useState<number>(0)
    const [holes, setHoles] = useState<'F9' | 'B9' | '18'>('18')
    const [rounded, setRounded] = useState<boolean>(true)
    const [allowance, setAllowance] = useState<number>(100)

    const GREEN = '#4CAF50'
    const GREY_BTN = '#E0E0E0'
    const BORDER = '#D6D6D6'
    const TEXT = '#333333'

    const calculateCH = (tee: HandicapTeeData) => {
        const base =
            handicapIndex * (tee.slopeRating / 113) +
            (tee.courseRating - tee.par)

        const allowed = base * (allowance / 100)

        return rounded ? Math.round(allowed) : allowed
    }

    return (
        <div
            className="w-full h-full bg-white shadow-xl relative flex flex-col overflow-hidden calc-wrapper"
            style={{ padding: 'calc(var(--svh) * 3)' }}
        >


        {/* Close Button */}
            <button
                className="absolute bg-red-600 text-white flex items-center justify-center font-bold"
                style={{
                    top: 'calc(var(--svh) * 3)',
                    right: 'calc(var(--svh) * 3)',
                    width: 'calc(var(--svh) * 7)',
                    height: 'calc(var(--svh) * 7)',
                    fontSize: 'calc(var(--svh) * 3.5)',
                }}
                onClick={onClose}
            >
                ×
            </button>

            {/* UPPER 21/2 */}
            <div
                className="flex flex-col"
                style={{
                    height: '50%',
                    gap: 'calc(var(--svh) * 2)',
                }}
            >
                {/* Title */}
                <h2
                    className="text-center font-bold"
                    style={{
                        fontSize: 'calc(var(--svh) * 4.5)',
                    }}
                >
                    Handicap Calculator
                </h2>

                {/* Hole Selection */}
                <div className="flex justify-center">
                    {['F9', 'B9', '18'].map((h) => {
                        const active = holes === h
                        return (
                            <button
                                key={h}
                                onClick={() => setHoles(h as any)}
                                className=" border font-semibold"
                                style={{
                                    padding: 'calc(var(--svh) * 1.2) calc(var(--svh) * 4)',
                                    fontSize: 'calc(var(--svh) * 2.6)',
                                    backgroundColor: active ? GREEN : GREY_BTN,
                                    color: active ? 'white' : TEXT,
                                    borderColor: active ? GREEN : BORDER,
                                }}
                            >
                                {h === 'F9' ? 'Front 9' : h === 'B9' ? 'Back 9' : '18 Holes'}
                            </button>
                        )
                    })}
                </div>

                {/* Handicap Index */}
                <div
                    className="flex flex-col items-center"
                    style={{
                        paddingLeft: 'calc(var(--svh) * 2)',
                        paddingRight: 'calc(var(--svh) * 2)',
                    }}
                >
                    <label
                        className="font-semibold"
                        style={{
                            fontSize: 'calc(var(--svh) * 2.2)',
                            marginBottom: 'calc(var(--svh) * 1)',
                            textAlign: 'center',
                        }}
                    >
                        Handicap Index
                    </label>

                    <input
                        type="text"                     // must be text to control decimals + max length
                        inputMode="decimal"             // mobile keyboard shows numbers + decimal
                        maxLength={5}                   // total characters allowed
                        value={handicapIndex}
                        onChange={(e) => {
                            const v = e.target.value;

                            // Allow only digits + one decimal point
                            if (/^\d*\.?\d*$/.test(v)) {
                                setHandicapIndex(parseInt(v));
                            }
                        }}
                        style={{
                            width: 'calc(var(--svh) * 20)',      // narrow input
                            maxWidth: '60%',
                            padding: 'calc(var(--svh) * 1.2)',
                            fontSize: 'calc(var(--svh) * 2.6)',
                            border: `1px solid ${BORDER}`,
                            borderRadius: 'calc(var(--svh) * 0.8)',
                            textAlign: 'center',
                        }}
                    />
                </div>


                {/* Rounded / Unrounded + Allowance (single line, no gaps) */}
                <div
                    className="flex items-center justify-center"
                    style={{
                        gap: 'calc(var(--svh) * 1)',
                        marginTop: 'calc(var(--svh) * 1)',
                    }}
                >
                    <div>
                    {/* Rounded */}
                    <button
                        onClick={() => setRounded(true)}
                        className=" border font-semibold"
                        style={{
                            padding: 'calc(var(--svh) * 1) calc(var(--svh) * 3)',
                            fontSize: 'calc(var(--svh) * 2.2)',
                            backgroundColor: rounded ? GREEN : GREY_BTN,
                            color: rounded ? 'white' : TEXT,
                            borderColor: rounded ? GREEN : BORDER,
                        }}
                    >
                        Rounded
                    </button>

                    {/* Unrounded */}
                    <button
                        onClick={() => setRounded(false)}
                        className=" border font-semibold"
                        style={{
                            padding: 'calc(var(--svh) * 1) calc(var(--svh) * 3)',
                            fontSize: 'calc(var(--svh) * 2.2)',
                            backgroundColor: !rounded ? GREEN : GREY_BTN,
                            color: !rounded ? 'white' : TEXT,
                            borderColor: !rounded ? GREEN : BORDER,
                        }}
                    >
                        Unrounded
                    </button>
                    </div>

                    {/* Allowance Label (smaller) */}
                    <span
                        style={{
                            fontSize: 'calc(var(--svh) * 1.8)',
                            fontWeight: 600,
                            marginLeft: 'calc(var(--svh) * 1)',
                        }}
                    >
                        Allowance:
                    </span>

                    {/* Minus */}
                    <button
                        onClick={() => setAllowance((a) => Math.max(0, a - 5))}
                        className=" font-bold flex items-center justify-center"
                        style={{
                            width: 'calc(var(--svh) * 5)',
                            height: 'calc(var(--svh) * 5)',
                            backgroundColor: GREY_BTN,
                            fontSize: 'calc(var(--svh) * 2.5)',
                        }}
                    >
                        –
                    </button>


                    {/* Plus */}
                    <button
                        onClick={() => setAllowance((a) => Math.min(200, a + 5))}
                        className=" font-bold flex items-center justify-center"
                        style={{
                            width: 'calc(var(--svh) * 5)',
                            height: 'calc(var(--svh) * 5)',
                            backgroundColor: GREY_BTN,
                            fontSize: 'calc(var(--svh) * 2.5)',
                        }}
                    >
                        +
                    </button>

                    {/* Allowance Value (smaller) */}
                    <span
                        className="font-bold"
                        style={{
                            fontSize: 'calc(var(--svh) * 2.2)',
                            minWidth: 'calc(var(--svh) * 5)',
                            textAlign: 'center',
                        }}
                    >
                        {allowance}%
                    </span>
                </div>
            </div>

            {/* LOWER 1/2 — SCROLLABLE */}
            <div
                className="overflow-y-auto"
                style={{
                    height: '50%',
                    borderTop: `1px solid ${BORDER}`,
                    marginTop: 'calc(var(--svh) * 2)',
                    paddingTop: 'calc(var(--svh) * 2)',
                }}
            >
                <table
                    className="w-full border-collapse"
                    style={{
                        fontSize: 'calc(var(--svh) * 2.6)',
                    }}
                >
                    <thead>
                    <tr
                        className="font-semibold text-left"
                        style={{ borderBottom: `1px solid ${BORDER}` }}
                    >
                        <th className="py-[calc(var(--svh)*1)]">Tee</th>
                        <th className="py-[calc(var(--svh)*1)]">Gender</th>
                        <th className="py-[calc(var(--svh)*1)]">Par</th>
                        <th className="py-[calc(var(--svh)*1)]">Course Rating</th>
                        <th className="py-[calc(var(--svh)*1)]">Slope Rating</th>
                        <th className="py-[calc(var(--svh)*1)]">Calculated</th>
                    </tr>
                    </thead>

                    <tbody>
                    {handicapData.map((tee) => (
                        <tr
                            key={tee.displayedName + tee.gender}
                            style={{ borderBottom: `1px solid ${BORDER}` }}
                        >
                            <td className="py-[calc(var(--svh)*1)]">{tee.displayedName}</td>
                            <td>{tee.gender}</td>
                            <td>{tee.par}</td>
                            <td>{tee.courseRating}</td>
                            <td>{tee.slopeRating}</td>
                            <td className="font-bold">
                                {calculateCH(tee).toFixed(rounded ? 0 : 2)}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
})
