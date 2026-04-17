import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { normalizeSearchQuery } from '@/shared/lib/search-query'
import { PackageOpen, Terminal, Shield, Users, GitBranch, Search as SearchIcon, Settings } from 'lucide-react'
import { LandingQuickStartSection } from '@/shared/components/landing-quick-start'
import { SkillCard } from '@/features/skill/skill-card'
import { SkeletonList } from '@/shared/components/skeleton-loader'
import { useSearchSkills } from '@/shared/hooks/use-skill-queries'
import { useInView } from '@/shared/hooks/use-in-view'
import { Button } from '@/shared/ui/button'

/**
 * Marketing-style landing page for unauthenticated and first-time visitors.
 *
 * The page mixes static positioning content with live skill queries so popular and latest skills
 * stay aligned with the current registry state.
 */
export function LandingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: popularSkills, isLoading: isLoadingPopular } = useSearchSkills({
    sort: 'downloads',
    size: 6,
  })

  const { data: latestSkills, isLoading: isLoadingLatest } = useSearchSkills({
    sort: 'newest',
    size: 6,
  })

  const handleSkillClick = (namespace: string, slug: string) => {
    navigate({ to: `/space/${namespace}/${encodeURIComponent(slug)}` })
  }

  const heroView = useInView()
  const statsView = useInView()
  const featuresView = useInView()
  const quickStartView = useInView()
  const popularView = useInView()
  const latestView = useInView()

  const handleSearch = (query: string) => {
    const normalized = normalizeSearchQuery(query)
    navigate({
      to: '/search',
      search: { q: normalized, sort: 'relevance', page: 0, starredOnly: false },
    })
  }

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-primary" strokeWidth={2} />,
      title: t('landing.features.secure.title'),
      description: t('landing.features.secure.description'),
    },
    {
      icon: <Users className="w-6 h-6 text-primary" strokeWidth={2} />,
      title: t('landing.features.community.title'),
      description: t('landing.features.community.description'),
    },
    {
      icon: <PackageOpen className="w-6 h-6 text-primary" strokeWidth={2} />,
      title: t('landing.features.integration.title'),
      description: t('landing.features.integration.description'),
    },
    {
      icon: <GitBranch className="w-6 h-6 text-primary" strokeWidth={2} />,
      title: t('landing.features.versionControl.title', { defaultValue: 'Version control' }),
      description: t('landing.features.versionControl.description', { defaultValue: 'Managed release flows keep skill packages traceable and easier to review.' }),
    },
    {
      icon: <Terminal className="w-6 h-6 text-primary" strokeWidth={2} />,
      title: t('landing.features.cli.title', { defaultValue: 'CLI tooling' }),
      description: t('landing.features.cli.description', { defaultValue: 'Command-line workflows support publishing, installing, and operating skills quickly.' }),
    },
    {
      icon: <Settings className="w-6 h-6 text-primary" strokeWidth={2} />,
      title: t('landing.features.governance.title', { defaultValue: 'Governance' }),
      description: t('landing.features.governance.description', { defaultValue: 'Built-in review and permission flows help teams enforce skill quality.' }),
    },
  ]

  const stats = [
    { value: '1000+', label: t('landing.stats.skills', { defaultValue: 'Registry items' }) },
    { value: '50K+', label: t('landing.stats.downloads', { defaultValue: 'Downloads' }) },
    { value: '200+', label: t('landing.stats.teams', { defaultValue: 'Teams' }) },
  ]

  return (
    <>
      {/* Hero Section */}
      <main ref={heroView.ref} className={`relative z-10 flex flex-col items-center bg-background text-foreground pt-16 pb-20 px-4 md:pt-24 scroll-fade-up${heroView.inView ? ' in-view' : ''}`}>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-brand-gradient mb-4">
          SkillHub
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-center text-foreground mb-3">
          {t('landing.hero.title')}
        </h2>
        <p className="text-base md:text-lg text-center max-w-2xl text-content-secondary mb-10 leading-relaxed">
          {t('landing.hero.subtitle')}
        </p>

        {/* Search box */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center rounded-xl border border-border bg-card shadow-sm px-5 py-3.5">
            <SearchIcon className="w-5 h-5 flex-shrink-0 mr-3 text-muted-foreground" strokeWidth={1.5} />
            <input
              type="text"
              placeholder={t('landing.hero.searchPlaceholder')}
              className="hero-input flex-1 bg-transparent text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch((e.target as HTMLInputElement).value)
                }
              }}
            />
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-14">
          <Link
            to="/search"
            search={{ q: '', sort: 'relevance', page: 0, starredOnly: false }}
            className="px-8 py-3.5 rounded-xl text-base font-medium bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            {t('landing.hero.exploreSkills')}
          </Link>
          <Link
            to="/dashboard/publish"
            className="px-8 py-3.5 rounded-xl text-base font-medium border border-border bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            {t('landing.hero.publishSkill', { defaultValue: '开始构建' })}
          </Link>
        </div>

        {/* Stats */}
        <div ref={statsView.ref} className={`flex flex-row justify-center gap-16 md:gap-24 scroll-fade-up${statsView.inView ? ' in-view' : ''}`} style={{ transitionDelay: '0.15s' }}>
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold tracking-tight text-brand-gradient mb-1">
                {stat.value}
              </span>
              <span className="text-sm font-normal text-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* Features Section */}
      <section ref={featuresView.ref} className={`relative z-10 w-full bg-background py-20 md:py-24 px-6 scroll-fade-up${featuresView.inView ? ' in-view' : ''}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
              {t('landing.whySkillHub.title', { defaultValue: '为什么选择 SkillHub' })}
            </h2>
            <p className="text-base md:text-lg max-w-2xl mx-auto text-content-secondary leading-relaxed">
              {t('landing.whySkillHub.subtitle', { defaultValue: '专为企业打造的私有化 Agent 技能管理平台' })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-stroke-subtle bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 mx-auto bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-center text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-center text-content-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <div ref={quickStartView.ref} className={`scroll-fade-up${quickStartView.inView ? ' in-view' : ''}`}>
        <LandingQuickStartSection />
      </div>

      {/* Popular Downloads Section */}
      <section ref={popularView.ref} className={`relative z-10 w-full bg-background py-20 md:py-24 px-6 scroll-fade-up${popularView.inView ? ' in-view' : ''}`}>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                {t('home.popularTitle')}
              </h2>
              <p className="text-content-secondary">{t('home.popularDescription')}</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate({ to: '/search', search: { q: '', sort: 'downloads', page: 0, starredOnly: false } })}
            >
              {t('home.viewAll')}
            </Button>
          </div>
          {isLoadingPopular ? (
            <SkeletonList count={6} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {popularSkills?.items.map((skill, idx) => (
                <div key={skill.id} className={`animate-fade-up delay-${Math.min(idx + 1, 6)}`}>
                  <SkillCard
                    skill={skill}
                    onClick={() => handleSkillClick(skill.namespace, skill.slug)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Releases Section */}
      <section ref={latestView.ref} className={`relative z-10 w-full bg-background py-20 md:py-24 px-6 scroll-fade-up${latestView.inView ? ' in-view' : ''}`}>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                {t('home.latestTitle')}
              </h2>
              <p className="text-content-secondary">{t('home.latestDescription')}</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate({ to: '/search', search: { q: '', sort: 'newest', page: 0, starredOnly: false } })}
            >
              {t('home.viewAll')}
            </Button>
          </div>
          {isLoadingLatest ? (
            <SkeletonList count={6} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestSkills?.items.map((skill, idx) => (
                <div key={skill.id} className={`animate-fade-up delay-${Math.min(idx + 1, 6)}`}>
                  <SkillCard
                    skill={skill}
                    onClick={() => handleSkillClick(skill.namespace, skill.slug)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
