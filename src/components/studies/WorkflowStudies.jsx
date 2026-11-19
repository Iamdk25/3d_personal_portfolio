import { useState } from 'react';

function Segments({ label, value, options, onChange }) {
  return (
    <div className="segments" role="tablist" aria-label={label}>
      {options.map((option, index) => (
        <button
          key={option.id}
          id={`${label}-${option.id}`}
          type="button"
          role="tab"
          aria-selected={value === option.id}
          tabIndex={value === option.id ? 0 : -1}
          onClick={() => onChange(option.id)}
          onKeyDown={(event) => {
            if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
            event.preventDefault();
            const direction = event.key === 'ArrowRight' ? 1 : -1;
            const next = options[(index + direction + options.length) % options.length];
            onChange(next.id);
            requestAnimationFrame(() => document.getElementById(`${label}-${next.id}`)?.focus());
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function StudyFlag() {
  return (
    <div className="study-flag">
      <span>Interface study</span>
      <span>Illustrative content, not a product screenshot</span>
    </div>
  );
}

export function PaalStudy() {
  const [mode, setMode] = useState('explain');
  const options = [
    { id: 'explain', label: 'Explain' },
    { id: 'quiz', label: 'Quiz' },
    { id: 'guide', label: 'Guide' },
  ];

  return (
    <div className="study">
      <StudyFlag />
      <Segments label="PAAL study" value={mode} options={options} onChange={setMode} />
      <div className="study-grid">
        <article className="note-card">
          <p className="eyebrow">Source note</p>
          <p>Plants store light energy as sugar. Chlorophyll absorbs red and blue light and reflects green.</p>
        </article>
        <div className="output-card" role="tabpanel">
          {mode === 'explain' && (
            <>
              <p className="eyebrow">Explanation</p>
              <p>The note says chlorophyll is the pigment that catches the light plants use, and that the green we see is the light it does not absorb.</p>
            </>
          )}
          {mode === 'quiz' && (
            <>
              <p className="eyebrow">One question</p>
              <p>Which colors of light does chlorophyll absorb?</p>
              <p className="study-answer">Sample answer: red and blue.</p>
            </>
          )}
          {mode === 'guide' && (
            <>
              <p className="eyebrow">Study guide</p>
              <ol>
                <li>Define chlorophyll.</li>
                <li>Name the colors it absorbs.</li>
                <li>Explain why leaves look green.</li>
              </ol>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const RECEIPTS = {
  upload: {
    title: 'Uploaded',
    body: 'A sample receipt is in the queue. Nothing has been classified yet.',
  },
  classify: {
    title: 'Classified',
    body: 'Sample labels: lab supplies and parking. A person still confirms them.',
  },
  review: {
    title: 'In review',
    body: 'The sample submission is with a reviewer. A status email would go out from the real app.',
  },
};

export function EerisStudy() {
  const [step, setStep] = useState('upload');
  const options = [
    { id: 'upload', label: 'Upload' },
    { id: 'classify', label: 'Classify' },
    { id: 'review', label: 'Review' },
  ];
  const current = RECEIPTS[step];

  return (
    <div className="study">
      <StudyFlag />
      <Segments label="EERIS study" value={step} options={options} onChange={setStep} />
      <div className="receipt">
        <div>
          <p className="eyebrow">Sample receipt</p>
          <ul>
            <li><span>Lab supplies</span><span>$42.00</span></li>
            <li><span>Parking</span><span>$8.50</span></li>
          </ul>
        </div>
        <div className="output-card" role="tabpanel">
          <p className="eyebrow">{current.title}</p>
          <p>{current.body}</p>
        </div>
      </div>
    </div>
  );
}

const CANDLES = [
  { up: true, body: 42, wick: 64 },
  { up: false, body: 28, wick: 50 },
  { up: true, body: 54, wick: 74 },
  { up: true, body: 22, wick: 40 },
  { up: false, body: 36, wick: 58 },
  { up: true, body: 30, wick: 48 },
  { up: false, body: 18, wick: 36 },
];

export function QuantumStudy() {
  return (
    <div className="study study-compact">
      <StudyFlag />
      <div className="candles" aria-hidden="true">
        {CANDLES.map((candle, index) => (
          <span key={index} className={candle.up ? 'up' : 'down'}>
            <i style={{ height: candle.wick }} />
            <b style={{ height: candle.body }} />
          </span>
        ))}
      </div>
      <p className="study-caption">Sample prices for layout only. Not a market chart.</p>
    </div>
  );
}
