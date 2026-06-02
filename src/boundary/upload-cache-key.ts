export function uploadSessionCacheKey(userId: string, videoId: string): string {
  return `upload:${userId}:${videoId}`;
}
