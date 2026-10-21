Auth
Register: POST /auth/register (name, email, password)

Login: POST /auth/login (email, password)

copy token by login

Profile: GET /auth/me

Teams
Create Team: POST /teams (name)

List Teams: GET /teams

Add Member: POST /teams/:teamId/members (email, role)

Tasks
Create Task: POST /tasks (title, description, priority, status, teamId, dueDate, checklist)

List Tasks: GET /tasks?page=1&limit=10&status=TODO&priority=HIGH&search=keyword

Get Task: GET /tasks/:id

Update Task: PATCH /tasks/:id

Delete Task: DELETE /tasks/:id