import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "How do I take Coartem for malaria?",
    answer:
      "Coartem (Artemether-Lumefantrine) should be taken as a 3-day course: 4 tablets at diagnosis, then 4 tablets after 8 hours, and then 4 tablets twice daily for the next 2 days (total 24 tablets for adults). Take with food or milk for better absorption. Complete the full course even if you feel better. If you vomit within 1 hour of taking a dose, take a repeat dose. Always confirm your dosing with a pharmacist based on your weight.",
  },
  {
    question: "Can I take paracetamol with ibuprofen?",
    answer:
      "Yes, paracetamol (acetaminophen) and ibuprofen can generally be taken together or alternated as they work through different mechanisms. However, do not exceed the recommended daily dose of either: paracetamol max 4g/day (8 tablets of 500mg), ibuprofen max 1200mg/day for OTC use. Avoid ibuprofen if you have stomach ulcers, kidney disease, or are in the third trimester of pregnancy. Always consult your pharmacist if you are taking other medications.",
  },
  {
    question: "What OTC drugs are safe during pregnancy?",
    answer:
      "During pregnancy, very few medications are considered completely safe. Paracetamol is generally considered safe for pain and fever at recommended doses. Antacids containing calcium carbonate (like Tums) may be used for heartburn. Oral rehydration salts (ORS) are safe for dehydration. AVOID: ibuprofen, aspirin, most herbal medicines, and any medication not prescribed by your doctor. Always consult your healthcare provider or pharmacist before taking any medication during pregnancy.",
  },
  {
    question: "How do I store insulin in Ghana's heat?",
    answer:
      "Insulin is sensitive to heat and must be stored carefully in Ghana's tropical climate. Unopened insulin should be kept in a refrigerator (2-8 degrees Celsius) -- NOT in the freezer. Once opened, insulin can be kept at room temperature (below 30 degrees Celsius) for up to 28 days. Use a clay pot cooler (zeer pot) or insulated bag with a wet cloth if you lack refrigeration. Never expose insulin to direct sunlight. If insulin looks cloudy (when it should be clear), has particles, or has changed color, discard it.",
  },
  {
    question: "Are herbal medicines safe with my prescriptions?",
    answer:
      "Many herbal medicines can interact dangerously with prescription drugs. For example, neem can increase the effect of blood sugar medications, bitter leaf can interact with diabetes drugs, and African mahogany (Khaya) can affect liver enzymes that process many medications. St. John's Wort reduces the effectiveness of HIV medications (ARVs), birth control pills, and many other drugs. Always inform your pharmacist about ALL herbal remedies you take. Never stop prescribed medications in favor of herbal alternatives without medical advice.",
  },
  {
    question: "How can I identify genuine drugs from counterfeit ones?",
    answer:
      "In Ghana, use the FDA's mPedigree system: scratch the panel on the drug packaging and text the code to the short code number provided. You will receive an SMS confirming if the drug is genuine. Also check: the NAFDAC/FDA registration number is present, the expiry date is clearly printed and not expired, packaging is intact without tampering, and the drug appearance matches what you normally receive. Buy only from licensed pharmacies and avoid open-market drug vendors.",
  },
  {
    question: "What should I do if I miss a dose of my medication?",
    answer:
      "The general rule is: if you are close to the time of your missed dose, take it as soon as you remember. If it is almost time for your next dose, skip the missed dose and continue your normal schedule. Never take a double dose to make up for a missed one. Some medications have specific rules -- for example, birth control pills, ARVs, and blood pressure medications may have different instructions. Ask your pharmacist for specific guidance on your medication.",
  },
];

/**
 * PozosPharma FAQ Panel
 *
 * Accordion-style FAQ list with common pharmaceutical questions
 * relevant to Ghana. Features Adinkra Sankofa symbol decoration
 * and smooth expand/collapse animation.
 */
export default function FAQPanel() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="adinkra-bg-sankofa">
      <div className="text-center mb-6">
        {/* Sankofa symbol */}
        <div className="mx-auto w-12 h-12 rounded-full bg-brand-teal/10 dark:bg-teal-900/30 flex items-center justify-center mb-3">
          <svg
            className="w-6 h-6 text-brand-teal dark:text-teal-400"
            viewBox="0 0 40 40"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M20 6C14 6 9 11 9 17c0 7 11 17 11 17s11-10 11-17c0-6-5-11-11-11zm-4 8q4-5 8 0 4 5-4 13-8-8-4-13z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Common pharmaceutical questions for the Ghanaian community
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-2">
        {FAQ_ITEMS.map((item, index) => (
          <div
            key={index}
            className="bg-warm-50 dark:bg-surface-card-dark rounded-xl border border-warm-200/60 dark:border-gray-700 overflow-hidden transition-shadow hover:shadow-sm"
          >
            {/* Question Button */}
            <button
              type="button"
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-teal"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {item.question}
              </span>
              <svg
                className={`w-5 h-5 shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Answer */}
            <div
              id={`faq-answer-${index}`}
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
              role="region"
              aria-labelledby={`faq-question-${index}`}
            >
              <div className="px-5 pb-4 border-t border-warm-200 dark:border-gray-700/50 pt-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.answer}
                </p>
                <p className="mt-2 text-[10px] text-gray-600 dark:text-gray-500 italic">
                  Disclaimer: This is general guidance. Always consult your pharmacist for personalized advice.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
