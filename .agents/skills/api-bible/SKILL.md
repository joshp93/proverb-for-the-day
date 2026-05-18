---
name: api-bible
description: Skill for interacting with the API.Bible REST API to retrieve Bible metadata and text.
version: 1.0.0
license: MIT
---

# API.Bible

This skill describes how to interact with the API.Bible REST API to retrieve Bible metadata and text for use in applications.

---

## 1. Service overview

Name: API.Bible  
Base URL:

- https://rest.api.bible/{version}

API version placeholder:

- {version} → typically `v1` (for example: https://rest.api.bible/v1)

Purpose:

- Fetch Bible translations (Bibles) and their metadata
- Fetch books, chapters, sections, verses, and passages
- Power Scripture display and search in apps via a REST API

---

## 2. Authentication

API.Bible uses an API key passed in the request headers.

- Header name: `api-key`
- Header value: your application’s API key

You obtain/manage your key at:

- https://api.bible

### 2.1 Example authenticated request

GET https://rest.api.bible/v1/bibles  
api-key: YOUR_API_KEY_HERE

---

## 3. Core resources

API.Bible exposes several core resource types:

- Bibles – specific editions/translations (e.g., NIV, KJV)
- Books – books of the Bible belonging to a Bible
- Chapters – sub‑sections of a book
- Sections – titled sections within a chapter
- Verses – smallest unit of text within a chapter
- Passages – ranges of verses (e.g., PROV.10.1–PROV.10.5)

---

## 4. Endpoints

Below are the primary endpoints you’ll typically use. Exact query parameters and response schemas can be refined from the full OpenAPI spec, but this structure is suitable as an OpenCode skill document.

### 4.1 Bibles

#### 4.1.1 GET /bibles

Fetch the list of Bibles available to your application and their metadata.

- Method: GET
- Path: `/bibles`
- Auth: Required (api-key header)

Request:

- Headers:
  - api-key: YOUR_API_KEY_HERE

Common query parameters (to refine from full spec):

- language (optional) – filter by language code
- name (optional) – filter by Bible name/translation
- abbreviation (optional) – filter by abbreviation

Response (typical shape):

- data: array of Bible objects (id, name, abbreviation, language, etc.)

#### 4.1.2 GET /bibles/{bibleId}

Fetch metadata for a single Bible.

- Method: GET
- Path: `/bibles/{bibleId}`
- Auth: Required

Path parameters:

- bibleId – ID of the Bible (e.g., from GET /bibles)

---

### 4.2 Books

#### 4.2.1 GET /bibles/{bibleId}/books

List all books in a given Bible.

- Method: GET
- Path: `/bibles/{bibleId}/books`
- Auth: Required

Path parameters:

- bibleId – ID of the Bible

Optional query parameters (to refine):

- include-chapters – whether to include chapter info in each book

#### 4.2.2 GET /bibles/{bibleId}/books/{bookId}

Fetch metadata for a single book.

- Method: GET
- Path: `/bibles/{bibleId}/books/{bookId}`
- Auth: Required

Path parameters:

- bibleId – ID of the Bible
- bookId – ID of the book (e.g., GEN, PROV)

---

### 4.3 Chapters

#### 4.3.1 GET /bibles/{bibleId}/chapters

List chapters for a Bible, typically filtered by book.

- Method: GET
- Path: `/bibles/{bibleId}/chapters`
- Auth: Required

Path parameters:

- bibleId – ID of the Bible

Common query parameters:

- bookId – ID of the book whose chapters you want

#### 4.3.2 GET /bibles/{bibleId}/chapters/{chapterId}

Fetch a single chapter’s metadata and structure.

- Method: GET
- Path: `/bibles/{bibleId}/chapters/{chapterId}`
- Auth: Required

Path parameters:

- bibleId – ID of the Bible
- chapterId – ID of the chapter (e.g., PROV.10)

Optional query parameters (to refine):

- content-type – text, html, or json
- include-notes – whether to include footnotes
- include-titles – whether to include section titles

---

### 4.4 Sections

#### 4.4.1 GET /bibles/{bibleId}/chapters/{chapterId}/sections

List sections (titled subsections) within a chapter.

- Method: GET
- Path: `/bibles/{bibleId}/chapters/{chapterId}/sections`
- Auth: Required

Path parameters:

- bibleId – ID of the Bible
- chapterId – ID of the chapter

---

### 4.5 Verses

#### 4.5.1 GET /bibles/{bibleId}/verses

List verses, usually filtered by chapter or reference.

- Method: GET
- Path: `/bibles/{bibleId}/verses`
- Auth: Required

Path parameters:

- bibleId – ID of the Bible

Common query parameters:

- chapterId – ID of the chapter (e.g., PROV.10)
- reference – textual reference (e.g., Proverbs 10:1)

#### 4.5.2 GET /bibles/{bibleId}/verses/{verseId}

Fetch a single verse.

- Method: GET
- Path: `/bibles/{bibleId}/verses/{verseId}`
- Auth: Required

Path parameters:

- bibleId – ID of the Bible
- verseId – ID of the verse (e.g., PROV.10.1)

Optional query parameters:

- content-type – text, html, or json
- include-notes – include footnotes or not

---

### 4.6 Passages

#### 4.6.1 GET /bibles/{bibleId}/passages

Fetch a passage by reference or verse range.

- Method: GET
- Path: `/bibles/{bibleId}/passages`
- Auth: Required

Path parameters:

- bibleId – ID of the Bible

Common query parameters:

- reference – human‑readable reference (e.g., `Proverbs 10:1-5`)
- verseIds – explicit verse IDs range (e.g., `PROV.10.1-PROV.10.5`)
- content-type – text, html, or json
- include-notes – include footnotes
- include-titles – include section titles
- include-verse-numbers – include verse numbers in output

---

### 4.7 Search

#### 4.7.1 GET /bibles/{bibleId}/search

Search within a Bible by keyword or phrase.

- Method: GET
- Path: `/bibles/{bibleId}/search`
- Auth: Required

Path parameters:

- bibleId – ID of the Bible

Common query parameters:

- query – search term(s) or phrase
- limit – max number of results
- offset – pagination offset
- sort – relevance or canonical order

---

## 5. Usage patterns for your app

Typical flow:

1. List Bibles
   - GET /bibles → choose a translation (e.g., NIV, KJV, etc.)

2. Resolve structure
   - GET /bibles/{bibleId}/books
   - GET /bibles/{bibleId}/chapters?bookId=PROV

3. Fetch content
   - GET /bibles/{bibleId}/passages?reference=Proverbs%2010:1-5
   - Or GET /bibles/{bibleId}/verses/{verseId}

4. Store in your DB (if license allows)
   - Cache verses/passages for faster access, respecting any licensing limits.

5. Serve via your own API
   - Enforce verse limits, copyright notices, and any translation‑specific constraints.

---

## 6. Implementation notes

- Always send `api-key` in the header.
- Use `v1` (or the latest) as `{version}` in the base URL.
- Handle rate limits and errors gracefully.
- Respect licensing constraints for each translation (e.g., fair use, non‑commercial, verse limits, etc.).

---

## 7. Extending this skill

When you have the full OpenAPI JSON/YAML from API.Bible:

1. Extract all paths and schemas.
2. For each endpoint, add:
   - Method, path, description
   - Parameters (path, query, headers)
   - Example request/response
3. Keep this file as the human‑readable “skill” layer on top of the raw OpenAPI spec.
