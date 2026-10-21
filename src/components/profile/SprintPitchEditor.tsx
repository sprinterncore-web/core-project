'use client'

import { useEffect, useMemo, useState } from 'react'
import { Link2 } from 'lucide-react'
import { buildSprintPitch, parseSprintPitch } from '@/lib/sprintPitch'
import type { Profile } from '@/types/database'

type Props = {
  profile: Profile
  onChange: (updates: Partial<Profile>) => void
}

export function SprintPitchEditor({ profile, onChange }: Props) {
  const parsed = parseSprintPitch(profile.sprint_pitch)
  const [whatBuild, setWhatBuild] = useState(parsed.whatBuild)
  const [projectName, setProjectName] = useState(profile.best_project_name ?? '')
  const [projectUrl, setProjectUrl] = useState(profile.best_project_url ?? '')
  const [projectDesc, setProjectDesc] = useState(parsed.projectDesc)
  const [whyStartups, setWhyStartups] = useState(parsed.whyStartups)

  useEffect(() => {
    const p = parseSprintPitch(profile.sprint_pitch)
    setWhatBuild(p.whatBuild)
    setProjectName(profile.best_project_name ?? '')
    setProjectUrl(profile.best_project_url ?? '')
    setProjectDesc(p.projectDesc)
    setWhyStartups(p.whyStartups)
  }, [profile.id, profile.sprint_pitch, profile.best_project_name, profile.best_project_url])

  const combinedPreview = useMemo(
    () =>
      buildSprintPitch({
        whatBuild,
        projectName,
        projectDesc,
        whyStartups,
      }),
    [whatBuild, projectName, projectDesc, whyStartups]
  )

  function emit(
    w: string,
    name: string,
    url: string,
    desc: string,
    why: string
  ) {
    onChange({
      sprint_pitch: buildSprintPitch({
        whatBuild: w,
        projectName: name,
        projectDesc: desc,
        whyStartups: why,
      }),
      best_project_name: name || null,
      best_project_url: url || null,
    })
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-7">
      <h2 className="text-xl font-bold text-navy">Sprint Identity</h2>
      <p className="mt-1 text-sm text-slate">
        Companies read this in 10 seconds. Make every word count.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        <div>
          <div className="mb-1.5 flex justify-between">
            <label className="text-sm font-semibold text-navy">
              What do you build?
            </label>
            <span className="text-xs text-slate/50">{whatBuild.length}/120</span>
          </div>
          <input
            maxLength={120}
            value={whatBuild}
            onChange={(e) => {
              const v = e.target.value
              setWhatBuild(v)
              emit(v, projectName, projectUrl, projectDesc, whyStartups)
            }}
            placeholder="I build full-stack web apps with React, Next.js and Supabase."
            className="w-full rounded-xl border border-line px-4 py-3 text-sm text-navy focus:border-blue focus:ring-2 focus:ring-blue/10"
          />
          <p className="mt-1 text-xs text-slate/50">One sentence. Stack + output.</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-navy">
            Your best shipped project
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              value={projectName}
              onChange={(e) => {
                const v = e.target.value
                setProjectName(v)
                emit(whatBuild, v, projectUrl, projectDesc, whyStartups)
              }}
              placeholder="e.g. AI invoice parser"
              className="rounded-xl border border-line px-4 py-3 text-sm"
            />
            <div className="relative">
              <Link2
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate/40"
              />
              <input
                value={projectUrl}
                onChange={(e) => {
                  const v = e.target.value
                  setProjectUrl(v)
                  emit(whatBuild, projectName, v, projectDesc, whyStartups)
                }}
                placeholder="https://github.com/..."
                className="w-full rounded-xl border border-line py-3 pl-10 pr-4 text-sm"
              />
            </div>
          </div>
          <textarea
            rows={2}
            maxLength={200}
            value={projectDesc}
            onChange={(e) => {
              const v = e.target.value
              setProjectDesc(v)
              emit(whatBuild, projectName, projectUrl, v, whyStartups)
            }}
            placeholder="What did you build, what stack, what was the impact?"
            className="mt-3 w-full rounded-xl border border-line px-4 py-3 text-sm"
          />
        </div>

        <div>
          <div className="mb-1.5 flex justify-between">
            <label className="text-sm font-semibold text-navy">
              Why startups should sprint with you
            </label>
            <span className="text-xs text-slate/50">{whyStartups.length}/150</span>
          </div>
          <textarea
            rows={2}
            maxLength={150}
            value={whyStartups}
            onChange={(e) => {
              const v = e.target.value
              setWhyStartups(v)
              emit(whatBuild, projectName, projectUrl, projectDesc, v)
            }}
            placeholder="I ship fast, communicate proactively, and treat every sprint like it's my own product."
            className="w-full rounded-xl border border-line px-4 py-3 text-sm"
          />
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-canvas px-5 py-4">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate/50">
          How this reads to companies:
        </p>
        <p className="text-sm italic leading-relaxed text-navy">
          {combinedPreview.trim() ? (
            combinedPreview
          ) : (
            <span className="text-slate/40">
              Your combined sprint pitch will appear here as you fill in each
              field.
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
