# Sandlot Parkour Application

This is the beginnings of my Sandlot parkour stats app. More to come

## Endpoints

| Endpoint path | Description   |
|---------------|---------------|
|GET /api/generalstats|Responds with total courses, players, and combined completions.|
|GET /api/courses|Responds with stats on all parkour courses. Supports ?direction=, ?sort=, and ?search= for filtering.|
|GET /api/courses/{course_id}|Responds with stats for one parkour course.|
|GET /api/courses/times/{course_id}|Responds with all leaderboard times for one parkour course (ignores repeat times from players). Supports ?direction=, ?sort=, and ?search= for filtering.|
|GET /api/courses/records/{course_id}|Responds with the record progression for one parkour course.|
|GET /api/players|Responds with stats on all players. Supports ?direction=, ?sort=, and ?search= for filtering.|
|GET /api/players/{player_id}|Responds with stats for one player.|
|GET /api/players/completions/all/{player_id}|Responds with all parkour courses for one player. Supports ?direction=, ?sort=, and ?search= for filtering.|
|GET /api/players/completions/finished/{player_id}|Responds with all finished parkour courses for one player. Supports ?direction=, ?sort=, and ?search= for filtering.|
|GET /api/players/completions/unfinished/{player_id}|Responds with all unfinished parkour courses for one player. Supports ?direction=, ?sort=, and ?search= for filtering.|
|GET /api/playercourse/{course_id}/{player_id}|Responds with stats for one player on one parkour course.|
|GET /api/playercourse/completions/{course_id}/{player_id}|Responds with all parkour course completions for one player on one course. Supports ?direction= and ?sort= for filtering.|