# SpeakAI — English Speaking Practice

SpeakAI to prywatna aplikacja webowa (PWA) przeznaczona dla jednego użytkownika. Jej głównym celem jest rozwój umiejętności mówienia (speaking) w języku angielskim poprzez interakcje głosowe z postaciami AI, przy wykorzystaniu wbudowanego w przeglądarkę mechanizmu Speech-to-Text. Aplikacja dostarcza naturalne rozmowy oraz dedykowaną warstwę feedbacku językowego (tutor layer).

## Stack Technologiczny

- **Frontend**: React 19 + TypeScript + Vite
- **PWA**: `vite-plugin-pwa`
- **Backend / API**: Vercel Serverless Functions (Node.js)
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth)
- **AI**: Gemini API (`gemini-3.5-flash-lite` z Google AI Studio)
- **Speech-to-Text**: Web Speech API (wbudowane w Chrome/Edge)
- **Testy**: Vitest

## Struktura Projektu

- `/api` - Endpointy backendowe dla Vercel Serverless Functions. Znajdują się tu trasy takie jak `/api/chat`, `/api/conversations` itp., a także współdzielony katalog `_lib/` z logiką autoryzacji, limitowania żądań i obsługi AI.
- `/src` - Frontend aplikacji w React.
  - `/components` - Drobne, reużywalne elementy UI (np. `MessageBubble`, `MicButton`).
  - `/pages` - Główne ekrany aplikacji (Characters, Conversation, History, Memory, Settings).
  - `/hooks` - Logika domenowa wyciągnięta do hooków (m.in. `useSpeechRecognition`, `useChat`).
  - `/types` - Główne typy danych używane po stronie frontendu.
- `/supabase` - Skrypty SQL definiujące strukturę bazy danych i Row Level Security.

## Uruchomienie lokalne

1. **Zainstaluj zależności**:
   ```bash
   npm install
   ```
2. **Skonfiguruj zmienne środowiskowe**:
   Skopiuj plik z przykładowymi zmiennymi:
   ```bash
   cp .env.example .env
   ```
   *Wypełnij plik `.env` odpowiednimi kluczami (patrz sekcja poniżej).*
3. **Uruchom deweloperski serwer frontendu i proxy**:
   ```bash
   npm run dev
   ```
   *Uwaga: Endpointy z `/api` w środowisku lokalnym Vercela uruchamia się zazwyczaj komendą `vercel dev`. W pliku `vite.config.ts` ustawiono proxy na `localhost:3000`, gdzie Vercel zazwyczaj wystawia lokalnie API.*

## Testy i Build

- **Testy**: Uruchom testy jednostkowe (Vitest):
  ```bash
  npm run test
  ```
- **Sprawdzenie typów**:
  ```bash
  npm run typecheck
  ```
- **Build produkcyjny**:
  ```bash
  npm run build
  ```

## Konfiguracja Środowiska i Zmienne (.env)

Aplikacja rozróżnia zmienne bezpieczne dla frontendu (`VITE_...`) i zmienne wyłącznie backendowe. **Nigdy nie umieszczaj sekretów API w kodzie źródłowym ani w systemie kontroli wersji.**

Wymagane zmienne (w `.env` i Vercel Dashboard):

- **Bezpieczne dla frontendu (dostępne w przeglądarce):**
  - `VITE_SUPABASE_URL` - URL projektu Supabase.
  - `VITE_SUPABASE_PUBLISHABLE_KEY` - Klucz publiczny Supabase anon (zabezpieczony przez RLS).
- **Tylko dla backendu (Vercel):**
  - `SUPABASE_URL` - To samo co wyżej.
  - `SUPABASE_SECRET_KEY` - Klucz Service Role do Supabase (niezbędny do działań administracyjnych w funkcjach).
  - `GEMINI_API_KEY` - Klucz API z Google AI Studio.
  - `GEMINI_MODEL` (opcjonalnie) - Nazwa modelu (domyślnie `models/gemini-2.0-flash` ze względu na dostępność w SDK, jednak docelowo rekomendowane `gemini-3.5-flash-lite`).

### Konfiguracja Supabase
1. Utwórz nowy projekt Supabase.
2. Uruchom zapytanie SQL znajdujące się w `supabase/schema.sql` w edytorze SQL w panelu Supabase. Stworzy to tabele, reguły bezpieczeństwa RLS oraz doda bazowe dane (postacie).
3. Pobierz wartości konfiguracyjne do `.env`.

### Konfiguracja Gemini
1. Zdobądź klucz w Google AI Studio.
2. Projekt zoptymalizowano pod wymuszony format wyjściowy (JSON) używając `responseSchema`.

## Bezpieczeństwo
- Wszystkie tabele w Supabase mają aktywne zasady **Row Level Security (RLS)**. Oznacza to, że użytkownik może odczytywać i modyfikować wyłącznie swoje dane, nawet przy użyciu publicznego klucza (auth.uid()).
- **Backend-only secrets**: Klucze do API Gemini oraz Supabase Service Role Key są ukryte w Vercel Serverless Functions. Frontend uderza do własnego backendu (`/api/*`), przesyłając jedynie JWT. Backend sprawdza ważność tego tokenu.
- Rate Limiting zaimplementowano na poziomie zapytań do bazy danych, w celu prewencji nadużyć na koncie Free Tier.

## Limity i Koszty (Free Tier)
Projekt został zaprojektowany z myślą o darmowym wykorzystaniu:
- **Speech-to-Text**: Wykorzystuje darmowe `Web Speech API` dostępne w nowszych przeglądarkach (Chrome/Edge). Brak dodatkowych płatnych wtyczek.
- **Gemini AI**: Wymaga darmowego klucza z Google AI Studio. **Uwaga na rate limity** (często ok. 15 RPM, co na pojedynczego użytkownika powinno wystarczyć). 
- **Zabezpieczenie przed kosztami**: Zapytania do API (w jednym przebiegu generujące zarówno odpowiedź postaci, jak i feedback) posiadają maksymalny limit generowanych znaków (`maxOutputTokens: 1024`), aby nie uszczuplać darmowego budżetu. Nie należy konfigurować płatnego konta, jeśli zależy nam wyłącznie na kosztach 0 zł.

## Deployment
Projekt jest natywnie gotowy na wdrożenie na platformę **Vercel**:
1. Zainstaluj Vercel CLI (lub użyj Vercel Dashboard).
2. Połącz repozytorium na Vercel.
3. W sekcji Settings > Environment Variables dodaj wszystkie potrzebne zmienne (z podziałem na frontend i backend).
4. Vercel automatycznie wykryje Vite dla statycznego frontendu, a katalog `/api/` uruchomi jako Serverless Functions. Ustawienia proxy znajdują się w pliku `vercel.json`.
