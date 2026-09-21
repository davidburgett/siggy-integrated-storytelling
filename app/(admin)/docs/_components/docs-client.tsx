'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FadeIn } from '@/components/ui/animate'
import { FileText, ArrowRight } from 'lucide-react'

const ENDPOINTS = [
  {
    group: 'Story Discovery',
    items: [
      {
        method: 'GET',
        path: '/api/v1/stories',
        desc: 'List all stories with part counts.',
        response: `[{ "id": "...", "title": "My Story", "description": "...", "partCount": 12, "publishedPartCount": 8 }]`,
      },
      {
        method: 'GET',
        path: '/api/v1/stories/:storyId/manifest',
        desc: 'Full manifest for a story: types, parts, tags, decision points.',
        response: `{
  "story": { "id": "...", "title": "...", "description": "..." },
  "partTypes": [{ "id": "...", "name": "Chapter", "color": "#6366f1" }],
  "parts": [{
    "id": "...", "title": "...", "type": "Chapter", "sortOrder": 0,
    "tags": ["intro"], "isPublished": true,
    "decisionPoints": [{ "id": "...", "prompt": "Which path?",
      "choices": [{ "id": "...", "label": "Go left", "targetPartId": "..." }] }]
  }],
  "allTags": ["intro", "bad_ending"],
  "allDecisionPoints": [{ "id": "...", "partId": "...", "prompt": "...", "choices": [...] }]
}`,
      },
    ],
  },
  {
    group: 'Content Retrieval',
    items: [
      {
        method: 'GET',
        path: '/api/v1/parts/:partId',
        desc: 'Fetch a single part with full content and decision points.',
        response: `{ "id": "...", "title": "...", "type": "Chapter", "content": "# Markdown...",\n  "tags": ["chapter_start"], "sortOrder": 0, "decisionPoints": [...] }`,
      },
      {
        method: 'GET',
        path: '/api/v1/stories/:storyId/parts/by-tag/:tag',
        desc: 'Fetch parts matching a specific tag (e.g. "million_points").',
        response: `[{ "id": "...", "title": "...", "content": "...", "tags": ["million_points"], ... }]`,
      },
      {
        method: 'GET',
        path: '/api/v1/stories/:storyId/parts/by-type/:typeName',
        desc: 'Fetch all parts of a given type name.',
        response: `[{ "id": "...", "title": "...", "type": "Epilogue", ... }]`,
      },
    ],
  },
  {
    group: 'Reader Management',
    items: [
      {
        method: 'POST',
        path: '/api/v1/readers',
        desc: 'Create or retrieve a reader (upsert by externalId + storyId).',
        body: `{ "externalId": "user-uuid-123", "storyId": "...", "label": "Player One" }`,
        response: `{ "id": "...", "externalId": "user-uuid-123", "storyId": "...", "label": "Player One" }`,
      },
      {
        method: 'GET',
        path: '/api/v1/readers/:readerId',
        desc: 'Get reader state: current part, parts read count.',
        response: `{ "id": "...", "externalId": "...", "currentPartId": "...", "partsRead": 5 }`,
      },
      {
        method: 'GET',
        path: '/api/v1/readers/:readerId/history',
        desc: 'Full read history for a reader.',
        response: `[{ "partId": "...", "partTitle": "Chapter 1", "readAt": "2026-01-15T..." }]`,
      },
      {
        method: 'GET',
        path: '/api/v1/readers/:readerId/unread',
        desc: 'List all published parts this reader has NOT read.',
        response: `[{ "id": "...", "title": "Chapter 3", "sortOrder": 2, "tags": [...] }]`,
      },
      {
        method: 'GET',
        path: '/api/v1/readers/:readerId/next',
        desc: 'Next unread part (by sort order) with full content.',
        response: `{ "id": "...", "title": "...", "content": "...", "decisionPoints": [...] }`,
      },
    ],
  },
  {
    group: 'Reader Actions',
    items: [
      {
        method: 'POST',
        path: '/api/v1/readers/:readerId/read',
        desc: 'Mark a part as read, update current position.',
        body: `{ "partId": "..." }`,
        response: `{ "readerId": "...", "currentPartId": "...", "partsRead": 6 }`,
      },
      {
        method: 'POST',
        path: '/api/v1/readers/:readerId/navigate',
        desc: 'Navigate a decision choice: marks current part read, moves to target. For choose-your-adventure branching.',
        body: `{ "choiceId": "..." }`,
        response: `{ "id": "...", "title": "The Dark Forest", "content": "...", "decisionPoints": [...] }`,
      },
      {
        method: 'POST',
        path: '/api/v1/readers/:readerId/goto',
        desc: 'Jump directly to a specific part (for incremental game triggers, etc.).',
        body: `{ "partId": "..." }`,
        response: `{ "id": "...", "title": "Million Points!", "content": "...", "decisionPoints": [...] }`,
      },
    ],
  },
  {
    group: 'Availability Query',
    items: [
      {
        method: 'GET',
        path: '/api/v1/stories/:storyId/available?readerId=:readerId',
        desc: 'What is available to this reader: unread count, next part, current decision points, unread tags.',
        response: `{
  "unreadCount": 4,
  "nextPart": { "id": "...", "title": "...", "sortOrder": 3 },
  "currentPartId": "...",
  "currentDecisionPoints": [{ "id": "...", "prompt": "...", "choices": [...] }],
  "unreadTags": ["boss_fight", "secret_ending"]
}`,
      },
    ],
  },
]

export function DocsClient() {
  return (
    <div className="space-y-8 max-w-4xl">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">API Documentation</h1>
          <p className="text-muted-foreground mt-1">All endpoints require the <code className="text-primary font-mono text-sm">X-API-Key</code> header.</p>
        </div>
      </FadeIn>

      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardContent className="py-4">
          <p className="text-sm"><strong>Authentication:</strong> Every request must include <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">X-API-Key: your_key_here</code> in the headers. Generate keys in the API Keys section.</p>
        </CardContent>
      </Card>

      {ENDPOINTS.map((group) => (
        <div key={group.group} className="space-y-3">
          <h2 className="text-xl font-display font-semibold tracking-tight">{group.group}</h2>
          {group.items.map((ep) => (
            <Card key={ep.path}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={ep.method === 'GET' ? 'secondary' : 'default'} className="font-mono text-xs">{ep.method}</Badge>
                  <code className="text-sm font-mono">{ep.path}</code>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{ep.desc}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {(ep as any).body && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Request Body:</p>
                    <pre className="bg-muted rounded-md p-3 text-xs font-mono overflow-x-auto">{(ep as any).body}</pre>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Response:</p>
                  <pre className="bg-muted rounded-md p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">{ep.response}</pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  )
}
