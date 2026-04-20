import { unstable_cache } from 'next/cache'
import { getPayloadClient } from './payload'
import type { Score, Subscore, AdditionalScore, Discipline, Technique, Path } from '../../payload-types'

// Adds _id = String(id) for backwards compatibility with character components
function norm<T extends { id: number }>(doc: T): T & { _id: string } {
  return { ...doc, _id: String(doc.id) }
}

export const fetchCharacterData = unstable_cache(
  async function fetchCharacterData() {
  const payload = await getPayloadClient()

  const [culturesRes, pathsRes, patronagesRes, disciplinesRes, scoresRes, subscoresRes, additionalScoresRes] =
    await Promise.all([
      payload.find({ collection: 'cultures', limit: 100, depth: 0 }),
      payload.find({ collection: 'paths', limit: 100, depth: 2 }),
      payload.find({ collection: 'patronages', limit: 100, depth: 2 }),
      payload.find({ collection: 'disciplines', limit: 100, depth: 2 }),
      payload.find({ collection: 'scores', limit: 100, depth: 0 }),
      payload.find({ collection: 'subscores', limit: 200, depth: 0 }),
      payload.find({ collection: 'additional-scores', limit: 50, depth: 1 }),
    ])

  // Build score+subscores structure (subscores reference scores, not the other way)
  const scores = scoresRes.docs.map(score => norm({
    ...score,
    subscores: subscoresRes.docs
      .filter(ss => {
        const ssScoreId = typeof ss.score === 'number' ? ss.score : (ss.score as Score | null)?.id
        return ssScoreId === score.id
      })
      .map(ss => norm({ ...ss as Subscore, defaultValue: (ss as Subscore).defaultValue ?? null })),
  }))

  // Normalize disciplines with paths/techniques
  const disciplines = disciplinesRes.docs.map(d => norm({
    ...d as Discipline,
    paths: (d.paths ?? []).map(p =>
      typeof p === 'number' ? { _id: String(p), id: p, title: null } : norm(p as Path)
    ),
    techniques: (d.techniques ?? []).map(t =>
      typeof t === 'number' ? { _id: String(t), id: t, title: null } : norm(t as Technique)
    ),
  }))

  // Normalize paths with modifiers subscores
  const paths = (pathsRes.docs.map(p => {
    const modifiers = (p.modifiers ?? []).map(m => {
      const rawSub = m.modifierSubscore
      if (!rawSub || typeof rawSub === 'number') {
        const id = typeof rawSub === 'number' ? rawSub : 0
        return { ...m, modifierSubscore: { _id: String(id), id, score: null } }
      }
      const sub = rawSub as Subscore
      const rawScore = sub.score
      const normedScore = !rawScore
        ? null
        : typeof rawScore === 'number'
          ? { _id: String(rawScore), id: rawScore as number, title: null }
          : norm(rawScore as Score)
      return { ...m, modifierSubscore: norm({ ...sub, score: normedScore }) }
    })
    return norm({ ...p as Path, modifiers })
  })) as import('./character-types').NormedPath[]

  // Normalize patronages with effects entries
  const patronages = patronagesRes.docs.map(p => norm({
    ...p,
    effects: (p.effects ?? []).map(e => ({
      ...e,
      entry: e.entry && typeof e.entry !== 'number'
        ? norm(e.entry)
        : e.entry,
    })),
  }))

  // Normalize additionalScores - flatten polymorphic scores to {_id: string} for characterSlice
  const additionalScores = additionalScoresRes.docs.map(as => {
    const normalized = norm({ ...as as AdditionalScore })
    return {
      ...normalized,
      scores: (as.scores ?? []).map(s => {
        const val = s.value
        if (typeof val === 'number') return { _id: String(val) }
        return { ...(val as Score | Subscore), _id: String((val as { id: number }).id) }
      }),
    }
  })

  const cultures = culturesRes.docs.map(norm)

  return {
    cultures,
    paths,
    patronages,
    disciplines,
    scores,
    subscores: subscoresRes.docs.map(norm),
    additionalScores,
  }
},
['character-data'],
{ revalidate: 3600 },
)
