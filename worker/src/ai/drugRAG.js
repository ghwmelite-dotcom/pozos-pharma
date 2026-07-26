/**
 * Drug Database RAG (Retrieval-Augmented Generation)
 * Searches the D1 drugs table and returns formatted context
 * for PozosBot to use in AI responses.
 */

const STOP_WORDS = new Set([
  'i', 'me', 'my', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'can', 'may', 'might', 'shall', 'about', 'what', 'which', 'who',
  'whom', 'this', 'that', 'these', 'those', 'am', 'or', 'and', 'but', 'if',
  'for', 'not', 'no', 'nor', 'on', 'at', 'to', 'from', 'by', 'with', 'in',
  'of', 'it', 'its', 'how', 'when', 'where', 'why', 'much', 'many', 'some',
  'any', 'take', 'taking', 'use', 'using', 'need', 'want', 'know', 'think',
  'feel', 'get', 'got', 'make', 'go', 'going', 'come', 'say', 'said', 'tell',
  'ask', 'try', 'help', 'give', 'gave', 'please', 'thank', 'thanks', 'also',
  'very', 'really', 'just', 'still', 'already', 'even', 'drug', 'medicine',
  'medication', 'pill', 'tablet', 'capsule', 'side', 'effect', 'effects',
  'dose', 'dosage', 'used', 'good', 'bad', 'work', 'works', 'does'
]);

/**
 * Extract potential drug names and medical terms from a user message.
 * Filters out common English stop words and very short tokens.
 */
function extractMedicalTerms(message) {
  const words = message.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));

  return [...new Set(words)];
}

/**
 * Search the drugs table for relevant entries and return formatted context.
 * Queries by generic_name, brand_names, and drug_class using LIKE matching.
 * Returns at most 3 search terms x 3 results = 9 drug entries (deduplicated).
 */
export async function getDrugContext(userMessage, env) {
  const searchTerms = extractMedicalTerms(userMessage);

  if (searchTerms.length === 0) return '';

  const seen = new Set();
  let context = '';

  for (const term of searchTerms.slice(0, 3)) {
    const searchTerm = `%${term}%`;

    try {
      const results = await env.DB.prepare(
        `SELECT generic_name, brand_names, drug_class, uses, side_effects, interactions, dosage_notes, pregnancy_category
         FROM drugs
         WHERE generic_name LIKE ? OR brand_names LIKE ? OR drug_class LIKE ?
         LIMIT 3`
      ).bind(searchTerm, searchTerm, searchTerm).all();

      for (const drug of (results.results || [])) {
        // Deduplicate by generic_name
        if (seen.has(drug.generic_name)) continue;
        seen.add(drug.generic_name);

        context += `\n--- ${drug.generic_name} (${drug.brand_names || 'N/A'}) ---\n`;
        context += `Class: ${drug.drug_class || 'N/A'}\n`;
        context += `Uses: ${drug.uses || 'N/A'}\n`;
        context += `Side Effects: ${drug.side_effects || 'N/A'}\n`;
        context += `Interactions: ${drug.interactions || 'N/A'}\n`;
        context += `Dosage: ${drug.dosage_notes || 'N/A'}\n`;
        if (drug.pregnancy_category) {
          context += `Pregnancy Category: ${drug.pregnancy_category}\n`;
        }
      }
    } catch (err) {
      console.error(`Drug RAG lookup failed for term "${term}":`, err.message);
      // Continue with other terms — don't let one failure block the rest
    }
  }

  return context;
}

/**
 * Search the herbs table for relevant traditional/herbal remedies and return
 * formatted context. Foregrounds evidence_level, herb-drug interactions and
 * safety concerns so the AI never presents traditional use as clinical fact.
 * Returns at most 3 search terms x 3 results = 9 herb entries (deduplicated).
 */
export async function getHerbContext(userMessage, env) {
  const searchTerms = extractMedicalTerms(userMessage);
  if (searchTerms.length === 0) return '';

  const seen = new Set();
  let context = '';

  for (const term of searchTerms.slice(0, 3)) {
    const searchTerm = `%${term}%`;
    try {
      const results = await env.DB.prepare(
        `SELECT common_name, local_names, scientific_name, traditional_uses, evidence_level,
                herb_drug_interactions, safety_concerns, pregnancy_caution
         FROM herbs
         WHERE common_name LIKE ? OR local_names LIKE ? OR scientific_name LIKE ?
         LIMIT 3`
      ).bind(searchTerm, searchTerm, searchTerm).all();

      for (const herb of (results.results || [])) {
        if (seen.has(herb.common_name)) continue;
        seen.add(herb.common_name);

        context += `\n--- ${herb.common_name}${herb.local_names ? ' (' + herb.local_names + ')' : ''} ---\n`;
        if (herb.scientific_name) context += `Scientific name: ${herb.scientific_name}\n`;
        context += `Evidence level: ${herb.evidence_level || 'unknown'} (do NOT present traditional use as proven)\n`;
        context += `Traditional uses (claim, not endorsement): ${herb.traditional_uses || 'N/A'}\n`;
        context += `Herb-drug interactions: ${herb.herb_drug_interactions || 'Not well documented'}\n`;
        context += `Safety concerns: ${herb.safety_concerns || 'N/A'}\n`;
        if (herb.pregnancy_caution) context += `Pregnancy: ${herb.pregnancy_caution}\n`;
      }
    } catch (err) {
      console.error(`Herb RAG lookup failed for term "${term}":`, err.message);
      // Non-fatal (e.g. herbs table not migrated yet) — continue.
    }
  }

  return context;
}
