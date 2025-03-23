# Ligenia Core Domain Logic Checklist

## User

| Use Case                  | API Route Implemented | Domain Logic Implemented | Unit Tests Implemented | Pagination/Filtering Support | Notes |
|---------------------------|-----------------------|--------------------------|------------------------|------------------------------|-------|
| User Registration         | ✅                    | ✅                       | ✅                     | ⬜️                          | Integrated with Supabase Auth |
| User Login                | ✅                    | ✅                       | ✅                     | ⬜️                          | Integrated with Supabase Auth |
| User Logout               | ✅                    | ✅                       | ✅                     | ⬜️                          | Integrated with Supabase Auth |
| Token Management          | ✅                    | ✅                       | ✅                     | ⬜️                          | Integrated with Supabase Auth |
| Profile Retrieval         | ✅                    | ✅                       | ✅                     | ⬜️                          | Profile data from 'profiles' table in Supabase |
| Profile Update            | ✅                    | ✅                       | ✅                     | ⬜️                          | For user profile data outside of auth (username, etc.) |
| Password Change           | ✅                    | ⚡️                       | ⚡️                     | ⬜️                          | Handled by Supabase Auth, minimal integration code |
| Email Verification        | ✅                    | ⚡️                       | ⚡️                     | ⬜️                          | Handled by Supabase Auth, minimal integration code |
| Forgot Password           | ✅                    | ⚡️                       | ⚡️                     | ⬜️                          | Handled by Supabase Auth, minimal integration code |
| Token Refresh             | ✅                    | ⚡️                       | ⚡️                     | ⬜️                          | Handled by Supabase SDK automatically |
| User Preferences          | ✅                    | ✅                       | ✅                     | ⬜️                          | Links to Preference entity (theme, notifications, etc.) |

> **Note:** 
> - ⚡️ marks functionality primarily handled by Supabase Auth. These features require minimal domain logic implementation as they are managed by the external service.
> - The User domain is considered complete for MVP scope with the above functionalities implemented.

## Player

| Use Case                       | API Route Implemented | Domain Logic Implemented | Unit Tests Implemented | Pagination/Filtering Support |
|-------------------------------|-----------------------|--------------------------|------------------------|------------------------------|
| Create Player Profile          | ✅                    | ✅                       | ✅                     | ⬜️                          |
| Get Player by ID               | ✅                    | ✅                       | ✅                     | ⬜️                          |
| Update Player Profile          | ✅                    | ✅                       | ✅                     | ⬜️                          |
| List Players                   | ✅                    | ✅                       | ✅                     | ✅ (level, search)           |
| Get Player Matches             | ✅                    | ✅                       | ✅                     | ✅ (pagination, status)      |
| Get Player Tournaments         | ✅                    | ✅                       | ✅                     | ✅ (status, date)            |
| Update Player Level            | ✅                    | ✅                       | ✅                     | ⬜️                          |

## Tournament

| Use Case                         | Entity Created & Validated | Domain Logic Implemented | Unit Tests Implemented  | Notes                          |
|----------------------------------|---------------------------|--------------------------|-------------------------|--------------------------------|
| Create Tournament                | ✅                         | ✅                        | ✅                       | -                              |
| Update Tournament                | ✅                         | ✅                        | ✅                       | -                              |
| Get Tournament by ID             | ✅                         | ✅                        | ✅                       | -                              |
| List Tournaments                 | ✅                         | ✅                        | ✅                       | Required (pagination, filters) |
| Register for Tournament          | ✅                         | ✅                        | ✅                       | -                              |
| Unregister from Tournament       | ✅                         | ✅                        | ✅                       | -                              |
| Cancel Tournament                | ✅                         | ✅                        | ✅                       | -                              |
| Start Tournament                 | ✅                         | ✅                        | ✅                       | -                              |
| Complete Tournament              | ✅                         | ✅                        | ✅                       | -                              |
| Generate Tournament Bracket      | ✅                         | ✅                        | ✅                       | Generated when tournament starts; creates initial bracket structure |
| Update Tournament Matches & Standings | ✅                    | ✅                        | ✅                       | Updates bracket when matches completed; determines player advancement |

## Match

| Use Case                       | Entity Created & Validated | Domain Logic Implemented | Unit Tests Implemented | Notes                          |
|--------------------------------|---------------------------|--------------------------|------------------------|--------------------------------|
| Create Match                   | ✅                         | ✅                        | ✅                      | -                              |
| Create Tournament Bracket Matches | ✅                      | ✅                        | ✅                      | Created by GenerateTournamentBracket use case |
| Get Match by ID                | ✅                         | ✅                        | ✅                      | -                              |
| Update Match Details           | ✅                         | ✅                        | ✅                      | -                              |
| Record Match Result            | ✅                         | ✅                        | ✅                      | -                              |
| List Tournament Matches        | ✅                         | ✅                        | ✅                      | Required (by round, status)    |
| List User Matches              | ✅                         | ✅                        | ✅                      | Required (by result, tournament) |
| Delete Match                   | ✅                         | ✅                        | ✅                      | -                              |
| Get Tournament Bracket         | ✅                         | ✅                        | ✅                      | Returns bracket structure for visualization |

## Statistic

| Use Case                    | API Route Implemented | Domain Logic Implemented | Unit Tests Implemented | Pagination/Filtering Support |
|-----------------------------|-----------------------|--------------------------|------------------------|------------------------------|
| Calculate Player Statistics | ✅                    | ✅                       | ✅                     | ⬜️                          |
| Get Player Statistics       | ✅                    | ✅                       | ✅                     | Required (by date range)     |
| Update Statistics After Match | ✅                  | ✅                       | ✅                     | ⬜️                          |
| Get Tournament Statistics   | ✅                    | ✅                       | ✅                     | ✅ (pagination, sorting)     |
| List Global Statistics      | ✅                    | ✅                       | ✅                     | ✅ (by level, pagination)    |

## PerformanceHistory

| Use Case                       | API Route Implemented | Domain Logic Implemented | Unit Tests Implemented | Pagination/Filtering Support |
|-------------------------------|-----------------------|--------------------------|------------------------|------------------------------|
| Record Performance Entry       | ✅                    | ✅                       | ✅                     | ⬜️                          |
| Get Player Performance History | ✅                    | ✅                       | ✅                     | Required (by date, category) |
| Get Performance Summary        | ✅                    | ✅                       | ✅                     | ⬜️                          |
| Track Performance Trends       | ✅                    | ✅                       | ✅                     | Required (by timeframe)      |

## Preference

| Use Case                      | API Route Implemented | Domain Logic Implemented | Unit Tests Implemented | Pagination/Filtering Support |
|------------------------------|-----------------------|--------------------------|------------------------|------------------------------|
| Get User Preferences          | ✅                    | ✅                       | ✅                     | ⬜️                          |
| Update User Preferences       | ✅                    | ✅                       | ✅                     | ⬜️                          |
| Reset Preferences to Default  | ✅                    | ✅                       | ✅                     | ⬜️                          |

## Ranking

| Use Case                      | API Route Implemented | Domain Logic Implemented | Unit Tests Implemented | Pagination/Filtering Support |
|------------------------------|-----------------------|--------------------------|------------------------|------------------------------|
| Calculate Player Rankings     | ✅                    | ✅                       | ✅                     | ⬜️                          |
| Get Global Ranking List       | ✅                    | ✅                       | ✅                     | ✅ (pagination)              |
| Get Category-Based Rankings   | ✅                    | ✅                       | ✅                     | ✅ (by player level)         |
| Update Rankings After Match   | ✅                    | ✅                       | ✅                     | ⬜️                          |
