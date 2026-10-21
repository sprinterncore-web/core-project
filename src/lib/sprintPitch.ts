export function buildSprintPitch(parts: {
  whatBuild: string
  projectName: string
  projectDesc: string
  whyStartups: string
}): string {
  const { whatBuild, projectName, projectDesc, whyStartups } = parts
  const chunks: string[] = []
  if (whatBuild.trim()) chunks.push(whatBuild.trim())
  if (projectName.trim() || projectDesc.trim()) {
    chunks.push(
      `My best recent project: ${projectName.trim() || 'Untitled'}${projectDesc.trim() ? ` — ${projectDesc.trim()}` : ''}.`
    )
  }
  if (whyStartups.trim()) chunks.push(whyStartups.trim())
  return chunks.join(' ')
}

export function parseSprintPitch(pitch: string | null | undefined): {
  whatBuild: string
  projectDesc: string
  whyStartups: string
} {
  if (!pitch?.trim()) {
    return { whatBuild: '', projectDesc: '', whyStartups: '' }
  }
  const projectMatch = pitch.match(
    /My best recent project:\s*([^—]+)(?:\s*—\s*([^.]+\.?))?/i
  )
  if (projectMatch) {
    const before = pitch.slice(0, projectMatch.index).trim()
    const after = pitch.slice((projectMatch.index ?? 0) + projectMatch[0].length).trim()
    return {
      whatBuild: before,
      projectDesc: (projectMatch[2] ?? '').replace(/\.$/, '').trim(),
      whyStartups: after,
    }
  }
  const parts = pitch.split(/\n\n/)
  return {
    whatBuild: parts[0] ?? '',
    projectDesc: parts[1] ?? '',
    whyStartups: parts.slice(2).join(' ') ?? '',
  }
}
