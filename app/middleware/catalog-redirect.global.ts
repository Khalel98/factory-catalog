/**
 * Редирект со старого формата URL на новый:
 * /catalog/:productId?category=:categoryId → /catalog/:categoryId/:productId
 */
export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/catalog/') || !to.query.category) return
  const segments = to.path.replace(/^\/catalog\/?/, '').split('/').filter(Boolean)
  if (segments.length !== 1) return
  const productId = segments[0]
  const categoryId = String(to.query.category)
  return navigateTo(`/catalog/${categoryId}/${productId}`, { replace: true })
})
