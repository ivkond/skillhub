import { describe, expect, it } from 'vitest'
import { buildCollectionSlugFromTitle } from './collection-slug'

describe('buildCollectionSlugFromTitle', () => {
  it.each([
    ['Название коллекции', 'nazvanie-kollektsii'],
    ['Привет, мир!', 'privet-mir'],
    ['Ёжик и Щука', 'yozhik-i-shchuka'],
    ['React & TypeScript', 'react-typescript'],
    ['  --Тест__slug--  ', 'test-slug'],
    ['   ', ''],
  ])('builds slug for "%s"', (title, expectedSlug) => {
    expect(buildCollectionSlugFromTitle(title)).toBe(expectedSlug)
  })
})
