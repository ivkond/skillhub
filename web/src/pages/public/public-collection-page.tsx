import { Link, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/use-auth'
import { CollectionSkillRows } from '@/features/collection/collection-skill-rows'
import { ApiError } from '@/shared/lib/api-error'
import { useCollectionDetail, usePublicCollection } from '@/shared/hooks/use-collection-queries'
import { buttonVariants } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { APP_SHELL_PAGE_CLASS_NAME } from '@/app/page-shell-style'

export function PublicCollectionPage() {
  const { t } = useTranslation()
  const { ownerKey, collectionSlug } = useParams({ from: '/u/$ownerKey/c/$collectionSlug' })
  const { user, isLoading: isAuthLoading } = useAuth()
  const publicCollectionQuery = usePublicCollection(ownerKey, collectionSlug)
  const resolvedCollectionId = publicCollectionQuery.data?.id != null ? String(publicCollectionQuery.data.id) : undefined
  const privateRefetchEnabled = !isAuthLoading && !!user && !!resolvedCollectionId
  const privateRefetchQuery = useCollectionDetail(resolvedCollectionId, privateRefetchEnabled)

  const publicErrorStatus = publicCollectionQuery.error instanceof ApiError ? publicCollectionQuery.error.status : null
  const notFoundFromPublicQuery = publicErrorStatus === 403 || publicErrorStatus === 404
  const notFoundFromAuthenticatedRefetch = privateRefetchQuery.error instanceof ApiError
    && (privateRefetchQuery.error.status === 403 || privateRefetchQuery.error.status === 404)
  const shouldRenderNotFound = notFoundFromPublicQuery || notFoundFromAuthenticatedRefetch

  const isLoading = publicCollectionQuery.isLoading || privateRefetchQuery.isLoading
  const collection = privateRefetchQuery.data ?? publicCollectionQuery.data

  if (isLoading) {
    return (
      <div className={APP_SHELL_PAGE_CLASS_NAME}>
        <p className="text-sm text-muted-foreground">{t('collections.publicLoading')}</p>
      </div>
    )
  }

  if (shouldRenderNotFound || !collection) {
    if (publicCollectionQuery.error && !notFoundFromPublicQuery) {
      return (
        <div className={APP_SHELL_PAGE_CLASS_NAME}>
          <Card>
            <CardHeader>
              <CardTitle>{t('collections.publicLoadErrorTitle')}</CardTitle>
              <CardDescription>{t('collections.publicLoadErrorDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <button
                type="button"
                className={buttonVariants({ variant: 'outline' })}
                onClick={() => window.location.reload()}
              >
                {t('collections.publicRetry')}
              </button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className={APP_SHELL_PAGE_CLASS_NAME}>
        <Card data-testid="public-collection-not-found">
          <CardHeader>
            <CardTitle>{t('collections.publicNotFoundTitle')}</CardTitle>
            <CardDescription>{t('collections.publicNotFoundDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/skills" className={buttonVariants({ variant: 'outline' })}>
              {t('collections.publicBackToSkills')}
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={APP_SHELL_PAGE_CLASS_NAME}>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{collection.title ?? t('collections.untitled')}</h1>
        <p className="text-sm text-muted-foreground">
          {collection.description || t('collections.publicSubtitle', { ownerKey })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('collections.skillsTitle')}</CardTitle>
          <CardDescription>{t('collections.publicSkillsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {(collection.members?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">{t('collections.publicEmptySkills')}</p>
          ) : (
            <CollectionSkillRows
              collectionId={String(collection.id ?? '')}
              members={collection.members ?? []}
              canReorder={false}
              showActions={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
