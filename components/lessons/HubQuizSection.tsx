import type { HubQuizView } from "@/lib/hub/types";

export default function HubQuizSection({ quiz }: { quiz: HubQuizView }) {
  return (
    <section className="mt-20 border-t border-ink/30 pt-12">
      <header className="mb-7">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-accent">
          Comprehension check
        </p>
        <h2 className="mt-2 font-sans text-[1.7rem] font-bold tracking-[-0.025em] text-ink md:text-[2rem]">
          Check yourself<span className="text-accent">.</span>
        </h2>
      </header>
      <div className="border border-ink/15 bg-paper-deep p-6 md:p-8">
        <ol className="space-y-8">
          {quiz.questions.map((question, qi) => (
            <li key={question.id}>
              <div className="mb-3 flex items-baseline gap-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink-soft">
                <span className="text-accent num-tabular">
                  Q{String(qi + 1).padStart(2, "0")}
                </span>
                <span>
                  {question.type === "multiple_choice"
                    ? "Single choice"
                    : question.type === "true_false"
                      ? "True / false"
                      : "Short answer"}
                </span>
              </div>
              <p className="mb-4 font-sans text-[1.05rem] leading-[1.5] text-ink">
                {question.prompt}
              </p>
              {question.image ? (
                <figure className="mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={question.image.cloudinary_url}
                    alt={question.image.alt}
                    className="block w-full max-w-2xl border border-ink/15"
                  />
                </figure>
              ) : null}
              {question.type === "multiple_choice" ? (
                <ul className="space-y-2">
                  {question.options.map((choice, ci) => (
                    <li key={ci}>
                      <label className="group flex cursor-pointer items-baseline gap-3">
                        <input
                          type="radio"
                          name={question.id}
                          className="mt-1 h-3 w-3 accent-[var(--accent-c,#C5462E)]"
                        />
                        <span className="font-sans text-[0.98rem] leading-[1.5] text-ink-muted group-hover:text-ink">
                          {choice}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : question.type === "true_false" ? (
                <ul className="space-y-2">
                  {["True", "False"].map((choice) => (
                    <li key={choice}>
                      <label className="group flex cursor-pointer items-baseline gap-3">
                        <input
                          type="radio"
                          name={question.id}
                          className="mt-1 h-3 w-3 accent-[var(--accent-c,#C5462E)]"
                        />
                        <span className="font-sans text-[0.98rem] leading-[1.5] text-ink-muted group-hover:text-ink">
                          {choice}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <textarea
                  className="min-h-[80px] w-full border border-ink/15 bg-background p-3 font-sans text-[0.98rem] leading-[1.55] text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none"
                  placeholder="One or two sentences."
                />
              )}
            </li>
          ))}
        </ol>
        <div className="mt-8 flex items-center gap-4">
          <button
            type="button"
            className="bg-ink px-5 py-2.5 font-sans text-[0.86rem] font-semibold text-paper-deep transition-colors hover:bg-accent"
          >
            Submit answers
          </button>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink-soft">
            Not submitted
          </span>
        </div>
      </div>
    </section>
  );
}
