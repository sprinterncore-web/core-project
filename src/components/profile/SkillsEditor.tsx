'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Plus, Search, Trash2, X } from 'lucide-react'
import { SKILL_CATEGORIES } from '@/data/skills'
import type { SkillProof } from '@/types/database'

type Props = {
  skills: string[]
  skillProofs: SkillProof[]
  onChange: (skills: string[], proofs: SkillProof[]) => void
}

export function SkillsEditor({ skills, skillProofs, onChange }: Props) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newLabel, setNewLabel] = useState('')

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return SKILL_CATEGORIES
    const out: Record<string, string[]> = {}
    for (const [cat, list] of Object.entries(SKILL_CATEGORIES)) {
      const filtered = list.filter((s) => s.toLowerCase().includes(q))
      if (filtered.length) out[cat] = filtered
    }
    return out
  }, [search])

  function toggleSkill(skill: string) {
    if (skills.includes(skill)) {
      onChange(
        skills.filter((s) => s !== skill),
        skillProofs.filter((p) => p.skill !== skill)
      )
    } else {
      onChange([...skills, skill], skillProofs)
    }
  }

  function updateProof(index: number, patch: Partial<SkillProof>) {
    const next = skillProofs.map((p, i) =>
      i === index ? { ...p, ...patch } : p
    )
    onChange(skills, next)
  }

  function addProof() {
    if (!newSkill || !newUrl.trim()) return
    onChange(skills, [
      ...skillProofs,
      { skill: newSkill, url: newUrl.trim(), label: newLabel.trim() || newSkill },
    ])
    setAdding(false)
    setNewSkill('')
    setNewUrl('')
    setNewLabel('')
  }

  return (
    <div className="mt-6 rounded-2xl border border-line bg-white p-7">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy">Stack & Proof Links</h2>
        <span className="rounded-full border border-teal/20 bg-teal-wash px-3 py-1 text-xs font-bold text-teal">
          {skills.length} skills
        </span>
      </div>

      <div className="mb-6 mt-6">
        <p className="mb-3 text-sm font-semibold text-navy">Your skills</p>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate/40"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search to add skills..."
            className="w-full rounded-xl border border-line py-3 pl-10 pr-4 text-sm"
          />
        </div>
        <motion.div layout className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <motion.span
              layout
              key={skill}
              className="flex items-center gap-2 rounded-full bg-navy px-3 py-1.5 text-sm text-white"
            >
              {skill}
              <button type="button" onClick={() => toggleSkill(skill)}>
                <X size={12} />
              </button>
            </motion.span>
          ))}
        </motion.div>

        {search ? (
          <div className="mt-4 max-h-48 overflow-y-auto">
            {Object.entries(filteredCategories).map(([cat, list]) => (
              <div key={cat} className="mb-3">
                <p className="text-xs font-semibold uppercase text-slate/50">
                  {cat}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {list.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        skills.includes(skill)
                          ? 'border-navy bg-navy text-white'
                          : 'border-line text-navy hover:border-navy'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="mt-3 text-sm font-semibold text-teal"
          >
            {expanded ? 'Hide categories' : 'Add more skills +'}
          </button>
        )}

        {expanded && !search ? (
          <div className="mt-4 max-h-64 overflow-y-auto">
            {Object.entries(SKILL_CATEGORIES).map(([cat, list]) => (
              <div key={cat} className="mb-4">
                <p className="text-xs font-semibold uppercase text-slate/50">
                  {cat}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {list.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        skills.includes(skill)
                          ? 'border-navy bg-navy text-white'
                          : 'border-line text-navy hover:border-navy'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="border-t border-line pt-6">
        <p className="text-sm font-semibold text-navy">
          Back your skills with proof
        </p>
        <p className="mt-1 text-xs text-slate">
          Link a project or repo for your top skills. Companies can click through
          before booking a call.
        </p>

        {skillProofs.length === 0 && !adding ? (
          <div className="mt-4 rounded-xl bg-canvas p-5 text-center">
            <Award size={24} className="mx-auto text-slate/30" />
            <p className="mt-2 text-sm text-slate">No proof links yet</p>
            <p className="mt-1 text-xs text-slate/60">
              Back your top 3 skills with a GitHub repo or live project — it
              dramatically increases match rates.
            </p>
          </div>
        ) : (
          <ul className="mt-4">
            {skillProofs.map((proof, i) => (
              <li
                key={`${proof.skill}-${i}`}
                className="flex items-center gap-3 border-b border-line py-3 last:border-0"
              >
                <span className="rounded-full border border-line bg-canvas px-3 py-1 text-xs font-medium text-navy">
                  {proof.skill}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <input
                    value={proof.url}
                    onChange={(e) => updateProof(i, { url: e.target.value })}
                    placeholder="https://..."
                    className="w-full text-sm text-blue outline-none"
                  />
                  <input
                    value={proof.label}
                    onChange={(e) => updateProof(i, { label: e.target.value })}
                    placeholder="What did you build here?"
                    className="w-full text-xs text-slate outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      skills,
                      skillProofs.filter((_, j) => j !== i)
                    )
                  }
                >
                  <Trash2 size={15} className="text-red-400 hover:text-red-600" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {adding ? (
          <div className="mt-4 space-y-2 rounded-xl border border-line p-4">
            <select
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            >
              <option value="">Select skill</option>
              {skills.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="URL"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Label"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addProof}
                className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="text-sm text-slate"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-4 flex items-center gap-2 text-sm font-semibold text-teal"
          >
            <Plus size={15} />
            Add proof link
          </button>
        )}
      </div>
    </div>
  )
}
